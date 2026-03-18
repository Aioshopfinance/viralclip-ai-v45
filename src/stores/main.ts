import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

// Definindo explicitamente a matriz de papéis (Role Matrix) conforme a User Story
export type UserRole = 'visitor' | 'client' | 'admin' | 'affiliate' | 'collaborator' | 'operator_ia'

interface AppState {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    credits: number
  } | null
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  logout: () => void
  deductCredits: (amount: number) => boolean
  startAnonymousSession: () => Promise<{ data?: any; error: any }>
  convertAnonymousUser: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: any }>
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppState['user']>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

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
      const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single()
      const { data: credits } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.full_name || 'Usuário',
          email: profile.email || '',
          role: (profile.role?.toLowerCase() || 'client') as UserRole,
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
    if (!supabase) return { error: new Error('Supabase client is not configured.') }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signup = async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: new Error('Supabase client is not configured.') }
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

  const startAnonymousSession = async () => {
    if (!supabase) return { error: new Error('Supabase client is not configured.') }

    setIsAuthLoading(true)
    try {
      let { data, error } = await supabase.auth.signInAnonymously()

      if (
        error &&
        (error.message.toLowerCase().includes('anonymous') ||
          error.status === 400 ||
          error.status === 403)
      ) {
        const dummyEmail = `anon_${crypto.randomUUID().slice(0, 8)}@viralclip.ai`
        const dummyPassword = crypto.randomUUID()
        const res = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: { data: { full_name: 'Visitante' } },
        })

        if (!res.error && res.data.user) {
          await fetchUserProfile(res.data.user.id)
        } else {
          setIsAuthLoading(false)
        }
        return { data: res.data, error: res.error }
      }

      if (data?.user) {
        await fetchUserProfile(data.user.id)
      } else {
        setIsAuthLoading(false)
      }
      return { data, error }
    } catch (err: any) {
      setIsAuthLoading(false)
      return { error: err }
    }
  }

  const convertAnonymousUser = async (email: string, password: string, fullName: string) => {
    if (!supabase || !user) return { error: new Error('Not connected') }

    const { error } = await supabase.auth.updateUser({
      email,
      password,
      data: { full_name: fullName },
    })

    if (!error) {
      await supabase.from('users').update({ email, full_name: fullName }).eq('id', user.id)
      await fetchUserProfile(user.id)
    }

    return { error }
  }

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        user,
        isAuthLoading,
        login,
        signup,
        logout,
        deductCredits,
        startAnonymousSession,
        convertAnonymousUser,
      },
    },
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
