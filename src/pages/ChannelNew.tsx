import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, CheckCircle2, ChevronRight, Loader2, Youtube } from 'lucide-react'
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

export default function ChannelNew() {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
    else {
      setIsProcessing(true)
      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false)
        toast({
          title: 'Auditoria Concluída',
          description: 'Os Agentes de IA finalizaram a análise do seu canal.',
        })
        navigate('/channels/ch_1/audit')
      }, 4000)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse-glow"></div>
          <div className="relative bg-secondary text-white p-6 rounded-full shadow-lg">
            <Bot className="h-12 w-12" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-foreground">Auditando Canal...</h2>
          <p className="text-muted-foreground">
            O Agente Estrategista está avaliando métricas e conteúdo.
          </p>
        </div>
        <div className="w-64 space-y-2">
          <div className="flex items-center text-sm gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Lendo metadados
          </div>
          <div className="flex items-center text-sm gap-2 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Processando thumbnails
          </div>
          <div className="flex items-center text-sm gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" /> Calculando Growth Score
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Conectar Canal</h1>
        <p className="text-muted-foreground mt-2">Nossa IA fará uma auditoria completa gratuita.</p>
      </div>

      <div className="flex items-center gap-2 mb-8 text-sm font-medium">
        <span className={step >= 1 ? 'text-primary' : 'text-muted-foreground'}>
          1. Identificação
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className={step >= 2 ? 'text-primary' : 'text-muted-foreground'}>2. Detalhes</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? 'Qual é o seu canal?' : 'Fale mais sobre seu objetivo'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Cole o link do YouTube, Instagram ou TikTok.'
              : 'Isso ajuda a IA a calibrar a estratégia.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL do Canal</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://youtube.com/@seucanal"
                    className="pl-9"
                    defaultValue="https://youtube.com/@palavraviva"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nicho Principal</Label>
                <Select defaultValue="devocional">
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
              <div className="space-y-2">
                <Label>Maior Desafio Atual</Label>
                <Select defaultValue="retencao">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retencao">Baixa Retenção nos vídeos</SelectItem>
                    <SelectItem value="frequencia">Falta de tempo para postar</SelectItem>
                    <SelectItem value="ideias">Falta de ideias virais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            <Button onClick={handleNext}>
              {step === 1 ? 'Avançar' : 'Iniciar Auditoria com IA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
