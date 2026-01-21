"use client"

import { ProcessMemoryEntry } from "@/app/types/memory"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function MemoryMapVisualizer({ entries }: { entries: ProcessMemoryEntry[] }) {
  const sortedEntries = [...entries].sort((a, b) => 
    parseInt(a.address, 16) - parseInt(b.address, 16)
  )

  // Calculate positions with compressed gaps
  const calculatePositions = () => {
    const totalSize = entries.reduce((sum, entry) => sum + entry.kbytes, 0)
    const positions = new Map<string, { position: number, height: number }>()
    let currentPosition = 0

    sortedEntries.forEach((entry, i) => {
      const nextEntry = sortedEntries[i + 1]
      const currentAddress = parseInt(entry.address, 16)
      const nextAddress = nextEntry ? parseInt(nextEntry.address, 16) : currentAddress

      // Calculate gap size
      const gap = nextEntry ? nextAddress - (currentAddress + entry.kbytes * 1024) : 0
      
      // Use a smaller fixed size for gaps (e.g., 5% of total height)
      const gapHeight = gap > 0 ? 5 : 0
      
      // Calculate segment height proportional to its size but with minimum height
      const height = Math.max((entry.kbytes / totalSize) * 95, 2) // 95% of space for actual segments

      positions.set(entry.address, {
        position: currentPosition,
        height
      })

      currentPosition += height + gapHeight
    })

    return positions
  }

  const positions = calculatePositions()

  // Color mapping for different memory permissions
  const getColorForPermissions = (mode: string | undefined) => {
    if (!mode) return 'bg-gray-100 dark:bg-gray-900'
    
    const colors: Record<string, string> = {
      'r-x': 'bg-blue-100 dark:bg-blue-900',    // Code (executable)
      'rw-': 'bg-green-100 dark:bg-green-900',  // Data (read-write)
      'r--': 'bg-yellow-100 dark:bg-yellow-900', // Read-only
      '---': 'bg-gray-100 dark:bg-gray-900',    // No access
    }
    
    const modePrefix = mode.slice(0, 3)
    return colors[modePrefix] || 'bg-gray-100 dark:bg-gray-900'
  }

  const formatSize = (kbytes: number) => {
    if (kbytes < 1024) return `${kbytes} KB`
    return `${(kbytes / 1024).toFixed(1)} MB`
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory Address Space</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            {/* Memory regions list */}
            <div className="w-full max-w-xs space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                Memory Regions
              </div>
              {sortedEntries.map((entry, i) => (
                <div 
                  key={i}
                  className={`relative p-3 rounded-lg border transition-colors ${getColorForPermissions(entry.mode)}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono">
                      {entry.address}
                    </div>
                    <div className="text-xs font-medium">
                      {formatSize(entry.kbytes)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {entry.mapping || 'Anonymous'}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {entry.mode}
                  </div>
                </div>
              ))}
            </div>

            {/* Visual memory map */}
            <div className="flex-1 relative h-[calc(100vh-200px)] border rounded-lg p-2">
              <div className="absolute inset-0 overflow-auto">
                {sortedEntries.map((entry, i) => {
                  const pos = positions.get(entry.address)
                  if (!pos) return null

                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`absolute w-full transition-all ${getColorForPermissions(entry.mode)}`}
                          style={{
                            height: `${pos.height}%`,
                            top: `${pos.position}%`,
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono opacity-0 hover:opacity-100 truncate px-2">
                            {entry.address}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-medium">{entry.address}</div>
                          <div>{formatSize(entry.kbytes)}</div>
                          <div>{entry.mapping || 'Anonymous'}</div>
                          <div>Permissions: {entry.mode}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              {/* Address markers */}
              <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs font-mono text-muted-foreground">
                <div>{sortedEntries[0]?.address}</div>
                <div>{sortedEntries[Math.floor(sortedEntries.length / 2)]?.address}</div>
                <div>{sortedEntries[sortedEntries.length - 1]?.address}</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900" />
              <span>Executable (r-x)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900" />
              <span>Read-Write (rw-)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900" />
              <span>Read-Only (r--)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
} 