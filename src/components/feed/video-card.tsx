"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { VideoPlayer } from "./video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VideoWithProfile } from "@/lib/api/videos";

interface VideoCardProps {
  video: VideoWithProfile;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  className?: string;
}

export function VideoCard({
  video,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onComment,
  onShare,
  className,
}: VideoCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(video.like_count);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLocalLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    onLike?.(video.id);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLocalLikeCount((prev) => prev + 1);
      setIsLikeAnimating(true);
      onLike?.(video.id);
      
      setTimeout(() => {
        setIsLikeAnimating(false);
      }, 1000);
    }
  };

  const videoUrl = video.storage_path.startsWith("http")
    ? video.storage_path
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${video.storage_path}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn("relative h-full w-full", className)}
    >
      <VideoPlayer
        src={videoUrl}
        poster={video.poster_url || undefined}
        isActive={isActive}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
        onDoubleTap={handleDoubleTap}
      />

      {isLikeAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Heart className="h-32 w-32 fill-red-500 text-red-500" />
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-20 flex items-end justify-between p-4">
        <div className="flex max-w-[70%] flex-col gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-white">
              <AvatarImage
                src={video.profile?.avatar_url || undefined}
                alt={video.profile?.username || "User"}
              />
              <AvatarFallback>
                {video.profile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                @{video.profile?.username || "unknown"}
              </span>
              <span className="text-xs text-white/80">
                {video.profile?.display_name || "User"}
              </span>
            </div>
          </div>

          {video.caption && (
            <p className="text-sm text-white line-clamp-3">{video.caption}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full text-white hover:bg-white/20",
              isLiked && "text-red-500"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-7 w-7", isLiked && "fill-current")} />
            <span className="sr-only">Like</span>
          </Button>
          <span className="text-xs font-semibold text-white">
            {localLikeCount}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={() => onComment?.(video.id)}
          >
            <MessageCircle className="h-7 w-7" />
            <span className="sr-only">Comment</span>
          </Button>
          <span className="text-xs font-semibold text-white">
            {video.comment_count}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            onClick={() => onShare?.(video.id)}
          >
            <Share2 className="h-7 w-7" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
