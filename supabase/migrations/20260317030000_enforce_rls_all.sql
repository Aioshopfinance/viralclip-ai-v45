-- Enforce strict RLS on channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can select own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can delete own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can manage own channels" ON public.channels;

CREATE POLICY "Users can select own channels" ON public.channels FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own channels" ON public.channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channels" ON public.channels FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own channels" ON public.channels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enforce strict RLS on audits
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can select own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can insert own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can update own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can delete own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can view own audits" ON public.audits;

CREATE POLICY "Users can select own audits" ON public.audits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audits" ON public.audits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audits" ON public.audits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own audits" ON public.audits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enforce strict RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can select own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;

CREATE POLICY "Users can select own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
