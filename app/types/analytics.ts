export interface MemoryMetrics {
  fragmentation: number
  pageFaultRate: number
  pressureScore: number
  swapUsagePercent: number
  majorFaults: number
  minorFaults: number
}

export interface TimelineData {
  timestamp: number
  used_memory: number
  available_memory: number
  pageFaults: number
}

export interface MemoryRecommendation {
  message: string
  severity: 'high' | 'medium' | 'low'
  type: string
} 