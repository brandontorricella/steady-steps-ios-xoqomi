
-- Create future_messages table for "Past Me to Future Me" feature
CREATE TABLE public.future_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_day INTEGER NOT NULL, -- which streak/journey day to deliver
  current_day_when_created INTEGER NOT NULL DEFAULT 0, -- user's day count when they wrote it
  delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.future_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own messages"
ON public.future_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
ON public.future_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
ON public.future_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
ON public.future_messages FOR DELETE
USING (auth.uid() = user_id);
