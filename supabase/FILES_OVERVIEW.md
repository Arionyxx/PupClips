# Supabase Schema Files Overview

This document provides an overview of all files in the Supabase directory and their purposes.

## Directory Structure

```
supabase/
├── migrations/                                   # SQL migration files
│   ├── 20240101000000_initial_schema.sql        # Tables, indexes, and base schema
│   ├── 20240101000001_aggregate_triggers.sql    # Triggers for like/comment counts
│   ├── 20240101000002_rls_policies.sql          # Row Level Security policies
│   └── 20240101000003_helper_functions.sql      # Helper functions and views
├── config.toml                                   # Supabase CLI configuration
├── seed.sql                                      # Sample data for development
├── storage_setup.sql                             # Storage bucket setup script
├── FILES_OVERVIEW.md                             # This file
├── README.md                                     # Main schema documentation
├── RLS_TEST_GUIDE.md                            # Testing guide for RLS policies
└── USAGE_EXAMPLES.md                            # Code examples for using the schema
```

## Migration Files

### 20240101000000_initial_schema.sql

**Purpose:** Creates the core database schema

**Contents:**

- Enables UUID extension
- Creates `profiles` table with user profile data
- Creates `videos` table with video metadata
- Creates `likes` table for video likes
- Creates `comments` table for video comments
- Adds indexes for query performance
- Creates `updated_at` trigger function and applies it to tables

**Key Features:**

- All tables linked with proper foreign key relationships
- Constraints for data validation (username format, caption length, etc.)
- Indexes optimized for feed queries and user interactions

### 20240101000001_aggregate_triggers.sql

**Purpose:** Maintains cached aggregate counts on videos

**Contents:**

- `increment_video_like_count()` - Function to increment like_count
- `decrement_video_like_count()` - Function to decrement like_count
- `increment_video_comment_count()` - Function to increment comment_count
- `decrement_video_comment_count()` - Function to decrement comment_count
- Triggers that call these functions on INSERT/DELETE

**Benefits:**

- Fast aggregate reads without counting on every query
- Atomic updates ensure data consistency
- Automatic maintenance - no manual count updates needed

### 20240101000002_rls_policies.sql

**Purpose:** Enables Row Level Security and defines access policies

**Contents:**

- Enables RLS on all tables
- Policies for profiles (select all, insert/update/delete own)
- Policies for videos (select all, insert/update/delete own)
- Policies for likes (select all, insert/delete own)
- Policies for comments (select all, insert/update/delete own)

**Security Model:**

- All authenticated users can read all public content
- Users can only modify their own content
- No anonymous access (must be authenticated)

### 20240101000003_helper_functions.sql

**Purpose:** Provides helper functions and views for common operations

**Contents:**

- `handle_new_user()` - Auto-creates profile when user signs up
- `has_user_liked_video()` - Checks if user has liked a video
- `videos_with_profiles` view - Joins videos with profile info
- Grants appropriate permissions

**Benefits:**

- Reduces boilerplate code in application
- Provides optimized queries for common patterns
- Automatically handles profile creation on signup

## Configuration Files

### config.toml

**Purpose:** Configuration for local Supabase development

**Key Settings:**

- Database ports (54321 for API, 54322 for DB)
- Studio port (54323)
- Authentication settings
- Storage limits (50MB file size limit)
- Email configuration for local testing

**Usage:** Automatically used by `supabase start`

## Data Files

### seed.sql

**Purpose:** Sample data for development and testing

**Contents:**

- 2 test users with known credentials
- 3 sample videos
- Sample likes and comments
- Demonstrates relationships between tables

**Test Users:**

- test1@example.com / password123
- test2@example.com / password123

**Usage:**

```bash
supabase db reset  # Automatically applies seed.sql
```

### storage_setup.sql

**Purpose:** Sets up the videos storage bucket and policies

**Contents:**

- Creates the `videos` bucket with configuration
- Sets file size limit (50MB)
- Configures allowed MIME types (video formats)
- Creates storage policies for upload/read/update/delete
- Includes verification queries

**Security Model:**

- Public read access to all videos
- Authenticated users can upload to their own folder
- Users can only modify/delete their own files
- Files organized by user ID: `{user_id}/{video_id}.mp4`

**Usage:**
Run this in the Supabase SQL Editor after migrations are applied.

## Documentation Files

### README.md

**Purpose:** Comprehensive schema documentation

**Sections:**

- Schema overview with table definitions
- Indexes and triggers explanation
- RLS policies documentation
- Storage bucket setup instructions
- Local and production setup guides
- Migration management
- TypeScript type generation
- Testing guidelines
- Troubleshooting tips

**Audience:** Developers setting up or maintaining the database

### RLS_TEST_GUIDE.md

**Purpose:** SQL snippets for testing Row Level Security policies

**Contents:**

- Test cases for all CRUD operations on all tables
- Examples of authorized operations (should succeed)
- Examples of unauthorized operations (should fail)
- Aggregate trigger tests
- Helper function tests
- Reset procedures

**Usage:** Copy and paste SQL snippets into SQL Editor to verify RLS works correctly

**Audience:** Developers testing security policies

### USAGE_EXAMPLES.md

**Purpose:** Code examples for using the schema in the application

**Contents:**

- Supabase client setup with TypeScript
- Authentication examples (signup, signin, getUser)
- CRUD operations for all tables
- Real-time subscription examples
- Pagination patterns
- Error handling
- React hooks examples
- Server-side usage (Server Components, API Routes)
- Best practices

**Audience:** Frontend developers integrating with the database

### FILES_OVERVIEW.md (This File)

**Purpose:** Quick reference for all files in the supabase directory

**Audience:** New developers getting familiar with the project structure

## TypeScript Types

Located in `src/types/database.ts`, these types are manually maintained to match the database schema. They provide full type safety when using Supabase in TypeScript.

**Regenerate types:**

```bash
supabase gen types typescript --local > src/types/database.ts
```

**Note:** After auto-generating, you may need to adjust the format to match the existing structure.

## Application Flow

### Initial Setup

1. Run `supabase start` → Applies all migrations automatically
2. Migrations create tables, indexes, triggers, and RLS policies
3. Run `storage_setup.sql` in SQL Editor → Creates videos bucket
4. (Optional) Seed data is applied automatically with `supabase db reset`

### Development Workflow

1. User signs up → `handle_new_user()` trigger creates profile
2. User uploads video → File stored in `videos/{user_id}/` bucket
3. Video record created in database
4. Other users like/comment → Triggers update aggregate counts
5. Feed queries use `videos_with_profiles` view for efficiency
6. RLS ensures users can only modify their own content

### Production Deployment

1. Link to production project: `supabase link`
2. Push migrations: `supabase db push`
3. Run `storage_setup.sql` in production SQL Editor
4. Update environment variables
5. Deploy application

## Key Design Decisions

### Why Cached Counts?

- **Performance:** Counting likes/comments on every feed load is expensive
- **Solution:** Triggers automatically maintain `like_count` and `comment_count`
- **Trade-off:** Slightly more complex write operations for much faster reads

### Why Views?

- **Convenience:** `videos_with_profiles` avoids repeated joins in application code
- **Optimization:** PostgreSQL can optimize view queries
- **Maintainability:** Change join logic in one place

### Why RLS?

- **Security:** Database-level security that can't be bypassed
- **Simplicity:** No need for middleware to check permissions
- **Consistency:** Same security rules apply from client, server, and API

### Why Separate Migration Files?

- **Clarity:** Each file has a single responsibility
- **Debugging:** Easier to identify issues in specific areas
- **Rollback:** Can selectively rollback parts of the schema
- **Organization:** Logical grouping of related changes

## Migration History

All migrations use timestamp-based naming: `YYYYMMDDHHMMSS_description.sql`

**Current migrations:**

- `20240101000000` - Initial schema (tables and indexes)
- `20240101000001` - Aggregate triggers
- `20240101000002` - RLS policies
- `20240101000003` - Helper functions and views

**Adding new migrations:**

```bash
supabase migration new descriptive_name
```

This creates a new file with current timestamp. Add your SQL, then:

- Local: `supabase db reset` or `supabase migration up`
- Production: `supabase db push`

## Maintenance Notes

### Updating TypeScript Types

After schema changes, regenerate types:

```bash
supabase gen types typescript --local > src/types/database.ts
```

### Testing After Changes

1. Run RLS tests from `RLS_TEST_GUIDE.md`
2. Test aggregate triggers still work
3. Verify storage policies in Supabase Dashboard
4. Check that application still works end-to-end

### Backup Strategy

- Supabase automatically backs up production databases
- For local: `pg_dump` the database before major changes
- Migrations are in version control for reproducibility

## Common Issues and Solutions

### Issue: Migrations fail to apply

- **Solution:** Check for syntax errors in SQL
- **Solution:** Ensure migrations are in correct order
- **Solution:** Run `supabase db reset` to start fresh

### Issue: RLS blocking legitimate queries

- **Solution:** Verify user is authenticated
- **Solution:** Check JWT claims are set correctly
- **Solution:** Review policy definitions in `20240101000002_rls_policies.sql`

### Issue: Aggregate counts incorrect

- **Solution:** Triggers may not be installed - check `20240101000001_aggregate_triggers.sql`
- **Solution:** Manually recalculate: `UPDATE videos SET like_count = (SELECT COUNT(*) FROM likes WHERE video_id = videos.id)`

### Issue: Storage uploads failing

- **Solution:** Ensure bucket created via `storage_setup.sql`
- **Solution:** Check file size is under 50MB
- **Solution:** Verify MIME type is allowed
- **Solution:** Confirm user is authenticated and uploading to their folder

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Supabase CLI:** https://supabase.com/docs/reference/cli
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

## Support

For questions or issues:

1. Check this documentation first
2. Review `README.md` for detailed explanations
3. Consult `USAGE_EXAMPLES.md` for code patterns
4. Test with `RLS_TEST_GUIDE.md` to verify behavior
5. Check Supabase logs for error details
