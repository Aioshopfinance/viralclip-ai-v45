-- 1. Alter public.users
-- Update existing roles to 'client' before applying the new constraint
UPDATE public.users 
SET role = 'client' 
WHERE role IS NULL OR role NOT IN ('visitor', 'client', 'affiliate', 'collaborator', 'administrator', 'operator_ia');

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('visitor', 'client', 'affiliate', 'collaborator', 'administrator', 'operator_ia'));

ALTER TABLE public.users 
ALTER COLUMN role SET DEFAULT 'client';

-- Update the handle_new_user function to use 'client' instead of 'Client'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  
  INSERT INTO public.credits (user_id, balance)
  VALUES (new.id, 500); -- Initial signup bonus
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Alter public.channels
ALTER TABLE public.channels 
RENAME COLUMN channel_url TO channel_link;

ALTER TABLE public.channels 
ADD COLUMN status TEXT DEFAULT 'active';

-- 3. Alter public.audits
ALTER TABLE public.audits 
RENAME COLUMN creator_growth_score TO growth_score;

ALTER TABLE public.audits 
ALTER COLUMN growth_score TYPE INTEGER USING growth_score::INTEGER;

ALTER TABLE public.audits 
RENAME COLUMN report_json TO analysis_data;

-- 4. Alter public.projects
ALTER TABLE public.projects 
RENAME COLUMN service_type TO service_name;

ALTER TABLE public.projects 
RENAME COLUMN delivery_content TO deliverables;

ALTER TABLE public.projects 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 5. Alter public.credits
ALTER TABLE public.credits 
RENAME COLUMN last_updated TO updated_at;

-- 6. Alter public.transactions
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

UPDATE public.transactions 
SET type = 'credit_purchase' 
WHERE type = 'credit';

UPDATE public.transactions 
SET type = 'service_usage' 
WHERE type = 'debit';

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('credit_purchase', 'service_usage'));


-- 7. Row Level Security Policies
-- Drop old policies to replace them with complete CRUD policies
DROP POLICY IF EXISTS "Users can manage own channels" ON public.channels;
DROP POLICY IF EXISTS "Users can view own audits" ON public.audits;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Users
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Channels
CREATE POLICY "Users can select own channels" ON public.channels 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels" ON public.channels 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels" ON public.channels 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels" ON public.channels 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Audits
CREATE POLICY "Users can select own audits" ON public.audits 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits" ON public.audits 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits" ON public.audits 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits" ON public.audits 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Projects
CREATE POLICY "Users can select own projects" ON public.projects 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Credits
CREATE POLICY "Users can select own credits" ON public.credits 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON public.credits 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.credits 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credits" ON public.credits 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can select own transactions" ON public.transactions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. Seed Data for Testing
DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  -- Seed Administrator
  seed_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    seed_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@viralclip.ai',
    crypt('ViralClip2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin ViralClip", "role": "administrator"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL, '', '', ''
  );

  -- Seed Client
  seed_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    seed_user_id,
    '00000000-0000-0000-0000-000000000000',
    'client@viralclip.ai',
    crypt('ViralClip2026!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Client ViralClip", "role": "client"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL, '', '', ''
  );
END $$;
