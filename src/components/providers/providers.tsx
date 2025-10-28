"use client";

import { Toaster } from "@/components/ui/sonner";
import { SupabaseProvider } from "./supabase-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      {children}
      <Toaster />
    </SupabaseProvider>
  );
}
