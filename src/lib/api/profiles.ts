import type { Tables, Updates } from "@/types/database";
import { createClient } from "@/lib/supabase/browser-client";
import { createClient as createServerClient } from "@/lib/supabase/server-client";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = Updates<"profiles">;

/**
 * Fetch a user profile by ID
 * TODO: Implement actual query logic
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Fetch a user profile by username
 * TODO: Implement actual query logic
 */
export async function fetchProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

/**
 * Update a user profile (server-side)
 * TODO: Implement with authorization check (only owner)
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data as unknown as Profile;
}

/**
 * Create a new profile (typically called after user signup)
 * TODO: This should be triggered automatically via database trigger or webhook
 */
export async function createProfile(profile: {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}): Promise<Profile> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", error);
    throw error;
  }

  return data;
}
