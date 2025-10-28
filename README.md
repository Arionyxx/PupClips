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
- **Backend:** Supabase (to be configured)

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
│   └── providers/         # Global context providers
├── lib/
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - (Optional) Service role key for server-side operations

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
