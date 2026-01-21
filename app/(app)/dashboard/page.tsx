'use client'

import { useEffect, useState, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemMemoryView } from '@/app/components/memory/SystemMemoryView'
import { ProcessMemoryView } from '@/app/components/memory/ProcessMemoryView'
import { MemoryMappingView } from '@/app/components/memory/MemoryMappingView'
import { MemoryMapVisualizer } from '@/app/components/visualizations/MemoryMapVisualizer'
import { MemoryData } from '@/app/types/memory'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"
import { RefreshControl } from "@/app/components/header/RefreshControl"

const refreshInterval = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '5000')

export default function Dashboard() {
  const [data, setData] = useState<MemoryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('system')
  const [loading, setLoading] = useState(true)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/memory')
      if (!response.ok) {
        throw new Error('Failed to fetch memory data')
      }
      const newData = await response.json()
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
      intervalRef.current = setInterval(fetchData, refreshInterval)
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
            <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Memory Data</h2>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="mapping">Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6">
            {data?.systemMemory && <SystemMemoryView data={data.systemMemory} />}
          </TabsContent>

          <TabsContent value="process" className="mt-6">
            {data?.processMemory && <ProcessMemoryView data={data.processMemory} />}
          </TabsContent>

          <TabsContent value="mapping" className="mt-6">
            {data?.memoryMappings && (
              <div className="space-y-6">
                <MemoryMappingView data={data.memoryMappings} />
                <MemoryMapVisualizer entries={data.processMemory?.entries || []} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
} 