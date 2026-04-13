export type NormalizedAuditResult = {
  auditStatus: string
  integrationStatus: string | null
  provider: string | null
  message: string | null
  summary: string
  growthScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  data: {
    metrics: {
      subscriber_count: number
      average_views: number
      video_count: number
      last_upload_date: string | null
      engagement_rate: number
      average_likes: number
      average_comments: number
      total_views: number
    }
    score_breakdown: {
      total: number
      frequency: { score: number }
      engagement: { score: number }
      activity: { score: number }
    }
    content_suggestions: string[]
    channel: {
      title: string
      subscriberCount: number
      videoCount: number
      viewCount: number
    }
    aggregates: {
      avgViews: number
      avgLikes: number
      avgComments: number
      engagementRate: number
    }
    recent_videos: any[]
    summary: string
  }
  meta: {
    channelName: string | null
    canonicalChannelId: string | null
    platform: string | null
    channelLink: string | null
  }
  error: {
    message: string | null
  } | null
}

function safeNumber(value: unknown, fallback = 0): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function safeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function safeArray(value: unknown): any[] {
  return Array.isArray(value) ? value.filter((item) => item != null) : []
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item == null) return ''
      return String(item).trim()
    })
    .filter(Boolean)
}

export function normalizeAuditResult(raw: any, channel: any): NormalizedAuditResult {
  const rawData = raw?.data ?? {}
  const rawMeta = raw?.meta ?? {}

  const totalScore =
    safeNumber(rawData?.score_breakdown?.total) ||
    safeNumber(raw?.score?.total) ||
    safeNumber(raw?.growthScore) ||
    0

  const frequencyScore =
    safeNumber(rawData?.score_breakdown?.frequency?.score) ||
    safeNumber(rawData?.score_breakdown?.consistency) ||
    0

  const engagementScore =
    safeNumber(rawData?.score_breakdown?.engagement?.score) ||
    safeNumber(rawData?.score_breakdown?.engagement) ||
    0

  const activityScore =
    safeNumber(rawData?.score_breakdown?.activity?.score) ||
    safeNumber(rawData?.score_breakdown?.reach) ||
    0

  const channelTitle =
    safeNullableString(rawData?.channel?.title) ||
    safeNullableString(rawMeta?.channelName) ||
    safeNullableString(channel?.channel_name)

  const subscriberCount =
    safeNumber(rawData?.channel?.subscriberCount) ||
    safeNumber(rawData?.metrics?.subscriber_count)

  const videoCount =
    safeNumber(rawData?.channel?.videoCount) ||
    safeNumber(rawData?.metrics?.video_count)

  const viewCount =
    safeNumber(rawData?.channel?.viewCount) ||
    safeNumber(rawData?.metrics?.total_views)

  const avgViews =
    safeNumber(rawData?.aggregates?.avgViews) ||
    safeNumber(rawData?.metrics?.average_views)

  const avgLikes =
    safeNumber(rawData?.aggregates?.avgLikes) ||
    safeNumber(rawData?.metrics?.average_likes)

  const avgComments =
    safeNumber(rawData?.aggregates?.avgComments) ||
    safeNumber(rawData?.metrics?.average_comments)

  const engagementRate =
    safeNumber(rawData?.aggregates?.engagementRate) ||
    safeNumber(rawData?.metrics?.engagement_rate)

  const recentVideos = safeArray(rawData?.recent_videos)
  const contentSuggestions =
    toStringArray(rawData?.content_suggestions) ||
    toStringArray(raw?.recommendations) ||
    []

  const summary =
    safeString(rawData?.summary) ||
    safeString(raw?.summary) ||
    'Análise concluída sem resumo detalhado.'

  const strengths = toStringArray(raw?.strengths)
  const weaknesses = toStringArray(raw?.weaknesses)
  const recommendations = toStringArray(raw?.recommendations)

  const lastUploadDate =
    safeNullableString(rawData?.metrics?.last_upload_date) ||
    safeNullableString(recentVideos?.[0]?.publishedAt) ||
    safeNullableString(recentVideos?.[0]?.published_at)

  return {
    auditStatus: safeString(raw?.auditStatus, 'completed'),
    integrationStatus: safeNullableString(raw?.integrationStatus),
    provider: safeNullableString(raw?.provider) || safeNullableString(channel?.platform),
    message: safeNullableString(raw?.message),
    summary,
    growthScore: totalScore,
    strengths,
    weaknesses,
    recommendations,
    data: {
      metrics: {
        subscriber_count: subscriberCount,
        average_views: avgViews,
        video_count: videoCount,
        last_upload_date: lastUploadDate,
        engagement_rate: engagementRate,
        average_likes: avgLikes,
        average_comments: avgComments,
        total_views: viewCount,
      },
      score_breakdown: {
        total: totalScore,
        frequency: { score: frequencyScore },
        engagement: { score: engagementScore },
        activity: { score: activityScore },
      },
      content_suggestions: contentSuggestions,
      channel: {
        title: channelTitle || '',
        subscriberCount,
        videoCount,
        viewCount,
      },
      aggregates: {
        avgViews,
        avgLikes,
        avgComments,
        engagementRate,
      },
      recent_videos: recentVideos,
      summary,
    },
    meta: {
      channelName: channelTitle,
      canonicalChannelId:
        safeNullableString(rawMeta?.canonicalChannelId) ||
        safeNullableString(rawData?.channel?.id),
      platform: safeNullableString(channel?.platform),
      channelLink: safeNullableString(channel?.channel_link),
    },
    error: raw?.error
      ? {
          message: safeNullableString(raw?.error?.message) || 'Erro desconhecido durante a auditoria.',
        }
      : null,
  }
}
