# Row Level Security (RLS) Testing Guide

This guide provides SQL snippets to test RLS policies in the PupClips database.

## Setup

Before running tests, ensure you have:

1. Applied all migrations
2. Have test users created (use seed.sql for quick setup)
3. Access to the Supabase SQL Editor or psql

## Test User IDs

Using the seed data, we have:

- User 1: `11111111-1111-1111-1111-111111111111` (test1@example.com)
- User 2: `22222222-2222-2222-2222-222222222222` (test2@example.com)

## Testing Profiles

### ✅ Test: Users can view all profiles

```sql
-- Set JWT claims to simulate authenticated user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should succeed - view all profiles
SELECT * FROM profiles;
```

### ✅ Test: Users can update their own profile

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should succeed - update own profile
UPDATE profiles
SET bio = 'Updated bio'
WHERE id = '11111111-1111-1111-1111-111111111111';
```

### ❌ Test: Users cannot update other profiles

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should fail - cannot update another user's profile
UPDATE profiles
SET bio = 'Hacked!'
WHERE id = '22222222-2222-2222-2222-222222222222';
-- Expected: 0 rows updated (blocked by RLS)
```

## Testing Videos

### ✅ Test: Users can view all videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should succeed
SELECT * FROM videos;
```

### ✅ Test: Users can insert their own videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should succeed
INSERT INTO videos (user_id, storage_path, caption)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111/test.mp4',
  'Test video'
);
```

### ❌ Test: Users cannot insert videos for other users

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should fail - cannot insert video for another user
INSERT INTO videos (user_id, storage_path, caption)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222/hacked.mp4',
  'Hacked video'
);
-- Expected: Policy violation error
```

### ✅ Test: Users can delete their own videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- First, get a video ID owned by user 1
SELECT id FROM videos WHERE user_id = '11111111-1111-1111-1111-111111111111' LIMIT 1;

-- Should succeed - delete own video
DELETE FROM videos
WHERE id = 'video-id-from-above'
  AND user_id = '11111111-1111-1111-1111-111111111111';
```

### ❌ Test: Users cannot delete other users' videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a video ID owned by user 2
SELECT id FROM videos WHERE user_id = '22222222-2222-2222-2222-222222222222' LIMIT 1;

-- Should fail - cannot delete another user's video
DELETE FROM videos
WHERE id = 'user2-video-id';
-- Expected: 0 rows deleted (blocked by RLS)
```

## Testing Likes

### ✅ Test: Users can like videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get any video ID
SELECT id FROM videos LIMIT 1;

-- Should succeed - like a video
INSERT INTO likes (video_id, user_id)
VALUES (
  'any-video-id',
  '11111111-1111-1111-1111-111111111111'
);

-- Check that like_count was incremented
SELECT like_count FROM videos WHERE id = 'any-video-id';
```

### ❌ Test: Users cannot like on behalf of others

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should fail - cannot create like for another user
INSERT INTO likes (video_id, user_id)
VALUES (
  'any-video-id',
  '22222222-2222-2222-2222-222222222222'
);
-- Expected: Policy violation error
```

### ✅ Test: Users can unlike (delete their own likes)

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a like ID for user 1
SELECT id, video_id FROM likes
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- Store the video_id for later check
-- Should succeed - unlike
DELETE FROM likes
WHERE user_id = '11111111-1111-1111-1111-111111111111'
  AND video_id = 'video-id-from-above';

-- Check that like_count was decremented
SELECT like_count FROM videos WHERE id = 'video-id-from-above';
```

### ❌ Test: Users cannot delete other users' likes

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a like by user 2
SELECT id FROM likes
WHERE user_id = '22222222-2222-2222-2222-222222222222'
LIMIT 1;

-- Should fail - cannot delete another user's like
DELETE FROM likes WHERE id = 'user2-like-id';
-- Expected: 0 rows deleted (blocked by RLS)
```

## Testing Comments

### ✅ Test: Users can comment on videos

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get any video ID
SELECT id FROM videos LIMIT 1;

-- Should succeed - add a comment
INSERT INTO comments (video_id, user_id, content)
VALUES (
  'any-video-id',
  '11111111-1111-1111-1111-111111111111',
  'Great video!'
);

-- Check that comment_count was incremented
SELECT comment_count FROM videos WHERE id = 'any-video-id';
```

### ❌ Test: Users cannot comment on behalf of others

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Should fail - cannot create comment for another user
INSERT INTO comments (video_id, user_id, content)
VALUES (
  'any-video-id',
  '22222222-2222-2222-2222-222222222222',
  'Fake comment'
);
-- Expected: Policy violation error
```

### ✅ Test: Users can update their own comments

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a comment by user 1
SELECT id FROM comments
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- Should succeed - update own comment
UPDATE comments
SET content = 'Updated comment'
WHERE id = 'user1-comment-id';
```

### ❌ Test: Users cannot update other users' comments

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a comment by user 2
SELECT id FROM comments
WHERE user_id = '22222222-2222-2222-2222-222222222222'
LIMIT 1;

-- Should fail - cannot update another user's comment
UPDATE comments
SET content = 'Hacked comment'
WHERE id = 'user2-comment-id';
-- Expected: 0 rows updated (blocked by RLS)
```

### ✅ Test: Users can delete their own comments

```sql
-- Set as user 1
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

-- Get a comment by user 1
SELECT id, video_id FROM comments
WHERE user_id = '11111111-1111-1111-1111-111111111111'
LIMIT 1;

-- Should succeed - delete own comment
DELETE FROM comments WHERE id = 'user1-comment-id';

-- Check that comment_count was decremented
SELECT comment_count FROM videos WHERE id = 'video-id-from-above';
```

## Testing Aggregate Triggers

### Test: Like count increments and decrements

```sql
-- Get initial like_count
SELECT id, like_count FROM videos LIMIT 1;
-- Note the video_id and like_count

-- Add a like (as user 1)
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

INSERT INTO likes (video_id, user_id)
VALUES ('video-id', '11111111-1111-1111-1111-111111111111');

-- Check like_count incremented
SELECT like_count FROM videos WHERE id = 'video-id';
-- Should be previous count + 1

-- Remove the like
DELETE FROM likes
WHERE video_id = 'video-id'
  AND user_id = '11111111-1111-1111-1111-111111111111';

-- Check like_count decremented
SELECT like_count FROM videos WHERE id = 'video-id';
-- Should be back to original count
```

### Test: Comment count increments and decrements

```sql
-- Get initial comment_count
SELECT id, comment_count FROM videos LIMIT 1;
-- Note the video_id and comment_count

-- Add a comment (as user 1)
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

INSERT INTO comments (video_id, user_id, content)
VALUES ('video-id', '11111111-1111-1111-1111-111111111111', 'Test comment');

-- Check comment_count incremented
SELECT comment_count FROM videos WHERE id = 'video-id';
-- Should be previous count + 1

-- Remove the comment
DELETE FROM comments
WHERE video_id = 'video-id'
  AND user_id = '11111111-1111-1111-1111-111111111111'
  AND content = 'Test comment';

-- Check comment_count decremented
SELECT comment_count FROM videos WHERE id = 'video-id';
-- Should be back to original count
```

## Testing Helper Functions

### Test: has_user_liked_video function

```sql
-- Get a video and user ID from seed data
SELECT id FROM videos LIMIT 1;

-- Check if user 1 has liked the video
SELECT has_user_liked_video(
  'video-id'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid
);
-- Returns true or false

-- Add a like and test again
INSERT INTO likes (video_id, user_id)
VALUES (
  'video-id',
  '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT DO NOTHING;

SELECT has_user_liked_video(
  'video-id'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid
);
-- Should return true
```

### Test: videos_with_profiles view

```sql
-- Query the view (includes user profile info with videos)
SET request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
SET ROLE authenticated;

SELECT
  id,
  caption,
  username,
  display_name,
  user_avatar_url,
  like_count,
  comment_count
FROM videos_with_profiles
ORDER BY created_at DESC
LIMIT 10;
```

## Resetting Test Environment

To reset your test environment:

```bash
# Reset local database and reapply migrations and seed
supabase db reset
```

Or manually:

```sql
-- Clear all data (keeps schema)
TRUNCATE public.comments CASCADE;
TRUNCATE public.likes CASCADE;
TRUNCATE public.videos CASCADE;
TRUNCATE public.profiles CASCADE;
DELETE FROM auth.users;

-- Reapply seed data
\i supabase/seed.sql
```

## Notes

- Always set `request.jwt.claims` and `SET ROLE authenticated` before testing RLS policies
- Use `SET ROLE postgres` to bypass RLS for admin operations
- RLS policies only affect authenticated role, not postgres/service role
- The seed.sql file creates test users with known UUIDs for easy testing
