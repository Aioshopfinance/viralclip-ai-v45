import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Instagram,
  Video,
  Youtube,
  RefreshCw,
  Loader2,
  Clock,
} from 'lucide-react'
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
  'Resolving channel pipeline...',
  'Fetching verified data...',
  'Calculating honest metrics...',
]

export function ChannelCard({ channel, onRetry }: ChannelCardProps) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  // Sort audits to get the most recent one reliably
  const latestAudit = [...(channel.audits || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]

  const rawStatus = latestAudit?.status || 'pending'
  const status = rawStatus === 'error' ? 'failed' : rawStatus

  const analysisData = latestAudit?.analysis_data as any
  const integrationStatus = analysisData?.integrationStatus || 'real'
  const isPendingIntegration = integrationStatus === 'pending'

  const score = isPendingIntegration ? 0 : latestAudit?.growth_score || 0

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (status === 'pending' || status === 'processing') {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMsgs.length)
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [status])

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
                      : status === 'failed' || integrationStatus === 'error'
                        ? 'destructive'
                        : isPendingIntegration
                          ? 'outline'
                          : 'default'
                  }
                  className="text-xs"
                >
                  {status === 'pending' || status === 'processing'
                    ? 'Auditando...'
                    : isPendingIntegration
                      ? 'Pendente API'
                      : status === 'failed' || integrationStatus === 'error'
                        ? 'Falhou'
                        : 'Concluído'}
                </Badge>
              </div>
            </div>
          </div>
          {status === 'failed' && (
            <div className="text-xs text-destructive flex items-start gap-1 mt-4 bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{analysisData?.message || 'Falha ao recuperar dados da API real.'}</span>
            </div>
          )}
          {isPendingIntegration && status === 'completed' && (
            <div className="text-xs text-muted-foreground flex items-start gap-1 mt-4 bg-muted/50 p-2 rounded-md border border-muted">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Integração em desenvolvimento. Dados em breve.</span>
            </div>
          )}
        </div>
        <div
          className={`w-24 shrink-0 ${isPendingIntegration || status !== 'completed' ? 'opacity-20 filter grayscale' : ''}`}
        >
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
          <Button size="sm" asChild disabled={status === 'pending' || status === 'processing'}>
            <Link to={status === 'completed' ? `/audits/${latestAudit?.id}` : '#'}>
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
        </div>
      )}
    </Card>
  )
}
