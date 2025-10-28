-- Function to create a profile automatically when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append random string
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
      NEW.id,
      'user_' || substr(NEW.id::text, 1, 8),
      COALESCE(NEW.raw_user_meta_data->>'display_name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if user has liked a video
CREATE OR REPLACE FUNCTION public.has_user_liked_video(video_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.likes
    WHERE video_id = video_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper view for video feed with user information
CREATE OR REPLACE VIEW public.videos_with_profiles AS
SELECT
  v.*,
  p.username,
  p.display_name,
  p.avatar_url AS user_avatar_url
FROM public.videos v
INNER JOIN public.profiles p ON v.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.videos_with_profiles TO authenticated;
