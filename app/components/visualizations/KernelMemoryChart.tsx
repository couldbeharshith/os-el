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
} from "@/components/ui/chart"
import { formatMemory } from "@/app/utils/format"

const chartConfig = {
  slab: {
    label: "Slab",
    color: "hsl(var(--chart-1))", // Same as used_memory
  },
  kernelStack: {
    label: "Kernel Stack",
    color: "hsl(var(--chart-2))", // Same as available_memory
  },
  pageTables: {
    label: "Page Tables",
    color: "hsl(var(--chart-3))", // Same as cached
  },
  vmallocUsed: {
    label: "VMalloc Used",
    color: "hsl(var(--chart-4))", // Same as buffers
  },
} satisfies ChartConfig

interface KernelMemoryChartProps {
  slab: number
  kernelStack: number
  pageTables: number
  vmallocUsed: number
}

export function KernelMemoryChart({ slab, kernelStack, pageTables, vmallocUsed }: KernelMemoryChartProps) {
  const barChartData = [
    { name: "Slab", value: slab, fill: chartConfig.slab.color },
    { name: "Kernel Stack", value: kernelStack, fill: chartConfig.kernelStack.color },
    { name: "Page Tables", value: pageTables, fill: chartConfig.pageTables.color },
    { name: "VMalloc", value: vmallocUsed, fill: chartConfig.vmallocUsed.color },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kernel Memory</CardTitle>
        <CardDescription>Kernel memory allocation</CardDescription>
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
          Slab memory: {formatMemory(slab)}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing kernel memory allocations
        </div>
      </CardFooter>
    </Card>
  )
} 