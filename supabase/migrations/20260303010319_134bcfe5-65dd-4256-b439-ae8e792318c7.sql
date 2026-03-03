
-- Community posts table for anonymous supportive feed
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL DEFAULT 'Fellow Traveler',
  category TEXT NOT NULL DEFAULT 'general',
  hearts_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community reactions (hearts) table
CREATE TABLE public.community_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Community replies table
CREATE TABLE public.community_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL DEFAULT 'Fellow Traveler',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;

-- Posts: anyone authenticated can read non-flagged, owners can insert/delete
CREATE POLICY "Anyone can read non-flagged posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (is_flagged = false);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reactions: anyone authenticated can read, users can insert/delete their own
CREATE POLICY "Anyone can read reactions"
  ON public.community_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON public.community_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON public.community_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Replies: anyone authenticated can read, users can insert/delete their own
CREATE POLICY "Anyone can read replies"
  ON public.community_replies FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create replies"
  ON public.community_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON public.community_replies FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Update hearts_count trigger
CREATE OR REPLACE FUNCTION public.update_hearts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET hearts_count = hearts_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET hearts_count = hearts_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER update_hearts_count_trigger
AFTER INSERT OR DELETE ON public.community_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_hearts_count();

-- Update replies_count trigger
CREATE OR REPLACE FUNCTION public.update_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER update_replies_count_trigger
AFTER INSERT OR DELETE ON public.community_replies
FOR EACH ROW EXECUTE FUNCTION public.update_replies_count();

-- Allow posts to be updated (for hearts_count/replies_count via triggers)
CREATE POLICY "System can update post counts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
