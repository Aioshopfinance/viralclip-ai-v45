import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Share2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/main'

export default function ChannelAudit() {
  const { id } = useParams() // this is the channel_id
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
        console.log(
          `[Audit Debug] Fetching channel and latest audit. User_id: ${user.id}, Channel_id: ${id}`,
        )

        // 1. Fetch channel ensuring it belongs to the user
        const { data: channelData, error: channelErr } = await supabase
          .from('channels')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (channelErr) throw channelErr
        if (!channelData) throw new Error('Canal não encontrado ou sem permissão de acesso.')

        setChannel(channelData)

        // 2. Fetch the latest completed audit for this specific channel and user
        const { data: auditData, error: auditErr } = await supabase
          .from('audits')
          .select('*')
          .eq('channel_id', id)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        console.log(
          `[Audit Debug] Query return status: ${auditData ? 'found' : 'not_found'}, Audit_id: ${auditData?.id}`,
        )

        if (auditErr) throw auditErr

        if (auditData) {
          setAudit(auditData)
        } else {
          setError('Nenhuma auditoria concluída foi encontrada para este canal.')
        }
      } catch (err: any) {
        console.error('[Audit Debug] Fetch Error:', err)
        setError(err.message || 'Erro ao carregar dados da auditoria isolada.')
      } finally {
        setLoading(false)
      }
    }

    fetchAuditData()
  }, [id, user])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Carregando relatório do canal...</p>
      </div>
    )
  }

  if (error || !channel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Acesso Restrito ou Falha</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Voltar ao Painel</Button>
      </div>
    )
  }

  const analysis = audit?.analysis_data || {}
  const score = audit?.growth_score || analysis.score || 0
  const avatarUrl = `https://img.usecurling.com/i?q=${encodeURIComponent(channel.platform)}&color=gradient`

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-background shadow-md bg-secondary/10"
          />
          <div>
            <h1 className="text-3xl font-heading font-bold line-clamp-1">
              {channel.channel_name || 'Canal Ativo'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {channel.platform}
              </Badge>
              {channel.niche && <span className="capitalize">• {channel.niche}</span>}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Area */}
        <Card className="lg:col-span-1 border-secondary/20 shadow-lg relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>
          <CardTitle className="mb-6 font-heading">Creator Growth Score</CardTitle>
          <ScoreGauge score={score} className="w-48" />
          <p className="mt-6 text-sm text-muted-foreground">
            A auditoria isolada (ID: {audit?.id?.slice(0, 8)}) mostra sua pontuação de {score}.
          </p>
        </Card>

        {/* Diagnostic Breakdown */}
        <div className="lg:col-span-2 grid gap-4">
          <h3 className="text-xl font-heading font-semibold mb-2">Diagnóstico da IA</h3>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-emerald-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Potencial de Crescimento</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.viral_potential ||
                    'O nicho analisado apresenta oportunidades consistentes.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-rose-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Frequência e Consistência</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.posting_frequency ||
                    'Recomendamos manter a regularidade das publicações para educar o algoritmo.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {analysis.content_suggestions && analysis.content_suggestions.length > 0 && (
            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-4 flex items-start gap-4">
                <Lightbulb className="h-6 w-6 text-accent mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold">Direcionamento de Conteúdo</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside ml-2">
                    {analysis.content_suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Plan */}
      <div className="mt-12">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2 mb-6">
          <Lightbulb className="text-accent" />
          Plano de Ação Recomendado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Contratar Agente de Edição</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Aumente seu volume de Shorts/Reels automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-6">
                Nossos agentes usam inteligência artificial para fragmentar seus vídeos longos com
                base no contexto desta auditoria.
              </p>
              <Button variant="secondary" className="w-full gap-2" asChild>
                <Link to="/marketplace">
                  Acessar Marketplace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
