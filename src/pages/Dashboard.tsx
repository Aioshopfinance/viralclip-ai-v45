import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Plus,
  TrendingUp,
  Sparkles,
  Youtube,
  Instagram,
  Video,
  AlertCircle,
} from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type BaseChannel = Database['public']['Tables']['channels']['Row']
type BaseAudit = Database['public']['Tables']['audits']['Row']
type ChannelWithAudits = BaseChannel & { audits: (BaseAudit & { type?: string })[] }

export default function Dashboard() {
  const { user } = useAppStore()
  const navigate = useNavigate()
  const [auditUrl, setAuditUrl] = useState('')
  const [channels, setChannels] = useState<ChannelWithAudits[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchChannels = async () => {
      const { data } = await supabase
        .from('channels')
        .select(`*, audits(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setChannels(data as ChannelWithAudits[])
      setIsLoading(false)
    }
    fetchChannels()

    const subscription = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audits', filter: `user_id=eq.${user.id}` },
        fetchChannels,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channels', filter: `user_id=eq.${user.id}` },
        fetchChannels,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  const handleAudit = () =>
    navigate(auditUrl ? '/channels/new?url=' + encodeURIComponent(auditUrl) : '/channels/new')
  const totalAudits = channels.reduce((sum, channel) => sum + (channel.audits?.length || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta. Acompanhe o progresso das suas auditorias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Youtube className="h-6 w-6 text-secondary" /> Auditoria Gratuita com IA
            </CardTitle>
            <CardDescription>
              Nossa IA analisa seu canal para encontrar oportunidades virais.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 pt-4">
            <Input
              placeholder="Cole a URL do seu canal..."
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              className="bg-background max-w-xl"
            />
            <Button size="lg" onClick={handleAudit} className="gap-2 shrink-0">
              <Sparkles className="h-4 w-4" /> Rodar Auditoria
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Canais Monitorados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading">{channels.length}</div>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {totalAudits} auditorias realizadas
            </p>
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
          {isLoading ? (
            <div className="col-span-2 py-10 flex justify-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
            </div>
          ) : (
            channels.map((channel) => {
              const audit = channel.audits?.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              )[0]
              const score = audit?.growth_score || 0
              const status = audit?.status || 'pending'
              const PlatformIcon =
                channel.platform === 'instagram'
                  ? Instagram
                  : channel.platform === 'tiktok'
                    ? Video
                    : Youtube

              return (
                <Card key={channel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full border-2 border-muted bg-secondary/10 flex items-center justify-center shrink-0">
                        <PlatformIcon className="h-8 w-8 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg line-clamp-1">
                          {channel.channel_name || 'Novo Canal'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Badge variant="outline" className="capitalize">
                            {channel.platform}
                          </Badge>
                          <Badge
                            variant={
                              status === 'pending'
                                ? 'secondary'
                                : status === 'error'
                                  ? 'destructive'
                                  : 'default'
                            }
                            className="text-xs"
                          >
                            {status === 'pending'
                              ? 'Auditando...'
                              : status === 'error'
                                ? 'Falhou'
                                : 'Concluído'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <ScoreGauge score={score} />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {status === 'error' ? (
                        <>
                          <AlertCircle className="h-3 w-3 text-destructive" /> Erro na análise
                        </>
                      ) : (
                        <>
                          <Activity className="h-3 w-3" /> Audit: {status}
                        </>
                      )}
                    </span>
                    <Button size="sm" asChild disabled={status === 'pending' || status === 'error'}>
                      <Link to={status === 'completed' ? `/channels/${channel.id}/audit` : '#'}>
                        {status === 'pending'
                          ? 'Aguarde...'
                          : status === 'error'
                            ? 'Falhou'
                            : 'Ver Relatório'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          )}
          <Card
            className="border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer min-h-[160px]"
            onClick={() => navigate('/channels/new')}
          >
            <Plus className="h-8 w-8 mb-2 opacity-50" />
            <span className="font-medium">Adicionar Novo Canal</span>
          </Card>
        </div>
      </div>
    </div>
  )
}
