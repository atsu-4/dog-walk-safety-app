"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Thermometer, AlertTriangle, Mail } from "lucide-react"
import type { AppState } from "@/app/page"
import { useTranslation } from "./translations"
import { formatTemperature, toFahrenheit } from "@/lib/utils"

interface InfoPageProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function InfoPage({ appState }: InfoPageProps) {
  const t = useTranslation(appState.language)
  
  const getTempRange = (minC: number | null, maxC: number | null) => {
    if (appState.unit === "F") {
      const minF = minC !== null ? toFahrenheit(minC).toFixed(0) : null;
      const maxF = maxC !== null ? toFahrenheit(maxC).toFixed(0) : null;
      if (minF && maxF) return `${minF}-${maxF}°F`;
      if (minF) return `> ${minF}°F`;
      if (maxF) return `< ${maxF}°F`;
    }
    if (minC && maxC) return `${minC}-${maxC}°C`;
    if (minC) return `> ${minC}°C`;
    if (maxC) return `< ${maxC}°C`;
    return "";
  }

  // ↓↓↓↓↓↓ この関数を追加しました ↓↓↓↓↓↓
  const formatTemp = (tempC: number) => {
    if (appState.unit === 'F') {
        return `${toFahrenheit(tempC).toFixed(0)}°F`;
    }
    return `${tempC}°C`;
  }
//ok
  // ↓↓↓↓↓↓ safetyTips の1項目めを formatTemp を使うように変更しました ↓↓↓↓↓↓
  const safetyTips = {
    ko: [
      `노면 온도가 ${formatTemp(25)} 이하인 곳에서 산책하세요`,
      "뜨거운 노면은 개의 발바닥을 화상 입힐 수 있습니다",
      "그늘진 길이나 잔디 구역을 이용하세요",
      "물을 충분히 준비하고 자주 휴식을 취하세요",
      "개가 심하게 헐떡이거나 침을 흘리면 즉시 그늘로 이동시키세요",
    ],
    en: [
      `Please walk in areas where the road surface temperature is below ${formatTemp(25)}`,
      "Hot pavement can burn a dog's paw pads",
      "Use shaded paths and grassy areas",
      "Bring plenty of water and take frequent breaks",
      "If your dog is panting heavily or drooling, move your dog into the shade immediately",
    ],
    ja: [
      `路面温度が${formatTemp(25)}以下の場所を散歩してください`,
      "熱い路面は犬の肉球を火傷させる恐れがあります",
      "日陰の道や芝生エリアを利用してください",
      "十分な水を用意し、こまめに休憩を取りましょう",
      "犬が激しく息をしたりよだれを垂らしたら、すぐに日陰に移動してください",
    ],
    zh: [
      `建议在路面温度低于${formatTemp(25)}的区域散步`,
      "高温路面可能会烫伤狗狗的肉垫",
      "请使用阴凉的小路或草地区域",
      "请准备足够的饮用水，并适时休息",
      "如果狗狗呼吸急促或流口水，请立即将其转移到阴凉处",
    ],
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("info")}</h2>

      {/* About App */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" /> {t("appIntro")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{t("appDescription")}</p>
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            {t("safetyRules")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safetyTips[appState.language].map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Temperature Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-red-500" />
            {t("tempGuide")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{t("safe")}</Badge>
              <span className="font-medium text-green-800">{getTempRange(null, 25)}</span>
            </div>
            <p className="text-sm text-green-700">{t("safeDesc")}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{t("caution")}</Badge>
              <span className="font-medium text-yellow-800">{getTempRange(25, 35)}</span>
            </div>
            <p className="text-sm text-yellow-700">{t("cautionDesc")}</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive">{t("danger")}</Badge>
              <span className="font-medium text-red-800">{getTempRange(35, null)}</span>
            </div>
            <p className="text-sm text-red-700">{t("dangerDesc")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {t("emergencyResponse")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-1">{t("heatStrokeSymptoms")}</h4>
              <p className="text-sm text-orange-700">{t("heatStrokeDesc")}</p>
            </div>

            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-800 mb-1">{t("firstAid")}</h4>
              <p className="text-sm text-red-700">{t("firstAidDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            {t("contact")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>⭐ SP!ED2025 Team15 E.A.S.T.</p>
            <p>⭐ E.A.S.T.-East Asian Super Team </p>
            <p>⭐ Atsushi,Youbin,Jongbeom,Yeebin,Yuhee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}