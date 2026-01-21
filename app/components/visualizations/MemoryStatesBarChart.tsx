"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
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
import { formatMemory } from "@/app/utils/format"

const chartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-2))",
  },
  cached: {
    label: "Cached",
    color: "hsl(var(--chart-3))",
  },
  buffers: {
    label: "Buffers",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

interface MemoryStatesBarChartProps {
  active: number
  inactive: number
  cached: number
  buffers: number
}

export function MemoryStatesBarChart({ active, inactive, cached, buffers }: MemoryStatesBarChartProps) {
  const barChartData = [
    { name: "Active", value: active, fill: chartConfig.active.color },
    { name: "Inactive", value: inactive, fill: chartConfig.inactive.color },
    { name: "Cached", value: cached, fill: chartConfig.cached.color },
    { name: "Buffers", value: buffers, fill: chartConfig.buffers.color },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory States</CardTitle>
        <CardDescription>Distribution of memory states</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={(value: number) => formatMemory(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={80}
            />
            <ChartTooltip
              cursor={false}
              content={({ label, payload }) => {
                if (!payload?.[0]) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-sm">
                        {formatMemory(payload[0].value as number)}
                      </p>
                    </div>
                  </div>
                )
              }}
            />
            <Bar 
              dataKey="value" 
              radius={4}
              fill="var(--color-active)"
              fillOpacity={0.9}
              stroke="none"
            >
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Active memory: {formatMemory(active)}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing distribution of different memory states
        </div>
      </CardFooter>
    </Card>
  )
} 