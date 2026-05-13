'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { PracticeSession } from '@/types'
import clsx from 'clsx'

interface Props {
  userEmail: string
  completedIds: string[]
  totalCompleted: number
  totalSessions: number
  sessionsByWeek: Record<number, PracticeSession[]>
  userId: string
  initialGoal: string
  version: string
}

const WEEK_LABELS_KO: Record<number, string> = {
  1: '1주차', 2: '2주차', 3: '3주차', 4: '4주차',
  5: '5주차', 6: '6주차', 7: '7주차', 8: '8주차',
  9: '9주차', 10: '10주차', 11: '11주차', 12: '12주차',
}

const WEEK_LABELS_EN: Record<number, string> = {
  1: 'Week 1', 2: 'Week 2', 3: 'Week 3', 4: 'Week 4',
  5: 'Week 5', 6: 'Week 6', 7: 'Week 7', 8: 'Week 8',
  9: 'Week 9', 10: 'Week 10', 11: 'Week 11', 12: 'Week 12',
}

export default function DashboardClient({ userEmail, completedIds, totalCompleted, totalSessions, sessionsByWeek, userId, initialGoal, version }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEn = version === 'en'
  const [goal, setGoal] = useState(initialGoal)
  const [goalSaved, setGoalSaved] = useState(false)
  const [goalSaving, setGoalSaving] = useState(false)

  async function saveGoal() {
    setGoalSaving(true)
    const { data: existing } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase.from('user_goals').update({ addiction_goal: goal }).eq('user_id', userId)
    } else {
      await supabase.from('user_goals').insert({ user_id: userId, addiction_goal: goal })
    }
    setGoalSaving(false)
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  const completedSet = new Set(completedIds)
  const weeks = Object.keys(sessionsByWeek).map(Number).sort((a, b) => a - b)

  const [activeWeek, setActiveWeek] = useState<number>(() => {
    const allSessions = Object.values(sessionsByWeek).flat()
    const nextSession = allSessions.find(s => !completedSet.has(s.id))
    if (!nextSession) return weeks[weeks.length - 1]
    return nextSession.week
  })

  const pct = Math.round((totalCompleted / totalSessions) * 100)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -20%, #fdf2f8 0%, #fdf8f0 60%)' }}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪷</span>
            <span className="font-medium text-sm text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? 'EALOWM' : '이로움 · EALOWM'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:block">{userEmail}</span>
            <button onClick={async () => {
              await supabase.from('user_goals').update({ version: null }).eq('user_id', userId)
              router.push('/select-version')
            }}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded">
              {isEn ? 'Change Version' : '버전 변경'}
            </button>
            <button onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded">
              {isEn ? 'Logout' : '로그아웃'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* 활용 예시 */}
        <div className="mb-6 animate-fade-up">
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-700 mb-3" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? 'How to Use' : '활용 예시'}
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="text-xs font-medium text-stone-600 mb-0.5">
                    {isEn ? 'Step 1 · Day 1 of Session 1' : '1단계 · 1회기의 1일 차'}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {isEn
                      ? "Read Workbook's the explanation of Session 1 Formless, complete the Reflecting activity, and record Day 1 of the Practicing section."
                      : "'무상관'에 대한 워크북의 설명을 읽고, '생각해보기' 활동 후 '실천해보기' 1일 차를 기록합니다."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="text-xs font-medium text-stone-600 mb-0.5">
                    {isEn ? 'Step 2 · Days 2–7 of Session 1' : '2단계 · 1회기의 2~7일 차'}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {isEn
                      ? 'While reflecting on the content of Session 1 in daily life, complete and record Days 2–7 of the Practicing section.'
                      : "일상생활 속에서 1회기의 내용을 되새기며, '실천해보기' 2~7일 차를 기록합니다."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="text-xs font-medium text-stone-600 mb-0.5">
                    {isEn ? 'Step 3 · Day 7 of Session 1' : '3단계 · 1회기의 7일 차'}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {isEn
                      ? "After completing Day 7 of the Practicing section, use the Organizing section to reflect on and summarize your week of practice."
                      : "'실천해보기' 7일 차를 기록한 후, '정리해보기'를 통해 한 주간의 실천을 되돌아보고 정리합니다."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 중독 행동 목표 */}
        <div className="mb-6 animate-fade-up">
          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-700 mb-1" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? 'Habitual Addictive Behavior I Want to Overcome' : '벗어나고 싶은 습관화된 중독 행동'}
            </p>
            <p className="text-xs text-stone-400 mb-3">
              {isEn
                ? 'Please write down the addictive behavior you wish to overcome as you progress through the program.'
                : '프로그램을 진행하면서 자신이 극복하고자 하는 중독 행동을 적어보세요.'}
            </p>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder={isEn
                ? 'e.g. smartphone addiction, overeating, gaming, alcohol...'
                : '스마트폰 중독, 과식, 게임, 음주 등 자신이 벗어나고 싶은 습관화된 중독 행동을 자유롭게 적어보세요.'}
              rows={3}
              className="w-full p-3 text-sm rounded-xl border border-stone-200 bg-stone-50
                focus:outline-none focus:border-amber-300 resize-none transition-colors
                text-stone-700 placeholder:text-stone-300"
            />
            <button
              onClick={async () => { await saveGoal(); router.push('/awareness?point=start') }}
              disabled={goalSaving}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #EF9F27, #BA7517)' }}>
              {goalSaving
                ? (isEn ? 'Saving...' : '저장 중...')
                : goalSaved
                ? (isEn ? 'Saved ✓' : '저장됨 ✓')
                : (isEn ? 'Save & Start Week 1' : '저장하고 1주차 시작하기')}
            </button>
          </div>
        </div>

        {/* 진행률 */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-stone-400 font-medium">
              {isEn ? 'Progress' : '진행률'}
            </p>
            <p className="text-xs text-stone-500 font-medium">
              {totalCompleted} / {totalSessions} {isEn ? 'sessions' : '회기'}
            </p>
          </div>

          {/* 캐릭터 진행률 */}
          <div className="relative mb-1">
            <div className="relative h-16">
              <div
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: `calc(${Math.min((totalCompleted / totalSessions) * 100, 92)}% - 24px)`,
                  animation: totalCompleted < totalSessions ? 'walkBounce 0.6s ease-in-out infinite alternate' : 'none',
                }}>
                <img
                  src={version === 'youth' ? '/characters/teen.png' : '/characters/adult.png'}
                  alt="character"
                  style={{
                    height: '64px',
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(totalCompleted / totalSessions) * 100}%`,
                  background: version === 'youth'
                    ? 'linear-gradient(90deg, #5dcaa5, #1D9E75)'
                    : 'linear-gradient(90deg, #e673a8, #d94f88)',
                }}
              />
            </div>
          </div>

          {/* 완료 메시지 */}
          {totalCompleted === totalSessions && (
            <p className="text-xs text-center text-teal-600 mt-2 font-medium">
              {isEn ? '🪷 All sessions complete!' : '🪷 모든 회기를 완료했습니다!'}
            </p>
          )}
        </div>
          

        {/* 주차 선택 */}
        <div className="grid grid-cols-4 gap-2 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {weeks.map(w => (
            <button key={w}
              onClick={() => setActiveWeek(w)}
              className={clsx(
                'py-3 rounded-xl text-xs font-medium transition-all text-center',
                activeWeek === w ? 'text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-500 hover:border-pink-200'
              )}
              style={activeWeek === w ? { background: 'linear-gradient(135deg, #e673a8, #d94f88)' } : {}}>
              <p className="text-base mb-0.5">{w}</p>
              <p className="text-xs opacity-70">{isEn ? WEEK_LABELS_EN[w] : WEEK_LABELS_KO[w]}</p>
            </button>
          ))}
        </div>

        {/* 회기 목록 */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {(sessionsByWeek[activeWeek] || []).map((s, i) => {
            const done = completedSet.has(s.id)
            return (
              <button key={s.id}
                onClick={() => router.push(`/session/${s.id}`)}
                className="w-full text-left bg-white rounded-2xl p-5 border border-stone-100 hover:border-pink-200 hover:shadow-md transition-all duration-200 group"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-stone-400">{s.num}</span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full',
                        s.type === 'gwan' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600')}>
                        {s.type === 'gwan'
                          ? (isEn ? 'The Sixfold Contemplation' : '육관행 · 觀')
                          : (isEn ? 'The Six Pāramitās' : '육바라밀 · 行')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 group-hover:text-pink-600 transition-colors"
                      style={{ fontFamily: 'var(--font-gowun)' }}>
                      {s.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-0.5">{s.sub}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {done ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                        ✓
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-300 group-hover:border-pink-300 transition-colors">
                        →
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 프로그램 소개 */}
        <div className="mt-12 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
            <img src="/logo.jpg" alt="EALOWM Logo"
              className="w-20 h-20 mx-auto rounded-full object-cover shadow-sm mb-3" />
            <h3 className="text-base font-bold text-stone-800 mb-2" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? 'EALOWM' : '이로움'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {isEn
                ? <>Based on Woncheuk's <em>Muryanguigyeongso</em><br/>A 12-step addiction prevention & mind-healing self-care program</>
                : <>신라 시대 원측(圓測, 613–696) 스님의 『무량의경소』 기반<br/>12단계 중독 예방 및 마음 치유 자기돌봄 프로그램</>}
            </p>
          </div>

          {/* 책 소개 */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h3 className="text-sm font-bold text-stone-700 mb-3" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? 'Workbook Guide' : '워크북 안내'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center flex-shrink-0 text-purple-700 text-xs font-bold">
                  {isEn ? '' : ''}
                </div>
                <div>
                  {isEn ? (
                    <>
                      <p className="text-xs text-stone-500 mt-0.5">[Print] EALOWM for Adults, Elevate A Lotus of Wisdom, Purple, 2026 Revised Edition</p>
                      <p className="text-xs text-stone-500 mt-0.5">[E-book] EALOWM for Adults, Elevate A Lotus of Wisdom, Bookk, 2026</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-stone-500 mt-0.5">[종이책] 성인을 위한 이로움, 지혜의 씨앗으로 자비의 연꽃 피우기, 퍼플, 2026 개정판</p>
                      <p className="text-xs text-stone-500 mt-0.5">[전자책] 성인을 위한 이로움, 지혜의 씨앗으로 자비의 연꽃 피우기, 부크크, 2026</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-pink-200 flex items-center justify-center flex-shrink-0 text-pink-700 text-xs font-bold">
                  {isEn ? '' : ''}
                </div>
                <div>
                  {isEn ? (
                    <>
                      <p className="text-xs text-stone-500 mt-0.5">[Print] EALOWM for Youth, Elevate A Lotus of Wisdom, Purple, 2026</p>
                      <p className="text-xs text-stone-500 mt-0.5">[E-book] EALOWM for Youth, Elevate A Lotus of Wisdom, Bookk, 2026</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-stone-500 mt-0.5">[종이책] 청소년을 위한 이로움, 지혜의 씨앗으로 자비의 연꽃 피우기, 퍼플, 2026</p>
                      <p className="text-xs text-stone-500 mt-0.5">[전자책] 청소년을 위한 이로움, 지혜의 씨앗으로 자비의 연꽃 피우기, 부크크, 2026</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
{/* 워크북 구매 */}
        <div className="mb-6 animate-fade-up">
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-4">
              {isEn ? 'Workbook · Purchase' : '워크북 구매'}
            </p>
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">{isEn ? '📖 Adult Version' : '📖 성인용'}</p>
              <div className="flex gap-2">
                <a href="https://product.kyobobook.co.kr/detail/S000219745212"
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all">
                  📚 {isEn ? 'Kyobo (Paper)' : '교보문고 종이책'}
                </a>
                <a href="https://m.yes24.com/goods/detail/187717378"
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all">
                  📱 {isEn ? 'Yes24 (E-book)' : '예스24 전자책'}
                </a>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-2">{isEn ? '📖 Youth Version' : '📖 청소년용'}</p>
              <div className="flex gap-2">
                <a href="https://product.kyobobook.co.kr/detail/S000219727370"
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all">
                  📚 {isEn ? 'Kyobo (Paper)' : '교보문고 종이책'}
                </a>
                <a href="https://m.yes24.com/goods/detail/187717379"
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all">
                  📱 {isEn ? 'Yes24 (E-book)' : '예스24 전자책'}
                </a>
              </div>
            </div>
          </div>
        </div>
          {/* 문의 */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
            <p className="text-xs text-stone-400 mb-2">{isEn ? 'Contact' : '문의'}</p>
            <a href="https://instagram.com/16bon_won33" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @16bon_won33
            </a>
          </div>

          <p className="text-center text-xs text-stone-400 pb-5 leading-relaxed"
            style={{ fontFamily: 'var(--font-gowun)' }}>
            {isEn
              ? 'Heal yourself with wisdom, illuminate the world with compassion.'
              : '지혜로 나를 치유하고, 자비로 세상을 밝힌다.'}
          </p>
        </div>
      </main>
    </div>
  )
}