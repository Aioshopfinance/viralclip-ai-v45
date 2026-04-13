import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bot, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { triggerAuditProcessing } from '@/lib/audit-service'
import { Progress } from '@/components/ui/progress'

const STEPS = [
  'Iniciando conexão...',
  'Analisando canal...',
  'Coletando dados...',
  'Calculando potencial viral...',
  'Gerando score...',
]

const MIN_PROCESSING_TIME = 15000

export default function AuditProcessing() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  const [stepIdx, setStepIdx] = useState(0)
  const [minTimePassed, setMinTimePassed] = useState(false)
  const [auditStatus, setAuditStatus] = useState<string>('pending')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!auditId) {
      navigate('/')
      return
    }

    const stepInterval = setInterval(() => {
      setStepIdx((prev) => Math.min(prev + 1, STEPS.length - 1))
    }, MIN_PROCESSING_TIME / STEPS.length)

    const minTimeTimeout = setTimeout(() => {
      setMinTimePassed(true)
    }, MIN_PROCESSING_TIME)

    supabase
      .from('audits')
      .select('status, error_message')
      .eq('id', auditId)
      .single()
      .then(({ data }) => {
        if (data) {
          setAuditStatus(data.status)
          if (data.error_message) setErrorMsg(data.error_message)

          if (data.status === 'pending') {
            console.log('[AuditProcessing] Audit still pending — re-triggering Edge Function')
            triggerAuditProcessing(auditId)
          }
        }
      })

    const subscription = supabase
      .channel(`audit-proc-${auditId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${auditId}` },
        (payload) => {
          setAuditStatus(payload.new.status)
          if (payload.new.error_message) setErrorMsg(payload.new.error_message)
        },
      )
      .subscribe()

    return () => {
      clearInterval(stepInterval)
      clearTimeout(minTimeTimeout)
      supabase.removeChannel(subscription)
    }
  }, [auditId, navigate])

  useEffect(() => {
    if (!minTimePassed) return

    if (auditStatus === 'completed' || auditStatus === 'pending_integration') {
      navigate(`/audit/result/${auditId}`, { replace: true })
    }
  }, [minTimePassed, auditStatus, navigate, auditId])

  if (auditStatus === 'failed' || auditStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold font-heading">Auditoria Interrompida</h1>

        <p className="text-muted-foreground mt-2 max-w-md">
          Ocorreu um erro ao extrair as métricas. Verifique se a URL informada é válida e tente
          novamente.
        </p>

        {errorMsg && (
          <p className="text-sm bg-muted text-muted-foreground p-3 rounded mt-4 max-w-md">
            {errorMsg}
          </p>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-8 text-primary font-medium hover:underline"
        >
          Voltar e tentar novamente
        </button>
      </div>
    )
  }

  const progressValue = Math.min(((stepIdx + 1) / STEPS.length) * 100, 99)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto animate-fade-in px-4">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse-glow">
          <Bot className="w-12 h-12" />
        </div>

        <div className="absolute top-0 right-0 w-6 h-6 bg-secondary rounded-full flex items-center justify-center border-4 border-background animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold font-heading text-center mb-2">Auditoria em andamento</h1>

      <p className="text-muted-foreground text-center mb-8 h-6 transition-all duration-300">
        {STEPS[stepIdx]}
      </p>

      <div className="w-full space-y-6">
        <Progress value={progressValue} className="h-3 bg-muted" />

        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < stepIdx
            const isCurrent = idx === stepIdx

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  isCompleted ? 'opacity-50' : isCurrent ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}

                <span
                  className={`text-sm ${
                    isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
