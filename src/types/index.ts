// Core type definitions for PupClips

// Re-export database types
export type { Database } from "./database";
export type { Database as SupabaseDatabase } from "./database";

// Convenience types from database schema
import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type VideoInsert = Database["public"]["Tables"]["videos"]["Insert"];
export type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"];

export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type LikeInsert = Database["public"]["Tables"]["likes"]["Insert"];

export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

export type VideoWithProfile =
  Database["public"]["Views"]["videos_with_profiles"]["Row"];

// Legacy types for compatibility (can be removed later)
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}
