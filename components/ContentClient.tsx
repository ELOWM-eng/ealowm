 'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentConfig } from '@/lib/content-config'

interface Props {
  sessionId: string
  version: string
  config: ContentConfig
}

const SESSION_TITLES: Record<string, string> = {
  s1: '무상관', s2: '세속관', s3: '자비관', s4: '보시행',
  s5: '지계행', s6: '인욕행', s7: '사상관', s8: '생멸관',
  s9: '무량관', s10: '정진행', s11: '선정행', s12: '지혜행',
}

export default function ContentClient({ sessionId, version, config }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'care' | 'card'>(
    config.care > 0 ? 'care' : 'card'
  )
  const [selectedCard, setSelectedCard] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const title = SESSION_TITLES[sessionId] ?? sessionId
  const hasCare = config.care > 0
  const hasCards = config.cards.length > 0
  const totalPages = config.cards[selectedCard] ?? 0
  const basePath = `/content/${version}/${sessionId}`

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage()
      else prevPage()
    }
  }

  function nextPage() {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1)
  }

  function prevPage() {
    if (currentPage > 0) setCurrentPage(prev => prev - 1)
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -20%, #fdf2f8 0%, #fdf8f0 60%)' }}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            ← 대시보드
          </button>
          <span className="text-sm font-medium text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
            {title} · 콘텐츠
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex border-b border-stone-100 mb-6">
          {hasCare && (
            <button
              onClick={() => setActiveTab('care')}
              className={`flex-1 py-2.5 text-sm transition-all ${
                activeTab === 'care'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-medium'
                  : 'text-stone-400 hover:text-stone-600'
              }`}>
              🎬 마음돌봄
            </button>
          )}
          {hasCards && (
            <button
              onClick={() => { setActiveTab('card'); setCurrentPage(0) }}
              className={`flex-1 py-2.5 text-sm transition-all ${
                activeTab === 'card'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-medium'
                  : 'text-stone-400 hover:text-stone-600'
              }`}>
              🗂️ 카드뉴스
            </button>
          )}
        </div>

        {activeTab === 'care' && hasCare && (
          <div className="space-y-4 animate-fade-up">
            {Array.from({ length: config.care }, (_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <p className="text-xs text-stone-400 px-4 pt-4 pb-2 font-medium">
                  🎬 마음돌봄 {config.care > 1 ? `${i + 1}` : ''}
                </p>
                <video
                  src={`${basePath}/care${i + 1}.mp4`}
                  controls
                  playsInline
                  className="w-full"
                  style={{ maxHeight: '600px', objectFit: 'contain', background: '#fff' }}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'card' && hasCards && (
          <div className="animate-fade-up space-y-4">
            {config.cards.length > 1 && (
              <div className="flex gap-2">
                {config.cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedCard(i); setCurrentPage(0) }}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedCard === i
                        ? 'bg-pink-500 text-white'
                        : 'bg-white border border-stone-200 text-stone-500 hover:border-pink-200'
                    }`}>
                    카드뉴스 {i + 1}
                  </button>
                ))}
              </div>
            )}

            <div
              className="relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}>
              <img
                src={`${basePath}/card${selectedCard + 1}_${currentPage + 1}.png`}
                alt={`카드 ${currentPage + 1}`}
                className="w-full"
                style={{ objectFit: 'contain', display: 'block' }}
              />
              {currentPage > 0 && (
                <button
                  onClick={prevPage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center text-2xl hover:bg-black/50 transition-all">
                  ‹
                </button>
              )}
              {currentPage < totalPages - 1 && (
                <button
                  onClick={nextPage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center text-2xl hover:bg-black/50 transition-all">
                  ›
                </button>
              )}
            </div>

            <div className="flex justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`rounded-full transition-all ${
                    i === currentPage ? 'w-5 h-2 bg-pink-500' : 'w-2 h-2 bg-stone-200'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-stone-400 text-center">
              {currentPage + 1} / {totalPages}
            </p>
          </div>
        )}

        {!hasCare && !hasCards && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🪷</p>
            <p className="text-sm text-stone-400">콘텐츠를 준비 중이에요.</p>
          </div>
        )}
      </main>
    </div>
  )
}
