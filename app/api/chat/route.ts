import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a memory optimization expert. Analyze system memory metrics and provide actionable recommendations.
    Always format your recommendations with severity levels (high/medium/low).
    Focus on practical steps to improve memory performance.
    If the metrics are within normal ranges, acknowledge the healthy state.
    Keep responses concise and technical.`,
    messages,
  })

  return result.toDataStreamResponse()
} 