import type { Tables, Inserts, Updates } from "@/types/database";
import { createClient } from "@/lib/supabase/browser-client";
import { createClient as createServerClient } from "@/lib/supabase/server-client";

export type Video = Tables<"videos">;
export type VideoInsert = Inserts<"videos">;
export type VideoUpdate = Updates<"videos">;

export interface FetchVideosOptions {
  limit?: number;
  offset?: number;
  userId?: string;
  orderBy?: "created_at" | "views_count" | "likes_count";
  order?: "asc" | "desc";
}

export interface VideoWithProfile extends Video {
  profile?: Tables<"profiles">;
}

/**
 * Fetch videos for the feed (client-side)
 * TODO: Implement actual query logic once database schema is ready
 */
export async function fetchVideos(
  options: FetchVideosOptions = {}
): Promise<VideoWithProfile[]> {
  const {
    limit = 10,
    offset = 0,
    userId,
    orderBy = "created_at",
    order = "desc",
  } = options;

  const supabase = createClient();

  let query = supabase
    .from("videos")
    .select("*")
    .order(orderBy, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }

  // TODO: Join with profiles table once relationships are defined in schema
  return (data || []) as VideoWithProfile[];
}

/**
 * Fetch a single video by ID (client-side)
 * TODO: Implement actual query logic
 */
export async function fetchVideoById(
  id: string
): Promise<VideoWithProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching video:", error);
    return null;
  }

  // TODO: Join with profiles table once relationships are defined in schema
  return data as VideoWithProfile;
}

/**
 * Create a new video (server-side)
 * TODO: Implement actual insert logic and file upload
 */
export async function createVideo(video: VideoInsert): Promise<Video> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("videos")
    .insert(video as any)
    .select()
    .single();

  if (error) {
    console.error("Error creating video:", error);
    throw error;
  }

  return data as unknown as Video;
}

/**
 * Update a video (server-side)
 * TODO: Implement actual update logic with authorization check
 */
export async function updateVideo(
  id: string,
  updates: VideoUpdate
): Promise<Video> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("videos")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating video:", error);
    throw error;
  }

  return data as unknown as Video;
}

/**
 * Delete a video (server-side)
 * TODO: Implement actual delete logic with authorization check
 */
export async function deleteVideo(id: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.from("videos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
}

/**
 * Increment video view count
 * TODO: Implement with proper deduplication logic and create RPC function in database
 */
export async function incrementVideoViews(videoId: string): Promise<void> {
  // TODO: Create increment_video_views RPC function in Supabase
  // Views tracking not yet implemented in schema
  console.log("Video view tracking not yet implemented:", videoId);
}
