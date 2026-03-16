import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, Youtube, Sparkles, Play, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import useAppStore from '@/stores/main'

export default function Index() {
  const navigate = useNavigate()
  const { login } = useAppStore()
  const [url, setUrl] = useState('')

  const handleLogin = (role: 'client' | 'admin') => {
    login(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Navbar Minimal */}
      <nav className="w-full max-w-6xl p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-primary font-heading font-bold text-xl">
          <div className="bg-secondary text-white p-1.5 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          ViralClip AI
        </div>
        <Button variant="ghost" onClick={() => handleLogin('client')}>
          Entrar
        </Button>
      </nav>

      <main className="flex-1 w-full max-w-6xl px-6 flex flex-col lg:flex-row items-center justify-center gap-12 py-12">
        {/* Hero Content */}
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
            <Button className="rounded-xl px-6" onClick={() => handleLogin('client')}>
              Auditoria Grátis
            </Button>
          </div>
        </div>

        {/* Login/Signup Modal Preview */}
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card className="border-border shadow-elevation bg-white/50 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-heading text-2xl">Acessar Plataforma</CardTitle>
              <CardDescription>Gerencie sua influência com dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Senha" type="password" />
                  </div>
                  <Button className="w-full" onClick={() => handleLogin('client')}>
                    Entrar no Workspace
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleLogin('admin')}>
                    Entrar como Admin (Demo)
                  </Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Input placeholder="Nome Completo" />
                    <Input placeholder="Email" type="email" />
                    <Input placeholder="Senha" type="password" />
                  </div>
                  <Button className="w-full" onClick={() => handleLogin('client')}>
                    Criar Conta
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Visual background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-secondary/10 blur-3xl mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl mix-blend-multiply opacity-50"></div>
      </div>
    </div>
  )
}
