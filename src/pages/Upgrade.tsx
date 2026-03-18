import { Check, ShieldCheck, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function Upgrade() {
  const { toast } = useToast()

  const handlePayment = () => {
    toast({
      title: 'Redirecionando...',
      description: 'Isso seria conectado ao Stripe ou Mercado Pago na versão final.',
    })
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-10 space-y-4 max-w-xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold">Relatório Premium</h1>
        <p className="text-lg text-muted-foreground">
          Liberte o potencial máximo do seu canal com o diagnóstico completo gerado por nossa IA
          Especializada.
        </p>
      </div>

      <Card className="w-full max-w-md border-secondary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-secondary to-accent"></div>
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>

        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl mb-2">Desbloqueio Total</CardTitle>
          <CardDescription className="text-base">
            Pagamento único, acesso vitalício ao relatório atual.
          </CardDescription>

          <div className="mt-6 flex items-baseline justify-center gap-1 font-heading">
            <span className="text-5xl font-bold text-foreground">R$ 19</span>
            <span className="text-muted-foreground font-medium">,90</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8">
          <ul className="space-y-3">
            {[
              'Acesso completo ao relatório do canal',
              'Análise detalhada de Potencial de Crescimento',
              'Diagnóstico de Qualidade dos Conteúdos',
              'Sugestões virais e roteiros exclusivos',
              'Prioridade na fila de processamento',
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-6 border-t mt-6">
          <Button size="lg" className="w-full text-lg h-12 gap-2" onClick={handlePayment}>
            <ShieldCheck className="h-5 w-5" /> Pagar Agora
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Pagamento 100% seguro via Stripe/Mercado Pago. Acesso liberado imediatamente após a
            confirmação.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
