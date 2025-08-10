"use client"

import { useState, useEffect } from "react"
import { MainDashboard } from "@/components/main-dashboard"
import { DetailPage } from "@/components/detail-page"
import { HistoryPage } from "@/components/history-page"
import { SettingsPage } from "@/components/settings-page"
import { InfoPage } from "@/components/info-page"
import { BottomNavigation } from "@/components/bottom-navigation"
import { TopBar } from "@/components/top-bar"

// 型定義
export type Language = "ko" | "en" | "ja" | "zh"
export type Page = "dashboard" | "detail" | "history" | "settings" | "info"
// ↓↓↓↓↓↓ ここに Unit 型を追加しました ↓↓↓↓↓↓
export type Unit = "C" | "F"

export interface WalkReport {
  id: string; 
  startTime: string; 
  endTime: string;   
  duration: number; 
  safeTime: number;
  cautionTime: number;
  dangerTime: number;
  memo: string;
}

export interface AppState {
  language: Language
  currentPage: Page
  asphaltTemp: number
  airTemp: number
  humidity: number
  lastUpdated: Date
  isWalking: boolean 
  walkStartTime: Date | null
  walkDuration: number
  currentWalkData: {
    safeTime: number;
    cautionTime: number;
    dangerTime: number;
  }
  // ↓↓↓↓↓↓ ここに unit を追加しました ↓↓↓↓↓↓
  unit: Unit 
}

export default function DogWalkSafetyApp() {
  const [appState, setAppState] = useState<AppState>({
    language: "ja",
    currentPage: "dashboard",
    asphaltTemp: 28,
    airTemp: 26,
    humidity: 65,
    lastUpdated: new Date(),
    isWalking: false, 
    walkStartTime: null,
    walkDuration: 0,
    currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 },
    // ↓↓↓↓↓↓ ここに unit の初期値を追加しました ↓↓↓↓↓↓
    unit: "C", 
  })

  const updateAppState = (updates: Partial<AppState> | ((prevState: AppState) => Partial<AppState>)) => {
    setAppState((prev) => ({ 
      ...prev, 
      ...(typeof updates === 'function' ? updates(prev) : updates) 
    }));
  };

  const toggleWalkState = () => {
    if (appState.isWalking) {
      const endTime = new Date();
      const newReport: WalkReport = {
        id: appState.walkStartTime!.toISOString(),
        startTime: appState.walkStartTime!.toISOString(),
        endTime: endTime.toISOString(),
        duration: appState.walkDuration,
        ...appState.currentWalkData,
        memo: "" 
      };
      const existingReportsJSON = localStorage.getItem('walkReports');
      const existingReports: WalkReport[] = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];
      const updatedReports = [newReport, ...existingReports];
      localStorage.setItem('walkReports', JSON.stringify(updatedReports));
      updateAppState({ 
        isWalking: false, 
        walkStartTime: null, 
        walkDuration: 0,
        currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 } 
      });
    } else {
      updateAppState({ 
        isWalking: true, 
        walkStartTime: new Date(), 
        walkDuration: 0,
        currentWalkData: { safeTime: 0, cautionTime: 0, dangerTime: 0 } 
      });
    }
  }

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case "dashboard":
        return <MainDashboard appState={appState} updateAppState={updateAppState} toggleWalkState={toggleWalkState} />
      case "detail":
        return <DetailPage appState={appState} updateAppState={updateAppState} />
      case "history":
        return <HistoryPage appState={appState} updateAppState={updateAppState} />
      case "settings":
        return <SettingsPage appState={appState} updateAppState={updateAppState} />
      case "info":
        return <InfoPage appState={appState} updateAppState={updateAppState} />
      default:
        return <MainDashboard appState={appState} updateAppState={updateAppState} toggleWalkState={toggleWalkState} />
    }
  }

  // 擬似的なセンサーデータ更新
  useEffect(() => {
    const interval = setInterval(() => {
      updateAppState(prev => ({
        asphaltTemp: prev.asphaltTemp + (Math.random() - 0.5) * 2,
        airTemp: prev.airTemp + (Math.random() - 0.5) * 1.5,
        humidity: Math.max(20, Math.min(99, prev.humidity + (Math.random() - 0.5) * 5)),
        lastUpdated: new Date(),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // 散歩タイマー＆データ記録用のuseEffect
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (appState.isWalking && appState.walkStartTime) {
      timerInterval = setInterval(() => {
        updateAppState(prev => {
          if (!prev.walkStartTime) return {};
          const now = new Date();
          const start = new Date(prev.walkStartTime);
          const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
          
          const currentTemp = prev.asphaltTemp;
          let { safeTime, cautionTime, dangerTime } = prev.currentWalkData;

          if (currentTemp <= 25) { safeTime += 1; } 
          else if (currentTemp <= 35) { cautionTime += 1; } 
          else { dangerTime += 1; }

          return { 
            walkDuration: elapsedSeconds,
            currentWalkData: { safeTime, cautionTime, dangerTime }
          };
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [appState.isWalking, appState.walkStartTime]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto border-x border-gray-200">
      <TopBar appState={appState} updateAppState={updateAppState} />
      <main className="flex-1 overflow-y-auto pb-20">{renderCurrentPage()}</main>
      <BottomNavigation appState={appState} updateAppState={updateAppState} />
    </div>
  )
}