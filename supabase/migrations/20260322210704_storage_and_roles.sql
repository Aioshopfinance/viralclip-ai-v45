-- Update role constraint and default value for new users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['visitor', 'user', 'client', 'affiliate', 'collaborator', 'administrator', 'operator_ia', 'subscriber']));

ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 500)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Setup Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-uploads', 'video-uploads', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

CREATE POLICY "Users can upload their own videos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'video-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own videos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'video-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own videos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'video-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own videos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'video-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
