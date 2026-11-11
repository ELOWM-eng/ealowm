'use client'

// 내 출석 도장 달력: 기수(상반기·하반기)마다 한국 날짜 기준으로 도장을 보여주고, 수료 여부를 알려줘요.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Focus = { week_start: string; text_ko: string; text_en: string | null }
type Cohort = { id: number; name_ko: string; name_en: string; start_date: string; weeks: number; pass_percent: number }

const DAY = 86400000
const toMs = (iso: string) => Date.parse(iso + 'T00:00:00Z') // 날짜만 다루므로 UTC 자정으로 통일해요
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()) // 해당 시간대의 오늘 (YYYY-MM-DD)

export default function StampsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [days, setDays] = useState<Set<string>>(new Set())
  const [version, setVersion] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [focusRows, setFocusRows] = useState<Focus[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'error' | 'login'>('loading')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = createClient()
      const { data: u } = await sb.auth.getUser()
      if (!u.user) { if (alive) setState('login'); return }
      const f = await sb.from('practice_weekly_focus').select('week_start,text_ko,text_en').order('week_start')
      if (alive && !f.error) setFocusRows((f.data ?? []) as Focus[])
      const [c, g, p] = await Promise.all([
        sb.from('practice_cohorts').select('*').order('start_date', { ascending: true }),
        sb.from('user_goals').select('version').eq('user_id', u.user.id).maybeSingle(),
        sb.from('practice_profiles').select('nickname').eq('user_id', u.user.id).maybeSingle(),
      ])
      if (c.error) { if (alive) setState('error'); return }
      const list = (c.data ?? []) as Cohort[]
      let set = new Set<string>()
      if (list.length) {
        const from = list[0].start_date
        const last = list[list.length - 1]
        const to = toIso(toMs(last.start_date) + (last.weeks * 7 - 1) * DAY)
        const r = await sb.rpc('my_attendance_days', { p_from: from, p_to: to })
        if (r.error) { if (alive) setState('error'); return }
        set = new Set((r.data ?? []).map((x: { day: string }) => x.day))
      }
      if (!alive) return
      setCohorts(list); setDays(set)
      setVersion((g.data?.version as string | undefined) ?? null)
      setNickname((p.data?.nickname as string | undefined) ?? '')
      setState('ok')
    })()
    return () => { alive = false }
  }, [])

  const en = version === 'en'
  const t = en
    ? { title: 'My attendance stamps', back: 'Back', days: 'days', need: 'Needed to complete', done: 'Completed', rule: 'A stamp is earned on a day you stay at least 20 minutes in a room (Eastern Time). Several rooms on the same day count as one stamp.', sun: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], full: 'Completed both halves', loading: 'Loading…', error: 'Could not load. Please try again.', login: 'Please log in first.', youth: 'Attendance stamps are not available for this version.', none: 'No program period has been set yet.', note: 'This is a record kept by the app, not an official certificate.' }
    : { title: '내 출석 도장', back: '돌아가기', days: '일', need: '수료 기준', done: '수료', rule: '한국 날짜 기준으로, 그날 방에 20분 이상 머물면 도장이 찍혀요. 같은 날 여러 방에 참여해도 도장은 1개예요.', sun: ['월', '화', '수', '목', '금', '토', '일'], full: '12주 완주', loading: '불러오는 중…', error: '불러오지 못했어요. 다시 시도해주세요.', login: '먼저 로그인해주세요.', youth: '이 버전에서는 출석 도장을 사용하지 않아요.', none: '아직 프로그램 기간이 정해지지 않았어요.', note: '앱이 보관하는 참여 기록이며, 공식 증명서는 아니에요.' }

  const today = todayIn(en ? 'America/New_York' : 'Asia/Seoul')
  const passed = cohorts.map(c => {
    const total = c.weeks * 7
    const need = Math.ceil((total * c.pass_percent) / 100)
    let count = 0
    for (let i = 0; i < total; i++) if (days.has(toIso(toMs(c.start_date) + i * DAY))) count++
    return { total, need, count, ok: count >= need }
  })
  const addD = (iso: string, n: number) => toIso(toMs(iso) + n * DAY)
  const focusRow = [...focusRows].reverse().find(f => f.week_start <= today && today < addD(f.week_start, 7))
  const focusText = focusRow ? (en ? (focusRow.text_en ?? focusRow.text_ko) : focusRow.text_ko) : ''
  const allDone = cohorts.length > 1 && passed.every(p => p.ok)

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-stone-700">🪷 {t.title}</h1>
        <Link href="/" className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5">{t.back}</Link>
      </div>

      {state === 'loading' && <p className="text-sm text-stone-400">{t.loading}</p>}
      {state === 'error' && <p className="text-sm text-stone-500">{t.error}</p>}
      {state === 'login' && <p className="text-sm text-stone-500">{t.login}</p>}
      {state === 'ok' && version === 'youth' && <p className="text-sm text-stone-500">{t.youth}</p>}
      {state === 'ok' && version !== 'youth' && cohorts.length === 0 && <p className="text-sm text-stone-500">{t.none}</p>}

      {state === 'ok' && version !== 'youth' && cohorts.length > 0 && (
        <div className="space-y-5">
          {focusText && <p className="rounded-xl bg-pink-50 text-sm text-pink-700 px-3 py-2 leading-relaxed">🌿 {focusText}</p>}
          <p className="text-xs text-stone-400 leading-relaxed">{t.rule}</p>

          {allDone && (
            <div className="rounded-2xl bg-pink-50 border border-pink-200 p-4 text-center">
              <p className="text-base font-medium text-pink-700">🪷 {t.full}</p>
              {nickname && <p className="text-xs text-pink-600 mt-1">{nickname}</p>}
            </div>
          )}

          {cohorts.map((c, ci) => {
            const p = passed[ci]
            const startMs = toMs(c.start_date)
            const lead = (new Date(startMs).getUTCDay() + 6) % 7 // 첫 주의 앞쪽 빈 칸 수 (월요일=0, 한 주는 월~일)
            const cells: (string | null)[] = Array(lead).fill(null)
            for (let i = 0; i < p.total; i++) cells.push(toIso(startMs + i * DAY))
            return (
              <section key={c.id} className="bg-white rounded-2xl border border-pink-100 p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-sm font-medium text-stone-700">{en ? c.name_en : c.name_ko}</h2>
                  <span className="text-xs text-stone-400">{c.start_date} ~ {toIso(startMs + (p.total - 1) * DAY)}</span>
                </div>
                <p className="text-sm text-stone-600 mb-2">
                  {p.count}/{p.total}{t.days} · {t.need} {p.need}{t.days} ({c.pass_percent}%)
                  {p.ok && <span className="ml-2 text-pink-600 font-medium">✓ {t.done}</span>}
                </p>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {t.sun.map((d, i) => <span key={i} className="text-[10px] text-stone-300">{d}</span>)}
                  {cells.map((d, i) => d === null ? <span key={`b${i}`} /> : (
                    <div key={d} data-day={d} data-stamp={days.has(d) ? '1' : '0'}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] ${
                        days.has(d) ? 'bg-pink-50 text-pink-600' : d > today ? 'text-stone-200' : 'text-stone-400 bg-stone-50'
                      } ${d === today ? 'ring-1 ring-pink-300' : ''}`}>
                      <span>{Number(d.slice(8))}</span>
                      {days.has(d) && <span className="text-sm leading-none">🪷</span>}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
          <p className="text-[11px] text-stone-300">{t.note}</p>
        </div>
      )}
    </main>
  )
}
