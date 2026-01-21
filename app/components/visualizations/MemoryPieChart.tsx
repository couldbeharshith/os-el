"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer } from "recharts"
import { TimelineData } from "@/app/types/analytics"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface MemoryPieChartProps {
  data: TimelineData
}

const chartConfig = {
  memory: {
    label: "Memory",
  },
  used: {
    label: "Used Memory",
    color: "hsl(var(--chart-1))",
  },
  available: {
    label: "Available Memory",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function MemoryPieChart({ data }: MemoryPieChartProps) {
  const totalMemory = data.used_memory + data.available_memory
  const usedPercentage = ((data.used_memory / totalMemory) * 100).toFixed(1)

  const chartData = [
    { 
      type: "used",
      memory: data.used_memory,
      fill: chartConfig.used.color,
    },
    { 
      type: "available",
      memory: data.available_memory,
      fill: chartConfig.available.color,
    },
  ]

  const totalMemoryGB = React.useMemo(() => {
    return formatBytes(totalMemory)
  }, [totalMemory])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Memory Distribution</CardTitle>
        <CardDescription>Current memory usage</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="memory"
                nameKey="type"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {usedPercentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Used
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total Memory: {totalMemoryGB} <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          {formatBytes(data.used_memory)} in use, {formatBytes(data.available_memory)} available
        </div>
      </CardFooter>
    </Card>
  )
} 