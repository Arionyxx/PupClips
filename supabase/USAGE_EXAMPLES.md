# Supabase Usage Examples

This guide shows how to use the PupClips database schema in your Next.js application.

## Setup Supabase Client

First, create a Supabase client instance:

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

## Using TypeScript Types

Import and use the generated types:

```typescript
import type { Profile, Video, VideoInsert, VideoWithProfile } from "@/types";
import { supabase } from "@/lib/supabase";
```

## Common Operations

### Authentication

#### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    data: {
      username: "johndoe",
      display_name: "John Doe",
    },
  },
});

// Profile is automatically created via trigger
```

#### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});
```

#### Get Current User

```typescript
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
```

### Profiles

#### Get User Profile

```typescript
const { data: profile, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId)
  .single();

// profile is typed as Profile
```

#### Update Profile

```typescript
const { data, error } = await supabase
  .from("profiles")
  .update({
    display_name: "New Name",
    bio: "Updated bio",
    avatar_url: "https://example.com/avatar.jpg",
  })
  .eq("id", userId)
  .select()
  .single();
```

#### Search Profiles by Username

```typescript
const { data: profiles, error } = await supabase
  .from("profiles")
  .select("*")
  .ilike("username", `%${searchTerm}%`)
  .limit(10);
```

### Videos

#### Get Video Feed (with profile info)

```typescript
const { data: videos, error } = await supabase
  .from("videos_with_profiles")
  .select("*")
  .order("created_at", { ascending: false })
  .range(0, 9); // First 10 videos

// videos is typed as VideoWithProfile[]
```

#### Get User's Videos

```typescript
const { data: videos, error } = await supabase
  .from("videos")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

#### Upload and Create Video

```typescript
// 1. Upload video file to storage
const videoFile = new File([blob], "video.mp4", { type: "video/mp4" });
const fileName = `${userId}/${crypto.randomUUID()}.mp4`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from("videos")
  .upload(fileName, videoFile, {
    contentType: "video/mp4",
    upsert: false,
  });

if (uploadError) throw uploadError;

// 2. Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from("videos").getPublicUrl(fileName);

// 3. Create video record in database
const { data: video, error } = await supabase
  .from("videos")
  .insert({
    user_id: userId,
    storage_path: fileName,
    poster_url: posterUrl, // Optional thumbnail
    caption: "Check out my pup!",
    duration_seconds: 15,
  })
  .select()
  .single();
```

#### Update Video

```typescript
const { data, error } = await supabase
  .from("videos")
  .update({
    caption: "Updated caption",
  })
  .eq("id", videoId)
  .eq("user_id", userId) // Ensure user owns the video
  .select()
  .single();
```

#### Delete Video

```typescript
// 1. Delete video record (triggers will handle related likes/comments)
const { error: dbError } = await supabase
  .from("videos")
  .delete()
  .eq("id", videoId)
  .eq("user_id", userId);

// 2. Delete from storage
const { error: storageError } = await supabase.storage
  .from("videos")
  .remove([storagePath]);
```

### Likes

#### Check if User Liked Video

```typescript
// Using helper function
const { data: hasLiked, error } = await supabase.rpc("has_user_liked_video", {
  video_uuid: videoId,
  user_uuid: userId,
});

// Or query directly
const { data: like, error } = await supabase
  .from("likes")
  .select("id")
  .eq("video_id", videoId)
  .eq("user_id", userId)
  .maybeSingle();

const hasLiked = !!like;
```

#### Like a Video

```typescript
const { data, error } = await supabase.from("likes").insert({
  video_id: videoId,
  user_id: userId,
});

// Trigger automatically increments video.like_count
```

#### Unlike a Video

```typescript
const { error } = await supabase
  .from("likes")
  .delete()
  .eq("video_id", videoId)
  .eq("user_id", userId);

// Trigger automatically decrements video.like_count
```

#### Get Users Who Liked a Video

```typescript
const { data: likes, error } = await supabase
  .from("likes")
  .select(
    `
    id,
    created_at,
    profiles (
      id,
      username,
      display_name,
      avatar_url
    )
  `
  )
  .eq("video_id", videoId)
  .order("created_at", { ascending: false });
```

### Comments

#### Get Comments for Video

```typescript
const { data: comments, error } = await supabase
  .from("comments")
  .select(
    `
    id,
    content,
    created_at,
    profiles (
      id,
      username,
      display_name,
      avatar_url
    )
  `
  )
  .eq("video_id", videoId)
  .order("created_at", { ascending: false });
```

#### Add Comment

```typescript
const { data: comment, error } = await supabase
  .from("comments")
  .insert({
    video_id: videoId,
    user_id: userId,
    content: "Awesome video!",
  })
  .select()
  .single();

// Trigger automatically increments video.comment_count
```

#### Update Comment

```typescript
const { data, error } = await supabase
  .from("comments")
  .update({
    content: "Updated comment",
  })
  .eq("id", commentId)
  .eq("user_id", userId) // Ensure user owns the comment
  .select()
  .single();
```

#### Delete Comment

```typescript
const { error } = await supabase
  .from("comments")
  .delete()
  .eq("id", commentId)
  .eq("user_id", userId);

// Trigger automatically decrements video.comment_count
```

## Real-time Subscriptions

### Subscribe to New Comments on a Video

```typescript
const channel = supabase
  .channel("video-comments")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "comments",
      filter: `video_id=eq.${videoId}`,
    },
    (payload) => {
      console.log("New comment:", payload.new);
      // Update your UI with the new comment
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Subscribe to Like Count Changes

```typescript
const channel = supabase
  .channel("video-likes")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "videos",
      filter: `id=eq.${videoId}`,
    },
    (payload) => {
      console.log("Video updated:", payload.new);
      // Update like_count in your UI
    }
  )
  .subscribe();
```

## Pagination

### Cursor-based Pagination for Feed

```typescript
async function getVideoFeed(cursor?: string, limit = 10) {
  let query = supabase
    .from("videos_with_profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  return {
    videos: data || [],
    nextCursor:
      data && data.length > 0 ? data[data.length - 1].created_at : null,
    hasMore: data && data.length === limit,
  };
}

// Usage
const { videos, nextCursor, hasMore } = await getVideoFeed();

// Load more
if (hasMore) {
  const { videos: moreVideos } = await getVideoFeed(nextCursor);
}
```

## Error Handling

```typescript
async function fetchVideo(videoId: string) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", videoId)
    .single();

  if (error) {
    // Handle different error types
    if (error.code === "PGRST116") {
      // Not found
      throw new Error("Video not found");
    }
    if (error.code === "42501") {
      // RLS policy violation
      throw new Error("Unauthorized");
    }
    throw error;
  }

  return data;
}
```

## React Hooks Examples

### useProfile Hook

```typescript
// src/hooks/useProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}
```

### useVideoFeed Hook

```typescript
// src/hooks/useVideoFeed.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { VideoWithProfile } from "@/types";

export function useVideoFeed(limit = 10) {
  const [videos, setVideos] = useState<VideoWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from("videos_with_profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        setVideos(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [limit]);

  return { videos, loading, error };
}
```

## Server-Side Usage (Server Components, API Routes)

### In Server Components

```typescript
// app/videos/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export default async function VideoPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: video } = await supabase
    .from('videos_with_profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!video) {
    return <div>Video not found</div>;
  }

  return <VideoPlayer video={video} />;
}
```

### In API Routes

```typescript
// app/api/videos/[id]/like/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Like the video
  const { data, error } = await supabase.from("likes").insert({
    video_id: params.id,
    user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

## Best Practices

1. **Always type your Supabase client** with the Database type for full TypeScript support
2. **Use RLS policies** - Never bypass them unless absolutely necessary (use service role key)
3. **Handle errors** - Check for both `error` and `data` in responses
4. **Use transactions** when you need atomic operations
5. **Leverage real-time** for live updates (comments, likes)
6. **Optimize queries** - Use `select()` to fetch only needed columns
7. **Use indexes** - The schema includes indexes for common queries
8. **Paginate results** - Don't fetch all records at once
9. **Cache on client** - Use React Query or SWR for data caching
10. **Clean up subscriptions** - Always unsubscribe from real-time channels

## Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
