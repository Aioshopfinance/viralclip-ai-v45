import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_CHANNELS } from '@/lib/mock-data'

type UserRole = 'client' | 'admin'

interface AppState {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    credits: number
  } | null
  isAuthLoading: boolean
  channels: typeof MOCK_CHANNELS
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  logout: () => void
  deductCredits: (amount: number) => boolean
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppState['user']>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [channels] = useState(MOCK_CHANNELS)

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setIsAuthLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setIsAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase!.from('users').select('*').eq('id', userId).single()
      const { data: credits } = await supabase!
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.full_name || 'Usuário',
          email: profile.email || '',
          role: profile.role?.toLowerCase() as 'client' | 'admin',
          credits: credits?.balance || 0,
        })
      } else {
        setUser({
          id: userId,
          name: 'Usuário',
          email: '',
          role: 'client',
          credits: credits?.balance || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile', error)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured.') }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signup = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client is not configured.') }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }

  const deductCredits = (amount: number) => {
    if (!user || user.credits < amount) return false

    setUser({ ...user, credits: user.credits - amount })

    if (supabase) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id)
      if (isUUID) {
        supabase
          .from('credits')
          .update({ balance: user.credits - amount })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Failed to deduct credits in DB', error)
          })
      }
    }

    return true
  }

  return React.createElement(
    AppContext.Provider,
    { value: { user, isAuthLoading, channels, login, signup, logout, deductCredits } },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
