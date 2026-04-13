import { supabase } from '@/lib/supabase/client'

export async function triggerAuditProcessing(auditId: string) {
  if (!auditId) {
    throw new Error('auditId é obrigatório para processar a auditoria.')
  }

  const { data, error } = await supabase.functions.invoke('process-audit', {
    body: { audit_id: auditId },
  })

  if (error) {
    console.error('Error triggering audit processing:', error)
    throw new Error(error.message || 'Falha ao acionar o processamento da auditoria.')
  }

  return data
}
