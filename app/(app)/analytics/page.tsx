'use client'

import { useEffect, useState, useRef } from 'react'
import { MemoryMetrics, TimelineData } from '@/app/types/analytics'
import { MemoryHealthIndicator } from '@/app/components/monitoring/MemoryHealthIndicator'
import { MemoryTimelineChart } from '@/app/components/visualizations/MemoryTimelineChart'
import { MemoryOptimizer } from '@/app/components/analysis/MemoryOptimizer'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"
import { RefreshControl } from "@/app/components/header/RefreshControl"

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MemoryMetrics | null>(null)
  const [initialMetrics, setInitialMetrics] = useState<MemoryMetrics | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
    
    if (isAutoRefresh) {
      intervalRef.current = setInterval(fetchData, 5000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoRefresh])

  const handleAutoRefreshChange = (enabled: boolean) => {
    setIsAutoRefresh(enabled)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const refreshControl = (
    <RefreshControl
      isAutoRefresh={isAutoRefresh}
      onAutoRefreshChange={handleAutoRefreshChange}
      onManualRefresh={fetchData}
      isRefreshing={loading}
    />
  )

  if (error) {
    return (
      <SidebarInset>
        <Header action={refreshControl} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Analytics</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <Header action={refreshControl} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {metrics && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
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