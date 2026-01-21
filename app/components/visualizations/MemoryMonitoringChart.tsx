"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatMemory } from "@/app/utils/format"

const chartConfig = {
  memory: {
    label: "Memory",
    color: undefined,
  },
  used_memory: {
    label: "Used Memory",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  available_memory: {
    label: "Available Memory",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  cached: {
    label: "Cached",
    color: "hsl(280.6 83.2% 52.7%)",
  },
  buffers: {
    label: "Buffers",
    color: "hsl(47.9 95.8% 53.1%)",
  },
} satisfies Record<string, { label: string; color?: string }>

interface TimelineDataPoint {
  timestamp: string
  used_memory: number
  available_memory: number
  cached: number
  buffers: number
}

interface MemoryMonitoringChartProps {
  data: TimelineDataPoint[]
}

export function MemoryMonitoringChart({ data }: MemoryMonitoringChartProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Real-time Memory Usage</CardTitle>
          <CardDescription>
            Live monitoring of system memory allocation
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              {Object.entries(chartConfig).map(([key, config]) => {
                if (key === 'memory' || !config.color) return null
                return (
                  <linearGradient
                    key={key}
                    id={`fill${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={config.color}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor={config.color}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleTimeString()
              }}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={({ label, payload }) => {
                if (!payload?.length) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(label).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        {payload.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ background: entry.color }}
                              />
                              <span className="text-sm font-medium">
                                {chartConfig[entry.name as keyof typeof chartConfig]?.label}
                              </span>
                            </div>
                            <span className="text-sm tabular-nums">
                              {formatMemory(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            {Object.entries(chartConfig).map(([key, config]) => {
              if (key === 'memory' || !config.color) return null
              return (
                <Area
                  key={key}
                  dataKey={key}
                  type="monotone"
                  fill={`url(#fill${key})`}
                  stroke={config.color}
                  strokeWidth={2}
                />
              )
            })}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 