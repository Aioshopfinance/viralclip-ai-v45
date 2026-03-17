-- Drop if exists to avoid conflicts with previous policies
DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;

-- Explicitly define INSERT policy for channels table to enforce data integrity
CREATE POLICY "Users can insert own channels" ON public.channels 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
