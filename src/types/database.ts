export interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: 'Client' | 'Admin' | 'Affiliate' | string
  created_at: string
}

export interface Channel {
  id: string
  user_id: string
  platform: 'YouTube' | 'TikTok' | 'Instagram' | string
  channel_name: string
  channel_url?: string
  niche?: string
  frequency?: string
  goals?: string
  created_at: string
}

export interface Audit {
  id: string
  user_id: string
  channel_id: string
  creator_growth_score?: number
  report_json?: Record<string, any>
  status: 'pending' | 'completed' | string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  channel_id: string
  service_type: string
  status: 'pending' | 'in_progress' | 'delivered' | string
  delivery_content?: Record<string, any>
  updated_at: string
}

export interface Credit {
  id: string
  user_id: string
  balance: number
  last_updated: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'debit' | 'credit'
  description?: string
  created_at: string
}
