'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import type { PracticeSession, SessionData } from '@/types'
import clsx from 'clsx'

interface Props {
  session: PracticeSession
  userId: string
  initialData: SessionData
}

type Tab = 'think' | 'practice' | 'reflect'

const TAB_LABELS_KO: Record<Tab, string> = {
  think: '생각해보기',
  practice: '실천해보기',
  reflect: '정리해보기',
}

const TAB_LABELS_EN: Record<Tab, string> = {
  think: 'Reflecting',
  practice: 'Practicing',
  reflect: 'Organizing',
}

export default function SessionClient({ session, userId, initialData }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const hasThink = initialData.think_checks.some(v => v !== null && v !== undefined)
    if (!hasThink) return 'think'
    const filled = initialData.practice_texts.filter(t => t && t.trim().length > 0).length
    if (filled >= 7) return 'reflect'
    return 'practice'
  })
  const [checks, setChecks] = useState<(boolean | null | string)[]>(
    initialData.think_checks.map(v => v ?? null)
  )
  const [practiceTexts, setPracticeTexts] = useState<string[]>(initialData.practice_texts)
  const [reflectTexts, setReflectTexts] = useState<string[]>(initialData.reflect_texts)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [completed, setCompleted] = useState(initialData.completed)
  const [showCard, setShowCard] = useState(false)
  const [cardDay, setCardDay] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  
  const version = initialData.version
  const isEn = version === 'en'
  const isYouth = version === 'youth'
  const [activeDay, setActiveDay] = useState<number>(() => {
    const filled = initialData.practice_texts.filter(t => t && t.trim().length > 0).length
    return Math.min(filled, 6)
  })
  const [timerStarted, setTimerStarted] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [timerCount, setTimerCount] = useState(30)
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  function startTimer() {
    if (timerStarted) return
    setTimerStarted(true)
    setTimerCount(30)
    timerInterval.current = setInterval(() => {
      setTimerCount(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!)
          setTimerDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveData = useCallback(async (markComplete?: boolean) => {
    setSaving(true)
    const isComplete = markComplete ?? completed

    const payload = {
      think_checks: checks,
      practice_texts: practiceTexts,
      reflect_texts: reflectTexts,
      completed: isComplete,
      updated_at: new Date().toISOString(),
    }

    // 먼저 기존 레코드 확인
    const { data: existing } = await supabase
      .from('session_records')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', session.id)
      .eq('version', version)
      .maybeSingle()

    let error
    if (existing) {
      // 있으면 update
      const { error: updateError } = await supabase
        .from('session_records')
        .update(payload)
        .eq('user_id', userId)
        .eq('session_id', session.id)
        .eq('version', version)
      error = updateError
    } else {
      // 없으면 insert
      const { error: insertError } = await supabase
        .from('session_records')
        .insert({ user_id: userId, session_id: session.id, version: version, ...payload })
      error = insertError
    }

    setSaving(false)
    if (!error) {
      setSaved(true)
      if (markComplete) setCompleted(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }, [checks, practiceTexts, reflectTexts, completed, userId, session.id, supabase])

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => saveData(), 2000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [checks, practiceTexts, reflectTexts, saveData]) // eslint-disable-line

  const checkedCount = checks.filter(v => v !== null && v !== undefined).length
const versionPrefix = version === 'youth' ? 'youth' : version === 'en' ? 'en' : 'adult'
  const cardFrontSrc = `/daycards/${versionPrefix}_${session.id}_day${cardDay}_front.png`
  const cardBackSrc = `/daycards/${versionPrefix}_${session.id}_day${cardDay}_back.png`

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -30%, #fdf2f8 0%, #fdf8f0 70%)' }}>

      {/* 데이 카드 팝업 */}
      {showCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => {
            if (isFlipped) {
              setShowCard(false)
              setIsFlipped(false)
              if (cardDay === 7) setActiveTab('reflect')
              else setActiveDay(prev => Math.min(prev + 1, 6))
            }
          }}>
          <div
            className="relative max-w-sm w-full animate-fade-up"
            onClick={e => e.stopPropagation()}>

            {/* 카드 헤더 */}
            <div className="bg-white rounded-t-3xl px-5 py-4 flex items-center justify-between border-b border-orange-100">
              <div>
                <p className="text-xs text-orange-400 font-medium">
                  {session.title} · DAY {cardDay}
                </p>
                <p className="text-sm font-bold text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
                  {isFlipped
                    ? (isEn ? "Today's Practice Card" : '오늘의 실천 카드')
                    : (isEn ? 'Tap the card to flip!' : '카드를 눌러 뒤집어보세요!')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCard(false)
                  setIsFlipped(false)
                  if (cardDay === 7) setActiveTab('reflect')
                  else setActiveDay(prev => Math.min(prev + 1, 6))
                }}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 transition-all">
                ✕
              </button>
            </div>

            {/* 카드 플립 영역 */}
            <div className="bg-white px-4 py-4">
              <style>{`
                .card-flip-container { perspective: 1000px; width: 100%; }
                .card-flip-inner { position: relative; width: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
                .card-flip-inner.flipped { transform: rotateY(180deg); }
                .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 16px; overflow: hidden; width: 100%; }
                .card-face-back { position: absolute; top: 0; left: 0; transform: rotateY(180deg); }
              `}</style>

              <div className="card-flip-container">
                <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`} style={{ minHeight: '300px' }}>

                  {/* 앞면 */}
                  <div className="card-face cursor-pointer relative" onClick={() => !isFlipped && setIsFlipped(true)}>
                    <img
                      src={cardFrontSrc}
                      alt={`DAY ${cardDay} 앞면`}
                      className="w-full rounded-2xl"
                      onError={e => {
                        const t = e.target as HTMLImageElement
                        t.style.display = 'none'
                        const p = t.parentElement
                        if (p) { p.style.cssText = 'background:linear-gradient(135deg,#fdf2f8,#fdf8f0);min-height:300px;display:flex;align-items:center;justify-content:center;border-radius:16px'; p.innerHTML = `<div style="text-align:center;padding:40px"><div style="font-size:48px">🪷</div><p style="font-size:14px;color:#78716c;margin-top:12px">${session.title} · DAY ${cardDay}</p></div>` }
                      }}
                    />
                    {!isFlipped && (
                      <div className="absolute inset-0 flex items-end justify-center pb-4 rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }}>
                        <p className="text-white text-xs font-medium animate-pulse">
                          {isEn ? '👆 Tap to flip' : '👆 눌러서 뒤집기'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 뒷면 */}
                  <div className="card-face card-face-back">
                    <img
                      src={cardBackSrc}
                      alt={`DAY ${cardDay} 뒷면`}
                      className="w-full rounded-2xl"
                      onError={e => {
                        const t = e.target as HTMLImageElement
                        t.style.display = 'none'
                        const p = t.parentElement
                        if (p) { p.style.cssText = 'background:linear-gradient(135deg,#e1f5ee,#fdf8f0);min-height:300px;display:flex;align-items:center;justify-content:center;border-radius:16px'; p.innerHTML = `<div style="text-align:center;padding:40px"><div style="font-size:48px">🌱</div><p style="font-size:14px;color:#78716c;margin-top:12px">${isEn ? "Today's practice" : '오늘의 실천'}</p></div>` }
                      }}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="bg-white rounded-b-3xl px-4 pb-5">
              {!isFlipped ? (
                <button onClick={() => setIsFlipped(true)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #f6a94a, #e07b20)' }}>
                  {isEn ? '🃏 Flip the Card' : '🃏 카드 뒤집기'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowCard(false)
                    setIsFlipped(false)
                    if (cardDay === 7) setActiveTab('reflect')
                    else setActiveDay(prev => Math.min(prev + 1, 6))
                  }}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: cardDay === 7 ? 'linear-gradient(135deg, #5dcaa5, #1D9E75)' : 'linear-gradient(135deg, #f6a94a, #e07b20)' }}>
                  {cardDay === 7
                    ? (isEn ? 'Go to Organizing →' : '정리해보기로 이동 →')
                    : (isEn ? `Go to DAY ${cardDay + 1} →` : `DAY ${cardDay + 1}로 이동 →`)}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            {isEn ? '← List' : '← 목록'}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-400">{session.num}</p>
            <h1 className="text-base font-bold text-stone-800 truncate" style={{ fontFamily: 'var(--font-gowun)' }}>
              {session.title}
              <span className="text-sm font-normal text-stone-500 ml-2">— {session.sub}</span>
            </h1>
          </div>
          <div className="flex-shrink-0 text-xs">
            {saving && <span className="text-stone-400">{isEn ? 'Saving...' : '저장 중...'}</span>}
            {saved && !saving && <span className="text-teal-500">{isEn ? 'Saved ✓' : '저장됨 ✓'}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-2 mb-5 animate-fade-up">
          <span className={clsx(
            'text-xs px-2.5 py-1 rounded-full',
            session.type === 'gwan' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
          )}>
            {session.type === 'gwan'
              ? (isEn ? 'The Sixfold Contemplation' : '육관행 · 觀')
              : (isEn ? 'The Six Pāramitās' : '육바라밀 · 行')}
          </span>
          {completed && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-600">
              {isEn ? 'Completed ✓' : '완료 ✓'}
            </span>
          )}
        </div>

        <div className="flex border-b border-stone-100 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {(['think', 'practice', 'reflect'] as Tab[]).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex-1 py-2.5 text-sm transition-all',
                activeTab === tab
                  ? 'text-pink-600 border-b-2 border-pink-500 font-medium'
                  : 'text-stone-400 hover:text-stone-600'
              )}>
              {isEn ? TAB_LABELS_EN[tab] : TAB_LABELS_KO[tab]}
            </button>
          ))}
        </div>

        {/* 생각해보기 */}
        {activeTab === 'think' && (
          <div className="animate-fade-up space-y-5">
            {/* 테마곡 플레이어 */}
            {(version === 'adult' || version === 'youth') && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <p className="text-xs text-stone-400 px-4 pt-4 pb-2 font-medium">
                    🎵 {session.id.replace('s', '')}회기 테마곡
                  </p>
                  <video
                    src={`/videos/${session.id}.mp4`}
                    controls
                    playsInline
                    className="w-full"
                    style={{ maxHeight: '480px', objectFit: 'contain', background: '#fff' }}
                  />
                </div>
                <div className="bg-white rounded-2xl border border-stone-100 p-4">
                  <p className="text-xs text-stone-400 mb-2 font-medium">🎵 {session.id.replace('s', '')}회기 테마곡 · 음원</p>
                  <audio
                    src={`/audio/${session.id}.mp3`}
                    controls
                    className="w-full"
                    style={{ height: '40px' }}
                  />
                </div>
              </div>
            )}

            {version === 'en' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <p className="text-xs text-stone-400 mb-2 font-medium">🎵 Theme Song</p>
                <audio
                  src={`/audio-en/${session.id}.mp3`}
                  controls
                  className="w-full"
                  style={{ height: '40px' }}
                />
              </div>
            )}

            <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-300">
              <p className="text-sm text-purple-700 leading-relaxed">{session.think.note}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-400 mb-1">Q.</p>
              <p className="text-sm text-stone-700 leading-relaxed">{session.think.q}</p>
            </div>
            

            {session.think.inputType === 'readonly' ? (
              <div className="space-y-4">
                {session.think.items.map((item, i) => {
                  const [title, ...rest] = item.split('\n')
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border-b border-pink-100">
                        <p className="text-sm font-bold text-pink-700" style={{ fontFamily: 'var(--font-gowun)' }}>
                          {isEn ? `Session ${i + 1} · ${title}` : `${i + 1}회기 · ${title}`}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                          {rest.join('\n')}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-5 text-center border border-pink-100">
                  <p className="text-2xl mb-2">🪷</p>
                  <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                    {isEn
                      ? <>From the seed of wisdom to the lotus of compassion.<br/>We celebrate your journey.</>
                      : <>지혜의 씨앗에서 자비의 연꽃으로.<br/>당신의 여정을 축하합니다.</>}
                  </p>
                </div>
              </div>
            ) : session.think.inputType === 'mbti' ? (
              <MbtiSection groups={session.think.mbtiGroups ?? []} checks={checks} setChecks={setChecks} isEn={isEn} />
            ) : session.think.inputType === 'checkbox' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full transition-all duration-300"
                      style={{ width: `${(checks.filter(v => v === true).length / checks.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-stone-400">{checks.filter(v => v === true).length}개 선택됨</span>
                </div>
                <ul className="space-y-2">
                  {session.think.items.map((item, i) => (
                    <li key={i}
                      onClick={() => setChecks(prev => prev.map((v, idx) => idx === i ? (v === true ? null : true) : v))}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                        checks[i] === true ? 'bg-pink-50 border-pink-300' : 'bg-white border-stone-100 hover:border-pink-200'
                      )}>
                      <div className={clsx(
                        'w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all',
                        checks[i] === true ? 'bg-pink-500 text-white' : 'border-2 border-stone-200'
                      )}>
                        {checks[i] === true && <span className="text-xs">✓</span>}
                      </div>
                      <p className={clsx('text-sm leading-relaxed', checks[i] === true ? 'text-pink-700 font-medium' : 'text-stone-700')}>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : session.think.inputType === 'timer' ? (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                    <p className="text-sm font-medium text-blue-700">{isEn ? 'Present Moment' : '지금, 이 순간'}</p>
                    <p className="text-xs text-blue-400 mt-0.5">{isEn ? 'Start the timer after writing' : '작성 후 타이머를 시작하세요'}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs text-stone-400 mb-1 block">{isEn ? 'Thoughts arising now' : '지금 떠오르는 생각'}</label>
                      <textarea
                        value={typeof checks[0] === 'string' ? checks[0] as string : ''}
                        onChange={e => setChecks(prev => { const n = [...prev]; n[0] = e.target.value; return n })}
                        placeholder={isEn ? 'Write the thoughts arising in this moment.' : '지금 이 순간 떠오르는 생각을 적어보세요.'}
                        rows={3}
                        className="w-full p-3 text-sm rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-blue-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 mb-1 block">{isEn ? 'Emotions felt now' : '지금 느끼는 감정'}</label>
                      <textarea
                        value={typeof checks[1] === 'string' ? checks[1] as string : ''}
                        onChange={e => setChecks(prev => { const n = [...prev]; n[1] = e.target.value; return n })}
                        placeholder={isEn ? 'Write the emotions felt in this moment.' : '지금 이 순간 느끼는 감정을 적어보세요.'}
                        rows={3}
                        className="w-full p-3 text-sm rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-blue-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                      />
                    </div>
                  </div>
                </div>
                {!timerStarted && (
                  <button onClick={startTimer}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                    {isEn ? 'Start Timer ▶' : '타이머 시작하기 ▶'}
                  </button>
                )}
                {timerStarted && (
                  <div className={clsx('rounded-2xl p-5 text-center transition-all',
                    timerDone ? 'bg-teal-50 border border-teal-200' : 'bg-amber-50 border border-amber-200')}>
                    {timerDone ? (
                      <div>
                        <p className="text-2xl mb-1">🪷</p>
                        <p className="text-sm font-medium text-teal-600">{isEn ? '30 seconds have passed' : '30초가 지났습니다'}</p>
                        <p className="text-xs text-teal-500 mt-1">{isEn ? 'Record the changes below' : '아래에 변화를 기록해보세요'}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-4xl font-bold text-amber-600 mb-1">{timerCount}</p>
                        <p className="text-xs text-amber-500">{isEn ? 'Observe your mind for a moment...' : '잠시 마음을 바라보세요...'}</p>
                        <div className="mt-3 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                            style={{ width: `${(timerCount / 30) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className={clsx('bg-white rounded-2xl border overflow-hidden transition-all',
                  timerDone ? 'border-teal-200' : 'border-stone-100 opacity-50 pointer-events-none')}>
                  <div className="bg-teal-50 px-4 py-3 border-b border-teal-100">
                    <p className="text-sm font-medium text-teal-700">{isEn ? 'After 30 Seconds' : '30초 후'}</p>
                    <p className="text-xs text-teal-400 mt-0.5">{timerDone ? (isEn ? 'Record the changes' : '변화를 기록해보세요') : (isEn ? 'You can write after the timer ends' : '타이머가 끝나면 작성할 수 있어요')}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs text-stone-400 mb-1 block">{isEn ? 'Thoughts after 30 seconds' : '30초 후 떠오르는 생각'}</label>
                      <textarea
                        value={typeof checks[2] === 'string' ? checks[2] as string : ''}
                        onChange={e => setChecks(prev => { const n = [...prev]; n[2] = e.target.value; return n })}
                        placeholder={isEn ? 'Write the thoughts arising after 30 seconds.' : '30초 후 떠오르는 생각을 적어보세요.'}
                        rows={3}
                        className="w-full p-3 text-sm rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-teal-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 mb-1 block">{isEn ? 'Emotions felt after 30 seconds' : '30초 후 느끼는 감정'}</label>
                      <textarea
                        value={typeof checks[3] === 'string' ? checks[3] as string : ''}
                        onChange={e => setChecks(prev => { const n = [...prev]; n[3] = e.target.value; return n })}
                        placeholder={isEn ? 'Write the emotions felt after 30 seconds.' : '30초 후 느끼는 감정을 적어보세요.'}
                        rows={3}
                        className="w-full p-3 text-sm rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-teal-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : session.think.inputType === 'typing' ? (
              <div className="space-y-6">
                {session.think.typingGroups?.map((group, gi) => (
                  <div key={gi} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                    {group.image && (
                      <img src={group.image} alt={group.label}
                        style={{ width: '100%', objectFit: 'contain' }} />
                    )}
                    <div className="bg-amber-50 px-4 py-3 border-b border-amber-100">
                      <p className="text-sm font-medium text-amber-700">{group.label}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {group.stages.map((stage, si) => {
                        const idx = gi * 4 + si
                        const value = typeof checks[idx] === 'string' ? checks[idx] as string : ''
                        const isCorrect = value === stage
                        return (
                          <div key={si}>
                            <label className="text-xs text-stone-400 mb-1 block">
                              {stage}{isCorrect && <span className="ml-2 text-teal-500 font-medium">✓</span>}
                            </label>
                            <input type="text" value={value}
                              onChange={e => setChecks(prev => {
                                const next = [...prev]
                                while (next.length <= idx) next.push(null)
                                next[idx] = e.target.value
                                return next
                              })}
                              placeholder={isEn ? `Type "${stage}" here...` : `"${stage}"을 따라 입력해보세요...`}
                              className={clsx(
                                'w-full px-3 py-2 text-sm rounded-lg border transition-colors text-stone-700 placeholder:text-stone-300 focus:outline-none',
                                isCorrect ? 'border-teal-300 bg-teal-50 focus:border-teal-400' : 'border-stone-200 bg-stone-50 focus:border-amber-300'
                              )}
                            />
                            {value.length > 0 && !isCorrect && (
                              <p className="text-xs text-red-400 mt-1">{isEn ? `Please type "${stage}" exactly.` : `"${stage}"을 정확히 입력해주세요`}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : session.think.inputType === 'quiz' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${(checks.filter(v => v === true).length / (session.think.items.length - (session.think.wrongItems?.length ?? 0))) * 100}%` }} />
                  </div>
                  <span className="text-xs text-stone-400">
                    {checks.filter(v => v === true).length}/{session.think.items.length - (session.think.wrongItems?.length ?? 0)}
                  </span>
                </div>
                <ul className="space-y-2">
                  {session.think.items.map((item, i) => {
                    const isWrong = session.think.wrongItems?.includes(i)
                    const isChecked = checks[i] === true
                    const isWrongChecked = checks[i] === 'wrong'
                    return (
                      <li key={i}
                        onClick={() => {
                          if (isWrong) {
                            setChecks(prev => prev.map((v, idx) => idx === i ? 'wrong' : v))
                            setTimeout(() => setChecks(prev => prev.map((v, idx) => idx === i ? null : v)), 1500)
                          } else {
                            if (checks[i] === true) {
                              setChecks(prev => prev.map((v, idx) => idx === i ? null : v))
                            } else {
                              setChecks(prev => prev.map((v, idx) => idx === i ? true : v))
                            }
                          }
                        }}
                        className={clsx(
                          'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                          isWrongChecked ? 'bg-red-50 border-red-300' :
                          isChecked ? 'bg-teal-50 border-teal-300' :
                          'bg-white border-stone-100 hover:border-stone-200'
                        )}>
                        <div className={clsx(
                          'w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all',
                          isWrongChecked ? 'bg-red-400 text-white' :
                          isChecked ? 'bg-teal-500 text-white' :
                          'border-2 border-stone-200'
                        )}>
                          {isWrongChecked && <span className="text-xs">✕</span>}
                          {isChecked && <span className="text-xs">✓</span>}
                        </div>
                        <p className={clsx('text-sm leading-relaxed flex-1',
                          isWrongChecked ? 'text-red-500' : isChecked ? 'text-teal-700' : 'text-stone-700')}>
                          {item}
                        </p>
                        {isWrongChecked && <span className="text-xs text-red-400 font-medium flex-shrink-0">다시 생각해보세요</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : session.think.inputType === 'select' ? (
              <ul className="space-y-4">
                {session.think.items.map((item, i) => (
                  <li key={i}
                    onClick={() => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v))}
                    className={clsx(
                      'rounded-2xl overflow-hidden border-2 cursor-pointer transition-all',
                      checks[i] === true ? 'border-pink-400 shadow-md' : 'border-stone-100 hover:border-pink-200'
                    )}>
                    {session.think.images?.[i] && (
                      <img src={session.think.images[i]} alt={item} width={800} height={600}
                        style={{ width: '100%', objectFit: 'contain' }} />
                    )}
                    <div className={clsx('p-4 flex items-start gap-3 transition-colors',
                      checks[i] === true ? 'bg-pink-50' : 'bg-white')}>
                      <div className={clsx('w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
                        checks[i] === true ? 'bg-pink-500 text-white' : 'border-2 border-stone-200')}>
                        {checks[i] === true && <span className="text-xs">✓</span>}
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed">{item}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : session.think.inputType === 'text' ? (
              <ul className="space-y-3">
                {session.think.items.map((item, i) => (
                  <li key={i} className="bg-white rounded-xl p-4 border border-stone-100">
                    <p className="text-sm font-medium text-stone-700 leading-relaxed mb-2">{i + 1}. {item}</p>
                    <textarea
                      value={typeof checks[i] === 'string' ? checks[i] as string : ''}
                      onChange={e => setChecks(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                      placeholder={isEn ? 'Write your answer here...' : '여기에 답을 적어보세요.'}
                      rows={3}
                      className="w-full p-3 text-sm leading-relaxed rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-purple-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${(checkedCount / checks.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-stone-400">{checkedCount}/{checks.length}</span>
                </div>
                <ul className="space-y-3">
                  {session.think.items.map((item, i) => (
                    <li key={i} className="bg-white rounded-xl p-4 border border-stone-100">
                      <p className="text-sm text-stone-700 leading-relaxed mb-3">{item}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setChecks(prev => prev.map((v, idx) => idx === i ? true : v))}
                          className={clsx('flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                            checks[i] === true ? 'bg-purple-500 text-white' : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-purple-300')}>
                          {isEn ? 'Yes' : '네'}
                        </button>
                        <button
                          onClick={() => setChecks(prev => prev.map((v, idx) => idx === i ? false : v))}
                          className={clsx('flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                            checks[i] === false ? 'bg-pink-500 text-white' : 'bg-stone-50 text-stone-500 border border-stone-200 hover:border-pink-300')}>
                          {isEn ? 'No' : '아니오'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
{/* 4, 5, 10회기 실천 예시 */}
            {(['s4','s5','s10'].includes(session.id)) && checks.some(v => v === true) && (() => {
              const checkedIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)

              const practiceExamples_adult: Record<string, { title: string; examples: string[] }[]> = {
                s4: [
                  {
                    title: '재시(財施) · 물질·시간·재능 나눔',
                    examples: [
                      '오늘 집에서 안 쓰는 물건 하나를 필요한 사람에게 나눠보세요',
                      '누군가의 일을 10분만 도와주세요 — 짐 들기, 자료 찾기 등',
                      '내가 잘하는 것(요리, 글쓰기, IT 등)을 한 번 가르쳐주세요',
                      '지인에게 작은 선물이나 음식을 건네보세요',
                    ]
                  },
                  {
                    title: '무외시(無畏施) · 정서적 지지와 안전감',
                    examples: [
                      '힘들어 보이는 사람에게 "괜찮아?"라고 먼저 물어보세요',
                      '누군가의 이야기를 끝까지 듣고 "그랬구나"라고 말해주세요',
                      '불안해하는 사람 옆에 그냥 함께 있어주세요',
                      '응원의 문자 한 통을 보내보세요',
                    ]
                  },
                  {
                    title: '법시(法施) · 바른 가르침 전하기',
                    examples: [
                      '내가 유익하게 읽은 글이나 영상을 공유해보세요',
                      '누군가의 고민에 내 경험을 솔직하게 나눠주세요',
                      '좋은 말 한마디 — "잘하고 있어", "네가 해낼 수 있어"',
                      '이 프로그램에서 배운 것을 주변에 조용히 나눠보세요',
                    ]
                  },
                ],
                s5: [
                  {
                    title: '생명 소중히 여기기',
                    examples: [
                      '오늘 하루 동안 화가 날 때 한 번만 멈추고 심호흡해보세요',
                      '길가의 식물이나 동물에게 잠깐 시선을 주세요',
                      '나 자신의 몸을 돌보는 시간을 10분만 가져보세요',
                      '주변 사람에게 "고마워"라고 한 번 말해보세요',
                    ]
                  },
                  {
                    title: '탐내지 않기',
                    examples: [
                      '오늘 하루 온라인 쇼핑을 한 번만 참아보세요',
                      '남의 것을 부러워하는 마음이 들 때 "지금 내게 있는 것"을 떠올려보세요',
                      '필요하지 않은 것을 사고 싶을 때 하루 기다려보세요',
                      '소비 전에 "정말 필요한가?"라고 한 번 물어보세요',
                    ]
                  },
                  {
                    title: '그릇된 행동 삼가기',
                    examples: [
                      '오늘 하루 후회할 것 같은 행동을 하기 전에 3초 멈춰보세요',
                      '습관적으로 하는 중독 행동 전에 "지금 왜 하려는가?" 물어보세요',
                      '충동이 올 때 자리를 바꾸거나 물 한 잔 마셔보세요',
                    ]
                  },
                  {
                    title: '바른말 실천하기',
                    examples: [
                      '오늘 하루 험담이나 불평을 한 번만 줄여보세요',
                      '거짓말 대신 "모르겠어요"라고 솔직하게 말해보세요',
                      '누군가를 칭찬하는 말을 한 마디 해보세요',
                      '말하기 전에 "이 말이 도움이 되는가?" 잠깐 생각해보세요',
                    ]
                  },
                  {
                    title: '정신 흐리게 하는 것 멀리하기',
                    examples: [
                      '오늘 스마트폰 사용 시간을 30분만 줄여보세요',
                      '자기 전 1시간은 화면 없이 지내보세요',
                      '술이나 카페인을 하루만 줄여보세요',
                      '무의식적으로 켜는 유튜브나 SNS를 오늘 한 번만 참아보세요',
                    ]
                  },
                ],
                s10: [
                  {
                    title: '어려움을 두려워하지 않는 의지',
                    examples: [
                      '오늘 미뤄왔던 일 하나를 5분만 시작해보세요',
                      '실패했던 일을 다시 한 번 작은 크기로 시도해보세요',
                      '"할 수 없어"라는 말 대신 "아직은 어렵지만"이라고 바꿔보세요',
                    ]
                  },
                  {
                    title: '이미 생긴 나쁜 습관 끊기',
                    examples: [
                      '오늘 그 습관 행동을 한 번만 멈추고 5분 기다려보세요',
                      '중독 행동이 일어나기 직전 신호(감정, 장소, 시간)를 기록해보세요',
                      '그 행동 대신 할 수 있는 것 하나를 정해보세요 (산책, 물 마시기 등)',
                    ]
                  },
                  {
                    title: '나쁜 습관이 생기기 전에 막기',
                    examples: [
                      '중독 행동이 자주 일어나는 상황이나 장소를 오늘 한 번 피해보세요',
                      '스트레스를 느끼기 전에 미리 산책이나 스트레칭을 해보세요',
                      '충동이 오기 쉬운 시간대에 다른 활동을 미리 계획해보세요',
                    ]
                  },
                  {
                    title: '좋은 마음 새롭게 일으키기',
                    examples: [
                      '오늘 하루 감사한 것 3가지를 저녁에 적어보세요',
                      '누군가를 응원하는 말을 한 번 해보세요',
                      '새로운 좋은 습관을 딱 하나만 오늘 시작해보세요 (5분 명상, 일기 등)',
                    ]
                  },
                  {
                    title: '좋은 습관 더 늘리기',
                    examples: [
                      '이미 잘 하고 있는 좋은 습관을 오늘 한 번 더 해보세요',
                      '지금까지 잘 해온 것 하나를 스스로 인정해주세요',
                      '좋은 습관을 함께 할 사람을 한 명 찾아보세요',
                    ]
                  },
                  {
                    title: '지혜와 자비 나누기',
                    examples: [
                      '이 프로그램에서 배운 것 중 하나를 주변 사람에게 나눠보세요',
                      '힘들어 보이는 사람에게 오늘 먼저 말을 걸어보세요',
                      '내 경험을 솔직하게 나누는 것 자체가 나눔이에요',
                    ]
                  },
                ],
              }

              const practiceExamples_youth: Record<string, { title: string; examples: string[] }[]> = {
                s4: [
                  {
                    title: '재시(財施) · 물질·시간·재능 나눔',
                    examples: [
                      '안 쓰는 학용품이나 책을 친구나 동생에게 나눠보세요',
                      '수업 시간에 모르는 친구에게 10분만 같이 공부해주세요',
                      '내가 잘하는 것(그림, 게임, 공부 등)을 한 번 가르쳐주세요',
                      '가족에게 간식을 챙겨주거나 심부름을 먼저 해보세요',
                    ]
                  },
                  {
                    title: '무외시(無畏施) · 정서적 지지와 안전감',
                    examples: [
                      '힘들어 보이는 친구에게 "괜찮아?"라고 먼저 물어보세요',
                      '친구의 이야기를 끝까지 듣고 "그랬구나, 힘들었겠다"라고 말해주세요',
                      '혼자 있는 친구 옆에 그냥 같이 있어주세요',
                      '응원의 문자나 카톡 한 통을 보내보세요',
                    ]
                  },
                  {
                    title: '법시(法施) · 바른 가르침 전하기',
                    examples: [
                      '유익하게 봤던 영상이나 글을 친구에게 공유해보세요',
                      '친구 고민에 내 경험을 솔직하게 나눠주세요',
                      '"잘하고 있어", "네가 해낼 수 있어"라고 말해주세요',
                      '이 프로그램에서 배운 것을 친구나 가족에게 조용히 나눠보세요',
                    ]
                  },
                ],
                s5: [
                  {
                    title: '생명 소중히 여기기',
                    examples: [
                      '오늘 화가 날 때 한 번만 멈추고 크게 숨을 쉬어보세요',
                      '학교 화단의 식물이나 길고양이에게 잠깐 시선을 줘보세요',
                      '오늘 나를 위해 스트레칭이나 산책을 10분 해보세요',
                      '부모님이나 친구에게 "고마워"라고 한 번 말해보세요',
                    ]
                  },
                  {
                    title: '탐내지 않기',
                    examples: [
                      '오늘 하루 온라인 쇼핑이나 게임 아이템 구매를 한 번 참아보세요',
                      '친구 것이 부러울 때 "지금 내게 있는 것"을 떠올려보세요',
                      '갖고 싶은 것이 생겼을 때 하루 기다려보세요',
                      '"정말 필요한가?" 한 번만 물어보고 결정해보세요',
                    ]
                  },
                  {
                    title: '그릇된 행동 삼가기',
                    examples: [
                      '후회할 것 같은 행동을 하기 전에 3초만 멈춰보세요',
                      '습관적으로 하는 행동 전에 "지금 왜 하려는 거지?" 물어보세요',
                      '충동이 올 때 자리를 바꾸거나 물 한 잔 마셔보세요',
                    ]
                  },
                  {
                    title: '바른말 실천하기',
                    examples: [
                      '오늘 하루 친구 험담이나 불평을 한 번만 줄여보세요',
                      '모를 때 솔직하게 "모르겠어"라고 말해보세요',
                      '친구나 가족을 칭찬하는 말을 한 마디 해보세요',
                      '카톡 보내기 전에 "이 말이 상처가 될까?" 한 번 생각해보세요',
                    ]
                  },
                  {
                    title: '정신 흐리게 하는 것 멀리하기',
                    examples: [
                      '오늘 스마트폰 스크린타임을 30분만 줄여보세요',
                      '자기 전 1시간은 폰 없이 지내보세요',
                      '무의식적으로 켜는 유튜브나 SNS를 오늘 한 번만 참아보세요',
                      '게임이나 영상 시청 시간을 스스로 정해보세요',
                    ]
                  },
                ],
                s10: [
                  {
                    title: '어려움을 두려워하지 않는 의지',
                    examples: [
                      '미뤄왔던 숙제나 공부를 오늘 5분만 시작해보세요',
                      '틀렸던 문제를 다시 한 번 풀어보세요',
                      '"못 해"라는 말 대신 "아직은 어렵지만 해볼게"라고 바꿔보세요',
                    ]
                  },
                  {
                    title: '이미 생긴 나쁜 습관 끊기',
                    examples: [
                      '오늘 그 습관 행동을 한 번만 멈추고 5분 기다려보세요',
                      '그 행동이 일어나기 직전 어떤 감정인지 메모해보세요',
                      '그 행동 대신 할 수 있는 것 하나를 정해보세요 (산책, 물 마시기, 친구에게 연락하기)',
                    ]
                  },
                  {
                    title: '나쁜 습관이 생기기 전에 막기',
                    examples: [
                      '그 습관이 자주 일어나는 장소나 상황을 오늘 한 번 피해보세요',
                      '스트레스 받기 전에 미리 스트레칭이나 산책을 해보세요',
                      '충동이 오기 쉬운 시간대에 다른 활동을 미리 계획해보세요',
                    ]
                  },
                  {
                    title: '좋은 마음 새롭게 일으키기',
                    examples: [
                      '오늘 하루 감사한 것 3가지를 자기 전에 적어보세요',
                      '친구나 가족을 응원하는 말을 한 번 해보세요',
                      '좋은 습관 하나를 오늘 시작해보세요 (5분 스트레칭, 일기 쓰기 등)',
                    ]
                  },
                  {
                    title: '좋은 습관 더 늘리기',
                    examples: [
                      '이미 잘 하고 있는 좋은 습관을 오늘 한 번 더 해보세요',
                      '지금까지 잘 해온 것 하나를 스스로 칭찬해주세요',
                      '좋은 습관을 함께 할 친구를 한 명 찾아보세요',
                    ]
                  },
                  {
                    title: '지혜와 자비 나누기',
                    examples: [
                      '이 프로그램에서 배운 것 하나를 친구나 가족에게 나눠보세요',
                      '힘들어 보이는 친구에게 오늘 먼저 말을 걸어보세요',
                      '내 솔직한 경험을 나누는 것 자체가 나눔이에요',
                    ]
                  },
                ],
              }

              const practiceExamples_en: Record<string, { title: string; examples: string[] }[]> = {
                s4: [
                  {
                    title: 'Material Giving · Sharing possessions, time & talents',
                    examples: [
                      'Give away one item at home you no longer use to someone who needs it',
                      'Help someone with a task for just 10 minutes — carrying things, finding info, etc.',
                      'Teach someone something you are good at (cooking, writing, tech, etc.)',
                      'Bring a small gift or snack to someone you know',
                    ]
                  },
                  {
                    title: 'Fearlessness Giving · Emotional support & safety',
                    examples: [
                      'Ask someone who looks troubled, "Are you okay?" first',
                      'Listen to someone all the way through and say "I see, that must have been hard"',
                      'Simply sit beside someone who is anxious — just being there matters',
                      'Send one message of encouragement today',
                    ]
                  },
                  {
                    title: 'Dharma Giving · Sharing wisdom & guidance',
                    examples: [
                      'Share an article or video you found helpful with someone',
                      'Honestly share your own experience with someone who is struggling',
                      'Say one kind word — "You\'re doing great", "I believe in you"',
                      'Quietly share something you\'ve learned from this program with those around you',
                    ]
                  },
                ],
                s5: [
                  {
                    title: 'Respecting Life',
                    examples: [
                      'When you feel angry today, stop just once and take a deep breath',
                      'Pause for a moment to notice a plant or animal on the street',
                      'Take 10 minutes to care for your own body today',
                      'Say "thank you" to someone around you at least once',
                    ]
                  },
                  {
                    title: 'Non-Greed',
                    examples: [
                      'Resist the urge to online shop just once today',
                      'When you feel envious of others, recall what you already have',
                      'When you want something, wait one day before deciding',
                      'Ask yourself "Do I really need this?" before buying',
                    ]
                  },
                  {
                    title: 'Avoiding Harmful Actions',
                    examples: [
                      'Before doing something you might regret, pause for 3 seconds',
                      'Before your habitual behavior, ask "Why do I want to do this right now?"',
                      'When an impulse comes, change your location or drink a glass of water',
                    ]
                  },
                  {
                    title: 'Speaking Truthfully',
                    examples: [
                      'Reduce gossip or complaints by just once today',
                      'Instead of a small lie, honestly say "I\'m not sure"',
                      'Say one word of praise to someone today',
                      'Before speaking, pause briefly: "Will this be helpful?"',
                    ]
                  },
                  {
                    title: 'Avoiding Mind-Clouding Substances & Behaviors',
                    examples: [
                      'Reduce your screen time by 30 minutes today',
                      'Stay screen-free for 1 hour before bed',
                      'Reduce alcohol or caffeine intake for just one day',
                      'Resist the habit of mindlessly opening YouTube or social media once today',
                    ]
                  },
                ],
                s10: [
                  {
                    title: 'Courage to Face Difficulty',
                    examples: [
                      'Start something you\'ve been putting off — just 5 minutes today',
                      'Try something you failed at before, in a smaller way',
                      'Replace "I can\'t do this" with "It\'s hard for now, but I\'ll try"',
                    ]
                  },
                  {
                    title: 'Ending Harmful Habits Already Present',
                    examples: [
                      'Stop the habitual behavior once today and wait 5 minutes',
                      'Note down what emotion triggered it just before it happened',
                      'Choose one thing to do instead (walk, drink water, etc.)',
                    ]
                  },
                  {
                    title: 'Preventing New Harmful Habits',
                    examples: [
                      'Avoid one situation or place where the habit often occurs',
                      'Take a walk or stretch before stress builds up',
                      'Plan a different activity for the time when impulses are most likely',
                    ]
                  },
                  {
                    title: 'Cultivating New Positive Intentions',
                    examples: [
                      'Write down 3 things you are grateful for before bed tonight',
                      'Say one word of encouragement to someone today',
                      'Start just one new good habit today (5-min meditation, journaling, etc.)',
                    ]
                  },
                  {
                    title: 'Growing Existing Good Habits',
                    examples: [
                      'Do a good habit you already practice — one more time today',
                      'Acknowledge one thing you\'ve been doing well',
                      'Find one person to share a good habit with',
                    ]
                  },
                  {
                    title: 'Sharing Wisdom & Compassion',
                    examples: [
                      'Share one thing you\'ve learned from this program with someone',
                      'Reach out first to someone who seems to be struggling',
                      'Sharing your honest experience is itself an act of giving',
                    ]
                  },
                ],
              }

              const practiceExamples = version === 'youth' ? practiceExamples_youth : version === 'en' ? practiceExamples_en : practiceExamples_adult

              const sessionExamples = practiceExamples[session.id] ?? []
              const selectedExamples = sessionExamples.filter((_, i) => checkedIdxs.includes(i))

              if (selectedExamples.length === 0) return null

              return (
                <div className="space-y-3 animate-fade-up">
                  <p className="text-xs text-orange-400 font-medium">
                    🌱 {isEn ? 'Practice Examples for Your Selections' : '선택하신 항목의 실천 예시'}
                  </p>
                  {selectedExamples.map((ex, i) => (
                    <div key={i} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-4">
                      <p className="text-xs font-bold text-orange-600 mb-2">{ex.title}</p>
                      <ul className="space-y-1.5">
                        {ex.examples.map((e, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-orange-300 flex-shrink-0 mt-0.5">•</span>
                            <p className="text-sm text-stone-600 leading-relaxed">{e}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            })()}
            {/* 회기별 체크 분석 */}
            {(['s1','s3','s9'].includes(session.id)) && checks.some(v => v !== null) && (() => {
              const getAnalysis = () => {
                if (isEn) {
                  // English version analysis
                  if (session.id === 's1') {
                    const yesIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                    const noIdxs = checks.map((v,i) => v === false ? i : -1).filter(i => i >= 0)
                    const shouldBeYes = [1,2,5,6,9]
                    const shouldBeNo = [0,3,4,7,8]
                    const correctYes = shouldBeYes.filter(i => yesIdxs.includes(i)).length
                    const correctNo = shouldBeNo.filter(i => noIdxs.includes(i)).length
                    const totalCorrect = correctYes + correctNo
                    const totalAnswered = checks.filter(v => v !== null).length
                    const fixedMind = yesIdxs.includes(3)
                    const eternalLife = yesIdxs.includes(0)
                    const eternalOwn = yesIdxs.includes(8)
                    const sameAs5 = yesIdxs.includes(7)
                    const oldWorry = yesIdxs.includes(4)
                    const changeAware = yesIdxs.includes(1) && yesIdxs.includes(2)
                    const allChangeAware = yesIdxs.includes(5) && yesIdxs.includes(6) && yesIdxs.includes(9)
                    if (totalAnswered < 5) return 'Some questions are still unanswered. Please take your time and review all the questions before checking again.'
                    if (totalCorrect >= 9) return 'You have a very deep understanding of Formless Contemplation! 🌸 Everything changes and nothing is fixed — this awareness is already well rooted in you. This session will connect that understanding directly to your habit patterns.'
                    if (totalCorrect >= 7) return 'Your understanding of Formless Contemplation is quite deep. In a few areas, the view of "fixed" still remains over "change." Let\'s explore those parts a little more through this session.'
                    if (fixedMind) return 'You feel that "addiction is a fixed part of me that I cannot escape." I fully understand how heavy that feels. But what Formless Contemplation says is exactly this — nothing is permanently fixed. Your current habits were formed by conditions, and when conditions change, they can change too.'
                    if (eternalLife) return 'You feel that you "can live forever." We often put off change when life feels endless. Formless Contemplation guides us from that very point — to look at the limits of life and choose change in this very moment.'
                    if (eternalOwn) return 'You feel there are things you "can own forever." What we cling to will eventually change or disappear. Through this session, let\'s gently examine that belief.'
                    if (sameAs5) return 'You feel you are the same person as you were at age 5. We are connected to our past, yet we change every moment. Who I am now is not the same as who I was — and growth lives in that change.'
                    if (oldWorry) return 'Concerns from around age 10 still remain with you. It may feel like those worries are still unresolved. Formless Contemplation says those worries are not permanent either — when conditions change, they can too.'
                    if (changeAware && allChangeAware) return 'Your understanding of change and impermanence is already deep. You know that emotions, situations, and even objects all change. This awareness is a solid starting point for the 12-week journey.'
                    return 'You have your own perspective on change. Formless Contemplation is the process of understanding that "nothing stays the same — so your current habits can also change." Let\'s feel that gradually through this session.'
                  }

                  if (session.id === 's3') {
                    const yesIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                    const selfYes = yesIdxs.filter(i => i <= 4).length
                    const otherYes = yesIdxs.filter(i => i >= 5).length
                    const totalYes = yesIdxs.length
                    const totalAnswered = checks.filter(v => v !== null).length
                    const selfLevel = selfYes >= 4 ? 'high' : selfYes >= 2 ? 'medium' : 'low'
                    const otherLevel = otherYes >= 4 ? 'high' : otherYes >= 2 ? 'medium' : 'low'
                    if (totalAnswered < 5) return 'Some questions are still unanswered. Please take your time and review all the questions before checking again.'
                    if (totalYes >= 9) return `Your compassion for both yourself and others is very deep! 🌸 Self-compassion ${selfYes}/5, compassion for others ${otherYes}/5 — this warmth will be the strongest foundation for breaking free from addictive patterns.`
                    if (selfYes > otherYes) return `Your self-compassion (${selfYes}/5) is higher than your compassion for others (${otherYes}/5). You have the ability to look at yourself with warmth. In this session, we will practice letting that warmth flow naturally toward those around you.`
                    if (otherYes > selfYes) return `Your compassion for others (${otherYes}/5) is higher than your self-compassion (${selfYes}/5). You are warm toward others — but perhaps strict with yourself? Compassion Contemplation begins with giving that same warmth to yourself.`
                    if (selfYes === otherYes && totalYes >= 6) return `You have balanced compassion for both yourself (${selfYes}/5) and others (${otherYes}/5). This session is about connecting that compassion to your habit patterns. Your habits too can be seen with that warm gaze.`
                    if (selfLevel === 'low' && otherLevel === 'low') return `It seems difficult right now to extend compassion to both yourself (${selfYes}/5) and others (${otherYes}/5). Compassion doesn\'t have to be grand. "Observing uncomfortable emotions without judgment" — that is enough compassion. Let\'s start with the smallest compassion through this session.`
                    return `Self-compassion ${selfYes}/5, compassion for others ${otherYes}/5. Compassion Contemplation is the practice of looking at both yourself and others with warmth. Where you feel lacking right now is the seed of compassion that will grow through this session.`
                  }

                  if (session.id === 's9') {
                    const checkedIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                    const count = checkedIdxs.length
                    const items = [
                      'Having someone nearby who can help me when I am in difficulty',
                      'Acting sincerely with words and actions aligned',
                      'Understanding others\' emotions and managing relationships well',
                      'Thinking of new ideas and solving problems creatively',
                      'Trying to live life with energy',
                      'Cooperating and taking responsibility for a group or community',
                      'Trying to learn what I don\'t know and understand it deeply',
                      'Making deep judgments based on life experience and insight',
                      'Choosing what is right even in the face of fear',
                      'Not giving up and moving toward goals even in difficulty',
                      'Treating all people fairly without prejudice',
                      'Leading others well and fostering cooperation',
                      'Being able to regulate my impulses, emotions, and actions',
                      'Feeling and expressing gratitude for what I have received',
                      'Forming deep relationships and approaching others warmly',
                      'Showing warm actions by caring for and helping others',
                    ]
                    const relationStrengths = checkedIdxs.filter(i => [0,2,5,11,14,15].includes(i))
                    const innerStrengths = checkedIdxs.filter(i => [1,7,8,9,12].includes(i))
                    const growthStrengths = checkedIdxs.filter(i => [3,6,10].includes(i))
                    const lifeStrengths = checkedIdxs.filter(i => [4,13].includes(i))
                    const dominant = [
                      { label: 'Connection & Relationships', count: relationStrengths.length },
                      { label: 'Inner Strength', count: innerStrengths.length },
                      { label: 'Learning & Growth', count: growthStrengths.length },
                      { label: 'Life Energy', count: lifeStrengths.length },
                    ].sort((a,b) => b.count - a.count)[0]
                    if (count === 0) return 'It\'s okay if your strengths aren\'t visible right now. Boundless Contemplation begins with believing "I already have infinite potential within me." Let\'s find those seeds through this session.'
                    if (count <= 3) return `${items[checkedIdxs[0]]} — you\'ve discovered a precious strength. Choosing fewer isn\'t a lack — it\'s honesty with yourself. These strengths will guide your 12-week journey.`
                    if (count <= 8) return `Your strengths stand out most in the area of ${dominant.label}. ${count} strengths — these are real resources you can actually use to break free from addictive patterns.`
                    return `You selected ${count} strengths! Among them, ${dominant.label} is your strongest area. These abundant strengths will be the solid foundation of your journey.`
                  }
                  return ''
                }
                if (session.id === 's1') {
                  const yesIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                  const noIdxs = checks.map((v,i) => v === false ? i : -1).filter(i => i >= 0)

                  // 무상관 이해 = 네여야 하는 항목 (인덱스 1,2,5,6,9)
                  const shouldBeYes = [1,2,5,6,9]
                  // 무상관 이해 = 아니오여야 하는 항목 (인덱스 0,3,4,7,8)
                  const shouldBeNo = [0,3,4,7,8]

                  const correctYes = shouldBeYes.filter(i => yesIdxs.includes(i)).length
                  const correctNo = shouldBeNo.filter(i => noIdxs.includes(i)).length
                  const totalCorrect = correctYes + correctNo
                  const totalAnswered = checks.filter(v => v !== null).length

                  // 특정 항목 체크
                  const fixedMind = yesIdxs.includes(3) // q4 네 → 중독은 고정된 나의 일부
                  const eternalLife = yesIdxs.includes(0) // q1 네 → 영원히 살 수 있다
                  const eternalOwn = yesIdxs.includes(8) // q9 네 → 영원히 소유 가능
                  const sameAs5 = yesIdxs.includes(7) // q8 네 → 5살때와 같다
                  const oldWorry = yesIdxs.includes(4) // q5 네 → 10살 고민 여전히 있다
                  const changeAware = yesIdxs.includes(1) && yesIdxs.includes(2) // q2,q3 네
                  const allChangeAware = yesIdxs.includes(5) && yesIdxs.includes(6) && yesIdxs.includes(9) // q6,q7,q10 네

                  let msg = ''

                  if (totalAnswered < 5) {
                    msg = '아직 답하지 않은 항목이 있어요. 천천히 모든 질문을 살펴보고 나서 다시 확인해보세요.'
                  } else if (totalCorrect >= 9) {
                    msg = '무상관을 매우 잘 이해하고 계시네요! 🌸 모든 것은 변하고, 고정된 실체는 없다는 것 — 이 앎이 이미 깊이 자리잡고 있어요. 이번 회기는 그 이해를 중독 패턴에 직접 연결하는 시간이 될 거예요.'
                  } else if (totalCorrect >= 7) {
                    msg = '무상관에 대한 이해가 꽤 깊으시네요. 몇 가지 항목에서 아직 "변화"보다 "고정"의 시각이 남아있어요. 이번 회기를 통해 그 부분을 조금 더 살펴보면 좋겠어요.'
                  } else if (fixedMind) {
                    msg = '지금 "중독은 고정된 나의 일부라 벗어날 수 없다"고 느끼고 계시는군요. 그 마음이 얼마나 무거운지 충분히 이해해요. 하지만 무상관이 말하는 건 바로 이거예요 — 어떤 것도 영원히 고정되어 있지 않아요. 지금의 습관도 조건이 만든 것이고, 조건이 바뀌면 달라질 수 있어요.'
                  } else if (eternalLife || eternalOwn) {
                    msg = eternalLife
                      ? '"영원히 살 수 있다"고 느끼시는군요. 우리는 종종 삶이 영원할 것처럼 느껴질 때 변화를 미루게 돼요. 무상관은 바로 그 지점에서 — 삶의 유한함을 바라보며 지금 이 순간의 변화를 선택하도록 이끌어요.'
                      : '"영원히 소유할 수 있는 것이 있다"고 느끼시는군요. 우리가 집착하는 것들도 결국 변하거나 사라져요. 이번 회기를 통해 그 믿음을 조금씩 살펴보게 될 거예요.'
                  } else if (sameAs5 || oldWorry) {
                    msg = sameAs5
                      ? '지금도 5살 때의 나와 같은 존재라고 느끼시는군요. 우리는 이어져 있지만, 동시에 매 순간 변화하고 있어요. 지금의 나는 과거의 나와 같지 않아요 — 그 변화 속에 성장이 있어요.'
                      : '10살 무렵의 고민이 여전히 남아있으시군요. 그 고민이 아직 해결되지 않은 느낌일 수 있어요. 무상관은 그 고민도 영원하지 않고, 조건이 바뀌면 달라질 수 있다고 말해요.'
                  } else if (changeAware && allChangeAware) {
                    msg = '변화와 무상함에 대한 이해가 이미 깊으시네요. 내 감정도, 상황도, 물건도 모두 변한다는 것을 아시는군요. 이 앎이 12주 여정의 든든한 출발점이 돼요.'
                  } else {
                    msg = '변화에 대한 나만의 시각이 있으시군요. 무상관은 "변하지 않는 건 없다 — 그러니 지금의 습관도 변할 수 있다"는 것을 알아가는 과정이에요. 이번 회기를 통해 조금씩 느껴보세요.'
                  }
                  return msg
                }

                if (session.id === 's3') {
                  const yesIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                  
                  // 자신에 대한 자비 (q1~q5, 인덱스 0~4)
                  const selfYes = yesIdxs.filter(i => i <= 4).length
                  // 타인에 대한 자비 (q6~q10, 인덱스 5~9)
                  const otherYes = yesIdxs.filter(i => i >= 5).length
                  const totalYes = yesIdxs.length
                  const totalAnswered = checks.filter(v => v !== null).length

                  const selfLevel = selfYes >= 4 ? '높음' : selfYes >= 2 ? '보통' : '낮음'
                  const otherLevel = otherYes >= 4 ? '높음' : otherYes >= 2 ? '보통' : '낮음'

                  let msg = ''

                  if (totalAnswered < 5) {
                    msg = '아직 답하지 않은 항목이 있어요. 천천히 모든 질문을 살펴보고 나서 다시 확인해보세요.'
                  } else if (totalYes >= 9) {
                    msg = `자신과 타인 모두에게 자비의 마음이 매우 깊으시네요! 🌸 자신에 대한 자비 ${selfYes}/5, 타인에 대한 자비 ${otherYes}/5 — 이 따뜻한 마음이 중독 패턴을 벗어나는 가장 든든한 힘이 될 거예요.`
                  } else if (selfYes > otherYes) {
                    msg = `자신에 대한 자비(${selfYes}/5)가 타인에 대한 자비(${otherYes}/5)보다 높으시네요. 나를 따뜻하게 바라보는 힘이 있으시군요. 이번 회기에서는 그 따뜻함이 주변으로도 자연스럽게 흘러가는 연습을 해볼 거예요.`
                  } else if (otherYes > selfYes) {
                    msg = `타인에 대한 자비(${otherYes}/5)가 자신에 대한 자비(${selfYes}/5)보다 높으시네요. 남에게는 따뜻한데 정작 자신에게는 엄격하신가요? 자비관은 나 자신에게도 그 따뜻함을 주는 것에서 시작해요.`
                  } else if (selfYes === otherYes && totalYes >= 6) {
                    msg = `자신(${selfYes}/5)과 타인(${otherYes}/5) 모두에게 균형 있는 자비심을 갖고 계시네요. 이번 회기는 그 자비심을 중독 패턴과 연결하는 시간이에요. 내 습관도 그 따뜻한 시선으로 바라볼 수 있어요.`
                  } else if (selfLevel === '낮음' && otherLevel === '낮음') {
                    msg = `자신(${selfYes}/5)과 타인(${otherYes}/5) 모두에게 자비의 마음을 내기가 지금은 어려우신가 봐요. 자비는 거창한 것이 아니에요. "불편한 감정을 판단하지 않고 바라보는 것" — 그것도 충분한 자비예요. 이번 회기를 통해 아주 작은 자비부터 시작해보세요.`
                  } else {
                    msg = `자신에 대한 자비 ${selfYes}/5, 타인에 대한 자비 ${otherYes}/5로 나타났어요. 자비관은 나와 타인을 함께 따뜻하게 바라보는 실천이에요. 지금 부족하게 느껴지는 부분이 바로 이번 회기에서 키워갈 자비의 씨앗이에요.`
                  }
                  return msg
                }

                if (session.id === 's9') {
                  const checkedIdxs = checks.map((v,i) => v === true ? i : -1).filter(i => i >= 0)
                  const count = checkedIdxs.length

                  // 청소년용 항목 (sessions-youth.ts 기준)
                  const youthItems = [
                    '내가 힘들 때 나를 도와줄 수 있는 사람이 옆에 있음',
                    '진심으로 행동하고 말한 대로 실천함',
                    '다른 사람의 감정을 이해하고 관계를 잘 이어감',
                    '새로운 아이디어를 잘 떠올리고 나만의 방식으로 문제를 풀어냄',
                    '삶을 활기차게 살아가려고 노력함',
                    '학교에서 모임이나 공동체를 위해 협력하고 맡은 일에 최선을 다함',
                    '모르는 것을 배우고 깊이 이해하려고 함',
                    '편견 없이 모든 사람을 공평하게 대함',
                    '여러 경험을 바탕으로 깊이 있게 생각하고 판단함',
                    '다른 사람을 좋은 방향으로 잘 이끌고 함께함',
                    '두려움이 있더라도 옳은 일을 선택함',
                    '진실한 마음으로 친구와 사귀고 따뜻하게 다가감',
                    '나의 충동, 감정, 행동을 스스로 조절할 수 있음',
                    '어려움이 있어도 포기하지 않고 목표를 향해 나아감',
                    '다른 사람을 배려하고 돕는 따뜻한 행동을 함',
                    '받은 것에 고마움을 느끼고 표현함',
                  ]

                  // 성인용 항목
                  const adultItems = [
                    '내가 어려울 때 나를 도울 수 있는 사람이 옆에 있음',
                    '진심으로 행동하고 말과 행동이 일치함',
                    '타인의 감정과 욕구를 이해하고 관계를 잘 다룸',
                    '새로운 아이디어를 생각하고 독창적으로 문제를 해결함',
                    '삶을 에너지 있게 살아가려고 함',
                    '집단이나 공동체를 위해 협력하고 책임을 다함',
                    '모르는 것을 배우고 깊이 이해하려고 함',
                    '삶의 경험과 통찰을 바탕으로 깊이 있는 판단을 내림',
                    '두려움에도 불구하고 옳은 일을 선택함',
                    '어려움 속에서도 포기하지 않고 목표를 향해 나아감',
                    '편견 없이 모든 사람을 공평하게 대함',
                    '타인을 좋은 방향으로 잘 이끌고 협력함',
                    '자신의 충동, 감정, 행동을 조절할 수 있음',
                    '받은 것에 고마움을 느끼고 표현함',
                    '깊은 관계를 형성하고 타인에게 따뜻하게 다가감',
                    '타인을 배려하고 돕는 따뜻한 행동을 함',
                  ]

                  const items = isYouth ? youthItems : adultItems
                  const selectedItems = checkedIdxs.map(i => items[i])

                  // 청소년 강점 카테고리 (항목 순서 기준)
                  // 0:도움받음 1:진심 2:공감 3:창의 4:활기 5:협력 6:배움 7:공정 8:판단 9:리더 10:용기 11:우정 12:자기조절 13:끈기 14:배려 15:감사
                  const youthRelation = checkedIdxs.filter(i => [0,2,5,9,11,14].includes(i))
                  const youthInner = checkedIdxs.filter(i => [1,8,10,12,13].includes(i))
                  const youthGrowth = checkedIdxs.filter(i => [3,6,7].includes(i))
                  const youthLife = checkedIdxs.filter(i => [4,15].includes(i))

                  // 성인 강점 카테고리
                  const adultRelation = checkedIdxs.filter(i => [0,2,5,11,14,15].includes(i))
                  const adultInner = checkedIdxs.filter(i => [1,7,8,9,12].includes(i))
                  const adultGrowth = checkedIdxs.filter(i => [3,6,10].includes(i))
                  const adultLife = checkedIdxs.filter(i => [4,13].includes(i))

                  const relationStrengths = isYouth ? youthRelation : adultRelation
                  const innerStrengths = isYouth ? youthInner : adultInner
                  const growthStrengths = isYouth ? youthGrowth : adultGrowth
                  const lifeStrengths = isYouth ? youthLife : adultLife

                  const dominant = [
                    { label: '관계와 연결', count: relationStrengths.length },
                    { label: '내면의 힘', count: innerStrengths.length },
                    { label: '배움과 성장', count: growthStrengths.length },
                    { label: '삶의 에너지', count: lifeStrengths.length },
                  ].sort((a,b) => b.count - a.count)[0]

                  let msg = ''
                  if (count === 0) {
                    msg = '지금 당장 강점이 잘 보이지 않아도 괜찮아요. 무량관은 "내 안에 이미 무한한 가능성이 있다"는 것을 믿는 것부터 시작해요. 이 회기를 통해 그 씨앗을 찾아볼게요.'
                  } else if (count <= 3) {
                    msg = `${selectedItems.slice(0,2).join(', ')} — 소중한 강점을 발견하셨네요. 적게 고른 것이 아니라, 자신에게 솔직한 거예요. 이 강점들이 12주 여정을 이끌어 줄 거예요.`
                  } else if (count <= 8) {
                    msg = `${dominant.label} 영역에서 강점이 두드러지네요. ${count}가지 강점 — 이것들이 바로 중독 패턴을 벗어나는 데 실제로 쓰일 수 있는 자원이에요.`
                  } else {
                    msg = `${count}가지나 선택하셨네요! 그 중에서도 ${dominant.label} 영역이 가장 강해요. 이 풍부한 강점들이 여정의 든든한 토대가 될 거예요.`
                  }
                  return msg
                }

                return ''
              }

              const analysis = getAnalysis()
              if (!analysis) return null

              return (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-5 animate-fade-up">
                  <p className="text-xs text-purple-400 font-medium mb-2">
                    🪷 {isEn
                      ? (session.id === 's1' ? 'Formless' : session.id === 's3' ? 'Compassion' : 'Infinite') + ' · My Mind Right Now'
                      : (session.id === 's1' ? '무상관' : session.id === 's3' ? '자비관' : '무량관') + ' · 지금 나의 마음'}
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">{analysis}</p>
                </div>
              )
            })()}

            <button
              onClick={async () => { await saveData(); setActiveTab('practice') }}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #e673a8, #d94f88)' }}>
              {isEn ? 'Save Go to Practicing →' : '저장하기 실천해보기로 이동 →'}
            </button>
          </div>
        )}

        {/* 실천해보기 */}
        {activeTab === 'practice' && (
          <div className="animate-fade-up space-y-5">

            {/* 11회기 선정 유형 표시 */}
            {session.id === 's11' && (() => {
              const groups = session.think.mbtiGroups ?? []
              const scores: Record<string, number> = {}
              groups.forEach((group, gi) => {
                scores[group.code] = 0
                group.items.forEach((_, ii) => {
                  const idx = gi * 4 + ii
                  if (checks[idx] === true) scores[group.code] = (scores[group.code] ?? 0) + 1
                })
              })
              const pairs = [['I','E'], ['S','N'], ['T','F'], ['J','P']]
              const hasAny = Object.values(scores).some(v => v > 0)
              if (!hasAny) return null
              const resultCode = pairs.map(([a, b]) => {
                const sa = scores[a] ?? 0
                const sb = scores[b] ?? 0
                if (sa === sb) return `${a}·${b}`
                return sa > sb ? a : b
              }).join(' ')
              const RESULT_LABELS_INLINE: Record<string, string> = isEn ? {
                'I': 'Quiet Inner Explorer', 'E': 'Active Energy Practitioner',
                'S': 'Sensory Awakening Meditator', 'N': 'Imaginative Expanding Meditator',
                'T': 'Logical Mind Analyst', 'F': 'Emotional Healing Practitioner',
                'J': 'Structured Growth Practitioner', 'P': 'Free Moment Explorer',
              } : {
                'I': '고요한 내면 탐구자', 'E': '활동적 에너지 실천가',
                'S': '감각 깨우기 명상가', 'N': '상상력 확장 명상가',
                'T': '논리적 마음 분석가', 'F': '감성 치유 실천가',
                'J': '규칙적 성장 실천가', 'P': '자유로운 순간 탐구자',
              }
              return (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <p className="text-xs text-stone-400 mb-1">
                    {isEn ? 'My Concentration Type from Reflecting' : '생각해보기에서 나온 나의 선정 유형'}
                  </p>
                  <p className="text-xl font-bold text-pink-600 mb-1" style={{ fontFamily: 'var(--font-gowun)' }}>
                    {resultCode}
                  </p>
                  <p className="text-xs text-stone-500 mb-2">
                    {pairs.map(([a, b]) => {
                      const sa = scores[a] ?? 0
                      const sb = scores[b] ?? 0
                      if (sa === sb) return `${RESULT_LABELS_INLINE[a]} · ${RESULT_LABELS_INLINE[b]}`
                      return RESULT_LABELS_INLINE[sa > sb ? a : b]
                    }).join(' · ')}
                  </p>
                
                </div>
              )
            })()}

            <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-300">
              <p className="text-xs text-orange-500 font-medium mb-1">{isEn ? 'Today\'s Practice' : '오늘의 실천'}</p>
              <p className="text-sm text-orange-700 leading-relaxed">{session.practice.q}</p>
            </div>

            {/* DAY 탭 */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: 7 }, (_, i) => (
                <button key={i}
                  onClick={() => setActiveDay(i)}
                  className={clsx(
                    'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    activeDay === i ? 'bg-orange-500 text-white' :
                    practiceTexts[i]?.trim() ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                    'bg-stone-50 text-stone-400 border border-stone-200'
                  )}>
                  DAY {i + 1}
                  {practiceTexts[i]?.trim() && activeDay !== i && <span className="ml-1">✓</span>}
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-stone-400 mb-1">DAY {activeDay + 1}</p>
              <textarea
                value={practiceTexts[activeDay] || ''}
                onChange={e => setPracticeTexts(prev => prev.map((v, idx) => idx === activeDay ? e.target.value : v))}
                placeholder={session.practice.placeholder}
                rows={8}
                className="w-full p-3 text-sm leading-relaxed rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-orange-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
              />
            </div>

            <div className="flex gap-2">
              {activeDay < 6 ? (
                <button onClick={async () => {
                  await saveData()
                  setCardDay(activeDay + 1)
                  setShowCard(true)
                }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-all">
                  Save & DAY {activeDay + 2} →
                </button>
              ) : (
                <button onClick={async () => {
                    await saveData()
                    setCardDay(7)
                    setShowCard(true)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                  {isEn ? 'Save Go to Organizing →' : '저장하기 정리해보기로 이동 →'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 정리해보기 */}
        {activeTab === 'reflect' && (
          <div className="animate-fade-up space-y-5">
            <div className="bg-teal-50 rounded-xl p-4 border-l-4 border-teal-300">
              <p className="text-xs text-teal-500 font-medium mb-1">{isEn ? 'Weekly Organizing' : '한 주를 정리하며'}</p>
              <p className="text-sm text-teal-700 leading-relaxed">{isEn ? 'Take your time to reflect on and organize the week\'s practice.' : '일주일의 실천을 돌아보며 천천히 답해보세요.'}</p>
            </div>
            {session.reflect.qs.map((q, i) => (
              <div key={i}>
                <label className="flex items-start gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">{i + 1}</span>
                  <span className="text-sm text-stone-700 leading-relaxed">{q}</span>
                </label>
                <textarea
                  value={reflectTexts[i] || ''}
                  onChange={e => setReflectTexts(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                  placeholder={isEn ? 'Write here...' : '여기에 기록해보세요.'}
                  rows={4}
                  className="w-full p-4 text-sm leading-relaxed rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-teal-300 resize-none transition-colors text-stone-700 placeholder:text-stone-300"
                />
              </div>
            ))}
            <div className="bg-stone-50 rounded-xl p-5 text-center">
              <p className="text-xs text-stone-400 mb-2" style={{ fontFamily: 'var(--font-gowun)' }}>{isEn ? 'Session Declaration' : '회기 선언문'}</p>
              <p className="text-sm text-stone-600 leading-relaxed italic" style={{ fontFamily: 'var(--font-gowun)' }}>
                {session.reflect.declaration}
              </p>
            </div>

            {session.id === 's12' ? (
              <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-6 border border-pink-100 text-center space-y-4">
                <p className="text-2xl">🪷</p>
                <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                  {isEn
                    ? <>Now, it is time to tend to the lotus of compassion<br/>that has blossomed from the seed of wisdom.<br/>Would you like to begin anew?</>
                    : <>이제, 지혜의 씨앗에서 싹을 틔워 피운<br/>자비의 연꽃을 돌볼 시간입니다.<br/>새롭게 다시 시작하시겠습니까?</>}
                </p>
                <button
                  onClick={async () => {
  await supabase.from('session_records').delete().eq('user_id', userId).eq('version', version)
  await new Promise(resolve => setTimeout(resolve, 500))
  router.push('/awareness?point=end')
}}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #e673a8, #d94f88)' }}>
                  {isEn ? '🪷 Start Again from Session 1' : '🪷 1회기부터 다시 시작하기'}
                </button>
             <button
                  onClick={async () => { await saveData(true); router.push('/awareness?point=end') }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                  {isEn ? 'Session List' : '회기 목록으로'}
                </button>
              </div>
            ) : (
              <button
                onClick={async () => { await saveData(true); router.push('/dashboard') }}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                {isEn ? '✓ Return to Session List' : '✓ 회기 목록으로 돌아가기'}
              </button>
            )}
          </div>
        )}
      </main>

      {/* 저장 상태 표시만 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-stone-100 px-4 py-2 text-center">
        <p className="text-xs text-stone-400">
          {saving
            ? (isEn ? 'Saving...' : '저장 중...')
            : saved
            ? (isEn ? 'Saved ✓' : '저장됨 ✓')
            : (isEn ? 'Auto-saving' : '자동 저장됩니다')}
        </p>
      </div>
    </div>
  )
}

function MbtiSection({ groups, checks, setChecks, isEn }: {
  groups: { label: string; code: string; items: string[] }[]
  checks: (boolean | null | string)[]
  setChecks: React.Dispatch<React.SetStateAction<(boolean | null | string)[]>>
  isEn: boolean
}) {
  const COLORS: Record<string, { bg: string; border: string; text: string; checked: string }> = {
    I: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', checked: 'bg-purple-500' },
    E: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', checked: 'bg-orange-500' },
    S: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', checked: 'bg-green-500' },
    N: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', checked: 'bg-blue-500' },
    T: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', checked: 'bg-slate-500' },
    F: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', checked: 'bg-pink-500' },
    J: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', checked: 'bg-teal-500' },
    P: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', checked: 'bg-amber-500' },
  }

  const RESULT_LABELS: Record<string, string> = isEn ? {
    'I': 'Quiet Inner Explorer', 'E': 'Active Energy Practitioner',
    'S': 'Sensory Awakening Meditator', 'N': 'Imaginative Expanding Meditator',
    'T': 'Logical Mind Analyst', 'F': 'Emotional Healing Practitioner',
    'J': 'Structured Growth Practitioner', 'P': 'Free Moment Explorer',
  } : {
    'I': '고요한 내면 탐구자', 'E': '활동적 에너지 실천가',
    'S': '감각 깨우기 명상가', 'N': '상상력 확장 명상가',
    'T': '논리적 마음 분석가', 'F': '감성 치유 실천가',
    'J': '규칙적 성장 실천가', 'P': '자유로운 순간 탐구자',
  }

  const scores: Record<string, number> = {}
  groups.forEach((group, gi) => {
    scores[group.code] = 0
    group.items.forEach((_, ii) => {
      const idx = gi * 4 + ii
      if (checks[idx] === true) scores[group.code]++
    })
  })

  const pairs = [['I','E'], ['S','N'], ['T','F'], ['J','P']]
  const hasAnyCheck = Object.values(scores).some(v => v > 0)

  const pairResults = pairs.map(([a, b]) => {
    const sa = scores[a] ?? 0
    const sb = scores[b] ?? 0
    if (sa === sb) return { code: `${a}·${b}`, label: `${RESULT_LABELS[a]}·${RESULT_LABELS[b]}`, tied: true, colorA: a, colorB: b }
    return { code: sa > sb ? a : b, label: RESULT_LABELS[sa > sb ? a : b], tied: false, colorA: sa > sb ? a : b, colorB: sa > sb ? a : b }
  })

  
  return (
    <div className="space-y-4">
      {groups.map((group, gi) => {
        const color = COLORS[group.code]
        const groupScore = scores[group.code] ?? 0
        return (
          <div key={gi} className={`rounded-2xl border overflow-hidden ${color.border}`}>
            <div className={`px-4 py-3 border-b ${color.bg} ${color.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${color.checked}`}>
                  {group.code}
                </span>
                <p className={`text-sm font-medium ${color.text}`}>{group.label}</p>
              </div>
              <span className={`text-xs ${color.text}`}>{groupScore}/4</span>
            </div>
            <div className="p-3 space-y-2 bg-white">
              {group.items.map((item, ii) => {
                const idx = gi * 4 + ii
                const isChecked = checks[idx] === true
                return (
                  <div key={ii}
                    onClick={() => setChecks(prev => prev.map((v, pidx) => pidx === idx ? (v === true ? null : true) : v))}
                    className={clsx('flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border',
                      isChecked ? `${color.bg} ${color.border}` : 'border-stone-100 hover:border-stone-200')}>
                    <div className={clsx('w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all',
                      isChecked ? `${color.checked} text-white` : 'border-2 border-stone-200')}>
                      {isChecked && <span className="text-xs leading-none">✓</span>}
                    </div>
                    <p className={clsx('text-sm leading-relaxed', isChecked ? color.text : 'text-stone-600')}>{item}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {hasAnyCheck && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100 text-center">
          <p className="text-xs text-stone-400 mb-2">{isEn ? 'My Concentration Type' : '나의 선정 유형'}</p>
          <div className="space-y-1 mb-3">
            {pairResults.map((r, i) => (
              <p key={i} className="text-lg font-bold" style={{ fontFamily: 'var(--font-gowun)', color: '#d94f88' }}>
                {r.code}
                {r.tied && <span className="text-xs text-stone-400 font-normal ml-2">{isEn ? 'Balanced' : '균형형'}</span>}
              </p>
            ))}
          </div>
          <p className="text-sm text-stone-600 font-medium leading-relaxed">
            {pairResults.map(r => r.label).join(' · ')}
          </p>
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            {pairResults.map((r, i) => {
              const color = COLORS[r.colorA]
              return (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
                  {r.code} {r.tied ? (isEn ? 'Tied' : '동점') : `${scores[r.colorA]}${isEn ? 'points' : '점'}`}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}