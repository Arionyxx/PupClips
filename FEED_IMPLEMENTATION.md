# TikTok-Style Feed Implementation

## Overview

This document describes the implementation of the vertical video feed with TikTok-style interactions, smooth navigation, and server-driven data fetching.

## Architecture

### Data Flow

```
Server Component (page.tsx)
    ↓ Fetch initial videos
FeedContainer (Client)
    ↓ Initialize store
VideoFeed (Client)
    ↓ Render videos
VideoCard
    ↓ Contains
VideoPlayer
```

### State Management

**Feed Store** (`src/stores/feed-store.ts`)

- Videos list
- Current video index
- Autoplay/mute state
- Loading state
- Pagination state

### Key Components

#### 1. VideoPlayer (`src/components/feed/video-player.tsx`)

Custom HTML5 video player with:

- ✅ Autoplay when active
- ✅ Play/pause on single tap
- ✅ Double-tap detection (forwarded to parent)
- ✅ Mute toggle
- ✅ Progress bar with seek
- ✅ Looping
- ✅ Custom controls (show/hide on mouse move)

**Props:**

- `src`: Video URL
- `poster`: Thumbnail URL
- `isActive`: Whether video should play
- `isMuted`: Mute state
- `autoplay`: Enable autoplay
- `onDoubleTap`: Double-tap handler
- `onPlayPause`: Play/pause callback
- `onMuteToggle`: Mute toggle callback

#### 2. VideoCard (`src/components/feed/video-card.tsx`)

Wrapper component with:

- ✅ User avatar and info
- ✅ Caption display
- ✅ Action buttons (like, comment, share)
- ✅ Like animation on double-tap
- ✅ Framer Motion transitions
- ✅ Local interaction state

#### 3. VideoFeed (`src/components/feed/video-feed.tsx`)

Main feed container with:

- ✅ Vertical scroll with snap points
- ✅ Swipe gesture navigation
- ✅ Keyboard navigation (arrow keys)
- ✅ Intersection Observer for autoplay
- ✅ Infinite scroll pagination
- ✅ Loading skeleton

#### 4. FeedContainer (`src/components/feed/feed-container.tsx`)

Client wrapper that:

- ✅ Initializes feed store
- ✅ Handles pagination API calls
- ✅ Manages loading state

### Custom Hooks

#### useIntersectionObserver (`src/hooks/use-intersection-observer.ts`)

Detects when elements enter viewport for autoplay management.

#### useDoubleTap (`src/hooks/use-double-tap.ts`)

Distinguishes between single and double taps with configurable delay.

#### useSwipeGesture (`src/hooks/use-swipe-gesture.ts`)

Handles touch swipe gestures (up/down) for video navigation.

#### useKeyboardNavigation (`src/hooks/use-keyboard-navigation.ts`)

Handles keyboard shortcuts (arrow keys, space, escape).

## API Routes

### GET `/api/videos`

Fetches paginated videos from Supabase.

**Query Parameters:**

- `limit`: Number of videos (default: 10)
- `offset`: Starting position (default: 0)
- `orderBy`: Sort field (default: created_at)
- `order`: Sort direction (default: desc)

**Response:**

```json
{
  "videos": [...],
  "hasMore": boolean
}
```

## Database Integration

### Server-Side Fetching

Uses `fetchVideosServer()` from `@/lib/api/videos` with:

- Profile join: `select('*, profile:profiles(*)')`
- RLS policies for security
- Efficient indexing

### Client-Side Fetching

Uses fetch API to load more videos via `/api/videos` route.

## User Interactions

### Navigation

1. **Scroll**: Natural scroll with snap points
2. **Swipe**: Touch gestures for up/down navigation
3. **Keyboard**: Arrow keys for desktop navigation
4. **Programmatic**: Store methods for controlled navigation

### Video Controls

1. **Single Tap**: Play/pause video
2. **Double Tap**: Like video (with animation)
3. **Mute Button**: Toggle sound
4. **Progress Bar**: Click to seek

### Interactions

1. **Like**: Toggle with count update
2. **Comment**: Placeholder (to be implemented)
3. **Share**: Placeholder (to be implemented)

## Responsive Design

### Mobile (< 768px)

- Full-screen vertical videos
- Touch gestures enabled
- Bottom action buttons

### Desktop (>= 768px)

- Centered video container
- Mouse controls visible on hover
- Keyboard navigation
- Max width constraint

### Height Calculations

- Header: 64px (4rem)
- Video height: `calc(100vh - 4rem)`
- Maintains proper aspect ratios

## Performance Optimizations

### Lazy Loading

- Initial load: 10 videos
- Preload trigger: 3 videos before end
- Prevents duplicate videos

### Video Optimization

- Only active video plays
- Inactive videos paused
- Poster images for fast loading

### Scroll Optimization

- CSS scroll snap for smooth transitions
- Hidden scrollbar for clean UI
- Passive event listeners

### State Management

- Zustand for minimal re-renders
- Ref-based video management
- Debounced scroll handlers

## CSS Utilities

```css
.snap-vertical        /* Y-axis snap scrolling */
.snap-start          /* Snap to start of element */
.feed-scroll         /* Hide scrollbar */
.video-aspect-9-16   /* Standard vertical ratio */
```

## Testing

See `src/__tests__/README.md` for:

- Test setup instructions
- Manual testing checklist
- Expected behaviors

## Future Enhancements

### High Priority

- [ ] View count tracking
- [ ] Comment modal
- [ ] Share functionality
- [ ] User profile pages
- [ ] Follow/unfollow

### Nice to Have

- [ ] Video prefetching
- [ ] Analytics tracking
- [ ] Video quality selection
- [ ] Playback speed control
- [ ] Picture-in-picture mode
- [ ] Full-screen mode
- [ ] Video reports/moderation

## Troubleshooting

### Videos Not Autoplaying

- Check browser autoplay policies
- Ensure `isActive` prop is correct
- Verify IntersectionObserver setup

### Snap Scroll Not Working

- Verify CSS classes applied
- Check parent container height
- Ensure overflow-y-scroll is set

### Performance Issues

- Limit initial video count
- Check for memory leaks in event listeners
- Profile component re-renders

### Gestures Not Working

- Verify touch event listeners attached
- Check for event.preventDefault() conflicts
- Test threshold values

## Related Files

```
src/
├── components/feed/
│   ├── video-player.tsx
│   ├── video-card.tsx
│   ├── video-feed.tsx
│   ├── feed-container.tsx
│   ├── video-skeleton.tsx
│   └── index.ts
├── hooks/
│   ├── use-intersection-observer.ts
│   ├── use-double-tap.ts
│   ├── use-swipe-gesture.ts
│   └── use-keyboard-navigation.ts
├── stores/
│   └── feed-store.ts
├── app/
│   ├── page.tsx
│   └── api/videos/route.ts
└── __tests__/
    ├── feed-store.test.ts
    ├── video-player.test.tsx
    └── README.md
```
