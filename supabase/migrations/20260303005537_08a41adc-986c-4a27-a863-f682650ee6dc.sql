
-- Create habit_ratings table for community ratings
CREATE TABLE public.habit_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  would_recommend BOOLEAN,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, habit_id)
);

ALTER TABLE public.habit_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all ratings"
ON public.habit_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can insert own ratings"
ON public.habit_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
ON public.habit_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_habit_ratings_habit_id ON public.habit_ratings(habit_id);
