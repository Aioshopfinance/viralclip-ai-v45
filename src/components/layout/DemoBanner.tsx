import { AlertTriangle } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-accent-foreground">
      <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
      <span className="font-medium whitespace-nowrap">Versão de Demonstração:</span>
      <span className="truncate">
        Atualmente exibindo dados de exemplo. Integração com backend em andamento.
      </span>
    </div>
  )
}
