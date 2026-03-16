import { Link } from 'react-router-dom'
import { Activity, Play, Plus, TrendingUp, Sparkles, Youtube } from 'lucide-react'
import useAppStore from '@/stores/main'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/shared/ScoreGauge'

export default function Dashboard() {
  const { channels } = useAppStore()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta. Aqui está o resumo do seu crescimento digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="absolute top-0 right-0 p-4 opacity-10">
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
              <Link to="/marketplace">Contratar Cortes Virais</Link>
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
            onClick={() => (window.location.href = '/channels/new')}
          >
            <Plus className="h-8 w-8 mb-2 text-muted-foreground/50" />
            <span className="font-medium">Adicionar Novo Canal</span>
          </Card>
        </div>
      </div>
    </div>
  )
}
