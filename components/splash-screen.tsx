// dog_walk_safety_app/components/splash-screen.tsx

import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white max-w-md mx-auto">
      <Image
        src="/SDGs.png" // publicフォルダにあるロゴ画像
        alt="Dog Walk Safety Logo"
        width={128}
        height={128}
        className="animate-pulse" // ロゴをゆっくり点滅させるアニメーション
        priority // 最初に表示される重要な画像であることを示す
      />
      <p className="mt-4 text-lg font-semibold text-gray-700">Dog Walk Safety</p>
      {/* ↓↓↓↓↓↓ この行を追加しました ↓↓↓↓↓↓ */}
      <p className="mt-2 text-sm text-gray-500 animate-pulse">Loading...</p>
      {/* ↑↑↑↑↑↑ ここまで追加しました ↑↑↑↑↑↑ */}
    </div>
  );
}