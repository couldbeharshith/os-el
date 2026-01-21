'use server'

import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { MemoryMetrics } from '@/app/types/analytics'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function analyzeMemoryUsage(metrics: MemoryMetrics) {
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a memory optimization expert. Analyze system memory metrics and provide actionable recommendations.
    Always format your recommendations with severity levels (high/medium/low).
    Focus on practical steps to improve memory performance.
    If the metrics are within normal ranges, acknowledge the healthy state.
    Keep responses concise and technical.`,
    messages: [{
      role: 'user',
      content: `Current metrics:
      - Memory Fragmentation: ${metrics.fragmentation * 100}%
      - Memory Pressure: ${metrics.pressureScore * 100}%
      - Swap Usage: ${metrics.swapUsagePercent}%
      - Page Fault Rate: ${metrics.pageFaultRate}/s`
    }]
  })

  return result.toDataStreamResponse()
} 