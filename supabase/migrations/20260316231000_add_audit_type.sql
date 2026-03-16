-- Add 'type' column to the 'audits' table to support free audits differentiation
ALTER TABLE public.audits 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'free_audit';
