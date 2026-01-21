"use client"

import * as React from "react"
import { SystemMemory } from "@/app/types/memory"
import { MemoryUsagePieChart } from "@/app/components/visualizations/MemoryUsagePieChart"
import { MemoryStatesBarChart } from "@/app/components/visualizations/MemoryStatesBarChart"
import { KernelMemoryChart } from "@/app/components/visualizations/KernelMemoryChart"
import { MemoryMetricsCard } from "@/app/components/visualizations/MemoryMetricsCard"
import { MemoryMonitoringChart } from "@/app/components/visualizations/MemoryMonitoringChart"

export function SystemMemoryView({ data }: { data: SystemMemory }) {
  // Keep track of historical data for the monitoring chart
  const [monitoringData, setMonitoringData] = React.useState(() => {
    const now = new Date()
    return Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(now.getTime() - (29 - i) * 1000).toISOString(),
      used_memory: data.total - data.available,
      available_memory: data.available,
      cached: data.cached,
      buffers: data.buffers,
    }))
  })

  // Update monitoring data when new data arrives
  React.useEffect(() => {
    setMonitoringData(prev => [...prev.slice(1), {
      timestamp: new Date().toISOString(),
      used_memory: data.total - data.available,
      available_memory: data.available,
      cached: data.cached,
      buffers: data.buffers,
    }])
  }, [data])

  return (
    <div className="space-y-4">
      <MemoryMonitoringChart data={monitoringData} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MemoryUsagePieChart total={data.total} available={data.available} />
        <MemoryStatesBarChart
          active={data.active}
          inactive={data.inactive}
          cached={data.cached}
          buffers={data.buffers}
        />
        <KernelMemoryChart
          slab={data.slab}
          kernelStack={data.kernelStack}
          pageTables={data.pageTables}
          vmallocUsed={data.vmallocUsed}
        />
        
      </div>

      {/* Replace existing cards with MemoryMetricsCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MemoryMetricsCard
          title="Core Memory"
          description="Primary memory metrics"
          metrics={[
            { label: "Total Memory", value: data.total },
            { label: "Free Memory", value: data.free },
            { label: "Available Memory", value: data.available },
            { label: "Buffers", value: data.buffers },
            { label: "Cached", value: data.cached },
          ]}
        />
        <MemoryMetricsCard
          title="Swap Memory"
          description="Virtual memory statistics"
          metrics={[
            { label: "Swap Total", value: data.swapTotal },
            { label: "Swap Free", value: data.swapFree },
            { label: "Swap Cached", value: data.swapCached },
          ]}
        />
        <MemoryMetricsCard
          title="Anonymous Memory"
          description="Process private memory"
          metrics={[
            { label: "Anonymous Pages", value: data.anonPages },
            { label: "Active Anonymous", value: data.activeAnon },
            { label: "Inactive Anonymous", value: data.inactiveAnon },
          ]}
        />
        <MemoryMetricsCard
          title="File Memory"
          description="File-backed memory"
          metrics={[
            { label: "Active File", value: data.activeFile },
            { label: "Inactive File", value: data.inactiveFile },
          ]}
        />
        <MemoryMetricsCard
          title="Kernel Memory"
          description="System memory usage"
          metrics={[
            { label: "Slab", value: data.slab },
            { label: "Kernel Stack", value: data.kernelStack },
            { label: "Page Tables", value: data.pageTables },
            { label: "VMalloc Used", value: data.vmallocUsed },
          ]}
        />
        <MemoryMetricsCard
          title="Page Faults"
          description="Memory page fault statistics"
          metrics={[
            { label: "Page Faults", value: data.pageFaults || 0 },
            { label: "Dirty Pages", value: data.dirty || 0 },
            { label: "Mapped Pages", value: data.mapped || 0 },
            { label: "Committed", value: data.committed || 0 },
          ]}
        />
      </div>
    </div>
  )
} 