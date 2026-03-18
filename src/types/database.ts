export interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role:
    | 'visitor'
    | 'client'
    | 'affiliate'
    | 'collaborator'
    | 'administrator'
    | 'operator_ia'
    | 'subscriber'
    | string
  created_at: string
}

export interface Channel {
  id: string
  user_id: string
  platform: 'YouTube' | 'TikTok' | 'Instagram' | string
  channel_name?: string
  channel_link?: string
  niche?: string
  status?: string
  created_at: string
}

export interface Audit {
  id: string
  user_id: string
  channel_id: string
  growth_score?: number
  analysis_data?: Record<string, any>
  status: 'pending' | 'completed' | 'failed' | 'error' | string
  error_message?: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  channel_id: string
  service_name: string
  status: 'pending' | 'in_progress' | 'delivered' | string
  deliverables?: Record<string, any>
  updated_at: string
  created_at: string
}

export interface Credit {
  id: string
  user_id: string
  balance: number
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'credit_purchase' | 'service_usage'
  description?: string
  created_at: string
}
