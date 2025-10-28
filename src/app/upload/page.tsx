import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Upload Video</h1>
          <p className="text-muted-foreground">
            Share your favorite pup moments with the world
          </p>
        </div>
        <div className="border-border space-y-4 rounded-lg border-2 border-dashed p-12 text-center">
          <UploadCloud className="text-muted-foreground mx-auto h-12 w-12" />
          <div>
            <p className="text-muted-foreground text-sm">
              Upload functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
