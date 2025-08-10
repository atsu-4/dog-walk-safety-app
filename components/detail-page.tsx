// dog_walk_safety_app/components/detail-page.tsx

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Thermometer, Sun, Droplets, AlertTriangle, CheckCircle, XCircle, Lightbulb } from "lucide-react"
import type { AppState } from "@/app/page"
import { useTranslation } from "./translations"
import { formatTemperature } from "@/lib/utils"

interface DetailPageProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function DetailPage({ appState }: DetailPageProps) {
  const t = useTranslation(appState.language)

  const getWalkStatus = (temp: number) => {
    if (temp <= 25) return "safe"
    if (temp <= 35) return "caution"
    return "danger"
  }
  const status = getWalkStatus(appState.asphaltTemp)
  const statusConfig = {
    safe: { color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700", icon: CheckCircle, badge: "default" as const, message: t("safeMessage"), },
    caution: { color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700", icon: AlertTriangle, badge: "secondary" as const, message: t("cautionMessage"), },
    danger: { color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700", icon: XCircle, badge: "destructive" as const, message: t("dangerMessage"), },
  }
  const StatusIcon = statusConfig[status].icon

  const CAUTION_THRESHOLD = 25;
  const DANGER_THRESHOLD = 35;
  const MAX_TEMP = 50;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("detailInfo")}</h2>

      {/* 1. 危険度ステータスカード */}
      <Card className={`border-2 ${statusConfig[status].bgColor}`}>
        <CardContent className="p-6">
            <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center p-3 rounded-full ${statusConfig[status].color} text-white`}>
                <StatusIcon className="w-6 h-6" />
            </div>
            <div>
                <Badge variant={statusConfig[status].badge} className="text-md px-3 py-1">
                    {t(status)}
                </Badge>
                <p className={`mt-1 font-medium ${statusConfig[status].textColor}`}>{statusConfig[status].message}</p>
            </div>
            </div>
        </CardContent>
      </Card>
      
      {/* 2. 詳細データカード */}
      <Card>
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
              <span className="text-md font-medium text-gray-700">{t("asphaltTemp")}</span>
            </div>
            <div className="text-4xl font-bold text-red-600 mb-3">{formatTemperature(appState.asphaltTemp, appState.unit)}</div>
            <div className="relative pt-2">
              <Progress value={(appState.asphaltTemp / MAX_TEMP) * 100} className="h-2" />
              <div 
                className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-yellow-500"
                style={{ left: `${(CAUTION_THRESHOLD / MAX_TEMP) * 100}%` }}
              ></div>
              <div 
                className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-red-500"
                style={{ left: `${(DANGER_THRESHOLD / MAX_TEMP) * 100}%` }}
              ></div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 divide-x">
             <div className="p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-orange-500" />
                    {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                    <span className="text-md font-medium text-gray-600">{t("airTemp")}</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{formatTemperature(appState.airTemp, appState.unit)}</div>
             </div>
             <div className="p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span className="text-md font-medium text-gray-600">{t("humidity")}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{appState.humidity.toFixed(0)}%</div>
             </div>
          </div>
          
          <Separator />
          <div className="p-5 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-gray-500" />
                {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                <h3 className="text-md font-semibold text-gray-800">{t("sevenSecondTestTitle")}</h3>
            </div>
            {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
            <p className="text-sm text-gray-600 leading-relaxed">
                {t("sevenSecondTestDesc")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}