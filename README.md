# PupClips 🐾

A modern short-form vertical video platform for sharing your best pup moments, built with Next.js 14 App Router.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI (New York style)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Supabase (PostgreSQL database with Row Level Security)
- **Database:** PostgreSQL with automated migrations

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Docker (for local Supabase development)
- Supabase CLI (install with `npm install -g supabase` or `brew install supabase/tap/supabase`)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up Supabase locally:

```bash
# Start local Supabase instance (PostgreSQL, Auth, Storage, etc.)
supabase start
```

This will start a local Supabase instance and automatically apply all migrations. Note the output - it provides your local API URL and keys.

3. Copy the environment variables template:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local` with the credentials from `supabase start`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

5. Create the videos storage bucket:

The migrations create the database schema automatically. To set up the storage bucket for videos, you can either:

- Use the Supabase Studio (opens at http://localhost:54323 when running locally):
  - Navigate to Storage
  - Create a new bucket named "videos"
  - Make it public

- Or run the SQL commands in `supabase/README.md` in the SQL editor

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Supabase Commands

```bash
# Start local Supabase (includes PostgreSQL, Auth, Storage)
supabase start

# Stop local Supabase
supabase stop

# View Supabase status and credentials
supabase status

# Open Supabase Studio (local dashboard)
open http://localhost:54323

# Reset database (reapply all migrations)
supabase db reset

# Create a new migration
supabase migration new migration_name

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/database.ts
```

For more details on the database schema, RLS policies, and production setup, see [supabase/README.md](./supabase/README.md).

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for linting errors
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── upload/            # Video upload page
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home/Feed page
│   └── globals.css        # Global styles and CSS variables
├── components/
│   ├── ui/                # Shadcn UI components
│   └── providers/         # Global context providers
├── lib/
│   └── utils.ts           # Utility functions
├── types/
│   ├── database.ts        # Supabase database TypeScript types
│   └── index.ts           # General type definitions
└── hooks/                 # Custom React hooks

supabase/
├── migrations/            # SQL migration files (timestamped)
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240101000001_aggregate_triggers.sql
│   ├── 20240101000002_rls_policies.sql
│   └── 20240101000003_helper_functions.sql
└── README.md             # Supabase setup and schema documentation
```

## Features (Current State)

- ✅ Next.js 14 App Router setup with TypeScript
- ✅ Tailwind CSS v4 with custom design tokens for vertical video UI
- ✅ Shadcn UI components (Button, Input, Textarea, Avatar, Dialog, Sheet, Skeleton, Sonner, DropdownMenu, ScrollArea)
- ✅ Global Providers component with Toaster
- ✅ Route structure: `/` (feed), `/upload`, `/auth`
- ✅ Custom fonts (Inter)
- ✅ Linting and formatting setup (ESLint + Prettier)
- ✅ Environment variables template
- ✅ Supabase database schema with migrations
- ✅ Row Level Security (RLS) policies
- ✅ TypeScript database types
- ✅ Automated aggregate count triggers

## Custom Vertical Video Utilities

The project includes custom Tailwind utilities optimized for vertical video UI patterns:

- `.video-aspect-9-16` - Standard 9:16 aspect ratio for vertical videos
- `.video-aspect-portrait` - 3:4 portrait aspect ratio
- `.max-w-mobile-video` - Maximum width for mobile video containers (430px)
- `.h-mobile-video` - Responsive height for mobile video (max 844px)
- `.snap-vertical` - Vertical scroll snapping
- `.snap-center` - Center scroll snap alignment

## Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

- **profiles** - User profiles linked to Supabase Auth
- **videos** - Video content with metadata
- **likes** - User likes on videos
- **comments** - User comments on videos

All tables have Row Level Security (RLS) enabled with policies that:

- Allow authenticated users to read all public content
- Allow users to create/update/delete their own content
- Maintain data integrity with foreign key constraints

The database includes:

- Automated triggers to maintain `like_count` and `comment_count` on videos
- Indexes optimized for feed queries and interactions
- A trigger to auto-create profiles when users sign up
- Helper functions and views for common queries

See [supabase/README.md](./supabase/README.md) for complete schema documentation.

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - (Optional) Service role key for server-side operations

## Next Steps

- Implement Supabase authentication hooks
- Build video upload functionality with Supabase Storage
- Create the video feed with vertical scroll
- Add user profile pages and interactions
- Implement video playback with controls

## Contributing

This is a foundational setup. Future contributions should follow the established patterns and coding standards.

## License

Private project - All rights reserved.
