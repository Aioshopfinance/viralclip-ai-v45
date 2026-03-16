import React, { createContext, useContext, useState, ReactNode } from 'react'
import { MOCK_CHANNELS } from '@/lib/mock-data'

type UserRole = 'client' | 'admin'

interface AppState {
  user: {
    name: string
    email: string
    role: UserRole
    credits: number
  } | null
  channels: typeof MOCK_CHANNELS
  login: (role?: UserRole) => void
  logout: () => void
  deductCredits: (amount: number) => boolean
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppState['user']>(null)
  const [channels] = useState(MOCK_CHANNELS)

  const login = (role: UserRole = 'client') => {
    setUser({
      name: 'João Cristão',
      email: 'joao@exemplo.com',
      role,
      credits: 500,
    })
  }

  const logout = () => setUser(null)

  const deductCredits = (amount: number) => {
    if (!user || user.credits < amount) return false
    setUser({ ...user, credits: user.credits - amount })
    return true
  }

  return React.createElement(
    AppContext.Provider,
    { value: { user, channels, login, logout, deductCredits } },
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
