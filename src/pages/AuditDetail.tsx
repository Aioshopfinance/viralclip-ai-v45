import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'

function AuditStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="animate-pulse">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analisando
        </Badge>
      )
    case 'completed':
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
        </Badge>
      )
    case 'error':
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" /> Falha
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
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

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const isAnonymous = user?.email?.startsWith('anon_') || !user?.email || false
  const showPreviewOnly = isAnonymous && !isUnlocked && audit?.status === 'completed'

  useEffect(() => {
    if (!id || !user) return

    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    if (!isValidUUID) {
      setError('ID de auditoria inválido.')
      setLoading(false)
      return
    }

    const fetchAudit = async () => {
      try {
        console.log(
          `[Audit Debug] Fetching specific audit. Audit_id: ${id}, Session User_id: ${user.id}`,
        )

        const { data, error: fetchErr } = await supabase
          .from('audits')
          .select('*, channels(*)')
          .eq('id', id)
          .eq('user_id', user.id) // explicitly restricting via query in addition to RLS
          .single()

        console.log(`[Audit Debug] Query status: ${data ? 'found' : 'not_found'}`)

        if (fetchErr) throw fetchErr
        if (!data) throw new Error('Auditoria não encontrada ou acesso negado.')

        setAudit({
          ...data,
          channel: Array.isArray(data.channels) ? data.channels[0] : data.channels,
        })
      } catch (err: any) {
        console.error('[Audit Debug] Fetch Error:', err)
        setError(err.message || 'Erro ao carregar auditoria isolada.')
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()

    const subscription = supabase
      .channel(`audit-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${id}` },
        (payload) => {
          setAudit((prev: any) => ({ ...prev, ...payload.new }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [id, user])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name)
      return toast({
        title: 'Aviso',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      })

    setFormLoading(true)
    const { error: convErr } = await convertAnonymousUser(email, password, name)
    setFormLoading(false)

    if (convErr) {
      toast({
        title: 'Erro ao desbloquear',
        description: convErr.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Sua conta foi criada e o relatório completo foi desbloqueado.',
      })
      setIsUnlocked(true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando dados seguros da auditoria...
        </p>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">Acesso Restrito ou Falha</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    )
  }

  const analysis = audit.analysis_data || {}
  const score = audit.growth_score || analysis.score || 0
  const channelName =
    audit.channel?.channel_name || audit.channel?.channel_link || 'Canal Desconhecido'

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-2 -ml-3 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Button>
        <AuditStatusBadge status={audit.status} />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary border border-secondary/20">
            <Video className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold line-clamp-1">{channelName}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              Auditado em: {new Date(audit.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {audit.status === 'pending' && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
              <Sparkles className="h-12 w-12 text-secondary relative z-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-heading font-semibold">
              Nossa IA está analisando seu canal...
            </h2>
            <p className="text-muted-foreground max-w-md">
              Avaliando retenção, ganchos e potencial viral de forma segura. Isso normalmente leva
              alguns segundos. Não feche esta página.
            </p>
          </CardContent>
        </Card>
      )}

      {audit.status === 'error' && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-bold">Falha na Análise</h2>
            <p className="text-muted-foreground">
              Não foi possível processar a URL informada de forma segura.
            </p>
            <Button onClick={() => navigate('/')}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      )}

      {audit.status === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Score */}
          <Card className="md:col-span-1 border-secondary/20 shadow-lg relative overflow-hidden flex flex-col items-center justify-center p-6 text-center h-fit">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent" />
            <CardTitle className="mb-6 font-heading">Growth Score</CardTitle>
            <ScoreGauge score={score} className="w-48" />
            <p className="mt-6 text-sm text-muted-foreground">
              Baseado na análise exclusiva dos dados do seu canal.
            </p>
          </Card>

          {/* Insights / Preview */}
          <div className="md:col-span-2 space-y-6 relative">
            <div className="grid gap-4">
              <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Potencial Identificado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {analysis.viral_potential || 'Análise segura do canal efetuada.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm text-amber-600 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Oportunidade Otimizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {analysis.posting_frequency || 'Verifique as sugestões para o algoritmo.'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Blurred content if locked */}
            {showPreviewOnly ? (
              <div className="relative mt-8">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 rounded-xl border border-border">
                  <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading font-bold text-xl">
                      Desbloqueie o Relatório Completo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Crie sua conta gratuitamente para ver todas as recomendações da IA e salvar
                      este relatório.
                    </p>

                    <form onSubmit={handleUnlock} className="space-y-3 text-left mt-4">
                      <div className="space-y-1">
                        <Label>Nome Completo</Label>
                        <Input
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Senha</Label>
                        <Input
                          type="password"
                          placeholder="Crie uma senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full mt-2" disabled={formLoading}>
                        {formLoading ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          'Ver Resultados Completos'
                        )}
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Fake blurred content behind the lock */}
                <div className="opacity-40 pointer-events-none select-none space-y-4 filter blur-[3px]">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" /> Recomendações da IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-12 bg-muted rounded-lg w-full"></div>
                      <div className="h-12 bg-muted rounded-lg w-full"></div>
                      <div className="h-12 bg-muted rounded-lg w-full"></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-6 mt-8 animate-fade-in-up">
                <h3 className="text-xl font-heading font-semibold flex items-center gap-2 border-b pb-2">
                  <Sparkles className="text-secondary h-5 w-5" /> Recomendações Exclusivas
                </h3>

                <div className="grid gap-4">
                  {analysis.content_suggestions?.map((suggestion: string, idx: number) => (
                    <Card key={idx} className="bg-secondary/5 border-secondary/20">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <p className="pt-1">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}

                  {(!analysis.content_suggestions || analysis.content_suggestions.length === 0) && (
                    <p className="text-muted-foreground">
                      Nenhuma recomendação específica processada pela IA ainda.
                    </p>
                  )}
                </div>

                <Card className="bg-primary text-primary-foreground mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Próximo Passo</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Utilize essas métricas reais para gerar conteúdo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      Vá para o Marketplace de IA e contrate nossos agentes de edição focados nos
                      insights acima.
                    </p>
                    <Button variant="secondary" onClick={() => navigate('/marketplace')}>
                      Acessar Marketplace
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
