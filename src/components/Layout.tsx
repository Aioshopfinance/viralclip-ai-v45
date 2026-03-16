import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import useAppStore from '@/stores/main'

export default function Layout() {
  const { user, isAuthLoading } = useAppStore()
  const location = useLocation()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4 font-medium animate-pulse">
          Carregando workspace...
        </p>
      </div>
    )
  }

  const isLanding = location.pathname === '/'

  if (isLanding && !user) {
    return <Outlet />
  }

  if (isLanding && user) {
    return <Navigate to="/dashboard" replace />
  }

  if (!isLanding && !user) {
    return <Navigate to="/" replace />
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
