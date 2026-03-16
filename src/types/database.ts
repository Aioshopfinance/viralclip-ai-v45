export interface User {
  id: string
  email: string
  role: 'client' | 'admin'
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  preferences?: Record<string, any>
}

export interface Profile {
  id: string
  user_id: string
  platform: 'youtube' | 'instagram' | 'tiktok'
  channel_name: string
  channel_url: string
  subscribers: number
  niche: string
}

export interface Audit {
  id: string
  profile_id: string
  creator_growth_score: number
  report_data: Record<string, any>
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Service {
  id: string
  title: string
  description: string
  category: 'Biblical Viral Ideas' | 'Devotional Scripts' | 'Viral Clips' | string
  credits_cost: number
  agent_id: string
}

export interface Agent {
  id: string
  name: string
  role_description: string
  team_id?: string
}

export interface Team {
  id: string
  name: string
}

export interface Project {
  id: string
  user_id: string
  service_id: string
  profile_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  created_at: string
}

export interface Deliverable {
  id: string
  project_id: string
  file_url: string
  type: 'video' | 'script' | 'image' | 'document'
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  provider: 'stripe' | 'mercadopago'
  status: 'pending' | 'succeeded' | 'failed'
  created_at: string
}

export interface CreditBalance {
  user_id: string
  balance: number
  last_updated: string
}
