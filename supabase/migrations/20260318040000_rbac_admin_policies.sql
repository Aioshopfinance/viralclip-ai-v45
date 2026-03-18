-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Users Table
DROP POLICY IF EXISTS "Admins can select all users" ON public.users;
CREATE POLICY "Admins can select all users" ON public.users FOR SELECT TO authenticated USING (public.is_admin());

-- Channels Table
DROP POLICY IF EXISTS "Admins can select all channels" ON public.channels;
CREATE POLICY "Admins can select all channels" ON public.channels FOR SELECT TO authenticated USING (public.is_admin());

-- Audits Table
DROP POLICY IF EXISTS "Admins can select all audits" ON public.audits;
CREATE POLICY "Admins can select all audits" ON public.audits FOR SELECT TO authenticated USING (public.is_admin());

-- Projects Table
DROP POLICY IF EXISTS "Admins can select all projects" ON public.projects;
CREATE POLICY "Admins can select all projects" ON public.projects FOR SELECT TO authenticated USING (public.is_admin());

-- Credits Table
DROP POLICY IF EXISTS "Admins can select all credits" ON public.credits;
CREATE POLICY "Admins can select all credits" ON public.credits FOR SELECT TO authenticated USING (public.is_admin());

-- Transactions Table
DROP POLICY IF EXISTS "Admins can select all transactions" ON public.transactions;
CREATE POLICY "Admins can select all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.is_admin());

/*
=============================================================================
MANUAL ADMIN PROMOTION SNIPPET
=============================================================================
The system does not contain hardcoded administrator credentials.
To elevate a user to 'admin', execute the following SQL in the Supabase SQL Editor:

UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
=============================================================================
*/
