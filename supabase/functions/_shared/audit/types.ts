export type IntegrationStatus = 'real' | 'pending' | 'error'
export type AuditStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface AuditMetrics {
  follower_count?: number
  subscriber_count?: number
  video_count: number
  average_views: number
  likes_count?: number
  last_upload_date: string | null
}

export interface ScoreBreakdown {
  frequency: { score: number; max: number }
  engagement: { score: number; max: number }
  activity: { score: number; max: number }
  total: number
}

export interface AuditResponse {
  platform: string
  input: string
  normalizedInput: string | null
  integrationStatus: IntegrationStatus
  auditStatus: AuditStatus
  provider: string
  message: string
  data: {
    metrics?: AuditMetrics
    score_breakdown?: ScoreBreakdown
    content_suggestions?: string[]
    raw_data?: any
  } | null
  error: {
    code: string
    message: string
  } | null
  meta?: {
    canonicalChannelId?: string
    resolvedFrom?: string
    channelName?: string
  }
}
