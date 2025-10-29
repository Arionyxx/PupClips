# Feed Tests

This directory contains unit tests for the TikTok-style video feed functionality.

## Test Coverage

### Feed Store Tests (`feed-store.test.ts`)
- ✅ Initial state validation
- ✅ Setting and adding videos
- ✅ Navigation (next/previous video)
- ✅ Boundary conditions (first/last video)
- ✅ Autoplay toggle
- ✅ Mute toggle
- ✅ Duplicate video prevention
- ✅ Video interaction count updates

### VideoPlayer Tests (`video-player.test.tsx`)
- ✅ Rendering with correct props
- ✅ Autoplay when active
- ✅ Pause when inactive
- ✅ Mute state management
- ✅ Play/pause toggle on tap
- ✅ Double-tap detection
- ✅ Progress bar updates
- ✅ Video looping

## Running Tests

Currently, no test framework is installed. To run these tests:

1. Install a test framework:
```bash
npm install --save-dev vitest @testing-library/react @testing-library/react-hooks @testing-library/user-event @testing-library/jest-dom jsdom
```

2. Add test script to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

3. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

4. Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

5. Run tests:
```bash
npm test
```

## Manual Testing Checklist

Until automated tests are set up, use this checklist for manual testing:

### VideoPlayer
- [ ] Video autoplays when scrolled into view
- [ ] Video pauses when scrolled out of view
- [ ] Single tap toggles play/pause
- [ ] Double tap triggers like animation
- [ ] Mute button toggles sound
- [ ] Progress bar shows current playback position
- [ ] Progress bar is clickable to seek
- [ ] Video loops when it ends
- [ ] Controls show on mouse move and hide after 2 seconds
- [ ] All controls work on mobile touch

### Video Feed
- [ ] Initial videos load from server
- [ ] Scroll snap works smoothly between videos
- [ ] Swipe up/down navigates to next/previous video
- [ ] Arrow keys (up/down) navigate between videos
- [ ] Only active video plays, others pause
- [ ] Like button toggles and updates count
- [ ] Double-tap shows like animation
- [ ] Infinite scroll loads more videos near the end
- [ ] Loading skeleton shows while fetching
- [ ] No duplicate videos in feed
- [ ] User info and caption display correctly

### Feed Store
- [ ] Current video index updates on scroll
- [ ] Mute state persists across videos
- [ ] Autoplay state persists
- [ ] Navigation functions work correctly
- [ ] Video interaction counts update in real-time
