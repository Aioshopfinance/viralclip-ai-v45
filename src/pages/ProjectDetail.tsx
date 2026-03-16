import { useParams } from 'react-router-dom'
import { Download, Play, Bot, CheckCircle2, ChevronRight } from 'lucide-react'
import { MOCK_TIMELINE, MOCK_PROJECTS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function ProjectDetail() {
  const { id } = useParams()
  const project = MOCK_PROJECTS.find((p) => p.id === id) || MOCK_PROJECTS[0]
  const isComplete = project.status === 'Completed'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Timeline Section */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{project.service}</h1>
          <p className="text-muted-foreground text-sm mt-1">{project.channel}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade dos Agentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-6">
              <div className="space-y-6 pb-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {MOCK_TIMELINE.map((event, idx) => (
                  <div key={event.id} className="relative flex items-start gap-4 md:gap-6 group">
                    <div className="flex-1 md:text-right text-sm pt-1 md:block hidden">
                      <span className="text-muted-foreground font-medium">{event.time}</span>
                    </div>
                    <div
                      className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center z-10 border-4 border-background ${event.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary/20 text-secondary animate-pulse-glow'}`}
                    >
                      {event.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1 pb-4">
                      <h4 className="font-semibold text-sm">{event.agent}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{event.action}</p>
                      <span className="text-xs text-muted-foreground font-medium md:hidden block mt-1">
                        {event.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Result / Preview Section */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col overflow-hidden border-border shadow-elevation">
          <div className="bg-muted p-4 border-b border-border flex justify-between items-center">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Play className="h-4 w-4 text-secondary" /> Resultado Final
            </span>
            {isComplete && (
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Exportar (MP4)
              </Button>
            )}
          </div>

          <div className="flex-1 bg-black/5 flex items-center justify-center min-h-[400px] p-6 relative">
            {!isComplete ? (
              <div className="text-center space-y-4">
                <Bot className="h-16 w-16 text-muted-foreground/30 mx-auto animate-bounce" />
                <p className="text-muted-foreground font-medium">
                  A IA está renderizando o vídeo...
                </p>
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-xl overflow-hidden relative shadow-2xl flex items-center justify-center group cursor-pointer">
                <img
                  src={`https://img.usecurling.com/p/400/700?q=church&color=black`}
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 ml-1" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="text-sm font-bold truncate">Pregação - O poder da Fé (Corte 1)</p>
                  <p className="text-xs opacity-80">60 segundos • Otimizado para TikTok</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
