import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Video, Eye, Calendar } from 'lucide-react'

export function AuditMetrics({
  metrics,
  breakdown,
  platform = 'youtube',
}: {
  metrics: any
  breakdown: any
  platform?: string
}) {
  const countLabel = platform.toLowerCase() === 'tiktok' ? 'Seguidores' : 'Inscritos'
  const countValue = metrics?.follower_count ?? metrics?.subscriber_count ?? 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            {countLabel}
          </p>
          <p className="font-bold text-lg">{countValue.toLocaleString('pt-BR') || '-'}</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50">
          <Video className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Vídeos
          </p>
          <p className="font-bold text-lg">
            {metrics?.video_count?.toLocaleString('pt-BR') || '-'}
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50">
          <Eye className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Média Views
          </p>
          <p className="font-bold text-lg">
            {metrics?.average_views?.toLocaleString('pt-BR') || '-'}
          </p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center space-y-2 border-none shadow bg-card/50">
          <Calendar className="h-5 w-5 text-primary" />
          <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Último Upload
          </p>
          <p className="font-bold text-sm">
            {metrics?.last_upload_date
              ? new Date(metrics.last_upload_date).toLocaleDateString('pt-BR')
              : '-'}
          </p>
        </Card>
      </div>

      {breakdown && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Composição do Score</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Frequência (30%)</span>
                <span className="font-bold">{breakdown.frequency?.score} / 30</span>
              </div>
              <Progress value={(breakdown.frequency?.score / 30) * 100} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Engajamento (40%)</span>
                <span className="font-bold">{breakdown.engagement?.score} / 40</span>
              </div>
              <Progress value={(breakdown.engagement?.score / 40) * 100} className="h-2" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Atividade (30%)</span>
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
