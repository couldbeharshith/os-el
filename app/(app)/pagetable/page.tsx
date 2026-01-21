"use client"

import { useEffect, useState } from 'react'
import { PageTableData } from '@/app/types/memory'
import { PageTableVisualizer } from '@/app/components/visualizations/PageTableVisualizer'
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/app/components/header/Header"

export default function PageTablePage() {
  const [data, setData] = useState<PageTableData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/pagetable')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  if (error) return <div>Error: {error}</div>

  return (
    <SidebarInset>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {data?.page_table && (
          <PageTableVisualizer entries={data.page_table} />
        )}
      </div>
    </SidebarInset>
  )
} 