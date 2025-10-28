-- Seed file for testing and development
-- This file contains example data to help test the application

-- Note: In production, profiles are automatically created via the handle_new_user trigger
-- For development, we'll insert test profiles manually

-- Test User 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'test1@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"username": "testuser1", "display_name": "Test User 1"}',
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, display_name, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', 'testuser1', 'Test User 1', 'I love sharing pup videos! 🐾')
ON CONFLICT (id) DO NOTHING;

-- Test User 2
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated',
  'authenticated',
  'test2@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"username": "testuser2", "display_name": "Test User 2"}',
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, username, display_name, bio) VALUES
  ('22222222-2222-2222-2222-222222222222', 'testuser2', 'Test User 2', 'Dog lover and video creator 🐶')
ON CONFLICT (id) DO NOTHING;

-- Sample videos
INSERT INTO public.videos (id, user_id, storage_path, caption, duration_seconds) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111/video1.mp4',
    'My pup playing fetch! 🎾',
    15
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111/video2.mp4',
    'Cute sleeping puppy 😴',
    10
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222/video1.mp4',
    'Teaching tricks! 🦴',
    20
  )
ON CONFLICT (id) DO NOTHING;

-- Sample likes (triggers will automatically update like_count)
INSERT INTO public.likes (video_id, user_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (video_id, user_id) DO NOTHING;

-- Sample comments (triggers will automatically update comment_count)
INSERT INTO public.comments (video_id, user_id, content) VALUES
  ('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'So cute! 😍'),
  ('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'What breed is this?'),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Great training tips!')
ON CONFLICT DO NOTHING;
