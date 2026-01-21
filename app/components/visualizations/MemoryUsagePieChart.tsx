"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
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
  memory: {
    label: "Memory",
  },
  used_memory: {
    label: "Used Memory",
    color: "hsl(var(--chart-1))",
  },
  available_memory: {
    label: "Available Memory",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface MemoryUsagePieChartProps {
  total: number
  available: number
}

export function MemoryUsagePieChart({ total, available }: MemoryUsagePieChartProps) {
  const usedMemory = total - available
  const usedPercentage = ((usedMemory / total) * 100).toFixed(1)

  const pieChartData = [
    { memory: "used_memory", value: usedMemory, fill: "var(--color-used_memory)" },
    { memory: "available_memory", value: available, fill: "var(--color-available_memory)" },
  ]

  const totalMemory = React.useMemo(() => total, [total])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Memory Usage</CardTitle>
        <CardDescription>Current memory distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={pieChartData}
              dataKey="value"
              nameKey="memory"
              innerRadius={60}
              strokeWidth={5}
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
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {formatMemory(usedMemory)} in use <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total memory: {formatMemory(totalMemory)}
        </div>
      </CardFooter>
    </Card>
  )
} 