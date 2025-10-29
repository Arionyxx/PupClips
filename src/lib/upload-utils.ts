/**
 * Utilities for video upload, validation, and processing
 */

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

export interface VideoValidationResult {
  valid: boolean;
  error?: string;
}

// Video upload constraints
export const VIDEO_CONSTRAINTS = {
  MAX_SIZE_MB: 100,
  MAX_SIZE_BYTES: 100 * 1024 * 1024, // 100MB
  MAX_DURATION_SECONDS: 60,
  MIN_DURATION_SECONDS: 1,
  ALLOWED_TYPES: ["video/mp4", "video/webm"],
  ALLOWED_EXTENSIONS: [".mp4", ".webm"],
  CAPTION_MIN_LENGTH: 1,
  CAPTION_MAX_LENGTH: 500,
};

/**
 * Validate video file before upload
 */
export function validateVideoFile(
  file: File,
  metadata: VideoMetadata
): VideoValidationResult {
  // Check file type
  if (!VIDEO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload MP4 or WebM videos.`,
    };
  }

  // Check file size
  if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB.`,
    };
  }

  // Check duration
  if (metadata.duration > VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video is too long. Maximum duration is ${VIDEO_CONSTRAINTS.MAX_DURATION_SECONDS} seconds.`,
    };
  }

  if (metadata.duration < VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video is too short. Minimum duration is ${VIDEO_CONSTRAINTS.MIN_DURATION_SECONDS} second.`,
    };
  }

  return { valid: true };
}

/**
 * Validate caption text
 */
export function validateCaption(caption: string): VideoValidationResult {
  const trimmedCaption = caption.trim();

  if (
    trimmedCaption.length < VIDEO_CONSTRAINTS.CAPTION_MIN_LENGTH ||
    trimmedCaption.length > VIDEO_CONSTRAINTS.CAPTION_MAX_LENGTH
  ) {
    return {
      valid: false,
      error: `Caption must be between ${VIDEO_CONSTRAINTS.CAPTION_MIN_LENGTH} and ${VIDEO_CONSTRAINTS.CAPTION_MAX_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

/**
 * Extract metadata from video file
 */
export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: file.type,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a poster frame from video at specified time
 * @param file Video file
 * @param timeInSeconds Time to capture frame (default: 1 second)
 * @returns Blob of the poster image (JPEG)
 */
export async function generatePosterFrame(
  file: File,
  timeInSeconds: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      // Ensure we don't seek beyond the video duration
      const seekTime = Math.min(timeInSeconds, video.duration / 2);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to canvas
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(video.src);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to generate poster blob"));
            }
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        URL.revokeObjectURL(video.src);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video for poster generation"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format duration for display (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generate a unique filename for the video
 */
export function generateVideoFilename(
  userId: string,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const extension = originalFilename.split(".").pop() || "mp4";
  return `${userId}/${timestamp}-${randomStr}.${extension}`;
}

/**
 * Generate a unique filename for the poster
 */
export function generatePosterFilename(
  userId: string,
  videoFilename: string
): string {
  const videoName = videoFilename.split("/").pop()?.split(".")[0];
  return `${userId}/${videoName}-poster.jpg`;
}
