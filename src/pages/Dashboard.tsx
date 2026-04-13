import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Sparkles, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { ChannelCard, type ChannelWithAudits } from '@/components/dashboard/ChannelCard'
import { normalizeUrl } from '@/lib/utils'
import { triggerAuditProcessing } from '@/lib/audit-service'

type SupportedPlatform = 'youtube' | 'tiktok' | 'instagram'

function detectPlatform(url: string): SupportedPlatform | null {
  const lower = url.toLowerCase()

  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube'
  }

  if (lower.includes('tiktok.com')) {
    return 'tiktok'
  }

  if (lower.includes('instagram.com')) {
    return 'instagram'
  }

  return null
}

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

      if (data) {
        setChannels(data as ChannelWithAudits[])
      }
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
        .channel(`dashboard-updates-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'audits',
            filter: `user_id=eq.${userId}`,
          },
          () => fetchChannels(userId),
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'channels',
            filter: `user_id=eq.${userId}`,
          },
          () => fetchChannels(userId),
        )
        .subscribe()
    }

    initDashboard()

    const timeoutInterval = setInterval(async () => {
      const pendingAudits = channels.flatMap((channel) =>
        (channel.audits || []).filter(
          (audit) => audit.status === 'pending' || audit.status === 'processing',
        ),
      )

      for (const audit of pendingAudits) {
        const age = Date.now() - new Date(audit.created_at).getTime()

        if (age > 45000) {
          await supabase
            .from('audits')
            .update({
              status: 'failed',
              error_message: 'Tempo limite excedido na análise da IA.',
            })
            .eq('id', audit.id)
        }
      }
    }, 15000)

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
      clearInterval(timeoutInterval)
    }
  }, [toast, channels])

  const handleCreateAudit = async () => {
    const trimmedUrl = auditUrl.trim()

    if (!trimmedUrl) {
      toast({
        title: 'Aviso',
        description: 'Insira a URL do canal/perfil para auditoria.',
      })
      return
    }

    const platform = detectPlatform(trimmedUrl)

    if (!platform) {
      toast({
        title: 'URL inválida',
        description: 'No momento, suportamos URLs de YouTube, TikTok e Instagram.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Autenticação necessária')
      }

      const normalizedLink = normalizeUrl(trimmedUrl)

      let channelId = ''

      const { data: existingChannel, error: existingChannelError } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', user.id)
        .eq('normalized_link', normalizedLink)
        .maybeSingle()

      if (existingChannelError) {
        throw existingChannelError
      }

      if (existingChannel) {
        channelId = existingChannel.id
      } else {
        const { data: newChannel, error: chErr } = await supabase
          .from('channels')
          .insert({
            user_id: user.id,
            channel_link: trimmedUrl,
            normalized_link: normalizedLink,
            platform,
            channel_name: 'Novo Canal Detectado',
          } as any)
          .select()
          .single()

        if (chErr) throw chErr
        channelId = newChannel.id
      }

      const { data: insertedAudit, error: auditErr } = await supabase
        .from('audits')
        .insert({
          user_id: user.id,
          channel_id: channelId,
          status: 'pending',
          type: 'free_audit',
        })
        .select()
        .single()

      if (auditErr) throw auditErr
      if (!insertedAudit?.id) {
        throw new Error('Não foi possível obter o ID da auditoria criada.')
      }

      await triggerAuditProcessing(insertedAudit.id)

      setAuditUrl('')

      toast({
        title: 'Auditoria iniciada',
        description: 'Nossa IA está analisando seu perfil em tempo real.',
      })

      navigate(`/audit/processing/${insertedAudit.id}`)
    } catch (err: any) {
      console.error('Error creating audit:', err)
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao iniciar a auditoria.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRetryAudit = async (auditId: string) => {
    try {
      toast({
        title: 'Retentando auditoria...',
        description: 'Aguarde o processamento.',
      })

      const { error } = await supabase
        .from('audits')
        .update({
          status: 'pending',
          error_message: null,
        })
        .eq('id', auditId)

      if (error) throw error

      await triggerAuditProcessing(auditId)
      navigate(`/audit/processing/${auditId}`)
    } catch (err: any) {
      console.error('Error retrying audit:', err)
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao reprocessar a auditoria.',
        variant: 'destructive',
      })
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
              <Video className="h-6 w-6 text-secondary" />
              Nova Auditoria IA
            </CardTitle>
            <CardDescription>
              Cole a URL do seu YouTube, TikTok ou Instagram para analisar métricas e descobrir
              oportunidades de crescimento.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col sm:flex-row gap-3 pt-4">
            <Input
              placeholder="Ex: https://youtube.com/@canal, https://tiktok.com/@perfil ou instagram.com/..."
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
              <TrendingUp className="h-5 w-5 text-accent" />
              Canais Monitorados
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
