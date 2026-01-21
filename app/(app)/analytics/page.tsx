'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { MemoryMetrics, TimelineData } from '@/app/types/analytics'
import { MemoryHealthIndicator } from '@/app/components/monitoring/MemoryHealthIndicator'
import { MemoryTimelineChart } from '@/app/components/visualizations/MemoryTimelineChart'
import { MemoryOptimizer } from '@/app/components/analysis/MemoryOptimizer'
import { Loader2 } from "lucide-react"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/app/components/header/Header"

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null)
  const [initialMetrics, setInitialMetrics] = useState<MemoryMetrics | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()

      setMetrics(data)
      if (!initialMetrics) {
        setInitialMetrics(data)
      }
      
      setTimelineData(prevData => [...prevData, {
        timestamp: Date.now(),
        used_memory: data.memory_usage || 0,
        available_memory: data.free_memory || 0,
        pageFaults: data.majorFaults + data.minorFaults
      }].slice(-30))

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const refreshButton = (
    <Button onClick={fetchData} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : 'Refresh Data'}
    </Button>
  )

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <h2 className="text-red-800 dark:text-red-200">Error</h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    )
  }

  return (
    <SidebarInset>
      <Header action={refreshButton} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {metrics && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <MemoryHealthIndicator metrics={metrics} />
              {initialMetrics && <MemoryOptimizer metrics={initialMetrics} />}
            </div>
            <MemoryTimelineChart data={timelineData} />
          </>
        )}
      </div>
    </SidebarInset>
  )
} 