# Supabase Integration Guide

This document provides detailed information about the Supabase integration in PupClips.

## Overview

PupClips uses Supabase as its backend service, providing:

- **Authentication**: User sign-up, sign-in, and session management
- **Database**: PostgreSQL database with Row Level Security (RLS)
- **Storage**: File storage for videos and thumbnails
- **Realtime**: Live updates for likes, comments, and notifications

## Architecture

### Client Configuration

The application uses different Supabase clients depending on the execution context:

- **Browser Client** (`src/lib/supabase/browser-client.ts`): For client-side operations
- **Server Client** (`src/lib/supabase/server-client.ts`): For server components and API routes
- **Service Client** (`src/lib/supabase/server-client.ts`): For admin operations (optional)

### Session Management

Session persistence is handled through:

1. **Middleware** (`src/middleware.ts`): Refreshes the session on every request
2. **SupabaseProvider** (`src/components/providers/supabase-provider.tsx`): Provides Supabase client to React components
3. **Session Helpers** (`src/lib/supabase/session.ts`): Server-side utilities for getting user info

### Authentication Flow

```
User Sign-in → Supabase Auth → Session Cookie → Middleware Refresh → Persistent Session
```

The middleware automatically:

- Refreshes expired sessions
- Syncs auth state between server and client
- Protects routes (e.g., `/upload` requires authentication)

## Environment Variables

### Required Variables

Create a `.env.local` file with these variables:

```env
# Supabase Project URL (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (public, safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (private, server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Getting Your Keys

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public** key
4. (Optional) Copy the **service_role** key for admin operations

## API Layer

### Structure

The API layer is organized by domain:

- `src/lib/api/videos.ts` - Video CRUD operations
- `src/lib/api/interactions.ts` - Likes and comments
- `src/lib/api/profiles.ts` - User profiles

### Usage Examples

#### Fetching Videos (Client-side)

```typescript
import { fetchVideos } from "@/lib/api";

export function VideoFeed() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchVideos({ limit: 10, orderBy: "created_at" })
      .then(setVideos)
      .catch(console.error);
  }, []);

  return <div>{/* Render videos */}</div>;
}
```

#### Creating a Video (Server Action)

```typescript
"use server";

import { createVideo } from "@/lib/api";
import { requireAuth } from "@/lib/supabase/session";

export async function uploadVideo(formData: FormData) {
  const user = await requireAuth();

  const video = await createVideo({
    user_id: user.id,
    title: formData.get("title") as string,
    video_url: "https://...",
    duration: 30,
  });

  return { success: true, video };
}
```

#### Toggling a Like (Client-side)

```typescript
import { toggleVideoLike } from "@/lib/api";
import { useAuth } from "@/hooks";

export function LikeButton({ videoId }: { videoId: string }) {
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return;
    const { liked } = await toggleVideoLike(user.id, videoId);
    console.log(liked ? "Liked!" : "Unliked!");
  };

  return <button onClick={handleLike}>Like</button>;
}
```

## Realtime Subscriptions

### Basic Usage

```typescript
import { createRealtimeSubscription, unsubscribeRealtimeChannel } from "@/lib/supabase";

function VideoLikesCount({ videoId }: { videoId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const channel = createRealtimeSubscription({
      table: "likes",
      event: "INSERT",
      filter: `video_id=eq.${videoId}`,
      onEvent: (payload) => {
        setCount(c => c + 1);
      },
    });

    return () => unsubscribeRealtimeChannel(channel);
  }, [videoId]);

  return <span>{count} likes</span>;
}
```

### Listening to Multiple Events

```typescript
const channel = createRealtimeSubscription({
  table: "comments",
  event: "*", // Listen to INSERT, UPDATE, DELETE
  filter: `video_id=eq.${videoId}`,
  onEvent: (payload) => {
    console.log("Comment event:", payload.eventType, payload.new);
  },
});
```

## Type Generation

The `src/types/supabase.ts` file contains TypeScript types matching your database schema.

### Generate Types from Your Schema

```bash
# From Supabase Cloud
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts

# From Local Development
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Using Generated Types

```typescript
import type { Tables, Inserts, Updates } from "@/types/supabase";

// Type for a video row
type Video = Tables<"videos">;

// Type for inserting a video
type NewVideo = Inserts<"videos">;

// Type for updating a video
type VideoUpdate = Updates<"videos">;
```

## Protected Routes

The middleware protects certain routes from unauthenticated access:

```typescript
// In src/middleware.ts
if (!user && request.nextUrl.pathname.startsWith("/upload")) {
  // Redirect to /auth
  return NextResponse.redirect(url);
}
```

To add more protected routes, update the middleware condition.

## Custom Hooks

### useAuth

Gets the current authenticated user on the client:

```typescript
import { useAuth } from "@/hooks";

function UserProfile() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return <div>Welcome, {user.email}</div>;
}
```

### useSupabase

Gets the Supabase client instance:

```typescript
import { useSupabase } from "@/components/providers";

function CustomComponent() {
  const { supabase } = useSupabase();

  // Use supabase client directly
  const handleCustomQuery = async () => {
    const { data } = await supabase.from("videos").select("*");
  };
}
```

## Database Schema

The current types include these tables (placeholders - update with your actual schema):

- **videos** - Video metadata (title, description, URL, counts)
- **profiles** - User profiles (username, avatar, bio)
- **likes** - Video likes (user_id, video_id)
- **comments** - Video comments (content, user_id, video_id, parent_id)

## Security Best Practices

1. **Row Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for read/write access
   - Use `auth.uid()` to restrict access to user's own data

2. **Service Role Key**
   - Only use in server-side code
   - Never expose to the client
   - Store securely in environment variables

3. **Anonymous Key**
   - Safe to use in browser
   - Respects RLS policies
   - Use for all client-side operations

4. **API Layer**
   - Use typed API functions instead of direct Supabase queries
   - Validate input on the server
   - Implement proper error handling

## Testing Authentication

Visit `/auth/debug` to see the current authentication state and verify:

- User is authenticated
- Session is active
- User data is accessible

## Troubleshooting

### Session Not Persisting

1. Check that middleware is running on all routes
2. Verify environment variables are set correctly
3. Clear cookies and sign in again

### TypeScript Errors

1. Regenerate types from your schema
2. Ensure `@/types/supabase` is imported correctly
3. Check that all table names match your database

### Realtime Not Working

1. Enable Realtime in Supabase dashboard (Database → Replication)
2. Check that you're subscribed to the correct table/channel
3. Verify RLS policies allow reading the data

## Next Steps

1. Set up your Supabase project and get the keys
2. Create the database schema (tables, RLS policies)
3. Implement authentication UI (sign-up, sign-in)
4. Build video upload functionality
5. Add realtime features (likes, comments, notifications)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
