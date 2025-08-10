// dog_walk_safety_app/components/settings-page.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Globe, Bell, Thermometer } from "lucide-react"
import type { AppState, Language, Unit } from "@/app/page"
import { useTranslation } from "./translations"
import { formatTemperature } from "@/lib/utils"

interface SettingsPageProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function SettingsPage({ appState, updateAppState }: SettingsPageProps) {
  const t = useTranslation(appState.language)

  const dangerTempDesc = t("dangerTempDesc").replace(
    '{temp}', 
    formatTemperature(35, appState.unit)
  );
  const walkTimeDesc = t("walkTimeDesc").replace(
    '{temp}', 
    formatTemperature(30, appState.unit)
  );

  const languages = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "ko" as Language, name: "한국어", flag: "🇰🇷" },
    { code: "ja" as Language, name: "日本語", flag: "🇯🇵" },
    { code: "zh" as Language, name: "中文", flag: "🇨🇳" },
  ]

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("settings")}</h2>
      
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t("notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t("dangerTempAlert")}</div>
              <div className="text-sm text-gray-600">{dangerTempDesc}</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t("walkTimeAlert")}</div>
              {/* ↓↓↓↓↓↓ この行に className を追加しました ↓↓↓↓↓↓ */}
              <div className="text-sm text-gray-600 whitespace-pre-line">{walkTimeDesc}</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Temperature Units */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            {t("units")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button 
            onClick={() => updateAppState({ unit: "C" })}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              appState.unit === "C" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">{t("celsius")}</span>
            {appState.unit === "C" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </button>

          <button 
            onClick={() => updateAppState({ unit: "F" })}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
              appState.unit === "F" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium">{t("fahrenheit")}</span>
            {appState.unit === "F" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </button>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => updateAppState({ language: lang.code })}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                appState.language === lang.code ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {appState.language === lang.code && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}