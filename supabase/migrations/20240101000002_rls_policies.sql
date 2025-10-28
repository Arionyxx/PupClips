-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Anyone can view all profiles (public content)
CREATE POLICY "profiles_select_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ========================================
-- VIDEOS POLICIES
-- ========================================

-- Anyone can view all videos (public content)
CREATE POLICY "videos_select_all"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own videos
CREATE POLICY "videos_insert_own"
  ON public.videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
CREATE POLICY "videos_update_own"
  ON public.videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "videos_delete_own"
  ON public.videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- LIKES POLICIES
-- ========================================

-- Anyone can view all likes (public content)
CREATE POLICY "likes_select_all"
  ON public.likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own likes
CREATE POLICY "likes_insert_own"
  ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "likes_delete_own"
  ON public.likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS POLICIES
-- ========================================

-- Anyone can view all comments (public content)
CREATE POLICY "comments_select_all"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own comments
CREATE POLICY "comments_insert_own"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "comments_update_own"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
