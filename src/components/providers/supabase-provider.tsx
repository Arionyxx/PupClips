"use client";

import { createClient } from "@/lib/supabase/browser-client";
import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

import { createContext, useContext } from "react";

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
