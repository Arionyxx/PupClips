export default function FeedPage() {
  return (
    <main className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to PupClips
        </h1>
        <p className="text-muted-foreground max-w-md">
          Your favorite short-form vertical video platform for dogs.
        </p>
        <p className="text-muted-foreground text-sm">
          Sign in to start uploading and discovering amazing dog videos!
        </p>
      </div>
    </main>
  );
}
