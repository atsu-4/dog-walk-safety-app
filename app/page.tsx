"use client"

import { useState, useEffect } from "react"
import { MainDashboard } from "@/components/main-dashboard"
import { DetailPage } from "@/components/detail-page"
import { HistoryPage } from "@/components/history-page"
import { SettingsPage } from "@/components/settings-page"
import { InfoPage } from "@/components/info-page"
import { BottomNavigation } from "@/components/bottom-navigation"
import { TopBar } from "@/components/top-bar"
import { SplashScreen } from "@/components/splash-screen"
import { useSensorData } from "@/hooks/useSensorData"

// 타입 정의
export type Language = "ko" | "en" | "ja" | "zh"
export type Page = "dashboard" | "detail" | "history" | "settings" | "info"
export type Unit = "C" | "F"

export interface WalkReport {
  id: string
  startTime: string
  endTime: string
  duration: number
  safeTime: number
  cautionTime: number
  dangerTime: number
  memo: string
}

export interface AppSettings {
  language: Language
  unit: Unit
  dangerTempAlertEnabled: boolean
  walkTimeAlertEnabled: boolean
}

export interface AppState extends AppSettings {
  currentPage: Page
  asphaltTemp: number
  airTemp: number
  humidity: number
  pressure: number
  solarRadiation: number
  lastUpdated: Date
  isWalking: boolean
  walkStartTime: Date | null
  walkDuration: number
  currentWalkData: {
    safeTime: number
    cautionTime: number
    dangerTime: number
  }
  // 서버 연결 상태 추가
  isConnected: boolean
  connectionError: string | null
}

export default function DogWalkSafetyApp() {
  const [appState, setAppState] = useState<AppState>({
    language: "en",
    unit: "C",
    dangerTempAlertEnabled: true,
    walkTimeAlertEnabled: true,
    currentPage: "dashboard",
    asphaltTemp: 28,
    airTemp: 26,
    humidity: 65,
    pressure: 1013,
    solarRadiation: 650,
    lastUpdated: new Date(),
    isWalking: false,
    walkStartTime: null,
    walkDuration: 0,
    currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 },
    isConnected: false,
    connectionError: null,
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // 센서 데이터 훅 사용 (5초마다 업데이트)
  const sensorData = useSensorData(5000)

  // 센서 데이터가 업데이트될 때마다 앱 상태 업데이트
  useEffect(() => {
    if (sensorData.data) {
      setAppState((prev) => ({
        ...prev,
        asphaltTemp: sensorData.data!.asphalt_temp,
        airTemp: sensorData.data!.air_temp,
        humidity: sensorData.data!.humidity,
        pressure: sensorData.data!.pressure,
        solarRadiation: sensorData.data!.solar_radiation,
        lastUpdated: sensorData.lastUpdated || new Date(),
        isConnected: sensorData.isConnected,
        connectionError: sensorData.error,
      }))
    } else if (sensorData.error) {
      setAppState((prev) => ({
        ...prev,
        isConnected: false,
        connectionError: sensorData.error,
      }))
    }
  }, [sensorData.data, sensorData.lastUpdated, sensorData.isConnected, sensorData.error])

  // 앱 초기화
  useEffect(() => {
    const initializeApp = async () => {
      const loadSettings = new Promise<void>((resolve) => {
        const savedSettingsJSON = localStorage.getItem("userSettings")
        if (savedSettingsJSON) {
          const savedSettings: AppSettings = JSON.parse(savedSettingsJSON)
          updateAppState(savedSettings)
        }
        resolve()
      })

      const minimumDelay = new Promise<void>((resolve) => {
        setTimeout(resolve, 1500)
      })

      await Promise.all([loadSettings, minimumDelay])
      setIsInitialized(true)
    }

    initializeApp()
  }, [])

  // 설정 저장
  useEffect(() => {
    if (!isInitialized) return

    const { language, unit, dangerTempAlertEnabled, walkTimeAlertEnabled } = appState
    const userSettings: AppSettings = { language, unit, dangerTempAlertEnabled, walkTimeAlertEnabled }
    localStorage.setItem("userSettings", JSON.stringify(userSettings))
  }, [isInitialized, appState])

  const updateAppState = (updates: Partial<AppState> | ((prevState: AppState) => Partial<AppState>)) => {
    setAppState((prev) => ({
      ...prev,
      ...(typeof updates === "function" ? updates(prev) : updates),
    }))
  }

  const toggleWalkState = () => {
    if (appState.isWalking) {
      const endTime = new Date()
      const newReport: WalkReport = {
        id: appState.walkStartTime!.toISOString(),
        startTime: appState.walkStartTime!.toISOString(),
        endTime: endTime.toISOString(),
        duration: appState.walkDuration,
        ...appState.currentWalkData,
        memo: "",
      }
      const existingReportsJSON = localStorage.getItem("walkReports")
      const existingReports: WalkReport[] = existingReportsJSON ? JSON.parse(existingReportsJSON) : []
      const updatedReports = [newReport, ...existingReports]
      localStorage.setItem("walkReports", JSON.stringify(updatedReports))
      updateAppState({
        isWalking: false,
        walkStartTime: null,
        walkDuration: 0,
        currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 },
      })
    } else {
      updateAppState({
        isWalking: true,
        walkStartTime: new Date(),
        walkDuration: 0,
        currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 },
      })
    }
  }

  const renderCurrentPage = () => {
    const commonProps = {
      appState,
      updateAppState,
      sensorData: {
        ...sensorData,
        refresh: sensorData.refresh,
      },
    }

    switch (appState.currentPage) {
      case "dashboard":
        return <MainDashboard {...commonProps} toggleWalkState={toggleWalkState} />
      case "detail":
        return <DetailPage {...commonProps} />
      case "history":
        return <HistoryPage {...commonProps} />
      case "settings":
        return <SettingsPage {...commonProps} />
      case "info":
        return <InfoPage {...commonProps} />
      default:
        return <MainDashboard {...commonProps} toggleWalkState={toggleWalkState} />
    }
  }

  // 산책 타이머
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null
    if (appState.isWalking && appState.walkStartTime) {
      timerInterval = setInterval(() => {
        updateAppState((prev) => {
          if (!prev.walkStartTime) return {}
          const now = new Date()
          const start = new Date(prev.walkStartTime)
          const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)

          const currentTemp = prev.asphaltTemp
          let { safeTime, cautionTime, dangerTime } = prev.currentWalkData

          if (currentTemp <= 25) {
            safeTime += 1
          } else if (currentTemp <= 35) {
            cautionTime += 1
          } else {
            dangerTime += 1
          }

          return {
            walkDuration: elapsedSeconds,
            currentWalkData: { safeTime, cautionTime, dangerTime },
          }
        })
      }, 1000)
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [appState.isWalking, appState.walkStartTime])

  if (!isInitialized) {
    return <SplashScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto border-x border-gray-200">
      <TopBar appState={appState} updateAppState={updateAppState} />
      <main className="flex-1 overflow-y-auto pb-20">{renderCurrentPage()}</main>
      <BottomNavigation appState={appState} updateAppState={updateAppState} />
    </div>
  )
}
