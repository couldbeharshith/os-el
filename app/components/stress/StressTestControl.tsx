"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Square, Zap } from "lucide-react"

interface StressConfig {
  CHUNK_SIZE_MB: number
  CAP_LIMIT_MB: number
  ALLOCATION_INTERVAL_MS: number
}

export function StressTestControl() {
  const [status, setStatus] = useState<'running' | 'stopped'>('stopped')
  const [pid, setPid] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<StressConfig>({
    CHUNK_SIZE_MB: 150,
    CAP_LIMIT_MB: 2550,
    ALLOCATION_INTERVAL_MS: 800
  })

  const intervalSeconds = config.ALLOCATION_INTERVAL_MS / 1000

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/stress')
      const data = await res.json()
      setStatus(data.status)
      setPid(data.pid)
      if (data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error('Failed to check stress status:', err)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
      const data = await res.json()
      setStatus(data.status === 'started' ? 'running' : status)
      setPid(data.pid)
      if (data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error('Failed to start stress test:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })
      const data = await res.json()
      setStatus(data.status === 'stopped' ? 'stopped' : status)
      setPid(null)
    } catch (err) {
      console.error('Failed to stop stress test:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Memory Stress Test
            </CardTitle>
            <CardDescription>
              Simulate high memory usage for demonstration
            </CardDescription>
          </div>
          <Badge variant={status === 'running' ? 'default' : 'secondary'}>
            {status === 'running' ? (
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 animate-pulse" />
                Running
              </span>
            ) : (
              'Stopped'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pid && (
            <div className="text-sm text-muted-foreground">
              Process ID: <code className="bg-muted px-2 py-1 rounded">{pid}</code>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleStart}
              disabled={status === 'running' || loading}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Stress Test
            </Button>
            <Button
              onClick={handleStop}
              disabled={status === 'stopped' || loading}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop & Release
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Allocates memory in {config.CHUNK_SIZE_MB}MB chunks every {intervalSeconds} second{intervalSeconds !== 1 ? 's' : ''}</li>
              <li>Caps at {config.CAP_LIMIT_MB}MB to prevent system issues</li>
              <li>Watch memory usage increase in real-time</li>
              <li>Stop button releases all allocated memory</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
