import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/session";
import { UploadForm } from "@/components/upload/upload-form";

export default async function UploadPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <UploadForm userId={user.id} />
    </main>
  );
}
