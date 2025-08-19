"use client"

// 센서 데이터를 관리하는 커스텀 훅

import { useState, useEffect, useCallback } from "react"
import { fetchSensorData, checkServerHealth, type SensorData, type ApiResponse } from "@/lib/api"

export interface SensorDataState {
  data: SensorData | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  isConnected: boolean
  retryCount: number
}

export function useSensorData(intervalMs = 2000) {
  const [state, setState] = useState<SensorDataState>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    isConnected: false,
    retryCount: 0,
  })

  // 센서 데이터 가져오기 함수
  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const result: ApiResponse<SensorData> = await fetchSensorData()

      if (result.success && result.data) {
        // 백엔드 JSON을 프론트 구조로 변환
        const raw = result.data as any
        const mapped: SensorData = {
          asphalt_temp: raw.mlx90614?.object_temperature ?? 0,
          air_temp: raw.mlx90614?.ambient_temperature ?? 0,
          humidity: raw.bme280?.humidity ?? 0,
          pressure: raw.bme280?.pressure ?? 0,
          solar_radiation: raw.solar_radiation ?? 0,
          timestamp: raw.timestamp,
        }

        setState((prev) => ({
          ...prev,
          data: mapped,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
          isConnected: true,
          retryCount: 0,
        }))
      } else {
        throw new Error(result.error || "데이터를 가져올 수 없습니다")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류"

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isConnected: false,
        retryCount: prev.retryCount + 1,
      }))

      // 연결 실패 시 모의 데이터로 대체 (개발용)
      if (process.env.NODE_ENV === "development") {
        console.warn("Django 서버 연결 실패, 모의 데이터 사용:", errorMessage)

        setState((prev) => ({
          ...prev,
          data: {
            asphalt_temp: 28 + (Math.random() - 0.5) * 4,
            air_temp: 26 + (Math.random() - 0.5) * 3,
            humidity: 65 + (Math.random() - 0.5) * 10,
            pressure: 1013 + (Math.random() - 0.5) * 20,
            solar_radiation: 650 + (Math.random() - 0.5) * 100,
            timestamp: new Date().toISOString(),
          },
          isLoading: false,
          lastUpdated: new Date(),
          isConnected: false, // 모의 데이터임을 표시
        }))
      }
    }
  }, [])

  // 서버 상태 확인 함수
  const checkConnection = useCallback(async () => {
    try {
      const result = await checkServerHealth()

      if (result.success) {
        setState((prev) => ({ ...prev, isConnected: true, error: null }))
        return true
      } else {
        setState((prev) => ({ ...prev, isConnected: false, error: result.error || "서버 연결 실패" }))
        return false
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error.message : "연결 확인 실패",
      }))
      return false
    }
  }, [])

  // 수동 새로고침 함수
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // 초기 연결 확인 및 데이터 가져오기
  useEffect(() => {
    const initializeConnection = async () => {
      await checkConnection()
      await fetchData()
    }

    initializeConnection()
  }, [checkConnection, fetchData])

  // 주기적 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [fetchData, intervalMs])

  // 연결 상태 주기적 확인 (30초마다)
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      checkConnection()
    }, 30000)

    return () => clearInterval(healthCheckInterval)
  }, [checkConnection])

  return {
    ...state,
    refresh,
    checkConnection,
  }
}
