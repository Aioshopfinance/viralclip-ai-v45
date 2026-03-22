import { AuditResponse } from '../types.ts'
import { classifyInput, extractIdentifier, resolveCanonicalId } from '../youtube-parser.ts'

export async function runYouTubeAudit(
  url: string,
  apiKey: string,
): Promise<Partial<AuditResponse>> {
  try {
    const type = classifyInput(url)
    const identifier = extractIdentifier(url, type)

    if (!identifier) {
      throw new Error(`Não foi possível extrair identificador da URL: ${url}`)
    }

    const resolved = await resolveCanonicalId(identifier, type, apiKey)
    if (!resolved || !resolved.channelId) {
      throw new Error(`Não foi possível resolver o canal a partir da URL: ${url}`)
    }

    const { channelId, title } = resolved

    const channelRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${channelId}&key=${apiKey}`,
    )
    const channelData = await channelRes.json()
    if (channelData.error) throw new Error(channelData.error.message)
    if (!channelData.items || channelData.items.length === 0)
      throw new Error(`Canal não encontrado na API para o ID: ${channelId}`)

    const searchRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${channelId}&order=date&type=video&maxResults=10&key=${apiKey}`,
    )
    const searchData = await searchRes.json()
    if (searchData.error) throw new Error(searchData.error.message)

    const videoIds = (searchData.items || []).map((item: any) => item.id?.videoId).filter(Boolean)
    let videosData = { items: [] }

    if (videoIds.length > 0) {
      const videosRes = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`,
      )
      videosData = await videosRes.json()
      if ((videosData as any).error) throw new Error((videosData as any).error.message)
    }

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
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const recentVideosCount = videos.filter(
      (v: any) => new Date(v.snippet.publishedAt) >= ninetyDaysAgo,
    ).length

    const freqScore = Math.min((recentVideosCount / 10) * 30, 30)

    let engScore = 0
    if (subscriberCount > 0) {
      const engRatio = averageViews / subscriberCount
      let rawEngScore = (engRatio / 0.1) * 40
      if (averageViews < 100) rawEngScore *= averageViews / 100
      engScore = Math.min(rawEngScore, 40)
    } else if (averageViews > 0) {
      engScore = averageViews < 100 ? (averageViews / 100) * 40 : 40
    }

    let actScore = 0
    if (lastUploadDate) {
      const daysSinceLastUpload =
        (new Date().getTime() - lastUploadDate.getTime()) / (1000 * 3600 * 24)
      if (daysSinceLastUpload <= 7) actScore = 30
      else if (daysSinceLastUpload <= 30) actScore = 20
      else if (daysSinceLastUpload <= 90) actScore = 10
    }

    const finalScore = Math.round(freqScore + engScore + actScore)

    const suggestions =
      finalScore < 40
        ? [
            'Foque em criar consistência inicial (1-2 vídeos por semana).',
            'Experimente Shorts para ganhar tração e atrair os primeiros inscritos.',
            'Otimize suas thumbnails e títulos para se destacar nas buscas.',
          ]
        : [
            'Aumente a frequência de publicações para melhorar seu score de Frequência.',
            'Estimule os inscritos a interagirem para melhorar seu score de Engajamento.',
            'Mantenha o canal ativo postando regularmente.',
          ]

    return {
      integrationStatus: 'real',
      auditStatus: 'completed',
      provider: 'youtube-api-v3',
      message: 'Auditoria concluída com sucesso.',
      meta: {
        canonicalChannelId: channelId,
        resolvedFrom: type,
        channelName: title || channelData.items[0].snippet?.title || 'YouTube Channel',
      },
      data: {
        metrics: {
          subscriber_count: subscriberCount,
          video_count: videoCount,
          average_views: Math.round(averageViews),
          last_upload_date: lastUploadDate ? lastUploadDate.toISOString() : null,
        },
        score_breakdown: {
          frequency: { score: Math.round(freqScore), max: 30 },
          engagement: { score: Math.round(engScore), max: 40 },
          activity: { score: Math.round(actScore), max: 30 },
          total: finalScore,
        },
        content_suggestions: suggestions,
        raw_data: { channelData, videosData },
      },
    }
  } catch (err: any) {
    return {
      integrationStatus: 'error',
      auditStatus: 'failed',
      provider: 'youtube-api-v3',
      message: err.message,
      error: { code: 'YOUTUBE_API_ERROR', message: err.message },
    }
  }
}
