CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_audit_processing()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  anon_key text;
BEGIN
  -- URL and anon key based on the environment configuration
  edge_function_url := 'https://bmgxudjhfojeylsvsddt.supabase.co/functions/v1/process-audit';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZ3h1ZGpoZm9qZXlsc3ZzZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTc4MDQsImV4cCI6MjA4OTI3MzgwNH0.7325VwfD2YBBcZasDWrxXGFxglEV58R_53Um0LMqjEY';
  
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := json_build_object('record', row_to_json(NEW))::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_audit_created ON public.audits;
CREATE TRIGGER on_audit_created
  AFTER INSERT ON public.audits
  FOR EACH ROW
  WHEN (NEW.type = 'free_audit' AND NEW.status = 'pending')
  EXECUTE FUNCTION public.trigger_audit_processing();
