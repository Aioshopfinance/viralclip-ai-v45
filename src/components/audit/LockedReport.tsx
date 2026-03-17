import { useState } from 'react'
import { Lock, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LockedReportProps {
  handleUnlock: (e: React.FormEvent, email: string, pass: string, name: string) => Promise<void>
  formLoading: boolean
}

export function LockedReport({ handleUnlock, formLoading }: LockedReportProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="relative mt-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 rounded-xl border border-border">
        <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="font-heading font-bold text-xl">Desbloqueie o Relatório Completo</h3>
          <p className="text-sm text-muted-foreground">
            Crie sua conta gratuitamente para ver todas as recomendações da IA.
          </p>

          <form
            onSubmit={(e) => handleUnlock(e, email, password, name)}
            className="space-y-3 text-left mt-4"
          >
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

      <div className="opacity-40 pointer-events-none select-none space-y-4 filter blur-[3px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Recomendações Otimizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-12 bg-muted rounded-lg w-full" />
            <div className="h-12 bg-muted rounded-lg w-full" />
            <div className="h-12 bg-muted rounded-lg w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
