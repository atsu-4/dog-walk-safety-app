/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS 문제 해결을 위한 프록시 설정
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  
  // ESLint 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 설정
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
