import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Lock,
  CheckCircle2,
  ChevronRight,
  Hash,
  PlaySquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { AuditMetrics } from '@/components/audit/AuditMetrics'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/main'

export default function AuditResult() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const { user } = useAppStore()

  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auditId || !user) return

    const fetchAudit = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('audits')
          .select('*, channels(*)')
          .eq('id', auditId)
          .eq('user_id', user.id)
          .single()

        if (fetchErr) throw fetchErr
        if (!data) throw new Error('Auditoria não encontrada.')

        const auditData = {
          ...data,
          channel: Array.isArray(data.channels) ? data.channels[0] : data.channels,
        }

        setAudit(auditData)

        // Acceptance Criteria: Console Debugging
        if (auditData.analysis_data) {
          console.group(`[Audit Debug]`)
          console.log(`channelId:`, auditData.channel_id)
          console.log(`analysis_data:`, auditData.analysis_data)
          console.groupEnd()
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar resultados.')
      } finally {
        setLoading(false)
      }
    }
    fetchAudit()
  }, [auditId, user])

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

  const channel = audit.channel || {}
  const analysis = audit.analysis_data || {}
  const metrics = analysis.metrics || null
  const breakdown = analysis.score_breakdown || null
  const score = breakdown?.total || audit.growth_score || 0

  const avatarUrl = `https://img.usecurling.com/i?q=${encodeURIComponent(channel.platform || 'youtube')}&color=gradient`

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt="Platform" className="w-16 h-16 rounded-full bg-secondary/10" />
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {channel.channel_name || 'Canal Analisado'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="capitalize">{channel.platform}</span>
              {analysis.youtube_channel_id && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    <Hash className="h-3 w-3" /> {analysis.youtube_channel_id}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Main Score & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-secondary/20 shadow-lg relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>
          <CardTitle className="mb-6 font-heading text-xl">Score de Crescimento Viral</CardTitle>
          <ScoreGauge score={score} className="w-48" />
          <p className="mt-6 text-sm text-muted-foreground max-w-[250px]">
            Baseado em métricas de retenção, frequência e qualidade comparado ao seu nicho.
          </p>
        </Card>

        <div className="lg:col-span-2">
          {metrics && <AuditMetrics metrics={metrics} breakdown={null} />}
        </div>
      </div>

      {/* Partial Diagnosis & Paywall */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <TrendingUp className="text-primary" /> Diagnóstico do Canal
        </h2>

        {/* Free Content (30%) */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              Frequência de Postagem
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sua consistência atual foi avaliada com um score de{' '}
              <strong>
                {breakdown?.frequency?.score || 0}/{breakdown?.frequency?.max || 30}
              </strong>
              . Canais virais mantêm um ritmo de publicação mais intenso em formatos curtos
              (Shorts/Reels) para treinar o algoritmo a distribuir seu conteúdo.
            </p>
          </CardContent>
        </Card>

        {/* Paywalled Content (70%) */}
        <div className="relative mt-8 group">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex flex-col items-center justify-end pb-12">
            <div className="bg-card border shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-2 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-xl">Desbloqueie a análise completa</h3>
              <p className="text-sm text-muted-foreground px-4">
                Veja o relatório de Potencial de Crescimento, Qualidade dos Conteúdos e sugestões
                virais exclusivas.
              </p>
              <Button
                size="lg"
                className="w-full mt-4 gap-2 text-md"
                onClick={() => navigate('/upgrade')}
              >
                Liberar análise completa <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="opacity-40 filter blur-sm select-none pointer-events-none space-y-6">
            <Card className="border-l-4 border-l-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  Potencial de Crescimento <PlaySquare className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  Qualidade dos Conteúdos <PlaySquare className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-4/5 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-muted shrink-0"></div>
                    <div className="h-6 bg-muted rounded w-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
