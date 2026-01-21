import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MemoryMetrics } from "@/app/types/analytics"
import { cn } from "@/lib/utils"

interface HealthMetricProps {
  label: string
  value: number
  threshold: number
  unit?: string
}

function HealthMetric({ label, value, threshold, unit = '%' }: HealthMetricProps) {
  const percentage = (value / threshold) * 100
  const status = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success'
  
  return (
    <div className="space-y-2 p-2 rounded-lg transition-colors hover:bg-muted/50">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          "font-semibold text-sm rounded-full px-2 py-0.5",
          status === 'danger' ? 'text-red-600 dark:text-red-400' : 
          status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 
          'text-green-600 dark:text-green-400'
        )}>
          {value.toFixed(2)}{unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          "h-2 transition-all",
          status === 'danger' ? '[--progress-background:hsl(var(--red-600))]' : 
          status === 'warning' ? '[--progress-background:hsl(var(--yellow-600))]' : 
          '[--progress-background:hsl(var(--green-600))]'
        )}
      />
    </div>
  )
}

interface MemoryHealthIndicatorProps {
  metrics: MemoryMetrics
}

export function MemoryHealthIndicator({ metrics }: MemoryHealthIndicatorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <HealthMetric 
          label="Memory Fragmentation"
          value={metrics.fragmentation * 100}
          threshold={100}
        />
        <HealthMetric 
          label="Page Fault Rate"
          value={metrics.pageFaultRate}
          threshold={100}
          unit="/s"
        />
        <HealthMetric 
          label="Memory Pressure"
          value={metrics.pressureScore * 100}
          threshold={80}
        />
        <HealthMetric 
          label="Swap Usage"
          value={metrics.swapUsagePercent}
          threshold={90}
        />
      </CardContent>
    </Card>
  )
} 