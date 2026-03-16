import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { DemoBanner } from '@/components/layout/DemoBanner'
import useAppStore from '@/stores/main'

export default function Layout() {
  const { user } = useAppStore()
  const location = useLocation()

  // Don't show sidebar/header on the landing page if not logged in
  const isLanding = location.pathname === '/' && !user

  if (isLanding) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DemoBanner />
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
