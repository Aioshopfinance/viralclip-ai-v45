import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertCircle, Instagram, Video, Youtube, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import type { Database } from '@/lib/supabase/types'

type BaseChannel = Database['public']['Tables']['channels']['Row']
type BaseAudit = Database['public']['Tables']['audits']['Row']
export type ChannelWithAudits = BaseChannel & { audits: BaseAudit[] }

interface ChannelCardProps {
  channel: ChannelWithAudits
  onRetry: (auditId: string) => void
}

const loadingMsgs = [
  'Resolving channel...',
  'Fetching YouTube data...',
  'Calculating growth score...',
]

export function ChannelCard({ channel, onRetry }: ChannelCardProps) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  // Sort audits to get the most recent one reliably
  const latestAudit = [...(channel.audits || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]

  const score = latestAudit?.growth_score || 0
  const rawStatus = latestAudit?.status || 'pending'
  const status = rawStatus === 'error' ? 'failed' : rawStatus

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'pending' || status === 'processing') {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMsgs.length)
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [status])

  useEffect(() => {
    console.log(
      `[Audit Lifecycle] Render - channel_id: ${channel.id} | audit_id: ${latestAudit?.id || 'none'} | status: ${status || 'none'} | normalized_url: ${(channel as any).normalized_link || 'none'}`,
    )
  }, [channel.id, latestAudit?.id, status, (channel as any).normalized_link])

  const PlatformIcon =
    channel.platform.toLowerCase() === 'instagram'
      ? Instagram
      : channel.platform.toLowerCase() === 'tiktok'
        ? Video
        : Youtube

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex items-center gap-4">
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
                    status === 'pending' || status === 'processing'
                      ? 'secondary'
                      : status === 'failed'
                        ? 'destructive'
                        : 'default'
                  }
                  className="text-xs"
                >
                  {status === 'pending' || status === 'processing'
                    ? 'Auditando...'
                    : status === 'failed'
                      ? 'Falhou'
                      : 'Concluído'}
                </Badge>
              </div>
            </div>
          </div>
          {status === 'failed' && (
            <div className="text-xs text-destructive flex items-start gap-1 mt-4 bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Real YouTube data currently unavailable</span>
            </div>
          )}
        </div>
        <div className="w-24 shrink-0 opacity-20 filter grayscale">
          <ScoreGauge score={status === 'completed' ? score : 0} />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 border-t p-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {status === 'failed' ? (
            <span className="text-destructive font-medium">Requer atenção</span>
          ) : (
            <>
              <Activity className="h-3 w-3" /> Status: {status}
            </>
          )}
        </span>

        {status === 'failed' && latestAudit ? (
          <Button size="sm" variant="outline" onClick={() => onRetry(latestAudit.id)}>
            <RefreshCw className="h-3 w-3 mr-2" /> Tentar Novamente
          </Button>
        ) : (
          <Button size="sm" asChild disabled={status === 'pending' || status === 'processing'}>
            <Link to={status === 'completed' ? `/channels/${channel.id}/audit` : '#'}>
              {status === 'pending' || status === 'processing' ? 'Aguarde...' : 'Ver Relatório'}
            </Link>
          </Button>
        )}
      </CardFooter>

      {(status === 'pending' || status === 'processing') && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
          <span className="font-semibold text-sm animate-pulse tracking-wide">
            {loadingMsgs[loadingMsgIdx]}
          </span>
          <span className="text-xs text-muted-foreground mt-2 font-medium bg-muted px-2 py-1 rounded-full">
            Estimate: 20-40 seconds
          </span>
        </div>
      )}
    </Card>
  )
}
