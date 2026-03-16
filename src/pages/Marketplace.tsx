import { Bot, Coins, Sparkles } from 'lucide-react'
import { MOCK_SERVICES } from '@/lib/mock-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/main'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

export default function Marketplace() {
  const { deductCredits, user } = useAppStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleHire = (service: (typeof MOCK_SERVICES)[0]) => {
    const success = deductCredits(service.credits)
    if (success) {
      toast({
        title: 'Serviço Contratado!',
        description: `O projeto para "${service.title}" foi iniciado.`,
      })
      navigate('/projects')
    } else {
      toast({
        variant: 'destructive',
        title: 'Créditos Insuficientes',
        description: 'Adquira mais créditos para continuar crescendo.',
      })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Marketplace AI</h1>
          <p className="text-muted-foreground mt-1">
            Contrate nossos agentes especializados para crescer seu canal.
          </p>
        </div>
        <div className="bg-muted px-4 py-2 rounded-full flex items-center gap-2 border border-border">
          <Coins className="h-5 w-5 text-accent" />
          <span className="font-semibold text-sm">Seu saldo: {user?.credits} cr</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SERVICES.map((service) => (
          <Card
            key={service.id}
            className="flex flex-col group hover:border-secondary/50 transition-colors"
          >
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription className="min-h-[40px]">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md w-fit">
                <Bot className="h-4 w-4" />
                Agente: {service.agent}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-6">
              <div className="flex items-center gap-1 font-bold text-lg">
                <Coins className="h-5 w-5 text-accent" /> {service.credits}
              </div>
              <Button onClick={() => handleHire(service)}>Contratar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
