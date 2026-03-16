import { CreditCard, Wallet, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAppStore from '@/stores/main'

export default function Settings() {
  const { user } = useAppStore()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie sua conta e créditos da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Assinatura & Créditos
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Saldo Atual</CardTitle>
              <CardDescription>Créditos disponíveis para uso com Agentes de IA.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-secondary font-heading">
                {user?.credits} cr
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Créditos</CardTitle>
              <CardDescription>Escolha seu provedor de pagamento preferido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Integração Pendente</AlertTitle>
                <AlertDescription>
                  Os webhooks de pagamento (Stripe e Mercado Pago) estão sendo configurados.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 relative overflow-hidden group"
                  disabled
                >
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <span>Stripe</span>
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold">Em breve</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 relative overflow-hidden group"
                  disabled
                >
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                  <span>Mercado Pago</span>
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold">Em breve</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-heading font-semibold">Perfil</h2>
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Função</label>
                <p className="font-medium capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
