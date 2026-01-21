"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { MemoryMetrics, MemoryRecommendation } from "@/app/types/analytics"
import { useEffect, useState, useRef } from "react"
import { useChat } from 'ai/react'
import { ScrollArea } from "@/components/ui/scroll-area"
import Markdown from 'react-markdown'

interface MemoryOptimizerProps {
  metrics: MemoryMetrics
}

export function MemoryOptimizer({ metrics }: MemoryOptimizerProps) {
  const [recommendations, setRecommendations] = useState<MemoryRecommendation[]>([])
  const chatInitialized = useRef(false)
  
  const { messages, isLoading, error, append } = useChat()

  useEffect(() => {
    const getRecommendations = async () => {
      if (chatInitialized.current) return
      
      try {
        chatInitialized.current = true
        await append({
          role: 'user',
          content: `Analyze these memory metrics and provide concise recommendations:
          - Memory Fragmentation: ${metrics.fragmentation * 100}%
          - Memory Pressure: ${metrics.pressureScore * 100}%
          - Swap Usage: ${metrics.swapUsagePercent}%
          - Page Fault Rate: ${metrics.pageFaultRate}/s
          
          Format: "- **[High/Medium/Low]**: Your recommendation here"`,
        })
      } catch (err) {
        setRecommendations(getBasicRecommendations(metrics))
      }
    }

    getRecommendations()
  }, [metrics, append])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        const lines = lastMessage.content.split('\n').filter(line => line.trim())
        const parsedRecommendations: MemoryRecommendation[] = lines.map(line => {
          const severityMatch = line.match(/\*\*(high|medium|low)\*\*/i)
          const severity = (severityMatch?.[1].toLowerCase() || 'medium') as 'high' | 'medium' | 'low'
          const message = line.replace(/\*\*\w+\*\*:?/, '').trim()
          
          return {
            message,
            severity,
            type: 'ai'
          }
        })
        
        setRecommendations(parsedRecommendations)
      }
    }
  }, [messages])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Optimization Recommendations
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-red-500 mb-4">{error.message}</p>
        )}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 pr-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 rounded-sm p-2 hover:bg-muted/50">
                {rec.severity === 'high' ? (
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                ) : rec.severity === 'medium' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                )}
                <Markdown 
                  className="text-sm prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-0"
                >
                  {rec.message}
                </Markdown>
              </div>
            ))}
            {!isLoading && recommendations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No optimization recommendations at this time.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Fallback basic recommendations
function getBasicRecommendations(metrics: MemoryMetrics): MemoryRecommendation[] {
  const recommendations: MemoryRecommendation[] = []

  if (metrics.fragmentation > 0.7) {
    recommendations.push({
      message: "High memory fragmentation detected. Consider compacting memory or restarting the application.",
      severity: 'high',
      type: 'fragmentation'
    })
  }

  if (metrics.pressureScore > 0.8) {
    recommendations.push({
      message: "System is under memory pressure. Consider freeing up memory or adding more RAM.",
      severity: 'high',
      type: 'pressure'
    })
  }

  if (metrics.swapUsagePercent > 80) {
    recommendations.push({
      message: "High swap usage detected. This may impact system performance.",
      severity: 'medium',
      type: 'swap'
    })
  }

  return recommendations
} 