"use client";

import { useCallback, useRef } from "react";

interface UseDoubleTapOptions {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  delay?: number;
}

export function useDoubleTap({
  onSingleTap,
  onDoubleTap,
  delay = 300,
}: UseDoubleTapOptions = {}) {
  const lastTapRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < delay && timeSinceLastTap > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (onDoubleTap) {
        onDoubleTap();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      
      if (onSingleTap) {
        timeoutRef.current = setTimeout(() => {
          onSingleTap();
          timeoutRef.current = null;
        }, delay);
      }
    }
  }, [onSingleTap, onDoubleTap, delay]);

  return handleTap;
}
