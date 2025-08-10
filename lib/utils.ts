import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ↓↓↓↓↓↓ ここから追加しました ↓↓↓↓↓↓
/**
 * 摂氏を華氏に変換します。
 * @param celsius - 摂氏温度
 * @returns 華氏温度
 */
export const toFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * 温度を指定された単位（摂氏/華氏）でフォーマットします。
 * @param tempC - 摂氏温度
 * @param unit - "C" または "F"
 * @param includeUnit - trueの場合、単位記号（°C/°F）を末尾に追加します
 * @returns フォーマットされた温度文字列
 */
export const formatTemperature = (tempC: number, unit: "C" | "F", includeUnit: boolean = true): string => {
  const temp = unit === "F" ? toFahrenheit(tempC) : tempC;
  const unitSymbol = includeUnit ? (unit === "F" ? "°F" : "°C") : "";
  return `${temp.toFixed(1)}${unitSymbol}`;
};
// ↑↑↑↑↑↑ ここまで追加しました ↑↑↑↑↑↑