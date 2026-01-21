"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatMemory } from "@/app/utils/format"

interface MetricItem {
  label: string
  value: number
}

interface MemoryMetricsCardProps {
  title: string
  description: string
  metrics: MetricItem[]
}

export function MemoryMetricsCard({ title, description, metrics }: MemoryMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between">
            <span>{metric.label}:</span>
            <span className="font-mono">{formatMemory(metric.value)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 