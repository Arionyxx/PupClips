import { fetchVideosServer } from "@/lib/api/videos";
import { FeedContainer } from "@/components/feed";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const initialVideos = await fetchVideosServer({
    limit: 10,
    orderBy: "created_at",
    order: "desc",
  });

  if (initialVideos.length === 0) {
    return (
      <main className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to PupClips
          </h1>
          <p className="text-muted-foreground max-w-md">
            Your favorite short-form vertical video platform for dogs.
          </p>
          <p className="text-muted-foreground text-sm">
            No videos available yet. Sign in and start uploading amazing dog videos!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      <FeedContainer initialVideos={initialVideos} />
    </main>
  );
}
