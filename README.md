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
- **Backend:** Supabase (Authentication, Database, Storage, Realtime)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment variables template:

```bash
cp .env.example .env.local
```

3. Configure your environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

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
│   └── providers/         # Global context providers (Supabase, Theme, Toast)
├── lib/
│   ├── api/               # Typed API layer for Supabase operations
│   │   ├── videos.ts      # Video CRUD operations
│   │   ├── interactions.ts # Likes and comments
│   │   └── profiles.ts    # User profile operations
│   ├── supabase/          # Supabase client configuration
│   │   ├── browser-client.ts  # Client-side Supabase client
│   │   ├── server-client.ts   # Server-side Supabase client
│   │   ├── session.ts         # Session management helpers
│   │   └── realtime.ts        # Realtime subscription utilities
│   └── utils.ts           # Utility functions
├── types/
│   └── supabase.ts        # Generated Supabase database types
└── hooks/                 # Custom React hooks
```

## Features (Current State)

- ✅ Next.js 14 App Router setup with TypeScript
- ✅ Tailwind CSS v4 with custom design tokens for vertical video UI
- ✅ Shadcn UI components (Button, Input, Textarea, Avatar, Dialog, Sheet, Skeleton, Sonner, DropdownMenu, ScrollArea)
- ✅ Global Providers component with Toaster and Supabase
- ✅ Route structure: `/` (feed), `/upload`, `/auth`
- ✅ Custom fonts (Inter)
- ✅ Linting and formatting setup (ESLint + Prettier)
- ✅ Environment variables template
- ✅ Supabase integration with client/server helpers
- ✅ Session management and middleware for auth persistence
- ✅ Typed API layer for videos, interactions, and profiles
- ✅ Realtime subscription utilities for live updates

## Custom Vertical Video Utilities

The project includes custom Tailwind utilities optimized for vertical video UI patterns:

- `.video-aspect-9-16` - Standard 9:16 aspect ratio for vertical videos
- `.video-aspect-portrait` - 3:4 portrait aspect ratio
- `.max-w-mobile-video` - Maximum width for mobile video containers (430px)
- `.h-mobile-video` - Responsive height for mobile video (max 844px)
- `.snap-vertical` - Vertical scroll snapping
- `.snap-center` - Center scroll snap alignment

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key (safe for client-side use)
- `SUPABASE_SERVICE_ROLE_KEY` - (Optional) Service role key for server-side admin operations

### Security Guidelines for Environment Variables

**IMPORTANT:** The service role key has full admin privileges to your Supabase database.

- ✅ **DO** use it only in server-side code (API routes, server components, server actions)
- ✅ **DO** keep it secure in `.env.local` (never commit to version control)
- ✅ **DO** use environment variables in production (Vercel, etc.)
- ❌ **DON'T** expose it to the client or browser
- ❌ **DON'T** use it in client components or browser-side code
- ❌ **DON'T** commit it to Git or share it publicly

For most operations, use the anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) which respects Row Level Security (RLS) policies.

## Supabase Setup

### Generating Types

To generate TypeScript types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

Or if using local development:

```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### API Layer Usage

The project includes a typed API layer for interacting with Supabase:

```typescript
// Client-side usage
import { fetchVideos, toggleVideoLike } from "@/lib/api";

const videos = await fetchVideos({ limit: 10 });
const { liked } = await toggleVideoLike(userId, videoId);
```

### Realtime Subscriptions

Use the realtime utilities for live updates:

```typescript
import { createRealtimeSubscription } from "@/lib/supabase";

const channel = createRealtimeSubscription({
  table: "likes",
  event: "INSERT",
  filter: `video_id=eq.${videoId}`,
  onEvent: (payload) => {
    console.log("New like:", payload);
  },
});

// Cleanup when component unmounts
unsubscribeRealtimeChannel(channel);
```

## Next Steps

- Configure Supabase authentication
- Implement video upload functionality
- Build the video feed with vertical scroll
- Add user profiles and interactions
- Implement video playback with controls

## Contributing

This is a foundational setup. Future contributions should follow the established patterns and coding standards.

## License

Private project - All rights reserved.
