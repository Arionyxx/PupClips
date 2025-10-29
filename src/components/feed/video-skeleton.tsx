"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function VideoSkeleton() {
  return (
    <div className="relative h-full w-full bg-gray-900">
      <Skeleton className="h-full w-full" />
      
      <div className="absolute inset-x-0 bottom-20 flex items-end justify-between p-4">
        <div className="flex max-w-[70%] flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-64" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
