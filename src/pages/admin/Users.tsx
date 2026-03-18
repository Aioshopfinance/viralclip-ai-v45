import { useEffect, useState } from 'react'
import { ShieldAlert, Users as UsersIcon, Settings2, Loader2 } from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  credits: number
  status: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Agora, por causa da nova política de RLS "Admins can select all users",
        // esta query retornará todos os usuários da base.
        const { data, error } = await supabase
          .from('users')
          .select('*, credits(balance)')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          setUsers(
            data.map((u: any) => ({
              id: u.id,
              name: u.full_name || 'Desconhecido',
              email: u.email,
              role: u.role || 'client',
              credits: Array.isArray(u.credits)
                ? u.credits[0]?.balance || 0
                : u.credits?.balance || 0,
              status: 'Ativo',
            })),
          )
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

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
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {u.role}
                      </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
