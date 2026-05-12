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
  
  const version = initialData.version
  const isEn = version === 'en'
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

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -30%, #fdf2f8 0%, #fdf8f0 70%)' }}>
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
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
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
                              placeholder={`"${stage}"을 따라 입력해보세요...`}
                              className={clsx(
                                'w-full px-3 py-2 text-sm rounded-lg border transition-colors text-stone-700 placeholder:text-stone-300 focus:outline-none',
                                isCorrect ? 'border-teal-300 bg-teal-50 focus:border-teal-400' : 'border-stone-200 bg-stone-50 focus:border-amber-300'
                              )}
                            />
                            {value.length > 0 && !isCorrect && (
                              <p className="text-xs text-red-400 mt-1">"{stage}"을 정확히 입력해주세요</p>
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
                        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
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
                <button onClick={() => setActiveDay(prev => Math.min(prev + 1, 6))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-all">
                  Save & DAY {activeDay + 2} →
                </button>
              ) : (
                <button onClick={async () => { await saveData(); setActiveTab('reflect') }}
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
  await saveData(true)
  router.push('/dashboard')
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