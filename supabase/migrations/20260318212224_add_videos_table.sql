-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'upload')),
  storage_path TEXT,
  external_url TEXT,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on videos table
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for videos
CREATE POLICY "Users can manage own videos" ON public.videos 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can select all videos" ON public.videos 
  FOR SELECT TO authenticated 
  USING (is_admin());

-- Create Storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-uploads', 'video-uploads', false) 
ON CONFLICT DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own videos" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own videos" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own videos" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'video-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
