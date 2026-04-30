import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '이로움 · EALOWM',
  description: '지혜의 씨앗으로 자비의 연꽃 피우기 — 12단계 자기돌봄 프로그램',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
