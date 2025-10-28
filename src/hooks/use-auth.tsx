"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSupabase } from "@/components/providers/supabase-provider";

export function useAuth() {
  const { supabase } = useSupabase();
  const { user, session, profile, isLoading, setAuth, setProfile, clear } =
    useAuthStore();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    },
    [supabase, setProfile]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session);
      if (session?.user) {
        // Fetch profile
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, setAuth, clear, fetchProfile]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    refreshProfile,
  };
}
