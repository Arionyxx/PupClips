"use server";

import { createClient } from "@/lib/supabase/server-client";
import { requireAuth } from "@/lib/supabase/session";
import { revalidatePath } from "next/cache";

export interface UploadVideoResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface CreateVideoRecordInput {
  userId: string;
  storagePath: string;
  posterUrl: string | null;
  caption: string;
  durationSeconds: number;
}

/**
 * Create a video record in the database after upload
 */
export async function createVideoRecord(
  input: CreateVideoRecordInput
): Promise<UploadVideoResult> {
  try {
    // Verify authentication
    const user = await requireAuth();
    if (user.id !== input.userId) {
      return {
        success: false,
        error: "Unauthorized: User ID mismatch",
      };
    }

    const supabase = await createClient();

    // Create video record
    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: input.userId,
        storage_path: input.storagePath,
        poster_url: input.posterUrl,
        caption: input.caption.trim(),
        duration_seconds: Math.round(input.durationSeconds),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video record:", error);
      return {
        success: false,
        error: "Failed to create video record",
      };
    }

    // Revalidate the home page to show new video
    revalidatePath("/");

    return {
      success: true,
      videoId: data.id,
    };
  } catch (error) {
    console.error("Error in createVideoRecord:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a video from storage (for cleanup on failure)
 */
export async function deleteVideoFromStorage(
  storagePath: string
): Promise<void> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Extract user ID from storage path to verify ownership
    const pathUserId = storagePath.split("/")[0];
    if (pathUserId !== user.id) {
      console.error("Unauthorized: Cannot delete another user's video");
      return;
    }

    const { error } = await supabase.storage
      .from("videos")
      .remove([storagePath]);

    if (error) {
      console.error("Error deleting video from storage:", error);
    }
  } catch (error) {
    console.error("Error in deleteVideoFromStorage:", error);
  }
}

/**
 * Get signed upload URL for direct upload to Supabase Storage
 * This is an alternative approach but we'll use direct client upload
 */
export async function getUploadUrl(
  filename: string
): Promise<{ url: string; path: string } | { error: string }> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const storagePath = `${user.id}/${filename}`;

    // Create a signed upload URL (valid for 60 seconds)
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("Error creating signed upload URL:", error);
      return { error: "Failed to create upload URL" };
    }

    return {
      url: data.signedUrl,
      path: storagePath,
    };
  } catch (error) {
    console.error("Error in getUploadUrl:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
