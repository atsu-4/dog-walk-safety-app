// dog_walk_safety_app/components/main-dashboard.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Thermometer, AlertTriangle, CheckCircle, XCircle, ChevronRight, Footprints, PlaySquare, Square } from "lucide-react"
import type { AppState } from "@/app/page"
import { useTranslation } from "./translations"
import { formatTemperature } from "@/lib/utils"

interface MainDashboardProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
  toggleWalkState: () => void
}

export function MainDashboard({ appState, updateAppState, toggleWalkState }: MainDashboardProps) {
  const t = useTranslation(appState.language)
  const [displayTime, setDisplayTime] = useState("")
  const [isConfirmingStop, setIsConfirmingStop] = useState(false)

  useEffect(() => {
    if (!appState.isWalking) {
      setIsConfirmingStop(false);
    }
  }, [appState.isWalking]);


  useEffect(() => {
    setDisplayTime(
      appState.lastUpdated.toLocaleTimeString(
        appState.language === "ko"
          ? "ko-KR"
          : appState.language === "ja"
            ? "ja-JP"
            : appState.language === "zh"
              ? "zh-CN"
              : "en-US",
      )
    )
  }, [appState.lastUpdated, appState.language])

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

  // ↓↓↓↓↓↓ この部分を前回の会話で決定した多言語対応の内容に更新しました ↓↓↓↓↓↓
  const recommendations = {
    safe: { ja: ["こまめに水分補給をしましょう", "ゆったり散歩を楽しみましょう", "公園を活用しましょう"], en: ["Stay hydrated with frequent water breaks", "Enjoy a relaxed walk", "Take advantage of parks"], ko: ["자주 물을 마시게 해주세요", "여유롭게 산책을 즐기세요", "공원을 적극 활용하세요"], zh: ["及时补充水分", "轻松地享受散步吧", "多利用公园"] },
    caution: { ja: ["日陰や芝生で散歩しましょう", "散歩は15〜20分以内にしましょう", "肉球を守るための靴やバームを使いましょう"], en: ["Walk in shaded areas or on grass", "Keep walks to 15–20 minutes", "Use boots or paw balm to protect your dog’s paws"], ko: ["그늘이나 잔디밭에서 산책하세요", "산책은 15~20분 이내로 하세요", "강아지 발을 보호하는 신발이나 발 패드 전용 밤을 사용하세요"], zh: ["在阴凉处或草地散步", "散步时间控制在15-20分钟内", "使用鞋子或护掌膏保护狗狗的脚掌"] },
    danger: { ja: ["すぐに涼しい場所へ移動しましょう", "路面温度が高く、散歩に適していません", "火傷の恐れがあります"], en: ["Move to a cool place immediately", "Pavement temperature is too high for walking", "There is a risk of burns"], ko: ["바로 시원한 곳으로 이동하세요", "노면 온도가 높아 산책하기 적합하지 않습니다", "화상의 위험이 있습니다"], zh: ["立即移到凉爽的地方", "路面温度过高，不适合散步", "有烫伤风险"] },
  }
  // ↑↑↑↑↑↑ これは翻訳ok ↑↑↑↑↑↑
  
  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* ====================================================================== */}
      {/* 1. 危険度ステータスカード */}
      {/* ====================================================================== */}
      <Card className={`border-2 ${statusConfig[status].bgColor}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className={`inline-flex p-4 rounded-full ${statusConfig[status].color} text-white mb-4`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <Badge variant={statusConfig[status].badge} className="text-lg px-4 py-2 mb-3">
              {t(status)}
            </Badge>
            <p className={`text-lg font-medium ${statusConfig[status].textColor}`}>{statusConfig[status].message}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* ====================================================================== */}
      {/* 2. 温度カード & 散歩開始ボタン / 散歩中タイマー */}
      {/* ====================================================================== */}
      {appState.isWalking ? (
        // ★★★ 散歩中の表示 ★★★
        <>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center justify-between">
              {isConfirmingStop ? (
                // ★★★ インライン終了確認UI ★★★
                <div className="w-full flex flex-col items-center">
                  {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                  <p className="text-sm font-medium text-white mb-3">{t("confirmEndWalk")}</p>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={toggleWalkState}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-10 px-6"
                    >
                      {t("yes")}
                    </Button>
                    <Button 
                      onClick={() => setIsConfirmingStop(false)}
                      className="bg-gray-600 hover:bg-gray-500 text-white rounded-lg h-10 px-6"
                    >
                      {t("no")}
                    </Button>
                  </div>
                </div>
              ) : (
                // ★★★ 通常のタイマー表示 ★★★
                <>
                  <div className="text-left">
                    {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                    <p className="text-sm font-medium text-gray-400">{t("walkTime")}</p>
                    <p className="text-4xl font-semibold text-white tracking-wider">
                      {formatDuration(appState.walkDuration)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsConfirmingStop(true)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg w-28 h-14"
                  >
                    <Square className="w-6 h-6 mr-2" />
                    {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                    <span className="text-lg font-bold">{t("end")}</span>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-600">{t("asphaltTemp")}</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-2">{formatTemperature(appState.asphaltTemp, appState.unit)}</div>
              <div className="relative pt-2">
                <Progress value={Math.min((appState.asphaltTemp / 50) * 100, 100)} className="h-2" />
                {/* ↓↓↓↓↓↓ title 属性を削除しました ↓↓↓↓↓↓ */}
                <div 
                  className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-yellow-500"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                ></div>
                {/* ↓↓↓↓↓↓ title 属性を削除しました ↓↓↓↓↓↓ */}
                <div 
                  className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-red-500"
                  style={{ left: '70%', transform: 'translateX(-50%)' }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // ★★★ 散歩開始前の表示 ★★★
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-600">{t("asphaltTemp")}</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-2">{formatTemperature(appState.asphaltTemp, appState.unit)}</div>
              <div className="relative pt-2">
                <Progress value={Math.min((appState.asphaltTemp / 50) * 100, 100)} className="h-2" />
                {/* ↓↓↓↓↓↓ title 属性を削除しました ↓↓↓↓↓↓ */}
                <div 
                  className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-yellow-500"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                ></div>
                {/* ↓↓↓↓↓↓ title 属性を削除しました ↓↓↓↓↓↓ */}
                <div 
                  className="absolute bottom-2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-red-500"
                  style={{ left: '70%', transform: 'translateX(-50%)' }}
                ></div>
              </div>
            </CardContent>
          </Card>
          <Card 
            onClick={toggleWalkState}
            className="bg-green-500 border-green-600 text-white cursor-pointer hover:bg-green-600 active:bg-green-700 transition-all flex flex-col justify-center items-center"
          >
            <CardContent className="p-2 text-center">
                <PlaySquare className="w-8 h-8 mx-auto" />
                {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                <p className="text-lg font-bold mt-2">{t("startWalk")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. 推奨事項カード */}
      {/* ====================================================================== */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">{t("recommendations")}</h3>
          <div className="space-y-2">
            {recommendations[status as keyof typeof recommendations][appState.language as keyof typeof recommendations[typeof status]].map((rec, index) => (
              <div key={index} className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ====================================================================== */}
      {/* 4. 詳細を見るボタン */}
      {/* ====================================================================== */}
      <Button onClick={() => updateAppState({ currentPage: "detail" })} className="w-full" variant="outline">
        {t("viewDetails")}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>

      {/* ====================================================================== */}
      {/* 5. 最終更新時刻 */}
      {/* ====================================================================== */}
      <p className="text-xs text-gray-500 text-center">
        {t("lastUpdated")}: {displayTime}
      </p>

    </div>
  )
}