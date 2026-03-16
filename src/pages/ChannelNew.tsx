import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type AuditInsert = Database['public']['Tables']['audits']['Insert'] & { type: string }

export default function ChannelNew() {
  const { user, isAuthLoading } = useAppStore()
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [platform, setPlatform] = useState('youtube')
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('devocional')
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: 'Acesso Restrito',
        description: 'Faça login para continuar.',
        variant: 'destructive',
      })
      navigate('/')
    }
  }, [user, isAuthLoading, navigate, toast])

  const handleNext = () => {
    if (step < 2) {
      if (!name || !url) {
        return toast({
          title: 'Atenção',
          description: 'Preencha todos os campos.',
          variant: 'destructive',
        })
      }
      setStep(step + 1)
    } else {
      submitChannel()
    }
  }

  const submitChannel = async () => {
    if (!user) return
    setIsProcessing(true)

    try {
      const { data: channel, error: cErr } = await supabase
        .from('channels')
        .insert({
          user_id: user.id,
          platform,
          channel_name: name,
          channel_link: url,
          niche,
          status: 'active',
        })
        .select()
        .single()

      if (cErr) throw cErr

      const auditData: AuditInsert = {
        user_id: user.id,
        channel_id: channel.id,
        status: 'pending',
        type: 'free_audit',
      }
      const { error: aErr } = await supabase.from('audits').insert(auditData as any)

      if (aErr) throw aErr

      toast({
        title: 'Sucesso!',
        description: 'Seu canal foi registrado e a auditoria está na fila.',
      })
      navigate('/dashboard')
    } catch (error: any) {
      setIsProcessing(false)
      toast({
        title: 'Erro ao cadastrar',
        description: error.message || 'Ocorreu um erro.',
        variant: 'destructive',
      })
    }
  }

  if (isProcessing)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <Bot className="h-12 w-12 text-secondary animate-pulse" />
        <h2 className="text-2xl font-bold">Auditando Canal...</h2>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          O Agente Estrategista está avaliando seu conteúdo.
        </p>
      </div>
    )

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Auditoria de Crescimento</h1>
        <p className="text-muted-foreground mt-2">
          Nossa IA fará uma auditoria gratuita do seu canal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? 'Qual é o seu canal?' : 'Detalhes adicionais'}</CardTitle>
          <CardDescription>
            {step === 1
              ? 'Identifique sua plataforma e URL.'
              : 'Isso ajuda a IA a calibrar a estratégia.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Canal</Label>
                <Input
                  placeholder="Ex: Palavra Viva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL do Canal</Label>
                <Input
                  placeholder="https://youtube.com/@seucanal"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nicho Principal</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devocional">Devocional Diário</SelectItem>
                    <SelectItem value="pregacao">Pregações / Sermões</SelectItem>
                    <SelectItem value="louvor">Louvor e Adoração</SelectItem>
                    <SelectItem value="podcast">Podcast Cristão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button onClick={handleNext}>{step === 1 ? 'Avançar' : 'Iniciar Auditoria'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
