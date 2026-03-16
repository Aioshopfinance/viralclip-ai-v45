import { Link } from 'react-router-dom'
import { FileVideo, LayoutList, Clock, CheckCircle2 } from 'lucide-react'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function Projects() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Projetos Ativos</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o trabalho dos seus agentes de IA.</p>
      </div>

      <div className="space-y-4">
        {MOCK_PROJECTS.map((project, index) => (
          <Card
            key={project.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileVideo className="h-6 w-6" />
              </div>

              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{project.service}</h3>
                  <Badge
                    variant={project.status === 'Completed' ? 'default' : 'secondary'}
                    className="uppercase text-[10px] tracking-wider"
                  >
                    {project.status === 'Completed' ? 'Concluído' : 'Processando'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <LayoutList className="h-4 w-4" /> Canal: {project.channel}
                </p>

                {project.status !== 'Completed' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso da IA</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto flex flex-col items-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {project.status === 'Completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {project.date}
                </div>
                <Button
                  variant={project.status === 'Completed' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link to={`/projects/${project.id}`}>
                    {project.status === 'Completed' ? 'Ver Resultado' : 'Acompanhar'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
