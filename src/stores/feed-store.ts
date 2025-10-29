"use client";

import { create } from "zustand";
import type { VideoWithProfile } from "@/lib/api/videos";

interface FeedState {
  videos: VideoWithProfile[];
  currentIndex: number;
  isAutoplayEnabled: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasMore: boolean;
  setVideos: (videos: VideoWithProfile[]) => void;
  addVideos: (videos: VideoWithProfile[]) => void;
  setCurrentIndex: (index: number) => void;
  nextVideo: () => void;
  previousVideo: () => void;
  toggleAutoplay: () => void;
  toggleMute: () => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  updateVideoInteraction: (
    videoId: string,
    updates: { like_count?: number; comment_count?: number }
  ) => void;
  reset: () => void;
}

const initialState = {
  videos: [],
  currentIndex: 0,
  isAutoplayEnabled: true,
  isMuted: false,
  isLoading: false,
  hasMore: true,
};

export const useFeedStore = create<FeedState>((set, get) => ({
  ...initialState,
  setVideos: (videos) => set({ videos, currentIndex: 0 }),
  addVideos: (newVideos) => {
    const { videos } = get();
    const existingIds = new Set(videos.map((v) => v.id));
    const uniqueNewVideos = newVideos.filter((v) => !existingIds.has(v.id));
    set({ videos: [...videos, ...uniqueNewVideos] });
  },
  setCurrentIndex: (index) => {
    const { videos } = get();
    if (index >= 0 && index < videos.length) {
      set({ currentIndex: index });
    }
  },
  nextVideo: () => {
    const { currentIndex, videos } = get();
    if (currentIndex < videos.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },
  previousVideo: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },
  toggleAutoplay: () => set((state) => ({ isAutoplayEnabled: !state.isAutoplayEnabled })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  updateVideoInteraction: (videoId, updates) => {
    set((state) => ({
      videos: state.videos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              like_count: updates.like_count ?? video.like_count,
              comment_count: updates.comment_count ?? video.comment_count,
            }
          : video
      ),
    }));
  },
  reset: () => set(initialState),
}));
