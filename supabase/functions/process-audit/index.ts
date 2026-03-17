import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

async function fetchYouTubeData(url: string, apiKey: string) {
  let ytChannelId = null
  let urlType = 'unknown'

  const cleanUrl = url.trim()

  if (cleanUrl.includes('/channel/')) {
    const match = cleanUrl.match(/\/channel\/(UC[\w-]+)/)
    if (match) {
      ytChannelId = match[1]
      urlType = 'channel_id'
    }
  } else if (cleanUrl.includes('@')) {
    const match = cleanUrl.match(/@([\w.-]+)/)
    if (match) {
      const handle = match[1]
      urlType = 'handle'
      const res = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${apiKey}`,
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      if (data.items && data.items.length > 0) {
        ytChannelId = data.items[0].id
      }
    }
  } else if (cleanUrl.includes('/user/')) {
    const match = cleanUrl.match(/\/user\/([\w-]+)/)
    if (match) {
      const username = match[1]
      urlType = 'username'
      const res = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${apiKey}`,
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      if (data.items && data.items.length > 0) {
        ytChannelId = data.items[0].id
      }
    }
  } else if (cleanUrl.includes('/c/')) {
    const match = cleanUrl.match(/\/c\/([\w.-]+)/)
    if (match) {
      const cName = match[1]
      urlType = 'c_name'
      const res = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${cName}&key=${apiKey}`,
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      if (data.items && data.items.length > 0) {
        ytChannelId = data.items[0].snippet.channelId
      }
    }
  } else {
    const match = cleanUrl.match(/youtube\.com\/([\w.-]+)/)
    if (match && !['watch', 'playlist', 'feed', 'results'].includes(match[1])) {
      const handle = match[1]
      urlType = 'custom_path'
      const res = await fetch(
        `https://youtube.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${apiKey}`,
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      if (data.items && data.items.length > 0) {
        ytChannelId = data.items[0].id
      }
    }
  }

  if (!ytChannelId) {
    throw new Error(`Não foi possível resolver o channelId a partir da URL: ${url}`)
  }

  const channelRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${ytChannelId}&key=${apiKey}`,
  )
  const channelData = await channelRes.json()
  if (channelData.error) throw new Error(channelData.error.message)

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error(`Canal não encontrado na API para o ID: ${ytChannelId}`)
  }

  const searchRes = await fetch(
    `https://youtube.googleapis.com/youtube/v3/search?part=id,snippet&channelId=${ytChannelId}&order=date&type=video&maxResults=10&key=${apiKey}`,
  )
  const searchData = await searchRes.json()
  if (searchData.error) throw new Error(searchData.error.message)

  const videoIds = (searchData.items || []).map((item: any) => item.id?.videoId).filter(Boolean)
  let videosData = { items: [] }

  if (videoIds.length > 0) {
    const videosRes = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(
        ',',
      )}&key=${apiKey}`,
    )
    videosData = await videosRes.json()
    if ((videosData as any).error) throw new Error((videosData as any).error.message)
  }

  return { ytChannelId, urlType, channelData, searchData, videosData }
}

function calculateScore(channelData: any, videosData: any) {
  const stats = channelData.items[0].statistics
  const subscriberCount = parseInt(stats.subscriberCount || '0', 10)
  const videoCount = parseInt(stats.videoCount || '0', 10)

  const videos = videosData.items || []
  let totalViews = 0
  let lastUploadDate: Date | null = null

  videos.forEach((v: any, idx: number) => {
    totalViews += parseInt(v.statistics?.viewCount || '0', 10)
    const pubDate = new Date(v.snippet.publishedAt)
    if (idx === 0) {
      lastUploadDate = pubDate
    } else if (lastUploadDate && pubDate > lastUploadDate) {
      lastUploadDate = pubDate
    }
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

  return {
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
  }
}

Deno.serve(async (req: Request) => {
  let supabase
  let auditId

  try {
    const payload = await req.json()
    const record = payload.record || payload

    if (!record || !record.id || !record.channel_id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    auditId = record.id
    const channelId = record.channel_id

    console.log(`[Audit Lifecycle] Processing Started: ${auditId}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    supabase = createClient(supabaseUrl, supabaseKey)

    // Set status to processing
    await supabase.from('audits').update({ status: 'processing' }).eq('id', auditId)

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single()

    if (channelError || !channel) {
      throw new Error(`Failed to fetch channel: ${channelError?.message}`)
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('[Audit Lifecycle] YOUTUBE_API_KEY not found in environment.')
      throw new Error('YOUTUBE_API_KEY not found')
    }

    let ytChannelId, urlType, channelData, searchData, videosData
    try {
      const result = await fetchYouTubeData(channel.channel_link, apiKey)
      ytChannelId = result.ytChannelId
      urlType = result.urlType
      channelData = result.channelData
      searchData = result.searchData
      videosData = result.videosData
    } catch (e: any) {
      throw new Error(`Não foi possível obter dados reais do canal: ${e.message}`)
    }

    const { metrics, score_breakdown } = calculateScore(channelData, videosData)

    const content_suggestions =
      score_breakdown.total < 40
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

    const analysisData = {
      youtube_channel_id: ytChannelId,
      resolved_url_type: urlType,
      received_url: channel.channel_link,
      metrics,
      score_breakdown,
      raw_data: {
        channel: channelData,
        search: searchData,
        videos: videosData,
      },
      content_suggestions,
    }

    // Update the channel name dynamically from YouTube's API real data
    if (channelData && channelData.items && channelData.items.length > 0) {
      const channelTitle = channelData.items[0].snippet?.title
      if (channelTitle) {
        await supabase.from('channels').update({ channel_name: channelTitle }).eq('id', channelId)
      }
    }

    const { error: updateError } = await supabase
      .from('audits')
      .update({
        status: 'completed',
        growth_score: score_breakdown.total,
        analysis_data: analysisData,
        error_message: null,
      })
      .eq('id', auditId)

    if (updateError) {
      throw new Error(`Failed to update audit: ${updateError.message}`)
    }

    console.log(`[Audit Lifecycle] Processing Finished: ${auditId}`)
    return new Response(JSON.stringify({ success: true, auditId }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error(`[Audit Lifecycle] Failed: ${auditId || 'unknown'} - Error: ${error.message}`)

    if (supabase && auditId) {
      await supabase
        .from('audits')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', auditId)
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
