"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

export function useIntersectionObserver<T extends Element>({
  threshold = 0.5,
  root = null,
  rootMargin = "0px",
  onIntersect,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<T>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && onIntersect) {
          onIntersect(entry);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, onIntersect]);

  return { ref: targetRef, isIntersecting };
}
