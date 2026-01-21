"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RefreshControlProps {
  isAutoRefresh: boolean
  onAutoRefreshChange: (enabled: boolean) => void
  onManualRefresh: () => void
  isRefreshing?: boolean
}

export function RefreshControl({
  isAutoRefresh,
  onAutoRefreshChange,
  onManualRefresh,
  isRefreshing = false
}: RefreshControlProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch
          id="auto-refresh"
          checked={isAutoRefresh}
          onCheckedChange={onAutoRefreshChange}
        />
        <Label 
          htmlFor="auto-refresh" 
          className="text-sm font-medium cursor-pointer"
        >
          {isAutoRefresh ? "Auto" : "Manual"}
        </Label>
      </div>
      
      {!isAutoRefresh && (
        <Button 
          onClick={onManualRefresh} 
          disabled={isRefreshing}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} />
          Refresh
        </Button>
      )}
    </div>
  )
}
