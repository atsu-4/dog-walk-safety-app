// 서버 연결 상태를 표시하는 컴포넌트

"use client"

import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AppState } from "@/app/page"
import { useTranslation } from "./translations"

interface ConnectionStatusProps {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  onRefresh: () => void
  appState: AppState
}

export function ConnectionStatus({
  isConnected,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
  appState,
}: ConnectionStatusProps) {
  const t = useTranslation(appState.language)

  const getStatusColor = () => {
    if (isLoading) return "bg-blue-500"
    if (isConnected) return "bg-green-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (isLoading) return t("connecting")
    if (isConnected) return t("connected")
    return t("disconnected")
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return ""

    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds}${t("secondsAgo")}`
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60)
      return `${minutes}${t("minutesAgo")}`
    } else {
      return lastUpdated.toLocaleTimeString(
        appState.language === "ko"
          ? "ko-KR"
          : appState.language === "ja"
            ? "ja-JP"
            : appState.language === "zh"
              ? "zh-CN"
              : "en-US",
      )
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
          <Badge variant={isConnected ? "default" : "destructive"} className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </div>

        {lastUpdated && <span className="text-xs text-gray-500">{formatLastUpdated()}</span>}
      </div>

      <div className="flex items-center gap-2">
        {error && !isConnected && (
          <span className="text-xs text-red-600 max-w-32 truncate" title={error}>
            {error}
          </span>
        )}

        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="h-8 w-8 p-0">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  )
}
