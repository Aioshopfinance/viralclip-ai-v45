import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertCircle, Instagram, Video, Youtube, RefreshCw } from 'lucide-react'
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

export function ChannelCard({ channel, onRetry }: ChannelCardProps) {
  // Sort audits to get the most recent one reliably
  const latestAudit = [...(channel.audits || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]

  useEffect(() => {
    console.log(
      `[Audit Lifecycle] Render - channel_id: ${channel.id} | audit_id: ${latestAudit?.id || 'none'} | status: ${latestAudit?.status || 'none'} | normalized_url: ${(channel as any).normalized_link || 'none'}`,
    )
  }, [channel.id, latestAudit?.id, latestAudit?.status, (channel as any).normalized_link])

  const score = latestAudit?.growth_score || 0
  const rawStatus = latestAudit?.status || 'pending'
  const status = rawStatus === 'error' ? 'failed' : rawStatus
  const errorMessage = latestAudit?.error_message || 'Falha no processamento.'

  const PlatformIcon =
    channel.platform.toLowerCase() === 'instagram'
      ? Instagram
      : channel.platform.toLowerCase() === 'tiktok'
        ? Video
        : Youtube

  return (
    <Card className="hover:shadow-md transition-shadow relative">
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
                    status === 'pending'
                      ? 'secondary'
                      : status === 'failed'
                        ? 'destructive'
                        : 'default'
                  }
                  className="text-xs"
                >
                  {status === 'pending'
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
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
        <div className="w-24 shrink-0">
          <ScoreGauge score={score} />
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
          <Button size="sm" asChild disabled={status === 'pending'}>
            <Link to={status === 'completed' ? `/channels/${channel.id}/audit` : '#'}>
              {status === 'pending' ? 'Aguarde...' : 'Ver Relatório'}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
