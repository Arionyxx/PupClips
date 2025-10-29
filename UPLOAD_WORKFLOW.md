# Video Upload Workflow Documentation

This document describes the complete video upload workflow implementation for PupClips.

## Overview

The upload workflow allows authenticated users to upload vertical videos with captions to Supabase Storage and create corresponding database records with validation and progress feedback.

## Features Implemented

- ✅ Auth-protected `/upload` page with Shadcn form components
- ✅ Client-side validation (file type, size, duration, caption)
- ✅ Video metadata extraction (duration, dimensions)
- ✅ Automatic poster frame generation from video
- ✅ Progress UI with status messages
- ✅ Upload to Supabase Storage `videos` bucket
- ✅ Database record creation with metadata
- ✅ Error handling with toast notifications
- ✅ Cleanup on failure
- ✅ Redirect to feed after successful upload
- ✅ Unit tests with mocked Supabase

## Architecture

### Components

#### 1. Upload Page (`/src/app/upload/page.tsx`)

- Server component with auth guard
- Redirects to `/auth` if user is not authenticated
- Renders `UploadForm` component with user ID

#### 2. Upload Form (`/src/components/upload/upload-form.tsx`)

- Client component with file input, caption textarea, and progress UI
- Handles video selection, validation, and upload
- Generates poster frame on client side
- Uses Supabase browser client for direct upload
- Calls server actions for database operations

#### 3. Server Actions (`/src/app/upload/actions.ts`)

- `createVideoRecord`: Creates video database record
- `deleteVideoFromStorage`: Cleans up uploaded files on failure
- `getUploadUrl`: Alternative signed URL approach (not currently used)

#### 4. Upload Utilities (`/src/lib/upload-utils.ts`)

- Video validation functions
- Metadata extraction
- Poster frame generation
- File name generation
- Format helpers

### Upload Flow

```
1. User selects video file
   ↓
2. Extract metadata (duration, dimensions)
   ↓
3. Validate file (type, size, duration)
   ↓
4. Generate poster frame (canvas capture at 1s)
   ↓
5. User enters caption
   ↓
6. Upload video file to Supabase Storage
   ↓
7. Upload poster image to Supabase Storage
   ↓
8. Get public URLs for uploaded files
   ↓
9. Create database record via server action
   ↓
10. Revalidate home page cache
   ↓
11. Redirect to feed (/)
```

## Validation Rules

### Video File

- **Allowed types**: MP4, WebM
- **Max size**: 100MB
- **Max duration**: 60 seconds
- **Min duration**: 1 second

### Caption

- **Min length**: 1 character
- **Max length**: 500 characters
- **Required**: Yes

## Storage Structure

Videos are organized by user ID for proper RLS policy enforcement:

```
videos/
├── {user_id}/
│   ├── {timestamp}-{random}.mp4     # Video file
│   ├── {timestamp}-{random}-poster.jpg  # Poster image
│   └── ...
```

Example:

```
videos/
├── 123e4567-e89b-12d3-a456-426614174000/
│   ├── 1698765432000-abc123.mp4
│   ├── 1698765432000-abc123-poster.jpg
│   └── 1698765555000-xyz789.mp4
```

## Database Schema

Videos are stored in the `videos` table:

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  storage_path TEXT NOT NULL,
  poster_url TEXT,
  caption TEXT,
  duration_seconds INTEGER,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Supabase Storage Setup

### 1. Create the Videos Bucket

Via Supabase Dashboard:

1. Navigate to Storage
2. Click "Create bucket"
3. Name: `videos`
4. Public: Yes
5. Create

Or via SQL (in SQL Editor):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);
```

### 2. Apply Storage Policies

Run this SQL in the Supabase SQL Editor:

```sql
-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to videos
CREATE POLICY "Public read access to videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Policy Explanation

- **INSERT**: Users can only upload to folders matching their user ID (`{user_id}/...`)
- **SELECT**: Anyone (public) can read/view videos
- **UPDATE**: Users can only update videos in their own folder
- **DELETE**: Users can only delete videos in their own folder

## Error Handling

### Client-Side Errors

- Invalid file type → Toast error
- File too large → Toast error
- Video too long/short → Toast error
- Invalid caption → Toast error
- Metadata extraction failure → Toast error

### Upload Errors

- Storage upload failure → Toast error + cleanup
- Database insert failure → Toast error + cleanup (delete uploaded files)
- Network errors → Toast error

### Cleanup on Failure

If database insertion fails after files are uploaded, the `deleteVideoFromStorage` action is called to remove the uploaded files from storage.

## Progress Feedback

The upload UI shows different states:

1. **Idle**: Ready to select file
2. **Validating**: Extracting metadata and generating poster
3. **Uploading**: Uploading video and poster (0-80%)
4. **Processing**: Creating database record (80-100%)
5. **Success**: Upload complete, redirecting
6. **Error**: Upload failed with error message

Progress is shown with:

- Progress bar (0-100%)
- Status message
- Icons (spinner, checkmark, error)

## Testing

### Unit Tests

Tests are located in `/src/__tests__/`:

- `upload-utils.test.ts`: Tests for validation and utility functions
- `upload-actions.test.ts`: Mock tests for server actions

To run tests (after installing test dependencies):

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm test
```

### Manual Testing Checklist

- [ ] Auth guard redirects unauthenticated users to `/auth`
- [ ] File input accepts only MP4 and WebM files
- [ ] File size validation rejects files > 100MB
- [ ] Duration validation rejects videos > 60s or < 1s
- [ ] Caption validation enforces 1-500 characters
- [ ] Poster frame is generated correctly
- [ ] Video preview shows file info (name, size, duration, resolution)
- [ ] Upload progress bar updates smoothly
- [ ] Success state shows and redirects to home
- [ ] Error states show descriptive messages
- [ ] Toast notifications appear for all errors
- [ ] Uploaded video appears in feed immediately
- [ ] Storage RLS policies enforce user-based access
- [ ] Failed uploads clean up storage files

### Browser Compatibility

The upload workflow uses modern web APIs:

- `<video>` element for metadata extraction
- `<canvas>` for poster frame generation
- `File` and `Blob` APIs
- `async/await` for asynchronous operations

**Supported browsers**:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile support**:

- iOS Safari 14+
- Chrome Android 90+

## Usage Example

### For Users

1. Navigate to `/upload` (requires authentication)
2. Click the upload area or drag & drop a video
3. Wait for validation and poster generation
4. Enter a caption (1-500 characters)
5. Click "Upload Video"
6. Wait for upload to complete
7. Automatically redirected to feed

### For Developers

```typescript
// Import upload utilities
import {
  extractVideoMetadata,
  validateVideoFile,
  generatePosterFrame,
} from "@/lib/upload-utils";

// Extract metadata
const metadata = await extractVideoMetadata(videoFile);

// Validate
const validation = validateVideoFile(videoFile, metadata);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Generate poster
const poster = await generatePosterFrame(videoFile, 1);

// Upload files (handled by UploadForm component)
// See src/components/upload/upload-form.tsx for full implementation
```

## Limitations & Future Improvements

### Current Limitations

- Maximum file size: 100MB (can be increased in configuration)
- Maximum duration: 60 seconds (adjustable)
- Poster generated at 1 second mark (not customizable by user)
- No video compression or transcoding
- No batch upload support
- No draft/scheduled uploads

### Potential Improvements

1. **Video Processing**
   - Server-side transcoding with FFmpeg
   - Multiple quality levels for adaptive streaming
   - Automatic compression for large files
2. **Enhanced Features**
   - Multiple poster frame options
   - Custom thumbnail upload
   - Video trimming/editing
   - Filters and effects
   - Music/sound overlay
3. **Performance**
   - Chunked upload for large files
   - Resume interrupted uploads
   - Background upload with service worker
4. **User Experience**
   - Batch upload multiple videos
   - Save drafts
   - Schedule uploads
   - Upload from URL
   - Mobile camera integration

5. **Validation**
   - Aspect ratio validation (enforce vertical video)
   - Content moderation (AI-based)
   - Duplicate detection

## Security Considerations

1. **Authentication**: Upload page is protected by middleware auth guard
2. **Authorization**: RLS policies enforce user-based access to storage
3. **Validation**: Client and server-side validation prevents malicious uploads
4. **File Type**: Only MP4 and WebM files are accepted
5. **Size Limits**: 100MB limit prevents storage abuse
6. **User Isolation**: Files are stored in user-specific folders
7. **Public Read**: Videos are publicly readable (by design for social platform)

## Troubleshooting

### "Failed to upload video" error

- Check Supabase Storage bucket exists and is named `videos`
- Verify storage policies are applied correctly
- Check browser console for detailed error messages
- Ensure file meets validation requirements

### "Failed to create video record" error

- Verify database table `videos` exists with correct schema
- Check RLS policies on `videos` table
- Ensure user is authenticated
- Check server logs for detailed error

### Poster frame not generating

- Ensure browser supports `<canvas>` and `<video>` APIs
- Check if video codec is supported by browser
- Try with a different video file
- Check browser console for errors

### Upload stuck at "Processing"

- Check network connection
- Verify Supabase service is running
- Check browser console and server logs
- Try refreshing the page

## Related Documentation

- [Supabase Schema](./supabase/README.md) - Database schema and RLS policies
- [Supabase Setup](./SUPABASE_SETUP.md) - Initial Supabase configuration
- [Feed Implementation](./FEED_IMPLEMENTATION.md) - Video feed and playback

## Support

For issues or questions:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify all setup steps are completed
4. Review test files for expected behavior
