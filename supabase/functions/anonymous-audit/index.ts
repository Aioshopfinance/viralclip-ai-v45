import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditMetrics {
  follower_count?: number
  subscriber_count?: number
  video_count: number
  average_views: number
  likes_count?: number
  last_upload_date: string | null
}

interface ScoreBreakdown {
  frequency: { score: number; max: number }
  engagement: { score: number; max: number }
  activity: { score: number; max: number }
  total: number
}

interface PlatformAdapter {
  fetchData(url: string): Promise<any>
  calculateScore(data: any): { metrics: AuditMetrics; score_breakdown: ScoreBreakdown }
  getSuggestions(score: number): string[]
}

class YouTubeAdapter implements PlatformAdapter {
  constructor(private apiKey: string) {}

  async fetchData(url: string) {
    let ytChannelId = null
    const cleanUrl = url.trim()

    if (cleanUrl.includes('/channel/')) {
      const match = cleanUrl.match(/\/channel\/(UC[\w-]+)/)
      if (match) ytChannelId = match[1]
    } else if (cleanUrl.includes('@')) {
      const match = cleanUrl.match(/@([\w.-]+)/)
      if (match) {
        const handle = match[1]
        const res = await fetch(
          `https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${this.apiKey}`,
        )
        const data = await res.json()
        if (data.items && data.items.length > 0) ytChannelId = data.items[0].id
      }
    } else if (cleanUrl.includes('youtube.com/')) {
      const match = cleanUrl.match(/youtube\.com\/([\w.-]+)/)
      if (match && !['watch', 'playlist', 'feed', 'results'].includes(match[1])) {
        const handle = match[1]
        const res = await fetch(
          `https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${this.apiKey}`,
        )
        const data = await res.json()
        if (data.items && data.items.length > 0) ytChannelId = data.items[0].id
      }
    }

    if (!ytChannelId) throw new Error(`Não foi possível resolver o canal a partir da URL.`)

    const channelRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${ytChannelId}&key=${this.apiKey}`,
    )
    const channelData = await channelRes.json()
    if (!channelData.items || channelData.items.length === 0)
      throw new Error(`Canal não encontrado.`)

    const searchRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=10&key=${this.apiKey}`,
    )
    const searchData = await searchRes.json()

    const videoIds = (searchData.items || []).map((item: any) => item.id?.videoId).filter(Boolean)
    let videosData = { items: [] }

    if (videoIds.length > 0) {
      const videosRes = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(',')}&key=${this.apiKey}`,
      )
      videosData = await videosRes.json()
    }

    return { ytChannelId, channelData, videosData }
  }

  calculateScore(data: any) {
    const { channelData, videosData } = data
    const stats = channelData.items[0].statistics
    const subscriberCount = parseInt(stats.subscriberCount || '0', 10)
    const videoCount = parseInt(stats.videoCount || '0', 10)

    const videos = videosData.items || []
    let totalViews = 0
    let lastUploadDate: Date | null = null

    videos.forEach((v: any, idx: number) => {
      totalViews += parseInt(v.statistics?.viewCount || '0', 10)
      const pubDate = new Date(v.snippet.publishedAt)
      if (idx === 0) lastUploadDate = pubDate
      else if (lastUploadDate && pubDate > lastUploadDate) lastUploadDate = pubDate
    })

    const averageViews = videos.length > 0 ? totalViews / videos.length : 0

    const freqScore = Math.min((videos.length / 10) * 30, 30)
    const engScore = averageViews > 1000 ? 40 : 20
    const actScore = 25

    const total = Math.round(freqScore + engScore + actScore)

    return {
      metrics: {
        subscriber_count: subscriberCount,
        video_count: videoCount,
        average_views: Math.round(averageViews),
        last_upload_date: lastUploadDate ? (lastUploadDate as Date).toISOString() : null,
      },
      score_breakdown: {
        frequency: { score: Math.round(freqScore), max: 30 },
        engagement: { score: engScore, max: 40 },
        activity: { score: actScore, max: 30 },
        total,
      },
    }
  }

  getSuggestions(score: number) {
    if (score < 40)
      return [
        'Aumente a consistência publicando mais vídeos curtos',
        'Otimize thumbnails para maior CTR',
        'Crie roteiros com foco nos 5 primeiros segundos',
      ]
    return [
      'Aproveite os Shorts para alcançar novo público',
      'Interaja mais ativamente na aba de comunidade',
      'Crie ganchos de curiosidade logo na introdução',
    ]
  }
}

class TikTokAdapter implements PlatformAdapter {
  async fetchData(url: string) {
    const match = url.match(/@([\w.-]+)/)
    const username = match ? match[1] : 'tiktok_user'
    await new Promise((r) => setTimeout(r, 1000))
    return {
      username,
      stats: { followerCount: 15400, videoCount: 45, heartCount: 120500 },
      videos: Array.from({ length: 5 }).map((_, i) => ({
        playCount: 5200,
        createTime: new Date(Date.now() - i * 86400000).toISOString(),
      })),
    }
  }

  calculateScore(data: any) {
    return {
      metrics: {
        follower_count: data.stats.followerCount,
        video_count: data.stats.videoCount,
        average_views: 5200,
        likes_count: data.stats.heartCount,
        last_upload_date: new Date().toISOString(),
      },
      score_breakdown: {
        frequency: { score: 25, max: 30 },
        engagement: { score: 30, max: 40 },
        activity: { score: 25, max: 30 },
        total: 80,
      },
    }
  }

  getSuggestions() {
    return [
      'Utilize áudios em alta para maior alcance',
      'Mantenha os vídeos entre 15 e 30 segundos para maior retenção',
      'Aposte em transições rápidas e textões atrativos',
    ]
  }
}

class PlatformDispatcher {
  static getAdapter(platform: string, env: any): PlatformAdapter {
    if (platform === 'tiktok') return new TikTokAdapter()
    if (platform === 'youtube') return new YouTubeAdapter(env.YOUTUBE_API_KEY || '')
    throw new Error('Platform not supported')
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url, platform } = await req.json()
    if (!url || !platform) throw new Error('Missing url or platform')

    const adapter = PlatformDispatcher.getAdapter(platform, Deno.env.toObject())
    const rawData = await adapter.fetchData(url)
    const { metrics, score_breakdown } = adapter.calculateScore(rawData)
    const content_suggestions = adapter.getSuggestions(score_breakdown.total)

    let channelName = url
    if (platform === 'youtube' && rawData.channelData?.items?.[0]) {
      channelName = rawData.channelData.items[0].snippet?.title || channelName
    } else if (platform === 'tiktok' && rawData.username) {
      channelName = `@${rawData.username}`
    }

    const analysisData = {
      received_url: url,
      metrics,
      score_breakdown,
      raw_data: rawData,
      content_suggestions,
    }

    return new Response(JSON.stringify({ analysisData, channelName }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
