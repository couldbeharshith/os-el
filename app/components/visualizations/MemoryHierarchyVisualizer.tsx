"use client"

import { MemoryRegionInfo } from "@/app/types/memory"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function MemoryHierarchyVisualizer({ regions }: { regions: MemoryRegionInfo[] }) {
  const getColorForType = (type: string) => {
    const colors = {
      'heap': 'bg-green-100 dark:bg-green-900',
      'stack': 'bg-blue-100 dark:bg-blue-900',
      'code': 'bg-yellow-100 dark:bg-yellow-900',
      'data': 'bg-purple-100 dark:bg-purple-900',
      'shared': 'bg-orange-100 dark:bg-orange-900',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-900'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {regions.map((region, i) => (
            <div 
              key={i}
              className={`p-4 rounded-lg border ${getColorForType(region.type)}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{region.type}</div>
                  <div className="text-sm font-mono">
                    {region.start_addr} - {region.end_addr}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{(region.size / 1024).toFixed(1)} KB</div>
                  <div className="text-xs font-mono">{region.permissions}</div>
                </div>
              </div>
              {region.mapped_file && (
                <div className="text-xs text-muted-foreground mt-2">
                  {region.mapped_file}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 