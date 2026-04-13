import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  Hash,
  UploadCloud,
  Link as LinkIcon,
  Video as VideoIcon,
  Construction,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreGauge } from '@/components/shared/ScoreGauge'
import { AuditMetrics } from '@/components/audit/AuditMetrics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import useAppStore from '@/stores/main'

export default function AuditResult() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const { toast } = useToast()

  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!auditId || !user) return

    const fetchAudit = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('audits')
          .select('*, channels(*)')
          .eq('id', auditId)
          .eq('user_id', user.id)
          .single()

        if (fetchErr) throw fetchErr
        if (!data) throw new Error('Auditoria não encontrada.')

        const auditData = {
          ...data,
          channel: Array.isArray(data.channels) ? data.channels[0] : data.channels,
        }

        setAudit(auditData)
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar resultados.')
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [auditId, user])

  const handleCreateProject = async () => {
    if (!audit?.channel?.id) {
      toast({
        title: 'Erro',
        description: 'Canal não encontrado para criar o projeto.',
        variant: 'destructive',
      })
      return
    }

    if (uploadType === 'url' && !videoUrl) {
      toast({ title: 'Aviso', description: 'Insira a URL do vídeo.' })
      return
    }

    if (uploadType === 'upload' && !videoFile) {
      toast({ title: 'Aviso', description: 'Selecione um arquivo de vídeo.' })
      return
    }

    setIsSubmitting(true)

    try {
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          channel_id: audit.channel.id,
          service_name: 'Geração Automática de Cortes Virais',
          status: 'received',
        })
        .select()
        .single()

      if (projErr) throw projErr

      if (uploadType === 'upload' && videoFile) {
        const ext = videoFile.name.split('.').pop()
        const path = `${user?.id}/${project.id}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('video-uploads')
          .upload(path, videoFile)

        if (upErr) throw upErr

        const { error: vidErr } = await supabase.from('videos').insert({
          user_id: user?.id,
          project_id: project.id,
          source_type: 'upload',
          storage_path: path,
        })

        if (vidErr) throw vidErr
      } else {
        const { error: vidErr } = await supabase.from('videos').insert({
          user_id: user?.id,
          project_id: project.id,
          source_type: 'url',
          external_url: videoUrl,
        })

        if (vidErr) throw vidErr
      }

      toast({
        title: 'Sucesso',
        description: 'Projeto criado e vídeo recebido para processamento!',
      })

      navigate('/projects')
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar vídeo',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <p>{error || 'Erro ao carregar auditoria.'}</p>
      </div>
    )
  }

  const channel = audit.channel || {}
  const analysis = audit.analysis_data || {}
  const analysisPayload = analysis.data || {}
  const metrics = analysisPayload.metrics || null
  const breakdown = analysisPayload.score_breakdown || null
  const suggestions = analysisPayload.content_suggestions || []
  const meta = analysis.meta || {}
  const score = breakdown?.total || audit.growth_score || 0

  const isPendingIntegration =
    audit.status === 'pending_integration' ||
    analysis.auditStatus === 'pending_integration' ||
    analysis.integrationStatus === 'pending_integration'

  const pendingMessage =
    analysis.message ||
    'A integração com essa plataforma ainda está em desenvolvimento. Em breve você verá dados reais aqui.'

  const avatarUrl = `https://img.usecurling.com/i?q=${encodeURIComponent(
    channel.platform || 'youtube',
  )}&color=gradient`

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt="Platform" className="w-16 h-16 rounded-full bg-secondary/10" />
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {channel.channel_name || meta.channelName || 'Canal Analisado'}
            </h1>

            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="capitalize">{channel.platform}</span>

              {meta?.canonicalChannelId && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    <Hash className="h-3 w-3" /> {meta.canonicalChannelId}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </Button>
      </div>

      {isPendingIntegration ? (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-8 text-center">
            <Construction className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-2">Integração em Desenvolvimento</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{pendingMessage}</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-secondary/20 shadow-lg relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-secondary to-accent"></div>
              <CardTitle className="mb-6 font-heading text-xl">
                Score de Crescimento Viral
              </CardTitle>
              <ScoreGauge score={score} className="w-48" />
              <p className="mt-6 text-sm text-muted-foreground max-w-[250px]">
                Baseado em métricas de frequência, engajamento e atividade do canal.
              </p>
            </Card>

            <div className="lg:col-span-2">
              {metrics && (
                <AuditMetrics metrics={metrics} breakdown={breakdown} platform={channel.platform} />
              )}

              {suggestions.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-heading font-semibold">Oportunidades</h3>
                  {suggestions.map((s: string, idx: number) => (
                    <Card key={idx} className="border-l-4 border-l-accent bg-card/50">
                      <CardContent className="p-4 text-sm">{s}</CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!metrics && (
                <Card className="mt-4 border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Os dados detalhados dessa auditoria ainda não puderam ser exibidos corretamente.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              <VideoIcon className="text-primary" /> Próximo Passo: Iniciar Projeto
            </h2>

            <Card>
              <CardHeader>
                <CardTitle>Envie um vídeo para gerar cortes virais</CardTitle>
              </CardHeader>

              <CardContent>
                <Tabs value={uploadType} onValueChange={setUploadType}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-2" /> Link do Vídeo
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <UploadCloud className="h-4 w-4 mr-2" /> Upload de Arquivo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Link Externo do Vídeo Completo</label>
                      <Input
                        placeholder="https://..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload">
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-medium">Clique ou arraste seu vídeo aqui</p>
                      <p className="text-sm text-muted-foreground mt-1">MP4, MOV, AVI até 500MB</p>

                      <input
                        id="file-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      />

                      {videoFile && (
                        <p className="mt-4 text-primary font-medium">
                          Arquivo selecionado: {videoFile.name}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleCreateProject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Iniciando Projeto...' : 'Enviar Vídeo e Criar Projeto'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
