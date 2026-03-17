-- Add error_message column to capture specific failure reasons
ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Update the status to 'failed' instead of 'error' for historical failed audits
UPDATE public.audits SET status = 'failed' WHERE status = 'error';

-- Update the trigger to handle RETRY logic (when status is updated from failed -> pending)
DROP TRIGGER IF EXISTS on_audit_created ON public.audits;

-- Trigger for INSERT
CREATE TRIGGER on_audit_created_insert
  AFTER INSERT ON public.audits
  FOR EACH ROW
  WHEN (NEW.type = 'free_audit' AND NEW.status = 'pending')
  EXECUTE FUNCTION public.trigger_audit_processing();

-- Trigger for UPDATE (Retry)
CREATE TRIGGER on_audit_created_update
  AFTER UPDATE OF status ON public.audits
  FOR EACH ROW
  WHEN (NEW.type = 'free_audit' AND NEW.status = 'pending' AND OLD.status IN ('failed', 'error'))
  EXECUTE FUNCTION public.trigger_audit_processing();

