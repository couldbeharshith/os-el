"use client"

import { useEffect, useState } from 'react'
import { MemoryHierarchyData } from '@/app/types/memory'
import { MemoryHierarchyVisualizer } from '@/app/components/visualizations/MemoryHierarchyVisualizer'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"

export default function MemoryHierarchyPage() {
  const [data, setData] = useState<MemoryHierarchyData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/hierarchy')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  if (error) return <div>Error: {error}</div>

  return (
    <SidebarInset>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {data?.memory_regions && (
          <MemoryHierarchyVisualizer regions={data.memory_regions} />
        )}
      </div>
    </SidebarInset>
  )
} 