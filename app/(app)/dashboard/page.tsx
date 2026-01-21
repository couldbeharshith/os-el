'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { SystemMemoryView } from '@/app/components/memory/SystemMemoryView'
import { ProcessMemoryView } from '@/app/components/memory/ProcessMemoryView'
import { MemoryMappingView } from '@/app/components/memory/MemoryMappingView'
import { MemoryMapVisualizer } from '@/app/components/visualizations/MemoryMapVisualizer'
import { MemoryData } from '@/app/types/memory'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"
import { Loader2 } from "lucide-react"

const refreshInterval = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL!)

export default function Dashboard() {
  const [data, setData] = useState<MemoryData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('system')
  const [loading, setLoading] = useState(true)

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
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [])

  const refreshButton = (
    <Button onClick={fetchData} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : 'Refresh Data'}
    </Button>
  )

  if (error) {
    return (
      <SidebarInset>
        <Header action={refreshButton} />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <h2 className="text-red-800 dark:text-red-200">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <Header action={refreshButton} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system">System Memory</TabsTrigger>
            <TabsTrigger value="process">Process Memory</TabsTrigger>
            <TabsTrigger value="mapping">Memory Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            {data?.systemMemory && <SystemMemoryView data={data.systemMemory} />}
          </TabsContent>

          <TabsContent value="process">
            {data?.processMemory && <ProcessMemoryView data={data.processMemory} />}
          </TabsContent>

          <TabsContent value="mapping">
            {data?.memoryMappings && (
              <div className="space-y-4">
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