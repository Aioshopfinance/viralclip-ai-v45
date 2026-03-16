import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'
import { cn } from '@/lib/utils'

interface ScoreGaugeProps {
  score: number
  className?: string
}

export function ScoreGauge({ score, className }: ScoreGaugeProps) {
  // Determine color based on score
  const color =
    score >= 80 ? 'hsl(var(--chart-4))' : score >= 60 ? 'hsl(var(--accent))' : 'hsl(var(--chart-5))'

  const data = [{ name: 'Score', value: score, fill: color }]

  return (
    <div className={cn('relative w-full aspect-square max-w-[200px] mx-auto', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={15}
          data={data}
          startAngle={210}
          endAngle={-30}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-heading font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          Growth Score
        </span>
      </div>
    </div>
  )
}
