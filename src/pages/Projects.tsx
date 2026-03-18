import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileVideo, LayoutList, Clock, CheckCircle2, Loader2, VideoIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/main'

export default function Projects() {
  const { user } = useAppStore()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, channels(channel_name)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setProjects(data)
      setLoading(false)
    }

    fetchProjects()

    const sub = supabase
      .channel('projects-update')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        fetchProjects,
      )
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return (
          <Badge variant="default" className="uppercase text-[10px] tracking-wider">
            Concluído
          </Badge>
        )
      case 'received':
        return (
          <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
            Recebido
          </Badge>
        )
      case 'pending':
      case 'in_progress':
      default:
        return (
          <Badge
            variant="secondary"
            className="uppercase text-[10px] tracking-wider bg-accent/20 text-accent"
          >
            Processando
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Projetos Ativos</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o trabalho dos seus agentes de IA.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="py-12 flex flex-col items-center justify-center text-center bg-muted/50 border-dashed">
            <VideoIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mt-1 mb-6">
              Você ainda não enviou nenhum vídeo para processamento.
            </p>
            <Button asChild>
              <Link to="/dashboard">Ir para Auditoria de Canal</Link>
            </Button>
          </Card>
        ) : (
          projects.map((project, index) => {
            const isDone = project.status === 'completed' || project.status === 'delivered'
            const progress = isDone ? 100 : project.status === 'received' ? 10 : 50

            return (
              <Card
                key={project.id}
                className="animate-slide-up hover:border-secondary/50 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileVideo className="h-6 w-6" />
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{project.service_name}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <LayoutList className="h-4 w-4" /> Canal:{' '}
                      {project.channels?.channel_name || 'Desconhecido'}
                    </p>

                    {!isDone && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso da IA</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-auto flex flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <Button variant={isDone ? 'default' : 'outline'} size="sm" asChild>
                      <Link to={`/projects/${project.id}`}>
                        {isDone ? 'Ver Resultado' : 'Acompanhar'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
