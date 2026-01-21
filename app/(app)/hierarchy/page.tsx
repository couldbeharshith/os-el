"use client"

import { useEffect, useState, useRef } from 'react'
import { MemoryHierarchyData } from '@/app/types/memory'
import { MemoryHierarchyVisualizer } from '@/app/components/visualizations/MemoryHierarchyVisualizer'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"
import { RefreshControl } from "@/app/components/header/RefreshControl"

export default function MemoryHierarchyPage() {
  const [data, setData] = useState<MemoryHierarchyData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/hierarchy')
      if (!res.ok) throw new Error('Failed to fetch hierarchy data')
      const newData = await res.json()
      setData(newData)
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
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Hierarchy</h2>
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
        {data?.memory_regions && (
          <MemoryHierarchyVisualizer regions={data.memory_regions} />
        )}
      </div>
    </SidebarInset>
  )
} 