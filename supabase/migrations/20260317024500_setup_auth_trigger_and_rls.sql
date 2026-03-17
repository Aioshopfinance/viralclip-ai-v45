-- Set up auth trigger and ensure RLS is correctly configured

-- Ensure correct handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into users table, doing nothing if user already exists
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Initial signup bonus
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 500)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Synchronize any existing users in auth.users that might be missing in public.users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.users)
  LOOP
    INSERT INTO public.users (id, full_name, email, role)
    VALUES (
      r.id,
      COALESCE(r.raw_user_meta_data->>'full_name', 'Usuário'),
      r.email,
      COALESCE(r.raw_user_meta_data->>'role', 'client')
    )
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.credits (user_id, balance)
    VALUES (r.id, 500)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Ensure RLS policies are set correctly for users, credits, channels, and audits
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- users policies
DROP POLICY IF EXISTS "Users can select own profile" ON public.users;
CREATE POLICY "Users can select own profile" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- credits policies
DROP POLICY IF EXISTS "Users can select own credits" ON public.credits;
CREATE POLICY "Users can select own credits" ON public.credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credits" ON public.credits;
CREATE POLICY "Users can insert own credits" ON public.credits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON public.credits;
CREATE POLICY "Users can update own credits" ON public.credits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- channels policies
DROP POLICY IF EXISTS "Users can select own channels" ON public.channels;
CREATE POLICY "Users can select own channels" ON public.channels
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own channels" ON public.channels;
CREATE POLICY "Users can insert own channels" ON public.channels
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own channels" ON public.channels;
CREATE POLICY "Users can update own channels" ON public.channels
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- audits policies
DROP POLICY IF EXISTS "Users can select own audits" ON public.audits;
CREATE POLICY "Users can select own audits" ON public.audits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audits" ON public.audits;
CREATE POLICY "Users can insert own audits" ON public.audits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own audits" ON public.audits;
CREATE POLICY "Users can update own audits" ON public.audits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
