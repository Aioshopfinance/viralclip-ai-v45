-- Ensure robust RLS policies on the channels table for data integrity

-- Drop existing policies that might be conflicting or incorrect
DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can select own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can delete own channels" ON public.channels;

-- Create secure policies ensuring strict matching between user_id and auth.uid()
CREATE POLICY "Users can select own channels" ON public.channels 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels" ON public.channels 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels" ON public.channels 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels" ON public.channels 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
