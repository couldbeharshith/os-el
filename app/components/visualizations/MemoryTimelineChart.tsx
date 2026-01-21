"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TimelineData } from "@/app/types/analytics"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { MemoryPieChart } from "./MemoryPieChart"

interface MemoryTimelineChartProps {
  data: TimelineData[]
}

const chartConfig = {
  used_memory: {
    label: "Used Memory",
    color: "hsl(var(--chart-1))",
  },
  available_memory: {
    label: "Available Memory",
    color: "hsl(var(--chart-2))",
  },
  pageFaults: {
    label: "Page Faults",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const COLORS = {
  used: "hsl(221.2 83.2% 53.3%)",    // blue-600
  available: "hsl(142.1 76.2% 36.3%)" // green-600
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function MemoryTimelineChart({ data }: MemoryTimelineChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
    used_memory: Number((item.used_memory / (1024 * 1024 * 1024)).toFixed(2)),
    available_memory: Number((item.available_memory / (1024 * 1024 * 1024)).toFixed(2)),
  }))

  // Prepare pie chart data
  const latestData = data[data.length - 1]
  const totalMemory = latestData.used_memory + latestData.available_memory
  const pieData = [
    { 
      name: "Used Memory",
      value: latestData.used_memory,
      percentage: ((latestData.used_memory / totalMemory) * 100).toFixed(1),
    },
    { 
      name: "Available Memory",
      value: latestData.available_memory,
      percentage: ((latestData.available_memory / totalMemory) * 100).toFixed(1),
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Memory Usage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              data={formattedData}
              height={300}
              margin={{ top: 16, right: 32, bottom: 32, left: 32 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}GB`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="natural"
                dataKey="used_memory"
                stroke="var(--color-used_memory)"
                fill="var(--color-used_memory)"
                fillOpacity={0.4}
              />
              <Area
                type="natural"
                dataKey="available_memory"
                stroke="var(--color-available_memory)"
                fill="var(--color-available_memory)"
                fillOpacity={0.4}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Memory Distribution Pie Chart */}
      <MemoryPieChart data={data[data.length - 1]} />

      {/* Page Faults Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Faults</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ pageFaults: chartConfig.pageFaults }}>
            <AreaChart
              data={formattedData}
              height={300}
              margin={{ top: 16, right: 32, bottom: 32, left: 32 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}/s`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="natural"
                dataKey="pageFaults"
                stroke="var(--color-pageFaults)"
                fill="var(--color-pageFaults)"
                fillOpacity={0.4}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Memory Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              data={formattedData}
              height={300}
              margin={{ top: 16, right: 32, bottom: 32, left: 32 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}GB`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="natural"
                dataKey="used_memory"
                stroke="var(--color-used_memory)"
                fill="var(--color-used_memory)"
                fillOpacity={0.4}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
} 