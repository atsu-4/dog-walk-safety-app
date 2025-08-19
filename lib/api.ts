export interface SensorData {
    asphalt_temp: number
    air_temp: number
    humidity: number
    pressure: number
    solar_radiation: number
    timestamp: string
  }
  
  export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
  }
  
  // 환경변수에서 API URL을 가져오거나 기본값 사용
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"
  
  /**
   * Django 서버에서 최신 센서 데이터를 가져옵니다
   */
  export async function fetchSensorData(): Promise<ApiResponse<SensorData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sensors/data/`, {
        method: "GET",
        mode: "cors",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: "no-cache",
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: SensorData = await response.json();
  
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("센서 데이터 가져오기 실패:", error);
  
      return {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
      };
    }
  }
  
  /**
   * Django 서버의 상태를 확인합니다
   */
  export async function checkServerHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sensors/health/`, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
      });
  
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("서버 상태 확인 실패:", error);
  
      return {
        success: false,
        error: error instanceof Error ? error.message : "서버 연결 실패",
      };
    }
  }
  
  /**
   * 산책 데이터를 Django 서버에 저장합니다 (POST 요청)
   */
  export async function saveWalkData(walkData: {
    start_time: string
    end_time: string
    duration: number
    safe_time: number
    caution_time: number
    danger_time: number
    memo?: string
  }): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/walks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(walkData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error("산책 데이터 저장 실패:", error);
  
      return {
        success: false,
        error: error instanceof Error ? error.message : "데이터 저장 실패",
      };
    }
  }