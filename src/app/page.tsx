export default function FeedPage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to PupClips 🐾
        </h1>
        <p className="text-muted-foreground max-w-md">
          Your favorite short-form vertical video platform for dogs.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="/upload"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium"
          >
            Upload Video
          </a>
          <a
            href="/auth"
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md border px-6 py-2 text-sm font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
