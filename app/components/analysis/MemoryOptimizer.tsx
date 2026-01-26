"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { MemoryMetrics, MemoryRecommendation } from "@/app/types/analytics"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MemoryOptimizerProps {
  metrics: MemoryMetrics
}

export function MemoryOptimizer({ metrics }: MemoryOptimizerProps) {
  const [recommendations, setRecommendations] = useState<MemoryRecommendation[]>([])

  useEffect(() => {
    setRecommendations(getRecommendations(metrics))
  }, [metrics])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3 pr-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3 border bg-card hover:bg-muted/50 transition-colors">
                  {rec.severity === 'high' ? (
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  ) : rec.severity === 'medium' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  ) : rec.severity === 'low' ? (
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{rec.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 rounded-lg p-3 border bg-card">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  System memory is operating within normal parameters.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function getRecommendations(metrics: MemoryMetrics): MemoryRecommendation[] {
  const recommendations: MemoryRecommendation[] = []

  // Memory Fragmentation Analysis
  if (metrics.fragmentation > 0.8) {
    recommendations.push({
      message: "Critical memory fragmentation detected (>80%). Consider restarting applications or the system to consolidate memory.",
      severity: 'high',
      type: 'fragmentation'
    })
  } else if (metrics.fragmentation > 0.6) {
    recommendations.push({
      message: "Moderate memory fragmentation detected. Monitor for performance degradation and consider periodic restarts.",
      severity: 'medium',
      type: 'fragmentation'
    })
  } else if (metrics.fragmentation > 0.4) {
    recommendations.push({
      message: "Low memory fragmentation. System is managing memory efficiently.",
      severity: 'low',
      type: 'fragmentation'
    })
  }

  // Memory Pressure Analysis
  if (metrics.pressureScore > 0.85) {
    recommendations.push({
      message: "Critical memory pressure detected. Close unnecessary applications or upgrade RAM to prevent system instability.",
      severity: 'high',
      type: 'pressure'
    })
  } else if (metrics.pressureScore > 0.7) {
    recommendations.push({
      message: "High memory pressure. Consider closing background applications to free up memory.",
      severity: 'high',
      type: 'pressure'
    })
  } else if (metrics.pressureScore > 0.5) {
    recommendations.push({
      message: "Moderate memory usage. System has adequate memory but monitor for spikes.",
      severity: 'medium',
      type: 'pressure'
    })
  }

  // Swap Usage Analysis
  if (metrics.swapUsagePercent > 80) {
    recommendations.push({
      message: "Critical swap usage (>80%). System performance is severely degraded. Add more RAM or reduce workload.",
      severity: 'high',
      type: 'swap'
    })
  } else if (metrics.swapUsagePercent > 50) {
    recommendations.push({
      message: "High swap usage detected. This may cause performance issues. Consider adding more RAM.",
      severity: 'medium',
      type: 'swap'
    })
  } else if (metrics.swapUsagePercent > 20) {
    recommendations.push({
      message: "Moderate swap usage. System is using disk for memory overflow, which may slow performance.",
      severity: 'low',
      type: 'swap'
    })
  }

  // Page Fault Rate Analysis
  if (metrics.pageFaultRate > 1000) {
    recommendations.push({
      message: "Very high page fault rate detected. System is thrashing. Reduce memory-intensive applications immediately.",
      severity: 'high',
      type: 'pagefault'
    })
  } else if (metrics.pageFaultRate > 500) {
    recommendations.push({
      message: "High page fault rate. System is frequently accessing swap. Consider optimizing memory usage.",
      severity: 'medium',
      type: 'pagefault'
    })
  } else if (metrics.pageFaultRate > 100) {
    recommendations.push({
      message: "Moderate page fault rate. Normal for active systems but monitor for increases.",
      severity: 'low',
      type: 'pagefault'
    })
  }

  // Overall System Health
  if (recommendations.length === 0 || recommendations.every(r => r.severity === 'low')) {
    recommendations.push({
      message: "System memory health is good. All metrics are within optimal ranges.",
      severity: 'good' as any,
      type: 'overall'
    })
  }

  return recommendations
} 