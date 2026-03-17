import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, Youtube, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'

export default function Index() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login, signup, isAuthLoading, startAnonymousSession, user } = useAppStore()

  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      toast({ title: 'Aviso', description: 'Preencha email e senha.', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    const { error } = await login(email, password)
    setIsLoading(false)
    if (error) {
      toast({ title: 'Erro de Autenticação', description: error.message, variant: 'destructive' })
    } else {
      navigate('/dashboard')
    }
  }

  const handleRegisterSubmit = async () => {
    if (!email || !password || !fullName) {
      toast({ title: 'Aviso', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    const { error } = await signup(email, password, fullName)
    setIsLoading(false)
    if (error) {
      toast({ title: 'Erro de Cadastro', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title: 'Conta criada!',
        description: 'Você agora pode fazer o login na plataforma.',
      })
      setActiveTab('login')
    }
  }

  const handleFreeAudit = async () => {
    if (!url) {
      toast({
        title: 'Aviso',
        description: 'Cole a URL do seu canal primeiro.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    let currentUser = user

    try {
      if (!currentUser) {
        const { data, error } = await startAnonymousSession()
        if (error || !data?.user) throw error || new Error('Falha ao iniciar sessão anônima')
        currentUser = { id: data.user.id } as any
      }

      const { data: channel, error: cErr } = await supabase
        .from('channels')
        .insert({
          user_id: currentUser!.id,
          platform: url.includes('instagram')
            ? 'instagram'
            : url.includes('tiktok')
              ? 'tiktok'
              : 'youtube',
          channel_link: url,
          channel_name: 'Analisando Canal...',
          status: 'active',
        })
        .select()
        .single()

      if (cErr) throw cErr

      const { data: audit, error: aErr } = await supabase
        .from('audits')
        .insert({
          user_id: currentUser!.id,
          channel_id: channel.id,
          status: 'pending',
          type: 'free_audit',
        })
        .select()
        .single()

      if (aErr) throw aErr

      navigate(`/audits/${audit.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro na Auditoria',
        description: err.message || 'Ocorreu um erro.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (isAuthLoading) return null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <nav className="w-full max-w-6xl p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xl">
          <div className="bg-secondary text-white p-1.5 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          ViralClip AI
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl px-6 flex flex-col lg:flex-row items-center justify-center gap-12 py-12">
        <div className="flex-1 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm">
            <Wand2 className="h-4 w-4" />
            IA Especializada para Cristãos
          </div>
          <h1 className="text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight text-balance">
            Sua Agência de Crescimento Cristão Automatizada.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Multiplique seu alcance. Nossa IA analisa, roteiriza e edita seus vídeos longos em
            múltiplos formatos virais para redes sociais.
          </p>

          <div className="bg-card p-2 rounded-2xl border border-border shadow-elevation flex items-center max-w-md">
            <Youtube className="text-muted-foreground ml-3 h-6 w-6 shrink-0" />
            <Input
              placeholder="Cole a URL do seu canal..."
              className="border-0 focus-visible:ring-0 shadow-none text-base"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button className="rounded-xl px-6" onClick={handleFreeAudit} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Auditoria Grátis
            </Button>
          </div>
        </div>

        <div
          className="w-full max-w-md animate-slide-up"
          style={{ animationDelay: '0.2s' }}
          id="auth-card"
        >
          <Card className="border-border shadow-elevation bg-white/50 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-heading text-2xl">Acessar Plataforma</CardTitle>
              <CardDescription>Gerencie sua influência com dados seguros.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
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
                  </div>
                  <Button className="w-full" onClick={handleLoginSubmit} disabled={isLoading}>
                    {isLoading && activeTab === 'login' ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      'Entrar no Workspace'
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome Completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                  </div>
                  <Button className="w-full" onClick={handleRegisterSubmit} disabled={isLoading}>
                    {isLoading && activeTab === 'register' ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      'Criar Conta Segura'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-3xl mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl mix-blend-multiply opacity-50"></div>
      </div>
    </div>
  )
}
