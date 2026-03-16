import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Youtube,
  ShoppingCart,
  FolderKanban,
  ShieldAlert,
  Zap,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Meus Canais', icon: Youtube, path: '/channels' },
  { title: 'Marketplace AI', icon: ShoppingCart, path: '/marketplace' },
  { title: 'Projetos', icon: FolderKanban, path: '/projects' },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAppStore()

  if (!user) return null

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 flex flex-row items-center gap-2">
        <div className="bg-secondary text-white p-1.5 rounded-lg flex items-center justify-center">
          <Zap className="h-5 w-5" />
        </div>
        <span className="font-heading font-bold text-xl text-foreground">ViralClip AI</span>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname.startsWith(item.path)}
                className="text-muted-foreground hover:text-foreground data-[active=true]:text-secondary data-[active=true]:bg-secondary/10"
              >
                <Link to={item.path} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {user.role === 'admin' && (
            <>
              <SidebarSeparator className="my-4" />
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/admin')}>
                  <Link to="/admin" className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Painel Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="bg-muted rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Créditos AI</span>
            <span className="text-sm font-bold text-secondary">{user.credits}</span>
          </div>
          <Progress value={(user.credits / 1000) * 100} className="h-2 bg-background" />
          <p className="text-xs text-muted-foreground mt-2">Atualize para mais automações</p>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground">
              {user.role === 'admin' ? 'Administrador' : 'Criador'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
