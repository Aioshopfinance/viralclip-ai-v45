import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import useAppStore from '@/stores/main'

interface ProtectedRouteProps {
  requireAuth?: boolean
  requireAdmin?: boolean
  requireGuest?: boolean
}

export function ProtectedRoute({ requireAuth, requireAdmin, requireGuest }: ProtectedRouteProps) {
  const { user, isAuthLoading } = useAppStore()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4 font-medium animate-pulse">
          Validando permissões...
        </p>
      </div>
    )
  }

  // Se a rota for apenas para visitantes (ex: Landing Page) e o usuário estiver logado, redireciona
  if (requireGuest && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Se a rota exige autenticação e o usuário não está logado, redireciona para a Landing Page
  if (requireAuth && !user) {
    return <Navigate to="/" replace />
  }

  // Se a rota exige papel de admin e o usuário não é, redireciona para o dashboard do cliente
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Renderiza os componentes filhos ou as rotas aninhadas
  return <Outlet />
}
