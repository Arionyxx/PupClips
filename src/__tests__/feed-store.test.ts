/**
 * Feed Store Tests
 *
 * These tests document the expected behavior of the useFeedStore.
 * To run these tests, install a test framework like Jest or Vitest:
 *
 * npm install --save-dev vitest @testing-library/react @testing-library/react-hooks
 *
 * Then run: npm test
 */

/* eslint-disable */
// @ts-nocheck
// Test file requires dev dependencies to be installed

import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFeedStore } from "@/stores/feed-store";

describe("useFeedStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFeedStore());
    act(() => {
      result.current.reset();
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useFeedStore());

    expect(result.current.videos).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isAutoplayEnabled).toBe(true);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });

  it("should set videos and reset index", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
      {
        id: "2",
        user_id: "user2",
        storage_path: "path2",
        like_count: 5,
        comment_count: 2,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
    });

    expect(result.current.videos).toEqual(mockVideos);
    expect(result.current.currentIndex).toBe(0);
  });

  it("should navigate to next video", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
      {
        id: "2",
        user_id: "user2",
        storage_path: "path2",
        like_count: 5,
        comment_count: 2,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
      result.current.nextVideo();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("should not navigate past last video", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
      result.current.nextVideo();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("should navigate to previous video", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
      {
        id: "2",
        user_id: "user2",
        storage_path: "path2",
        like_count: 5,
        comment_count: 2,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
      result.current.setCurrentIndex(1);
      result.current.previousVideo();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("should not navigate before first video", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
      result.current.previousVideo();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("should toggle autoplay", () => {
    const { result } = renderHook(() => useFeedStore());

    act(() => {
      result.current.toggleAutoplay();
    });

    expect(result.current.isAutoplayEnabled).toBe(false);

    act(() => {
      result.current.toggleAutoplay();
    });

    expect(result.current.isAutoplayEnabled).toBe(true);
  });

  it("should toggle mute", () => {
    const { result } = renderHook(() => useFeedStore());

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it("should add videos without duplicates", () => {
    const { result } = renderHook(() => useFeedStore());
    const initialVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
    ];
    const newVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      }, // Duplicate
      {
        id: "2",
        user_id: "user2",
        storage_path: "path2",
        like_count: 5,
        comment_count: 2,
      },
    ];

    act(() => {
      result.current.setVideos(initialVideos as any);
      result.current.addVideos(newVideos as any);
    });

    expect(result.current.videos).toHaveLength(2);
    expect(result.current.videos.map((v) => v.id)).toEqual(["1", "2"]);
  });

  it("should update video interaction counts", () => {
    const { result } = renderHook(() => useFeedStore());
    const mockVideos = [
      {
        id: "1",
        user_id: "user1",
        storage_path: "path1",
        like_count: 0,
        comment_count: 0,
      },
      {
        id: "2",
        user_id: "user2",
        storage_path: "path2",
        like_count: 5,
        comment_count: 2,
      },
    ];

    act(() => {
      result.current.setVideos(mockVideos as any);
      result.current.updateVideoInteraction("1", {
        like_count: 10,
        comment_count: 3,
      });
    });

    expect(result.current.videos[0].like_count).toBe(10);
    expect(result.current.videos[0].comment_count).toBe(3);
  });
});
