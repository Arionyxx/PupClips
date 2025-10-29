"use client";

import { useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { VideoCard } from "./video-card";
import { VideoSkeleton } from "./video-skeleton";
import { useFeedStore } from "@/stores";
import {
  useSwipeGesture,
  useKeyboardNavigation,
  useIntersectionObserver,
} from "@/hooks";
import { cn } from "@/lib/utils";
import type { VideoWithProfile } from "@/lib/api/videos";

interface VideoFeedProps {
  initialVideos: VideoWithProfile[];
  onLoadMore?: () => Promise<void>;
  className?: string;
}

export function VideoFeed({
  initialVideos,
  onLoadMore,
  className,
}: VideoFeedProps) {
  const {
    videos,
    currentIndex,
    isMuted,
    isLoading,
    hasMore,
    setVideos,
    setCurrentIndex,
    nextVideo,
    previousVideo,
    toggleMute,
    setLoading,
  } = useFeedStore();

  const videoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    if (initialVideos.length > 0 && videos.length === 0) {
      setVideos(initialVideos);
    }
  }, [initialVideos, videos.length, setVideos]);

  const scrollToVideo = useCallback((index: number) => {
    const videoElement = videoRefs.current.get(index);
    if (videoElement) {
      videoElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      nextVideo();
      scrollToVideo(currentIndex + 1);
    }
  }, [currentIndex, videos.length, nextVideo, scrollToVideo]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      previousVideo();
      scrollToVideo(currentIndex - 1);
    }
  }, [currentIndex, previousVideo, scrollToVideo]);

  const loadMoreVideos = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore || !onLoadMore) return;

    isLoadingMoreRef.current = true;
    setLoading(true);

    try {
      await onLoadMore();
    } catch (error) {
      console.error("Failed to load more videos:", error);
    } finally {
      setLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [hasMore, onLoadMore, setLoading]);

  useEffect(() => {
    if (currentIndex >= videos.length - 3 && hasMore && !isLoading) {
      loadMoreVideos();
    }
  }, [currentIndex, videos.length, hasMore, isLoading, loadMoreVideos]);

  const containerRef = useSwipeGesture<HTMLDivElement>({
    onSwipeUp: handleNext,
    onSwipeDown: handlePrevious,
  });

  useKeyboardNavigation({
    onArrowDown: handleNext,
    onArrowUp: handlePrevious,
  });

  const { ref: sentinelRef } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    onIntersect: () => {
      if (hasMore && !isLoading) {
        loadMoreVideos();
      }
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const videoHeight = container.clientHeight;
      const newIndex = Math.round(scrollPosition / videoHeight);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < videos.length
      ) {
        setCurrentIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [currentIndex, videos.length, setCurrentIndex, containerRef]);

  if (videos.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No videos available</h2>
          <p className="text-muted-foreground mt-2">
            Check back later for new content!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "feed-scroll snap-vertical h-full w-full overflow-y-scroll",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {videos.map((video, index) => (
          <div
            key={video.id}
            ref={(el) => {
              if (el) {
                videoRefs.current.set(index, el);
              } else {
                videoRefs.current.delete(index);
              }
            }}
            className="h-[calc(100vh-4rem)] w-full snap-start"
          >
            <VideoCard
              video={video}
              isActive={index === currentIndex}
              isMuted={isMuted}
              onMuteToggle={toggleMute}
            />
          </div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex h-[calc(100vh-4rem)] w-full snap-start items-center justify-center"
        >
          <VideoSkeleton />
        </div>
      )}
    </div>
  );
}
