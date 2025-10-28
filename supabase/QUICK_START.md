# Supabase Quick Start Guide

Get up and running with PupClips database in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker installed and running
- Supabase CLI installed (`npm install -g supabase` or `brew install supabase/tap/supabase`)

## Step 1: Start Supabase

```bash
# Navigate to project root
cd /path/to/pupclips

# Start local Supabase (this applies all migrations automatically!)
supabase start
```

Wait for Supabase to start (30-60 seconds). You'll see output like:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token
        anon key: eyJh...
service_role key: eyJh...
```

## Step 2: Save Your Credentials

Copy the `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials from the output above:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... # Copy the anon key from output
SUPABASE_SERVICE_ROLE_KEY=eyJh... # Copy the service_role key from output
```

## Step 3: Set Up Storage Bucket

Open Supabase Studio: http://localhost:54323

### Option A: Via Dashboard

1. Click "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Name: `videos`
4. Make it public: Toggle "Public bucket" ON
5. Click "Create bucket"

### Option B: Via SQL Editor

1. Click "SQL Editor" in the left sidebar
2. Open the file `supabase/storage_setup.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"

## Step 4: (Optional) Load Sample Data

If you want test data for development:

```bash
# Reset database and apply seed data
supabase db reset
```

This creates:

- Two test users (test1@example.com / password123, test2@example.com / password123)
- Sample videos
- Sample likes and comments

## Step 5: Start Your App

```bash
npm run dev
```

Visit http://localhost:3000

## Verify Setup

### Check Database Tables

Open Studio (http://localhost:54323) and click "Table Editor". You should see:

- ✅ profiles
- ✅ videos
- ✅ likes
- ✅ comments

### Check RLS Policies

1. Go to "Authentication" > "Policies"
2. You should see policies for all tables
3. Each table should show as "RLS enabled"

### Check Storage Bucket

1. Go to "Storage"
2. You should see the "videos" bucket
3. Click on it and verify it's marked as "Public"

## What Just Happened?

When you ran `supabase start`, it automatically:

1. ✅ Started a local PostgreSQL database
2. ✅ Applied all 4 migrations in order:
   - Created tables (profiles, videos, likes, comments)
   - Added indexes for performance
   - Set up triggers for aggregate counts
   - Enabled RLS and created security policies
   - Created helper functions and views
3. ✅ Started Supabase Studio for database management
4. ✅ Started authentication service
5. ✅ Started storage service

The only manual step is creating the storage bucket (Step 3).

## Next Steps

### For Developers

Read the usage examples:

```bash
cat supabase/USAGE_EXAMPLES.md
```

Or check out the code examples in the file. Key patterns:

- Authentication (signup/signin)
- Querying videos for the feed
- Creating likes and comments
- Real-time subscriptions

### Test the Database

Run RLS policy tests to verify security:

```bash
cat supabase/RLS_TEST_GUIDE.md
```

Copy SQL snippets into Studio's SQL Editor to verify policies work.

### Understand the Schema

Read the comprehensive documentation:

```bash
cat supabase/README.md
```

## Common Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# View status and credentials
supabase status

# Reset database (reapply all migrations)
supabase db reset

# View logs
supabase logs

# Open Studio
open http://localhost:54323
```

## Troubleshooting

### "supabase: command not found"

Install the CLI:

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### "Docker not running"

Start Docker Desktop and try again.

### "Port already in use"

Something is using port 54321, 54322, or 54323. Either:

- Stop the conflicting service
- Or change ports in `supabase/config.toml`

### Migrations not applied

```bash
# Force reset
supabase db reset

# Or manually apply
supabase migration up
```

### Storage uploads fail

- Verify bucket exists (Step 3)
- Check file size < 50MB
- Ensure user is authenticated
- Verify file is a video format

## Production Setup

When ready to deploy to production:

### 1. Create Supabase Project

Go to https://app.supabase.com and create a new project.

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 3. Push Migrations

```bash
supabase db push
```

### 4. Set Up Storage

Run `supabase/storage_setup.sql` in your production SQL Editor.

### 5. Update Environment Variables

Update your production `.env` with your production Supabase credentials.

### 6. Deploy Your App

Deploy to Vercel, Netlify, or your preferred platform.

## Resources

- 📖 **Schema Docs:** `supabase/README.md`
- 💻 **Code Examples:** `supabase/USAGE_EXAMPLES.md`
- 🧪 **Testing Guide:** `supabase/RLS_TEST_GUIDE.md`
- 📁 **Files Overview:** `supabase/FILES_OVERVIEW.md`
- 🌐 **Supabase Docs:** https://supabase.com/docs
- 🎓 **Supabase Tutorials:** https://supabase.com/docs/guides

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Read the detailed docs in `supabase/README.md`
3. Check Supabase logs: `supabase logs`
4. Review migrations in `supabase/migrations/`
5. Consult Supabase documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Your App                             │
│  (Next.js frontend + API routes)                            │
└────────────────┬────────────────────────────────────────────┘
                 │ Supabase Client
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Local)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   PostgREST  │  │     Auth     │  │   Storage    │     │
│  │   (API)      │  │   Service    │  │   Service    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │                                                        │  │
│  │  Tables: profiles, videos, likes, comments           │  │
│  │  Triggers: Auto-update counts                         │  │
│  │  RLS: Security policies                               │  │
│  │  Indexes: Optimized queries                           │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Tables

Quick reference:

| Table    | Purpose                 | Key Features               |
| -------- | ----------------------- | -------------------------- |
| profiles | User profile data       | Linked to auth.users       |
| videos   | Video metadata          | Cached like/comment counts |
| likes    | User likes on videos    | Unique per user+video      |
| comments | User comments on videos | Supports updates           |

All tables:

- ✅ Have Row Level Security enabled
- ✅ Have indexes for common queries
- ✅ Use UUIDs for primary keys
- ✅ Track created_at timestamps
- ✅ Have foreign key relationships

## Security Model

- 🔒 **RLS Enabled:** All tables protected by policies
- 👥 **Public Read:** Authenticated users can view all content
- ✏️ **Own Write:** Users can only modify their own content
- 🚫 **No Anonymous:** Must be authenticated to access
- 🔐 **Auth Required:** All operations require valid JWT

## Success Checklist

You're ready to start building when:

- ✅ Supabase is running (`supabase status` shows all services)
- ✅ Environment variables are set in `.env.local`
- ✅ Storage bucket "videos" exists and is public
- ✅ Studio accessible at http://localhost:54323
- ✅ Tables visible in Table Editor
- ✅ RLS policies enabled
- ✅ App runs at http://localhost:3000

Happy coding! 🐾
