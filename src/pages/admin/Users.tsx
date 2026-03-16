import { ShieldAlert, Users as UsersIcon, Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/main'
import { Navigate } from 'react-router-dom'

const MOCK_USERS = [
  {
    id: 1,
    name: 'João Cristão',
    email: 'joao@exemplo.com',
    role: 'Client',
    credits: 450,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Admin Principal',
    email: 'admin@viralclip.ai',
    role: 'Admin',
    credits: 9999,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Igreja Esperança',
    email: 'midia@esperanca.com',
    role: 'Client',
    credits: 10,
    status: 'Warning',
  },
]

export default function AdminUsers() {
  const { user } = useAppStore()

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <ShieldAlert className="h-8 w-8 text-rose-500" />
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-muted-foreground text-sm">
            Painel administrativo para controle interno de contas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="h-5 w-5" /> Base de Usuários
          </CardTitle>
          <Button size="sm" variant="outline">
            Adicionar Manualmente
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={u.credits < 50 ? 'text-rose-500 font-bold' : ''}>
                      {u.credits}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
