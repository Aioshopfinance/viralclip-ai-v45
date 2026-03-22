import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Video, Eye, Calendar, Heart, Activity } from 'lucide-react'

export function AuditMetrics({
  metrics,
  breakdown,
  platform = 'youtube',
}: {
  metrics: any
  breakdown: any
  platform?: string
}) {
  const isTikTok = platform.toLowerCase() === 'tiktok'

  const countLabel = isTikTok ? 'Seguidores' : 'Inscritos'
  const countValue = metrics?.follower_count ?? metrics?.subscriber_count

  const engLabel = isTikTok ? 'Curtidas' : 'Views'
  const engValue = isTikTok
    ? (metrics?.likes_count ?? metrics?.average_views)
    : metrics?.average_views

  const freqLabel = 'Frequência'
  const freqValue = metrics?.last_upload_date
    ? new Date(metrics.last_upload_date).toLocaleDateString('pt-BR')
    : '-'

  const vidLabel = isTikTok ? 'Engajamento' : 'Vídeos recentes'
  const vidValue = metrics?.video_count

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50 hover:bg-card transition-colors">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {countLabel}
          </p>
          <p className="font-bold text-lg">
            {countValue != null ? countValue.toLocaleString('pt-BR') : '-'}
          </p>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50 hover:bg-card transition-colors">
          {isTikTok ? (
            <Heart className="h-5 w-5 text-primary" />
          ) : (
            <Eye className="h-5 w-5 text-primary" />
          )}
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {engLabel}
          </p>
          <p className="font-bold text-lg">
            {engValue != null ? engValue.toLocaleString('pt-BR') : '-'}
          </p>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50 hover:bg-card transition-colors">
          {isTikTok ? (
            <Activity className="h-5 w-5 text-primary" />
          ) : (
            <Video className="h-5 w-5 text-primary" />
          )}
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {vidLabel}
          </p>
          <p className="font-bold text-lg">
            {vidValue != null ? vidValue.toLocaleString('pt-BR') : '-'}
          </p>
        </Card>

        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50 hover:bg-card transition-colors">
          <Calendar className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {freqLabel}
          </p>
          <p className="font-bold text-sm">{freqValue}</p>
        </Card>
      </div>

      {breakdown && breakdown.frequency && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 font-heading">Composição do Score</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frequência (30%)</span>
                <span className="font-bold">{breakdown.frequency?.score} / 30</span>
              </div>
              <Progress value={(breakdown.frequency?.score / 30) * 100} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Engajamento (40%)</span>
                <span className="font-bold">{breakdown.engagement?.score} / 40</span>
              </div>
              <Progress value={(breakdown.engagement?.score / 40) * 100} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Atividade (30%)</span>
                <span className="font-bold">{breakdown.activity?.score} / 30</span>
              </div>
              <Progress value={(breakdown.activity?.score / 30) * 100} className="h-2" />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
