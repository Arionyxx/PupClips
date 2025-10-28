"use server";

import { createClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(
  email: string,
  password: string,
  username?: string
): Promise<AuthResult> {
  const supabase = await createClient();

  // Extract username from email prefix if not provided
  const derivedUsername =
    username || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: derivedUsername,
        display_name: derivedUsername,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user was created successfully
  if (data.user) {
    // The handle_new_user() trigger should automatically create the profile
    // But we'll add a manual check/creation as a fallback
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        username: derivedUsername,
        display_name: derivedUsername,
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't return error here as the trigger might have created it
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
