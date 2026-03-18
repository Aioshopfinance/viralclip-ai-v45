-- Update users_role_check constraint to include 'subscriber' role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
  role = ANY (ARRAY[
    'visitor'::text, 
    'client'::text, 
    'affiliate'::text, 
    'collaborator'::text, 
    'administrator'::text, 
    'operator_ia'::text, 
    'subscriber'::text
  ])
);
