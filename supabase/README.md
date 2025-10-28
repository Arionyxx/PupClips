# Supabase Database Schema

This directory contains the database schema and migrations for the PupClips application.

## Schema Overview

The database consists of four main tables:

### Tables

#### `profiles`

User profile information linked to Supabase Auth users.

- `id` (UUID, PK) - References `auth.users(id)`
- `username` (TEXT, UNIQUE) - Unique username (3-30 chars, alphanumeric + underscore)
- `display_name` (TEXT) - Display name for the user
- `avatar_url` (TEXT, nullable) - URL to user's avatar image
- `bio` (TEXT, nullable) - User biography
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

#### `videos`

Video content uploaded by users.

- `id` (UUID, PK) - Video identifier
- `user_id` (UUID, FK) - References `profiles(id)`
- `storage_path` (TEXT) - Path to video file in Supabase Storage
- `poster_url` (TEXT, nullable) - URL to video thumbnail/poster
- `caption` (TEXT, nullable) - Video caption (max 500 chars)
- `duration_seconds` (INTEGER, nullable) - Video duration in seconds
- `like_count` (INTEGER) - Cached count of likes (maintained by triggers)
- `comment_count` (INTEGER) - Cached count of comments (maintained by triggers)
- `created_at` (TIMESTAMPTZ) - Upload timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

#### `likes`

User likes on videos.

- `id` (UUID, PK) - Like identifier
- `video_id` (UUID, FK) - References `videos(id)`
- `user_id` (UUID, FK) - References `profiles(id)`
- `created_at` (TIMESTAMPTZ) - Like timestamp
- UNIQUE constraint on `(video_id, user_id)` - One like per user per video

#### `comments`

User comments on videos.

- `id` (UUID, PK) - Comment identifier
- `video_id` (UUID, FK) - References `videos(id)`
- `user_id` (UUID, FK) - References `profiles(id)`
- `content` (TEXT) - Comment content (1-500 chars)
- `created_at` (TIMESTAMPTZ) - Comment timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### Views

#### `videos_with_profiles`

A convenient view that joins videos with profile information for efficient feed queries.

### Functions

#### `has_user_liked_video(video_uuid UUID, user_uuid UUID)`

Helper function to check if a user has liked a specific video.

#### `handle_new_user()`

Trigger function that automatically creates a profile when a new user signs up.

### Triggers

- **Updated At Triggers**: Automatically update `updated_at` timestamps on profiles, videos, and comments
- **Aggregate Count Triggers**: Automatically maintain `like_count` and `comment_count` on videos table
- **New User Trigger**: Automatically create profile for new auth users

### Indexes

Performance indexes are created on:

- `profiles.username` - Fast username lookups
- `videos.user_id` - User's videos queries
- `videos.created_at` - Feed ordering
- `videos.(user_id, created_at)` - User feed queries
- `likes.video_id` - Video likes queries
- `likes.user_id` - User likes queries
- `likes.(video_id, user_id)` - Composite lookup
- `comments.video_id` - Video comments queries
- `comments.(video_id, created_at)` - Ordered comments
- `comments.user_id` - User comments queries

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Profiles

- ✅ **SELECT**: All authenticated users can view all profiles
- ✅ **INSERT**: Users can create their own profile
- ✅ **UPDATE**: Users can update their own profile
- ✅ **DELETE**: Users can delete their own profile

### Videos

- ✅ **SELECT**: All authenticated users can view all videos
- ✅ **INSERT**: Users can upload their own videos
- ✅ **UPDATE**: Users can update their own videos
- ✅ **DELETE**: Users can delete their own videos

### Likes

- ✅ **SELECT**: All authenticated users can view all likes
- ✅ **INSERT**: Users can like videos
- ✅ **DELETE**: Users can unlike their own likes

### Comments

- ✅ **SELECT**: All authenticated users can view all comments
- ✅ **INSERT**: Users can comment on videos
- ✅ **UPDATE**: Users can edit their own comments
- ✅ **DELETE**: Users can delete their own comments

## Storage Bucket Configuration

The application requires a Supabase Storage bucket named `videos` with the following configuration:

### Create the bucket

You can create it via the Supabase Dashboard or using SQL:

```sql
-- Create the videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);
```

### Storage Policies

Apply these policies to the `videos` bucket:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to videos
CREATE POLICY "Public read access to videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Note**: Videos should be organized in folders by user ID (e.g., `{user_id}/{video_id}.mp4`) for the policies to work correctly.

## Setup Instructions

### Prerequisites

1. Install the Supabase CLI:

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

2. Ensure you have Docker installed for local development.

### Local Development Setup

1. Initialize Supabase locally:

```bash
supabase init
```

2. Start the local Supabase instance:

```bash
supabase start
```

This will start a local Supabase instance with PostgreSQL, PostgREST, and other services. Note the output - it will provide your local API URL and keys.

3. The migrations in the `supabase/migrations/` directory will be automatically applied when you start Supabase.

4. Get your local credentials:

```bash
supabase status
```

5. Update your `.env.local` file with the local credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

### Production Setup

1. Link your project to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

2. Push migrations to your production database:

```bash
supabase db push
```

3. Create the storage bucket either via:
   - The Supabase Dashboard: Storage > Create bucket > Name: "videos", Public: true
   - Or run the SQL commands from the "Storage Bucket Configuration" section above

4. Update your production environment variables with your Supabase project credentials.

### Applying New Migrations

When new migration files are added:

**Local:**

```bash
supabase db reset  # Resets and applies all migrations
# or
supabase migration up  # Applies pending migrations
```

**Production:**

```bash
supabase db push
```

### Creating New Migrations

To create a new migration file:

```bash
supabase migration new migration_name
```

This will create a new timestamped migration file in `supabase/migrations/`.

## Generating TypeScript Types

The TypeScript types in `src/types/database.ts` are manually maintained to match the schema. To generate types automatically from your database:

```bash
# For local development
supabase gen types typescript --local > src/types/database.ts

# For production
supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

**Note**: After generating types, you may need to adjust the output format to match the project's existing type structure.

## Testing the Schema

### Test RLS Policies

You can test the RLS policies using SQL snippets:

```sql
-- Test as an authenticated user
SET request.jwt.claims.sub = 'user-uuid-here';

-- Try to select profiles (should work)
SELECT * FROM profiles;

-- Try to insert a video for another user (should fail)
INSERT INTO videos (user_id, storage_path)
VALUES ('different-user-uuid', '/path/to/video.mp4');

-- Try to insert your own video (should work)
INSERT INTO videos (user_id, storage_path)
VALUES ('user-uuid-here', '/path/to/video.mp4');
```

### Test Aggregate Triggers

```sql
-- Insert a video
INSERT INTO videos (user_id, storage_path)
VALUES ('user-uuid', '/test/video.mp4')
RETURNING id;

-- Add likes (like_count should auto-increment)
INSERT INTO likes (video_id, user_id)
VALUES ('video-uuid', 'user1-uuid');

INSERT INTO likes (video_id, user_id)
VALUES ('video-uuid', 'user2-uuid');

-- Check the video's like_count
SELECT like_count FROM videos WHERE id = 'video-uuid';
-- Should return 2

-- Delete a like (like_count should auto-decrement)
DELETE FROM likes WHERE video_id = 'video-uuid' AND user_id = 'user1-uuid';

-- Check again
SELECT like_count FROM videos WHERE id = 'video-uuid';
-- Should return 1
```

## Migration Files

The migrations are applied in order by timestamp:

1. `20240101000000_initial_schema.sql` - Creates tables and indexes
2. `20240101000001_aggregate_triggers.sql` - Creates triggers for maintaining counts
3. `20240101000002_rls_policies.sql` - Enables RLS and creates policies
4. `20240101000003_helper_functions.sql` - Creates helper functions and views

## Seed Data

The `seed.sql` file contains sample data for testing and development. To apply seed data:

```bash
# Apply seed data to local database
supabase db reset --seed

# Or manually run the seed file
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/seed.sql
```

The seed file includes:

- Two test users (test1@example.com and test2@example.com, password: password123)
- Sample videos
- Sample likes and comments

**Note**: The seed file is for development only and should not be applied to production.

## Troubleshooting

### Migration Errors

If you encounter errors applying migrations:

1. Check the Supabase logs:

```bash
supabase status
# Note the DB URL, then connect with psql
psql "postgresql://postgres:postgres@localhost:54322/postgres"
```

2. Manually inspect the schema:

```sql
\dt public.*  -- List tables
\d+ public.profiles  -- Describe table
```

3. Reset the local database:

```bash
supabase db reset
```

### RLS Issues

If queries are being blocked unexpectedly:

1. Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

2. List policies:

```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

3. Test with service role (bypasses RLS) to verify data exists:

```typescript
const { data } = await supabase.from("videos").select("*").limit(10);
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
