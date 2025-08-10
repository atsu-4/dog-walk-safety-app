"use client"

// ↓↓↓↓↓↓ next/image から Image コンポーネントをインポートします ↓↓↓↓↓↓
import Image from "next/image"
import { Bell } from "lucide-react"
import type { AppState } from "@/app/page"
import { useTranslation } from "./translations"

interface TopBarProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function TopBar({ appState }: TopBarProps) {
  const t = useTranslation(appState.language)

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* ↓↓↓↓↓↓ この部分を修正しました ↓↓↓↓↓↓ */}
      {/* 左側に画像を表示するためのコンテナ */}
      <div className="w-8"> {/* 右側のBellアイコンのコンテナと幅を合わせる */}
        <Image
          src="/SDGs.png" // publicフォルダに配置した画像ファイルを指定
          alt="Dog Walk Safety Logo"
          width={32} // 画像の幅 (px)
          height={32} // 画像の高さ (px)
          className="rounded-md" // お好みで角丸に
        />
      </div>
      {/* ↑↑↑↑↑↑ ここまで修正しました ↑↑↑↑↑↑ */}


      <h1 className="font-bold text-lg text-gray-900">{t("title")}</h1>

      {/* ↓↓↓↓↓↓ 右側のBellアイコンをコンテナで囲みました ↓↓↓↓↓↓ */}
      {/* 右側にBellアイコンを表示するためのコンテナ */}
      <div className="w-8 flex justify-end"> {/* 左側の画像のコンテナと幅を合わせる */}
        <Bell className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  )
}