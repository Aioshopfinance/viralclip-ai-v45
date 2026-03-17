import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Marketplace from './pages/Marketplace'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ChannelNew from './pages/ChannelNew'
import ChannelAudit from './pages/ChannelAudit'
import AuditDetail from './pages/AuditDetail'
import AdminUsers from './pages/admin/Users'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { AppProvider } from './stores/main'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/channels/new" element={<ChannelNew />} />
            <Route path="/channels/:id/audit" element={<ChannelAudit />} />
            <Route path="/audits/:id" element={<AuditDetail />} />
            <Route path="/channels" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="/admin" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
