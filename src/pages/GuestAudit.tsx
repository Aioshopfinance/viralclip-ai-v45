import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Bot, AlertCircle, Lock, Sparkles, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { AuditMetrics } from '@/components/audit/AuditMetrics'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'
import { normalizeUrl } from '@/lib/utils'

export default function GuestAudit() {
  const { ephemeralAudit, setEphemeralAudit, signup, user } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [status, setStatus] = useState<'processing' | 'completed' | 'error' | 'auth'>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ephemeralAudit?.url) {
      navigate('/')
      return
    }

    if (status === 'processing' && !ephemeralAudit.analysisData) {
      const run = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('anonymous-audit', {
            body: { url: ephemeralAudit.url, platform: ephemeralAudit.platform },
          })
          if (error) throw new Error(error.message)
          if (data?.error) throw new Error(data.error)

          setEphemeralAudit({ ...ephemeralAudit, ...data })
          setStatus('completed')
        } catch (err: any) {
          setStatus('error')
          setErrorMsg(err.message || 'Erro ao analisar canal.')
        }
      }
      run()
    } else if (ephemeralAudit.analysisData && status === 'processing') {
      setStatus('completed')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && status === 'auth') {
      handleSaveToDb(user.id)
    }
  }, [user, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveToDb = async (userId: string) => {
    try {
      if (!ephemeralAudit || !ephemeralAudit.analysisData) return

      const normalizedLink = normalizeUrl(ephemeralAudit.url)
      let channelId = ''

      const { data: existing } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', userId)
        .eq('normalized_link', normalizedLink)
        .maybeSingle()

      if (existing) {
        channelId = existing.id
      } else {
        const { data: newCh } = await supabase
          .from('channels')
          .insert({
            user_id: userId,
            platform: ephemeralAudit.platform,
            channel_name: ephemeralAudit.channelName || 'Canal Detectado',
            channel_link: ephemeralAudit.url,
            normalized_link: normalizedLink,
            status: 'active',
          })
          .select()
          .single()
        if (newCh) channelId = newCh.id
      }

      const totalScore = ephemeralAudit.analysisData.data?.score_breakdown?.total || 0

      const { data: audit } = await supabase
        .from('audits')
        .insert({
          user_id: userId,
          channel_id: channelId,
          status: ephemeralAudit.analysisData.auditStatus || 'completed',
          type: 'free_audit',
          growth_score: totalScore,
          analysis_data: ephemeralAudit.analysisData,
        })
        .select()
        .single()

      setEphemeralAudit(null)
      if (audit) navigate(`/audits/${audit.id}`)
      else navigate('/dashboard')
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
      navigate('/dashboard')
    }
  }

  const handleRegister = async () => {
    if (!email || !password || !name)
      return toast({ title: 'Preencha tudo', variant: 'destructive' })
    setIsLoading(true)
    const { error } = await signup(email, password, name)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      setIsLoading(false)
    }
  }

  const analysisData = ephemeralAudit?.analysisData
  const metricsData = analysisData?.data?.metrics || analysisData?.metrics
  const breakdownData = analysisData?.data?.score_breakdown || analysisData?.score_breakdown
  const contentSuggestions =
    analysisData?.data?.content_suggestions || analysisData?.content_suggestions
  const isPendingIntegration = analysisData?.integrationStatus === 'pending'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full max-w-6xl mx-auto p-6 flex items-center gap-2 text-primary font-heading font-bold text-xl">
        <div
          className="bg-secondary text-white p-1.5 rounded-lg cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="cursor-pointer" onClick={() => navigate('/')}>
          ViralClip AI
        </span>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {status === 'processing' && (
          <div className="text-center animate-fade-in">
            <Bot className="w-16 h-16 text-primary animate-pulse mb-6 mx-auto" />
            <h1 className="text-3xl font-bold font-heading">Analisando Canal...</h1>
            <p className="text-muted-foreground mt-2">Acessando métricas públicas em tempo real.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center animate-fade-in">
            <AlertCircle className="w-16 h-16 text-destructive mb-6 mx-auto" />
            <h1 className="text-2xl font-bold font-heading">Erro na Análise</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{errorMsg}</p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Tentar Novamente
            </Button>
          </div>
        )}

        {status === 'auth' && (
          <Card className="w-full max-w-md animate-slide-up">
            <CardHeader>
              <CardTitle>Salvar Auditoria</CardTitle>
              <CardDescription>
                Crie sua conta grátis para salvar os resultados e gerar cortes virais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full" onClick={handleRegister} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Conta e Salvar
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStatus('completed')}
                disabled={isLoading}
              >
                Voltar ao Relatório
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'completed' && analysisData && (
          <div className="max-w-4xl w-full animate-fade-in space-y-8 pb-12 pt-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Relatório: {ephemeralAudit.channelName}
              </h1>
              <p className="text-muted-foreground capitalize text-lg">{ephemeralAudit.platform}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isPendingIntegration ? (
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-secondary/20 relative h-fit bg-muted/30">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <CardTitle className="mb-2 text-lg">Integração em Desenvolvimento</CardTitle>
                  <p className="text-sm text-muted-foreground text-balance">
                    {analysisData.message ||
                      'Estamos conectando a API real desta plataforma. Seus dados não foram inventados e estarão disponíveis em breve.'}
                  </p>
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-lg border-secondary/20 relative overflow-hidden h-fit">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent" />
                  <CardTitle className="mb-4">Growth Score</CardTitle>
                  <ScoreGauge score={breakdownData?.total || 0} className="w-48" />
                </Card>
              )}

              <div className="md:col-span-2 space-y-6">
                <AuditMetrics
                  metrics={metricsData}
                  breakdown={breakdownData}
                  platform={ephemeralAudit.platform}
                />

                {!isPendingIntegration && contentSuggestions?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-heading font-semibold">Oportunidades</h3>
                    {contentSuggestions.map((s: string, idx: number) => (
                      <Card key={idx} className="border-l-4 border-l-accent bg-card/50">
                        <CardContent className="p-4 text-sm">{s}</CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="bg-primary text-primary-foreground border-none shadow-xl mt-6">
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="font-bold text-xl mb-1">Pronto para acelerar?</h3>
                      <p className="text-sm opacity-90 text-balance">
                        Crie uma conta para salvar seu canal e enviar vídeos para nossa IA gerar
                        cortes virais automaticamente.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setStatus('auth')}
                      className="shrink-0 gap-2 whitespace-nowrap font-semibold"
                    >
                      <Lock className="w-4 h-4" /> Criar Conta Grátis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
