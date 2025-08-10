// dog_walk_safety_app/components/history-page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon, AlertCircle, Edit } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { AppState, WalkReport } from "@/app/page"
import { useTranslation } from "./translations"

interface HistoryPageProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

export function HistoryPage({ appState, updateAppState }: HistoryPageProps) {
  const t = useTranslation(appState.language)
  const [reports, setReports] = useState<WalkReport[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [memo, setMemo] = useState("")
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [memoBeforeEdit, setMemoBeforeEdit] = useState("")

  useEffect(() => {
    const storedReportsJSON = localStorage.getItem('walkReports')
    if (storedReportsJSON) {
      const storedReports: WalkReport[] = JSON.parse(storedReportsJSON)
      setReports(storedReports)
      if (storedReports.length > 0) {
        setMemo(storedReports[0].memo || "")
      }
    }
  }, [])
  
  useEffect(() => {
    if(reports[currentIndex]) {
      setMemo(reports[currentIndex].memo || "")
      setIsEditingMemo(false)
    }
  }, [currentIndex, reports])

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => Math.min(reports.length - 1, prevIndex + 1))
  }

  const handleSaveMemo = () => {
    const updatedReports = reports.map((report, index) => {
      if (index === currentIndex) {
        return { ...report, memo: memo };
      }
      return report;
    });
    setReports(updatedReports);
    localStorage.setItem('walkReports', JSON.stringify(updatedReports));
    setIsEditingMemo(false);
  }
  
  const handleEditClick = () => {
    setMemoBeforeEdit(memo);
    setIsEditingMemo(true);
  }

  const handleCancelEdit = () => {
    setMemo(memoBeforeEdit);
    setIsEditingMemo(false);
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Intl.DateTimeFormat(appState.language, options).format(date)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    return new Intl.DateTimeFormat(appState.language, options).format(date)
  }
  
  // ↓↓↓↓↓↓ 翻訳に対応した時間フォーマット関数に修正しました ↓↓↓↓↓↓
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h}${t('hours')}`);
    if (m > 0) parts.push(`${m}${t('minutes')}`);
    if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}${t('seconds')}`);

    return parts.join(' ');
  }

  const currentReport = reports[currentIndex]

  if (!currentReport) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">{t("noWalksFound")}</h3>
        <p className="mt-1 text-sm text-gray-500">{t("startNewWalk")}</p>
        {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
        <Button className="mt-6" onClick={() => updateAppState({ currentPage: 'dashboard' })}>{t("backToHome")}</Button>
      </div>
    )
  }
  
  const chartData = [
    { name: t('safeTime'), value: currentReport.safeTime, color: '#22c55e' },
    { name: t('cautionTime'), value: currentReport.cautionTime, color: '#f59e0b' },
    { name: t('dangerTime'), value: currentReport.dangerTime, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* ↓↓↓↓↓↓ walkReport の翻訳キーがなかったので、history に修正しました ↓↓↓↓↓↓ */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("history")}</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {currentIndex > 0 ? (
              <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="h-6 w-6" /></Button>
            ) : (
              <div className="w-10 h-10" />
            )}
            
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">{formatDate(currentReport.startTime)}</p>
              <p className="text-sm text-gray-500">{formatTime(currentReport.startTime)} ~ {formatTime(currentReport.endTime)}</p>
            </div>

            {currentIndex < reports.length - 1 ? (
              <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="h-6 w-6" /></Button>
            ) : (
              <div className="w-10 h-10" />
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={80} fill="#8884d8" dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold border-b pb-2">
              <span>{t('totalDuration')}</span>
              <span>{formatDuration(currentReport.duration)}</span>
            </div>
            {chartData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{formatDuration(item.value)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                {t("walkMemo")}
              </h3>
              {!isEditingMemo && (
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                  {t("edit")}
                </Button>
              )}
            </div>

            {isEditingMemo ? (
              <div>
                <Textarea 
                  // ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓
                  placeholder={t("memoPlaceholder")}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button onClick={handleSaveMemo}>
                    {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                    {t("save")}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[100px] bg-gray-50 p-3 rounded-md border">
                {/* ↓↓↓↓↓↓ 翻訳対応しました ↓↓↓↓↓↓ */}
                {memo || t("noMemoYet")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}