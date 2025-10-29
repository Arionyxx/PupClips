"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, Video, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/browser-client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
  Progress,
} from "@/components/ui";
import {
  extractVideoMetadata,
  generatePosterFrame,
  validateVideoFile,
  validateCaption,
  formatFileSize,
  formatDuration,
  generateVideoFilename,
  generatePosterFilename,
  VIDEO_CONSTRAINTS,
  type VideoMetadata,
} from "@/lib/upload-utils";
import {
  createVideoRecord,
  deleteVideoFromStorage,
} from "@/app/upload/actions";

interface UploadState {
  status:
    | "idle"
    | "validating"
    | "uploading"
    | "processing"
    | "success"
    | "error";
  progress: number;
  message: string;
}

export function UploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({
      status: "validating",
      progress: 0,
      message: "Validating video...",
    });

    try {
      // Extract metadata
      const metadata = await extractVideoMetadata(file);
      setVideoMetadata(metadata);

      // Validate file
      const validation = validateVideoFile(file, metadata);
      if (!validation.valid) {
        toast.error(validation.error);
        setUploadState({
          status: "error",
          progress: 0,
          message: validation.error || "Validation failed",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Generate poster frame
      setUploadState({
        status: "validating",
        progress: 50,
        message: "Generating poster frame...",
      });

      const poster = await generatePosterFrame(file, 1);
      setPosterBlob(poster);
      setPosterPreview(URL.createObjectURL(poster));

      setVideoFile(file);
      setUploadState({
        status: "idle",
        progress: 100,
        message: "Ready to upload",
      });
      toast.success("Video validated successfully!");
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video");
      setUploadState({
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Processing failed",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoMetadata(null);
    setPosterBlob(null);
    if (posterPreview) {
      URL.revokeObjectURL(posterPreview);
    }
    setPosterPreview(null);
    setUploadState({
      status: "idle",
      progress: 0,
      message: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !videoMetadata || !posterBlob) {
      toast.error("Please select a video first");
      return;
    }

    // Validate caption
    const captionValidation = validateCaption(caption);
    if (!captionValidation.valid) {
      toast.error(captionValidation.error);
      return;
    }

    setUploadState({
      status: "uploading",
      progress: 0,
      message: "Uploading video...",
    });

    const supabase = createClient();
    let videoStoragePath = "";
    let posterStoragePath = "";

    try {
      // Generate filenames
      videoStoragePath = generateVideoFilename(userId, videoFile.name);
      posterStoragePath = generatePosterFilename(userId, videoStoragePath);

      // Upload video file
      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoStoragePath, videoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (videoError) {
        throw new Error(`Failed to upload video: ${videoError.message}`);
      }

      setUploadState({
        status: "uploading",
        progress: 60,
        message: "Uploading poster...",
      });

      // Upload poster image
      const { error: posterError } = await supabase.storage
        .from("videos")
        .upload(posterStoragePath, posterBlob, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (posterError) {
        console.warn("Failed to upload poster:", posterError);
        // Continue without poster - it's optional
      }

      setUploadState({
        status: "processing",
        progress: 80,
        message: "Creating video record...",
      });

      // Get poster public URL
      const { data: posterUrlData } = posterError
        ? { data: null }
        : supabase.storage.from("videos").getPublicUrl(posterStoragePath);

      // Create database record
      const result = await createVideoRecord({
        userId,
        storagePath: videoStoragePath,
        posterUrl: posterUrlData?.publicUrl || null,
        caption: caption.trim(),
        durationSeconds: videoMetadata.duration,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create video record");
      }

      setUploadState({
        status: "success",
        progress: 100,
        message: "Upload complete!",
      });

      toast.success("Video uploaded successfully!");

      // Redirect to home feed after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadState({
        status: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Upload failed",
      });
      toast.error(error instanceof Error ? error.message : "Upload failed");

      // Cleanup: attempt to delete uploaded files
      if (videoStoragePath) {
        await deleteVideoFromStorage(videoStoragePath);
      }
    }
  };

  const isUploading =
    uploadState.status === "uploading" ||
    uploadState.status === "processing" ||
    uploadState.status === "validating";

  const canUpload =
    videoFile &&
    videoMetadata &&
    caption.trim().length >= VIDEO_CONSTRAINTS.CAPTION_MIN_LENGTH &&
    caption.trim().length <= VIDEO_CONSTRAINTS.CAPTION_MAX_LENGTH &&
    uploadState.status !== "uploading" &&
    uploadState.status !== "processing";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>
          Share your favorite pup moments with the world
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video file input */}
        {!videoFile ? (
          <div>
            <Label htmlFor="video-file">Video File</Label>
            <div
              className="border-border hover:border-primary mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-foreground mb-2 text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-muted-foreground text-xs">
                MP4 or WebM (max {VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB, up to{" "}
                {VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS}s)
              </p>
              <input
                ref={fileInputRef}
                id="video-file"
                type="file"
                accept={VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        ) : (
          <div>
            <Label>Selected Video</Label>
            <div className="border-border mt-2 space-y-4 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {posterPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={posterPreview}
                      alt="Video preview"
                      className="h-20 w-14 rounded object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-20 w-14 items-center justify-center rounded">
                      <Video className="text-muted-foreground h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-foreground text-sm font-medium">
                      {videoFile.name}
                    </p>
                    {videoMetadata && (
                      <div className="text-muted-foreground space-y-0.5 text-xs">
                        <p>
                          Duration: {formatDuration(videoMetadata.duration)}
                        </p>
                        <p>Size: {formatFileSize(videoMetadata.size)}</p>
                        <p>
                          Resolution: {videoMetadata.width} x{" "}
                          {videoMetadata.height}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveVideo}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Caption input */}
        <div>
          <Label htmlFor="caption">
            Caption{" "}
            <span className="text-muted-foreground text-xs">(required)</span>
          </Label>
          <Textarea
            id="caption"
            placeholder="Add a caption for your video..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={VIDEO_CONSTRAINTS.CAPTION_MAX_LENGTH}
            rows={3}
            disabled={isUploading}
            className="mt-2 resize-none"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {caption.trim().length} / {VIDEO_CONSTRAINTS.CAPTION_MAX_LENGTH}{" "}
            characters
          </p>
        </div>

        {/* Upload progress */}
        {uploadState.status !== "idle" && uploadState.status !== "error" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-foreground text-sm font-medium">
                {uploadState.message}
              </p>
              {uploadState.status === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Progress value={uploadState.progress} />
          </div>
        )}

        {/* Error message */}
        {uploadState.status === "error" && (
          <div className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Upload failed</p>
              <p className="mt-1 text-xs">{uploadState.message}</p>
            </div>
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!canUpload || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>Uploading...</>
          ) : uploadState.status === "success" ? (
            <>Redirecting...</>
          ) : (
            <>Upload Video</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
