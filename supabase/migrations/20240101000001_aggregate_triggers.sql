-- Function to increment like count
CREATE OR REPLACE FUNCTION public.increment_video_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.videos
  SET like_count = like_count + 1
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement like count
CREATE OR REPLACE FUNCTION public.decrement_video_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.videos
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = OLD.video_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comment count
CREATE OR REPLACE FUNCTION public.increment_video_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.videos
  SET comment_count = comment_count + 1
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment count
CREATE OR REPLACE FUNCTION public.decrement_video_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.videos
  SET comment_count = GREATEST(comment_count - 1, 0)
  WHERE id = OLD.video_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment like count on insert
CREATE TRIGGER likes_increment_count
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_video_like_count();

-- Trigger to decrement like count on delete
CREATE TRIGGER likes_decrement_count
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_video_like_count();

-- Trigger to increment comment count on insert
CREATE TRIGGER comments_increment_count
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_video_comment_count();

-- Trigger to decrement comment count on delete
CREATE TRIGGER comments_decrement_count
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_video_comment_count();
