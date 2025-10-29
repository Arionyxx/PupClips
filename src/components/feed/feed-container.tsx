"use client";

import { useCallback } from "react";
import { VideoFeed } from "./video-feed";
import { useFeedStore } from "@/stores";
import type { VideoWithProfile } from "@/lib/api/videos";

interface FeedContainerProps {
  initialVideos: VideoWithProfile[];
}

export function FeedContainer({ initialVideos }: FeedContainerProps) {
  const { videos, addVideos, setHasMore } = useFeedStore();

  const handleLoadMore = useCallback(async () => {
    const offset = videos.length || initialVideos.length;

    try {
      const response = await fetch(
        `/api/videos?limit=10&offset=${offset}&orderBy=created_at&order=desc`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        addVideos(data.videos);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more videos:", error);
      setHasMore(false);
    }
  }, [videos.length, initialVideos.length, addVideos, setHasMore]);

  return (
    <VideoFeed initialVideos={initialVideos} onLoadMore={handleLoadMore} />
  );
}
