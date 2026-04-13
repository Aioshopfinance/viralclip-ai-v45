import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bot, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { normalizeUrl } from '@/lib/utils'
import { triggerAuditProcessing } from '@/lib/audit-service'
import type { Database } from '@/lib/supabase/types'

type AuditInsert = Database['public']['Tables']['audits']['Insert'] & { type: string }

export default function ChannelNew() {
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [platform, setPlatform] = useState('youtube')
  const [customPlatform, setCustomPlatform] = useState('')
  const [name, setName] = useState('')
  const [niche, setNiche] = useState('devocional')
  const [customNiche, setCustomNiche] = useState('')
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()

  const detectPlatform = (inputUrl: string) => {
    const lowerUrl = inputUrl.toLowerCase()

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube'
    if (lowerUrl.includes('instagram.com')) return 'instagram'
    if (lowerUrl.includes('tiktok.com')) return 'tiktok'
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch') || lowerUrl.includes('fb.com')) return 'facebook'
    if (lowerUrl.includes('kwai.com') || lowerUrl.includes('kw.ai')) return 'kwai'
    if (lowerUrl.includes('linkedin.com')) return 'linkedin'
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
    if (lowerUrl.includes('pinterest.com') || lowerUrl.includes('pin.it')) return 'pinterest'
    if (lowerUrl.includes('twitch.tv')) return 'twitch'
    if (lowerUrl.includes('spotify.com')) return 'spotify'
    if (lowerUrl.includes('apple.com/podcast') || lowerUrl.includes('podcasts.apple.com')) return 'apple_podcasts'
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.me')) return 'telegram'
    if (lowerUrl.includes('whatsapp.com') || lowerUrl.includes('wa.me')) return 'whatsapp'
    if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) return 'discord'

    return null
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)

    const detected = detectPlatform(newUrl)
    if (detected) {
      setPlatform(detected)
      if (detected !== 'outros') {
        setCustomPlatform('')
      }
    }
  }

  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url)
      if (detected) setPlatform(detected)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (step < 2) {
      if (!name || !url) {
        return toast({
          title: 'Atenção',
          description: 'Preencha todos os campos obrigatórios.',
          variant: 'destructive',
        })
      }

      if (platform === 'outros' && !customPlatform.trim()) {
        return toast({
          title: 'Atenção',
          description: 'Por favor, descreva a plataforma.',
          variant: 'destructive',
        })
      }

      setStep(step + 1)
      return
    }

    if (niche === 'outros' && !customNiche.trim()) {
      return toast({
        title: 'Atenção',
        description: 'Por favor, descreva seu nicho.',
        variant: 'destructive',
      })
    }

    handleSubmit()
  }

  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData?.session?.user) {
        setIsProcessing(false)
        return toast({
          title: 'Sessão expirada',
          description: 'Você precisa estar autenticado para registrar um canal. Por favor, faça login novamente.',
        })
      }

      const uid = sessionData.session.user.id
      const finalPlatform = platform === 'outros' ? customPlatform.trim() : platform
      const finalNiche = niche === 'outros' ? customNiche.trim() : niche
      const normalizedLink = normalizeUrl(url)

      let channelId = ''

      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', uid)
        .eq('normalized_link', normalizedLink)
        .maybeSingle()

      if (existingChannel) {
        channelId = existingChannel.id
      } else {
        const channelData: any = {
          user_id: uid,
          platform: finalPlatform,
          channel_name: name,
          channel_link: url,
          normalized_link: normalizedLink,
          niche: finalNiche,
          status: 'active',
        }

        const { data: channel, error: cErr } = await supabase
          .from('channels')
          .insert(channelData)
          .select()
          .single()

        if (cErr) throw cErr
        channelId = channel.id
      }

      const auditData: AuditInsert = {
        user_id: uid,
        channel_id: channelId,
        status: 'pending',
        type: 'free_audit',
      }

      const { data: insertedAudit, error: aErr } = await supabase
        .from('audits')
        .insert(auditData as any)
        .select()
        .single()

      if (aErr) throw aErr

      console.log('[Frontend] audit created:', insertedAudit.id)

      await triggerAuditProcessing(insertedAudit.id)
      navigate(`/audit/processing/${insertedAudit.id}`)
    } catch (error: any) {
      setIsProcessing(false)

      let description = error.message || 'Ocorreu um erro desconhecido.'

      if (error.code === '42501') {
        description =
          'Acesso negado: Você não tem permissão para inserir este canal (Violação de RLS).'
      } else if (error.code === '23503') {
        description =
          'Sua conta não foi completamente sincronizada com o banco de dados. Faça logout e login novamente.'
      }

      toast({
        title: 'Erro ao cadastrar',
        description,
        variant: 'destructive',
      })
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <Bot className="h-12 w-12 text-secondary animate-pulse" />
        <h2 className="text-2xl font-bold">Iniciando Auditoria...</h2>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Registrando canal e disparando análise de IA.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold">Auditoria de Crescimento</h1>
        <p className="text-muted-foreground mt-2">
          Nossa IA fará uma auditoria gratuita do seu canal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? 'Qual é o seu canal?' : 'Detalhes adicionais'}</CardTitle>
          <CardDescription>
            {step === 1
              ? 'Identifique sua plataforma e URL. O tipo de plataforma pode ser detectado automaticamente.'
              : 'Isso ajuda a IA a calibrar a estratégia.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Canal</Label>
                <Input
                  placeholder="https://youtube.com/@seucanal"
                  value={url}
                  onChange={handleUrlChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Nome do Canal</Label>
                <Input
                  placeholder="Ex: Palavra Viva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select
                  value={platform}
                  onValueChange={(val) => {
                    setPlatform(val)
                    if (val !== 'outros') setCustomPlatform('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>

                  <SelectContent className="max-h-60">
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="kwai">Kwai</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">X / Twitter</SelectItem>
                    <SelectItem value="pinterest">Pinterest</SelectItem>
                    <SelectItem value="twitch">Twitch</SelectItem>
                    <SelectItem value="spotify">Spotify Podcast</SelectItem>
                    <SelectItem value="apple_podcasts">Apple Podcasts</SelectItem>
                    <SelectItem value="site_blog">Site / Blog</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Channel</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {platform === 'outros' && (
                <div className="space-y-2 animate-fade-in-up">
                  <Label>Descreva a plataforma</Label>
                  <Input
                    placeholder="Ex: Rumble"
                    value={customPlatform}
                    onChange={(e) => setCustomPlatform(e.target.value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nicho Principal</Label>
                <Select
                  value={niche}
                  onValueChange={(val) => {
                    setNiche(val)
                    if (val !== 'outros') setCustomNiche('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="devocional">Devocional Diário</SelectItem>
                    <SelectItem value="pregacao">Pregações / Sermões</SelectItem>
                    <SelectItem value="louvor">Louvor e Adoração</SelectItem>
                    <SelectItem value="podcast">Podcast Cristão</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {niche === 'outros' && (
                <div className="space-y-2 animate-fade-in-up">
                  <Label>Descreva seu nicho</Label>
                  <Input
                    placeholder="Ex: Finanças para Cristãos"
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}

            <Button onClick={handleNext}>
              {step === 1 ? 'Avançar' : 'Iniciar Auditoria'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
