import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, Video, Hash } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'
import { AuditMetrics } from '@/components/audit/AuditMetrics'
import { LockedReport } from '@/components/audit/LockedReport'

function AuditStatusBadge({ status }: { status: string }) {
  if (status === 'pending')
    return (
      <Badge variant="secondary" className="animate-pulse">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analisando
      </Badge>
    )
  if (status === 'completed')
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
      </Badge>
    )
  if (status === 'error' || status === 'failed')
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" /> Falha
      </Badge>
    )
  return <Badge variant="outline">{status}</Badge>
}

export default function AuditDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, convertAnonymousUser } = useAppStore()
  const { toast } = useToast()

  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const isAnonymous = user?.email?.startsWith('anon_') || !user?.email || false
  const showPreviewOnly = isAnonymous && !isUnlocked && audit?.status === 'completed'

  useEffect(() => {
    if (!id || !user) return
    const fetchAudit = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('audits')
          .select('*, channels(*)')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()
        if (fetchErr) throw fetchErr
        if (!data) throw new Error('Auditoria não encontrada.')
        setAudit({
          ...data,
          channel: Array.isArray(data.channels) ? data.channels[0] : data.channels,
        })
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar auditoria isolada.')
      } finally {
        setLoading(false)
      }
    }
    fetchAudit()

    const sub = supabase
      .channel(`audit-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${id}` },
        (payload) => setAudit((prev: any) => ({ ...prev, ...payload.new })),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [id, user])

  useEffect(() => {
    if (audit?.status === 'completed' && audit.analysis_data) {
      const ad = audit.analysis_data
      if (ad.received_url) {
        console.log(`[Audit Debug] URL recebida: ${ad.received_url}`)
        console.log(
          `[Audit Debug] channelId resolvido: ${ad.youtube_channel_id} (Formato: ${ad.resolved_url_type})`,
        )
        console.log(`[Audit Debug] métricas calculadas:`, ad.metrics, ad.score_breakdown)
        console.log(`[Audit Debug] dados brutos:`, ad.raw_data)
      }
    }
  }, [audit?.status])

  const handleUnlock = async (e: React.FormEvent, email: string, pass: string, name: string) => {
    e.preventDefault()
    setFormLoading(true)
    const { error: convErr } = await convertAnonymousUser(email, pass, name)
    setFormLoading(false)
    if (convErr)
      toast({ title: 'Erro ao desbloquear', description: convErr.message, variant: 'destructive' })
    else {
      toast({ title: 'Sucesso!', description: 'Conta criada e relatório desbloqueado.' })
      setIsUnlocked(true)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  if (error || !audit)
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <p>{error}</p>
      </div>
    )

  const analysis = audit.analysis_data || {}
  const breakdown = analysis.score_breakdown || null
  const score = breakdown?.total || audit.growth_score || analysis.score || 0
  const channelName =
    audit.channel?.channel_name || audit.channel?.channel_link || 'Canal Desconhecido'
  const metrics = analysis.metrics || null

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-2 -ml-3 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <AuditStatusBadge status={audit.status} />
      </div>

      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary border border-secondary/20">
          <Video className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold line-clamp-1">{channelName}</h1>
          <div className="text-muted-foreground text-sm flex items-center gap-3 mt-1">
            <span>Auditado em: {new Date(audit.created_at).toLocaleDateString('pt-BR')}</span>
            {analysis.youtube_channel_id && (
              <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-mono">
                <Hash className="h-3 w-3" /> {analysis.youtube_channel_id}
              </span>
            )}
          </div>
        </div>
      </div>

      {audit.status === 'pending' && (
        <Card className="border-dashed bg-muted/30 text-center py-16">
          <Sparkles className="h-12 w-12 text-secondary mx-auto animate-bounce" />
          <h2 className="text-2xl mt-4 font-semibold">Analisando dados reais do canal...</h2>
        </Card>
      )}

      {(audit.status === 'error' || audit.status === 'failed') && (
        <Card className="border-destructive/50 bg-destructive/5 text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="mt-4">
            {audit.error_message || 'Não foi possível obter dados reais do canal.'}
          </p>
        </Card>
      )}

      {audit.status === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 border-secondary/20 shadow-lg relative flex flex-col items-center justify-center p-6 text-center h-fit">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent" />
            <CardTitle className="mb-6 font-heading">Growth Score</CardTitle>
            <ScoreGauge score={score} className="w-48" />
          </Card>

          <div className="md:col-span-2 space-y-6 relative">
            {metrics && <AuditMetrics metrics={metrics} breakdown={breakdown} />}

            {showPreviewOnly ? (
              <LockedReport handleUnlock={handleUnlock} formLoading={formLoading} />
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                  <Sparkles className="text-secondary h-5 w-5" /> Recomendações Otimizadas
                </h3>
                {analysis.content_suggestions?.map((s: string, idx: number) => (
                  <Card key={idx} className="bg-secondary/5">
                    <CardContent className="p-4 flex gap-4">
                      <div className="font-bold">{idx + 1}</div>
                      <p>{s}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
