import { Bell, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import useAppStore from '@/stores/main'
import { Link } from 'react-router-dom'

export function AppHeader() {
  const { user } = useAppStore()
  const { isMobile } = useSidebar()

  if (!user) return null

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h2 className="text-lg font-heading font-semibold text-foreground hidden sm:block">
          Área de Trabalho
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="hidden md:flex gap-2" asChild>
          <Link to="/channels/new">
            <Plus className="h-4 w-4" />
            Adicionar Canal
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border border-background"></span>
        </Button>

        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
