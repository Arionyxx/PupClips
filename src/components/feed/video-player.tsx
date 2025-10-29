"use client";

import { useRef, useEffect, useState, forwardRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoubleTap } from "@/hooks";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isActive: boolean;
  isMuted: boolean;
  autoplay?: boolean;
  onDoubleTap?: () => void;
  onPlayPause?: (isPlaying: boolean) => void;
  onMuteToggle?: () => void;
  className?: string;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      src,
      poster,
      isActive,
      isMuted,
      autoplay = true,
      onDoubleTap,
      onPlayPause,
      onMuteToggle,
      className,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showPlayIcon, setShowPlayIcon] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (ref && typeof ref === "function") {
        ref(videoRef.current);
      } else if (ref) {
        ref.current = videoRef.current;
      }
    }, [ref]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isActive && autoplay) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Autoplay failed:", error);
            setIsPlaying(false);
          });
      } else {
        video.pause();
        // Synchronize React state with video element state
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsPlaying(false);
      }
    }, [isActive, autoplay]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = isMuted;
    }, [isMuted]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateProgress = () => {
        const value = (video.currentTime / video.duration) * 100;
        setProgress(isNaN(value) ? 0 : value);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        video.currentTime = 0;
        if (isActive && autoplay) {
          video.play();
        }
      };

      video.addEventListener("timeupdate", updateProgress);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("timeupdate", updateProgress);
        video.removeEventListener("ended", handleEnded);
      };
    }, [isActive, autoplay]);

    const togglePlayPause = () => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play();
        setIsPlaying(true);
        onPlayPause?.(true);
      } else {
        video.pause();
        setIsPlaying(false);
        onPlayPause?.(false);
      }

      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    };

    const handleDoubleTap = useDoubleTap({
      onSingleTap: togglePlayPause,
      onDoubleTap,
    });

    const handleMouseMove = () => {
      setShowControls(true);

      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      video.currentTime = percentage * video.duration;
    };

    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden bg-black",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          loop
          className="h-full w-full object-contain"
          onClick={handleDoubleTap}
        />

        {showPlayIcon && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/50 p-6 backdrop-blur-sm">
              {isPlaying ? (
                <Play className="h-12 w-12 text-white" />
              ) : (
                <Pause className="h-12 w-12 text-white" />
              )}
            </div>
          </div>
        )}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className="h-1 w-full cursor-pointer overflow-hidden rounded-full bg-white/30"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={togglePlayPause}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={onMuteToggle}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
