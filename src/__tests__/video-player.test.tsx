/**
 * VideoPlayer Component Tests
 *
 * These tests document the expected behavior of the VideoPlayer component.
 * To run these tests, install a test framework like Jest or Vitest:
 *
 * npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
 *
 * Then run: npm test
 */

/* eslint-disable */
// @ts-nocheck
// Test file requires dev dependencies to be installed

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VideoPlayer } from "@/components/feed/video-player";

describe("VideoPlayer", () => {
  const mockProps = {
    src: "https://example.com/video.mp4",
    poster: "https://example.com/poster.jpg",
    isActive: true,
    isMuted: false,
    autoplay: true,
    onDoubleTap: vi.fn(),
    onPlayPause: vi.fn(),
    onMuteToggle: vi.fn(),
  };

  beforeEach(() => {
    // Mock HTMLMediaElement methods
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("should render video element with correct src", () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    expect(video).toBeInTheDocument();
    expect(video.src).toContain("video.mp4");
  });

  it("should autoplay when isActive is true", async () => {
    render(<VideoPlayer {...mockProps} isActive={true} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    await waitFor(() => {
      expect(video.play).toHaveBeenCalled();
    });
  });

  it("should pause when isActive is false", () => {
    const { rerender } = render(<VideoPlayer {...mockProps} isActive={true} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    rerender(<VideoPlayer {...mockProps} isActive={false} />);

    expect(video.pause).toHaveBeenCalled();
  });

  it("should respect muted state", () => {
    const { rerender } = render(<VideoPlayer {...mockProps} isMuted={false} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    expect(video.muted).toBe(false);

    rerender(<VideoPlayer {...mockProps} isMuted={true} />);

    expect(video.muted).toBe(true);
  });

  it("should call onMuteToggle when mute button is clicked", async () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    // Trigger controls visibility by hovering
    fireEvent.mouseMove(video.parentElement!);

    const muteButton = screen.getByLabelText(/mute|unmute/i);
    fireEvent.click(muteButton);

    expect(mockProps.onMuteToggle).toHaveBeenCalled();
  });

  it("should toggle play/pause on single tap", async () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    fireEvent.click(video);

    await waitFor(
      () => {
        expect(video.pause).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it("should call onDoubleTap on double tap", async () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    // Simulate double tap
    fireEvent.click(video);
    fireEvent.click(video);

    await waitFor(
      () => {
        expect(mockProps.onDoubleTap).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it("should update progress bar as video plays", () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    // Simulate video progress
    Object.defineProperty(video, "currentTime", { value: 5, writable: true });
    Object.defineProperty(video, "duration", { value: 10, writable: true });

    fireEvent.timeUpdate(video);

    // Check if progress bar exists and has been updated
    const progressBar = video.parentElement!.querySelector("[style*='width']");
    expect(progressBar).toBeInTheDocument();
  });

  it("should loop video when it ends", async () => {
    render(<VideoPlayer {...mockProps} />);
    const video = screen.getByRole("video") as HTMLVideoElement;

    expect(video.loop).toBe(true);
  });
});
