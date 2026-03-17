import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Share2, ArrowRight, Lightbulb, Loader2, AlertCircle, Hash } from 'lucide-react'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/main'
import { AuditMetrics } from '@/components/audit/AuditMetrics'

export default function ChannelAudit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAppStore()

  const [channel, setChannel] = useState<any>(null)
  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    const fetchAuditData = async () => {
      try {
        const { data: cData, error: cErr } = await supabase
          .from('channels')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()
        if (cErr || !cData) throw new Error('Canal não encontrado.')
        setChannel(cData)

        const { data: aData, error: aErr } = await supabase
          .from('audits')
          .select('*')
          .eq('channel_id', id)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (aErr) throw aErr
        if (aData) setAudit(aData)
        else setError('Nenhuma auditoria concluída foi encontrada.')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAuditData()
  }, [id, user])

  useEffect(() => {
    if (audit && audit.status === 'completed' && audit.analysis_data) {
      const ad = audit.analysis_data
      if (ad.received_url) {
        console.group(`[Audit Debug] Resultado da Auditoria`)
        console.log(`URL recebida: ${ad.received_url}`)
        console.log(
          `channelId resolvido: ${ad.youtube_channel_id} (Formato: ${ad.resolved_url_type})`,
        )

        const stats = ad.raw_data?.channel?.items?.[0]?.statistics
        if (stats) {
          console.log(`Raw API subscriberCount: ${stats.subscriberCount}`)
          console.log(`Raw API videoCount: ${stats.videoCount}`)
        }

        console.log(
          `Main data from retrieved videos list:`,
          ad.raw_data?.videos?.items?.map((v: any) => ({
            id: v.id,
            views: v.statistics?.viewCount,
            publishedAt: v.snippet?.publishedAt,
          })),
        )

        console.log(`Intermediate metrics:`, ad.metrics)
        console.log(`Score breakdown:`, ad.score_breakdown)
        console.groupEnd()
      }
    }
  }, [audit?.status])

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  if (error || !channel)
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <p>{error}</p>
      </div>
    )

  const analysis = audit?.analysis_data || {}
  const breakdown = analysis.score_breakdown || null
  const score = breakdown?.total || audit?.growth_score || analysis.score || 0
  const metrics = analysis.metrics || null
  const avatarUrl = `https://img.usecurling.com/i?q=${encodeURIComponent(
    channel.platform,
  )}&color=gradient`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-background bg-secondary/10"
          />
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {channel.channel_name || 'Canal Ativo'}
            </h1>
            <div className="text-muted-foreground flex items-center gap-3 mt-1 text-sm">
              <Badge variant="secondary" className="capitalize">
                {channel.platform}
              </Badge>
              {analysis.youtube_channel_id && (
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-mono">
                  <Hash className="h-3 w-3" /> {analysis.youtube_channel_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-secondary/20 shadow-lg relative flex flex-col items-center justify-center p-6 text-center h-fit">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>
          <CardTitle className="mb-6 font-heading">Growth Score</CardTitle>
          <ScoreGauge score={score} className="w-48" />
        </Card>

        <div className="lg:col-span-2 grid gap-6">
          {metrics && <AuditMetrics metrics={metrics} breakdown={breakdown} />}

          <div className="space-y-4">
            <h3 className="text-xl font-heading font-semibold">Direcionamento de Conteúdo</h3>
            {analysis.content_suggestions?.map((s: string, idx: number) => (
              <Card key={idx} className="border-l-4 border-l-accent">
                <CardContent className="p-4">{s}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2 mb-6">
          <Lightbulb className="text-accent" /> Plano de Ação Recomendado
        </h2>
        <Card className="bg-primary text-primary-foreground max-w-md">
          <CardHeader>
            <CardTitle>Contratar Agente de Edição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-6">Aumente seu volume de Shorts automaticamente com IA.</p>
            <Button variant="secondary" className="w-full gap-2" asChild>
              <Link to="/marketplace">
                Acessar Marketplace <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
