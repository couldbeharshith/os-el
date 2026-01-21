import { MemoryMetrics, TimelineData } from "@/app/types/analytics"
import { MemoryHealthIndicator } from "../monitoring/MemoryHealthIndicator"
import { MemoryTimelineChart } from "../visualizations/MemoryTimelineChart"
import { MemoryOptimizer } from "../analysis/MemoryOptimizer"
import { MemoryMapVisualizer } from "../visualizations/MemoryMapVisualizer"
import { ProcessMemoryEntry } from "@/app/types/memory"

interface MemoryAnalyticsProps {
  metrics: MemoryMetrics
  timelineData: TimelineData[]
  memoryEntries: ProcessMemoryEntry[]
}

export function MemoryAnalytics({ metrics, timelineData, memoryEntries }: MemoryAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemoryHealthIndicator metrics={metrics} />
        <MemoryOptimizer metrics={metrics} />
      </div>
      
      <MemoryTimelineChart data={timelineData} />
      
      <MemoryMapVisualizer entries={memoryEntries} />
    </div>
  )
} 