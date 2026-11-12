'use client'

// 함께 수행 일정 달력: 함께 수행 중이 아니어도 언제든 열어서, 앞으로의 방 일정을 달력과 목록으로 볼 수 있어요.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Room, wallOf, todayIn, localTz, programTz, hhmmAdd } from '@/lib/schedule-util'

const DAY = 86400000
const toMs = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export default function SchedulePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [version, setVersion] = useState<string | null>(null)
  const [admin, setAdmin] = useState(false)
  const [state, setState] = useState<'loading' | 'ok' | 'error' | 'login'>('loading')
  const [month, setMonth] = useState('') // YYYY-MM
  const [picked, setPicked] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = createClient()
      const { data: u } = await sb.auth.getUser()
      if (!u.user) { if (alive) setState('login'); return }
      const g = await sb.from('user_goals').select('version').eq('user_id', u.user.id).maybeSingle()
      const v = (g.data?.version as string | undefined) ?? 'adult'
      const from = new Date(Date.now() - 2 * DAY).toISOString() // 시간대 차이를 감안해 이틀 전부터
      const r = await sb.from('practice_sessions').select('id,versions,title,starts_at,duration_min')
        .contains('versions', [v]).gte('starts_at', from).order('starts_at', { ascending: true }).limit(1500)
      if (r.error) { if (alive) setState('error'); return }
      const a = await sb.rpc('is_practice_admin')
      if (!alive) return
      const list = (r.data ?? []) as Room[]
      const tz = programTz(v)
      const today = todayIn(tz)
      setVersion(v); setRooms(list); setAdmin(a.data === true)
      const first = list.length ? wallOf(list[0].starts_at, tz).date : today
      const start = first > today ? first : today
      setMonth(start.slice(0, 7)); setPicked(start)
      setState('ok')
    })()
    return () => { alive = false }
  }, [])

  const en = version === 'en'
  const tz = programTz(version)
  const mine = localTz()
  const t = en
    ? { title: 'Practice schedule', back: 'Back', loading: 'Loading…', error: 'Could not load. Please try again.', login: 'Please log in first.', none: 'No rooms on this day.', next: 'Next room', noNext: 'No upcoming rooms are scheduled yet.', dow: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], tzNote: 'Times are shown in Eastern Time', mineNote: (z: string) => `, and in your device time (${z}) in parentheses.`, only: '.', admin: 'Manage schedule', rooms: (n: number) => `${n} room${n === 1 ? '' : 's'}`, today: 'Today', open: 'Opens 10 minutes before the start.' }
    : { title: '함께 수행 일정', back: '돌아가기', loading: '불러오는 중…', error: '불러오지 못했어요. 다시 시도해주세요.', login: '먼저 로그인해주세요.', none: '이 날은 방이 없어요.', next: '다음 방', noNext: '아직 예정된 방이 없어요.', dow: ['월', '화', '수', '목', '금', '토', '일'], tzNote: '시간은 한국 시간으로 보여드려요', mineNote: (z: string) => `, 괄호 안은 내 기기 시간(${z})이에요.`, only: '.', admin: '일정 관리', rooms: (n: number) => `${n}개`, today: '오늘', open: '시작 10분 전부터 들어올 수 있어요.' }

  const byDay = useMemo(() => {
    const m = new Map<string, Room[]>()
    for (const r of rooms) {
      const d = wallOf(r.starts_at, tz).date
      m.set(d, [...(m.get(d) ?? []), r])
    }
    return m
  }, [rooms, tz])

  const today = todayIn(tz)
  const nextRoom = rooms.find(r => Date.parse(r.starts_at) + r.duration_min * 60000 > Date.now())
  const sameTz = mine === tz

  function label(r: Room) {
    const a = wallOf(r.starts_at, tz).time
    const b = hhmmAdd(a, r.duration_min)
    let s = `${a}–${b}`
    if (!sameTz) {
      const la = wallOf(r.starts_at, mine)
      const lb = hhmmAdd(la.time, r.duration_min)
      const dayShift = la.date !== wallOf(r.starts_at, tz).date ? ` ${la.date.slice(5).replace('-', '/')}` : ''
      s += ` (${la.time}–${lb}${dayShift})`
    }
    return s
  }

  function shift(n: number) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(Date.UTC(y, m - 1 + n, 1))
    setMonth(d.toISOString().slice(0, 7))
  }

  const [y, mo] = month ? month.split('-').map(Number) : [2000, 1]
  const firstMs = Date.UTC(y, mo - 1, 1)
  const lead = (new Date(firstMs).getUTCDay() + 6) % 7
  const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate()
  const cells: (string | null)[] = Array(lead).fill(null)
  for (let i = 1; i <= dim; i++) cells.push(toIso(firstMs + (i - 1) * DAY))
  const dayRooms = byDay.get(picked) ?? []
  const nextLabel = nextRoom
    ? `${wallOf(nextRoom.starts_at, tz).date.slice(5).replace('-', '/')} ${label(nextRoom)} · ${nextRoom.title}`
    : ''

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-stone-700">📅 {t.title}</h1>
        <Link href="/" className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5">{t.back}</Link>
      </div>

      {state === 'loading' && <p className="text-sm text-stone-400">{t.loading}</p>}
      {state === 'error' && <p className="text-sm text-stone-500">{t.error}</p>}
      {state === 'login' && <p className="text-sm text-stone-500">{t.login}</p>}

      {state === 'ok' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-pink-50 px-3 py-2">
            <p className="text-[11px] text-pink-500">{t.next}</p>
            <p className="text-sm text-pink-700">{nextRoom ? nextLabel : t.noNext}</p>
          </div>

          <section className="bg-white rounded-2xl border border-pink-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => shift(-1)} aria-label="prev" className="px-3 py-1 text-stone-500">‹</button>
              <h2 className="text-sm font-medium text-stone-700">{en ? `${y}-${String(mo).padStart(2, '0')}` : `${y}년 ${mo}월`}</h2>
              <button onClick={() => shift(1)} aria-label="next" className="px-3 py-1 text-stone-500">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {t.dow.map((d, i) => <span key={i} className="text-[10px] text-stone-300">{d}</span>)}
              {cells.map((d, i) => {
                if (d === null) return <span key={`b${i}`} />
                const n = (byDay.get(d) ?? []).length
                return (
                  <button key={d} data-day={d} data-rooms={n} onClick={() => setPicked(d)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-all ${
                      d === picked ? 'bg-pink-500 text-white' : n ? 'bg-pink-50 text-pink-700' : 'text-stone-300'
                    } ${d === today && d !== picked ? 'ring-1 ring-pink-300' : ''}`}>
                    <span>{Number(d.slice(8))}</span>
                    {n > 0 && <span className={`text-[8px] leading-none mt-0.5 ${d === picked ? 'text-white' : 'text-pink-400'}`}>{'●'.repeat(Math.min(n, 3))}</span>}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-stone-100 p-4">
            <h3 className="text-sm font-medium text-stone-700 mb-2">
              {picked.slice(5).replace('-', '/')}{picked === today ? ` · ${t.today}` : ''}
            </h3>
            {dayRooms.length === 0
              ? <p className="text-sm text-stone-400">{t.none}</p>
              : <ul className="space-y-2">
                  {dayRooms.map(r => (
                    <li key={r.id} className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-stone-700">🪷 {r.title}</span>
                      <span className="text-stone-500 tabular-nums text-right">{label(r)}</span>
                    </li>
                  ))}
                </ul>}
            <p className="text-[11px] text-stone-300 mt-3 leading-relaxed">
              {t.open} {t.tzNote}{sameTz ? t.only : t.mineNote(mine)}
            </p>
          </section>

          {admin && (
            <Link href="/admin/schedule" className="block text-center text-xs text-white bg-stone-600 rounded-xl py-2.5">⚙ {t.admin}</Link>
          )}
        </div>
      )}
    </main>
  )
}
