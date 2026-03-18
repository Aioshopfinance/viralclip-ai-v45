import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Sparkles, Youtube, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { ChannelCard, type ChannelWithAudits } from '@/components/dashboard/ChannelCard'
import { normalizeUrl } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [auditUrl, setAuditUrl] = useState('')
  const [channels, setChannels] = useState<ChannelWithAudits[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const fetchChannels = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`*, audits(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setChannels(data as ChannelWithAudits[])
    } catch (error: any) {
      console.error('Error fetching channels:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao buscar os dados do painel.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    let subscription: any
    let userId = ''

    const initDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      userId = user.id
      await fetchChannels(userId)
      setIsLoading(false)

      subscription = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'audits', filter: `user_id=eq.${userId}` },
          () => fetchChannels(userId),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'channels', filter: `user_id=eq.${userId}` },
          () => fetchChannels(userId),
        )
        .subscribe()
    }

    initDashboard()

    const timeoutInterval = setInterval(() => {
      setChannels((prev) => {
        prev.forEach((ch) => {
          const latest = [...(ch.audits || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0]
          if (latest?.status === 'pending') {
            const age = Date.now() - new Date(latest.created_at).getTime()
            if (age > 45000) {
              supabase
                .from('audits')
                .update({
                  status: 'failed',
                  error_message: 'Tempo limite excedido na análise da IA.',
                })
                .eq('id', latest.id)
                .then()
            }
          }
        })
        return prev
      })
    }, 10000)

    return () => {
      if (subscription) supabase.removeChannel(subscription)
      clearInterval(timeoutInterval)
    }
  }, [toast])

  const handleCreateAudit = async () => {
    if (!auditUrl) {
      toast({
        title: 'Aviso',
        description: 'Insira a URL do canal do YouTube ou TikTok.',
      })
      return
    }

    const isTikTok = auditUrl.toLowerCase().includes('tiktok.com')
    const isYoutube =
      auditUrl.toLowerCase().includes('youtube.com') || auditUrl.toLowerCase().includes('youtu.be')

    if (!isTikTok && !isYoutube) {
      toast({
        title: 'Plataforma em Construção',
        description:
          'No momento, suportamos apenas YouTube e TikTok. Instagram e Twitch chegarão em breve!',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Autenticação necessária')

      const platform = isTikTok ? 'tiktok' : 'youtube'
      const normalizedLink = normalizeUrl(auditUrl)

      let channelId = ''
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user.id)
        .eq('normalized_link', normalizedLink)
        .maybeSingle()

      if (existingChannel) {
        channelId = existingChannel.id
      } else {
        const { data: newChannel, error: chErr } = await supabase
          .from('channels')
          .insert({
            user_id: user.id,
            channel_link: auditUrl,
            normalized_link: normalizedLink,
            platform,
            channel_name: 'Novo Canal Detectado',
          } as any)
          .select()
          .single()
        if (chErr) throw chErr
        channelId = newChannel.id
      }

      const { error: auditErr } = await supabase
        .from('audits')
        .insert({ user_id: user.id, channel_id: channelId, status: 'pending', type: 'free_audit' })

      if (auditErr) throw auditErr

      setAuditUrl('')
      toast({
        title: 'Auditoria Iniciada',
        description: 'Nossa IA está analisando seu perfil em tempo real.',
      })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRetryAudit = async (auditId: string) => {
    try {
      toast({ title: 'Retentando auditoria...', description: 'Aguarde o processamento.' })
      const { error } = await supabase
        .from('audits')
        .update({ status: 'pending', error_message: null })
        .eq('id', auditId)

      if (error) throw error
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o progresso das suas auditorias por canal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3 border-secondary/30 bg-secondary/5 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Video className="h-6 w-6 text-secondary" /> Nova Auditoria IA
            </CardTitle>
            <CardDescription>
              Cole a URL do seu YouTube ou TikTok para analisar as métricas e descobrir
              oportunidades virais.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 pt-4">
            <Input
              placeholder="Ex: https://tiktok.com/@meuperfil ou youtube.com/@canal"
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              className="bg-background max-w-xl"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAudit()}
            />
            <Button
              size="lg"
              onClick={handleCreateAudit}
              disabled={isCreating}
              className="gap-2 shrink-0"
            >
              {isCreating ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-b-transparent rounded-full" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Rodar Auditoria
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
            <p className="text-primary-foreground/70 text-sm mt-1">Unidades exclusivas</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-heading font-semibold">Canais Ativos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 py-10 flex justify-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
            </div>
          ) : (
            channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onRetry={handleRetryAudit} />
            ))
          )}

          <Card
            className="border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer min-h-[160px]"
            onClick={() => document.querySelector('input')?.focus()}
          >
            <Plus className="h-8 w-8 mb-2 opacity-50" />
            <span className="font-medium">Adicionar Novo Canal</span>
          </Card>
        </div>
      </div>
    </div>
  )
}
