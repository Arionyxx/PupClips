import type { Tables, Inserts } from "@/types/supabase";
import { createClient } from "@/lib/supabase/browser-client";
import { createClient as createServerClient } from "@/lib/supabase/server-client";

export type Like = Tables<"likes">;
export type Comment = Tables<"comments">;
export type CommentInsert = Inserts<"comments">;

export interface CommentWithProfile extends Comment {
  profile?: Tables<"profiles">;
}

/**
 * Check if the current user has liked a video
 * TODO: Implement actual query logic
 */
export async function hasUserLikedVideo(
  userId: string,
  videoId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();

  if (error) {
    console.error("Error checking like status:", error);
    return false;
  }

  return !!data;
}

/**
 * Toggle like on a video (create if doesn't exist, delete if exists)
 * TODO: Implement with optimistic updates and proper error handling
 */
export async function toggleVideoLike(
  userId: string,
  videoId: string
): Promise<{ liked: boolean }> {
  const supabase = createClient();

  const hasLiked = await hasUserLikedVideo(userId, videoId);

  if (hasLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("video_id", videoId);

    if (error) {
      console.error("Error removing like:", error);
      throw error;
    }

    return { liked: false };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, video_id: videoId });

    if (error) {
      console.error("Error adding like:", error);
      throw error;
    }

    return { liked: true };
  }
}

/**
 * Fetch comments for a video
 * TODO: Implement with pagination and nested replies support
 */
export async function fetchVideoComments(
  videoId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<CommentWithProfile[]> {
  const { limit = 20, offset = 0 } = options;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("video_id", videoId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  // TODO: Join with profiles table once relationships are defined in schema
  return (data || []) as CommentWithProfile[];
}

/**
 * Create a new comment on a video
 * TODO: Implement with proper validation and sanitization
 */
export async function createComment(
  comment: CommentInsert
): Promise<CommentWithProfile> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }

  // TODO: Join with profiles table once relationships are defined in schema
  return data as CommentWithProfile;
}

/**
 * Delete a comment
 * TODO: Implement with authorization check (only owner or admin)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

/**
 * Fetch replies to a comment
 * TODO: Implement nested replies support
 */
export async function fetchCommentReplies(
  parentId: string
): Promise<CommentWithProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comment replies:", error);
    throw error;
  }

  // TODO: Join with profiles table once relationships are defined in schema
  return (data || []) as CommentWithProfile[];
}
