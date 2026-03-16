import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, Play, Plus, TrendingUp, Sparkles, Youtube } from 'lucide-react'
import useAppStore from '@/stores/main'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScoreGauge } from '@/components/shared/ScoreGauge'

export default function Dashboard() {
  const { channels } = useAppStore()
  const navigate = useNavigate()
  const [auditUrl, setAuditUrl] = useState('')

  const handleAudit = () => {
    if (auditUrl) {
      navigate('/channels/new?url=' + encodeURIComponent(auditUrl))
    } else {
      navigate('/channels/new')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta. Aqui está o resumo do seu crescimento digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auditoria Express Flow */}
        <Card className="col-span-1 md:col-span-3 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Youtube className="h-40 w-40" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-heading font-medium flex items-center gap-2 text-foreground">
              <Youtube className="h-6 w-6 text-secondary" />
              Auditoria de Crescimento Gratuita
            </CardTitle>
            <CardDescription className="text-base">
              Nossa IA analisa os vídeos do seu canal para encontrar oportunidades virais
              escondidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 pt-4 relative z-10">
            <Input
              placeholder="Cole a URL do seu canal (YouTube, Instagram ou TikTok)..."
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              className="bg-background max-w-xl text-base h-12"
            />
            <Button size="lg" onClick={handleAudit} className="gap-2 shrink-0 h-12">
              <Sparkles className="h-4 w-4" />
              Rodar Auditoria Grátis
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Impacto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading">170K</div>
            <p className="text-primary-foreground/70 text-sm mt-1">Seguidores somados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-muted-foreground">
              <Play className="h-5 w-5 text-secondary" />
              Vídeos Gerados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading">24</div>
            <p className="text-sm text-emerald-500 font-medium mt-1">+12 esta semana</p>
          </CardContent>
        </Card>

        {/* AI Suggestion Box */}
        <Card className="border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-secondary">
              <Sparkles className="h-5 w-5" />
              Sugestão da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3">
              Seu canal "Palavra Viva" precisa de mais Retenção no início.
            </p>
            <Button size="sm" variant="secondary" className="w-full" asChild>
              <Link to="/marketplace">Contratar Serviço</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-heading font-semibold">Canais Ativos</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/channels/new">Ver todos</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full flex items-center gap-4">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="h-16 w-16 rounded-full border-2 border-muted object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{channel.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="font-normal">
                        {channel.platform}
                      </Badge>
                      <span>{channel.subscribers} subs</span>
                    </div>
                  </div>
                </div>
                <div className="w-24 shrink-0">
                  <ScoreGauge score={channel.score} />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Atualizado hoje
                </span>
                <Button size="sm" asChild>
                  <Link to={`/channels/${channel.id}/audit`}>Ver Relatório Completo</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card
            className="border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer min-h-[160px]"
            onClick={() => navigate('/channels/new')}
          >
            <Plus className="h-8 w-8 mb-2 text-muted-foreground/50" />
            <span className="font-medium">Adicionar Novo Canal</span>
          </Card>
        </div>
      </div>
    </div>
  )
}
