import { useParams, Link } from 'react-router-dom'
import { Share2, AlertTriangle, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react'
import { MOCK_CHANNELS } from '@/lib/mock-data'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ChannelAudit() {
  const { id } = useParams()
  const channel = MOCK_CHANNELS.find((c) => c.id === id) || MOCK_CHANNELS[0]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <img
            src={channel.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border-4 border-background shadow-md"
          />
          <div>
            <h1 className="text-3xl font-heading font-bold">{channel.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Badge variant="secondary">{channel.platform}</Badge>
              {channel.niche} • {channel.subscribers} inscritos
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
          <ScoreGauge score={channel.score} className="w-48" />
          <p className="mt-6 text-sm text-muted-foreground">
            Seu canal está no top <span className="font-bold text-foreground">15%</span> do seu
            nicho.
          </p>
        </Card>

        {/* Diagnostic Breakdown */}
        <div className="lg:col-span-2 grid gap-4">
          <h3 className="text-xl font-heading font-semibold mb-2">Diagnóstico da IA</h3>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-emerald-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Títulos e Thumbnails</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Excelente CTR (Click-Through Rate). Seus títulos criam boa curiosidade teológica.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-rose-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Retenção Inicial (Hooks)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Queda de 40% na audiência nos primeiros 10 segundos. Você precisa ser mais direto
                  nas introduções.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-4 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-accent mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">Volume de Shorts/Reels</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Baixa frequência. Postar cortes curtos das suas pregações pode aumentar o alcance
                  em 3x.
                </p>
              </div>
            </CardContent>
          </Card>
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
              <CardTitle className="text-lg">Pacote "Cortes Virais Bíblicos"</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Resolve o problema de Volume de Shorts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-6">
                A IA Editar vai pegar seu último vídeo de 40 min e gerar 5 shorts com legendas
                dinâmicas.
              </p>
              <Button variant="secondary" className="w-full gap-2" asChild>
                <Link to="/marketplace">
                  Contratar Serviço <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
