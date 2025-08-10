"use client"

import { Home, BarChart3, Clock, Settings, Info } from "lucide-react"
import type { AppState, Page } from "@/app/page"
import { useTranslation } from "./translations"

interface BottomNavigationProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function BottomNavigation({ appState, updateAppState }: BottomNavigationProps) {
  const t = useTranslation(appState.language)

  const navItems = [
    { id: "dashboard" as Page, icon: Home, label: t("dashboard") },
    { id: "detail" as Page, icon: BarChart3, label: t("detail") },
    { id: "history" as Page, icon: Clock, label: t("history") },
    { id: "settings" as Page, icon: Settings, label: t("settings") },
    { id: "info" as Page, icon: Info, label: t("info") },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = appState.currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => updateAppState({ currentPage: item.id })}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
