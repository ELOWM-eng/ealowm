'use client'

// 대시보드용 "함께 수행 일정" 카드: 다음 방 시간을 보여주고, 누르면 일정 달력(/schedule)으로 가요.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Room, wallOf, localTz, programTz, hhmmAdd } from '@/lib/schedule-util'

export default function ScheduleCard({ version }: { version: string }) {
  const en = version === 'en'
  const tz = programTz(version)
  const [room, setRoom] = useState<Room | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const sb = createClient()
      // 이미 끝난 방은 빼고, 끝나지 않은 가장 이른 방 하나만 가져와요 (시간대 차이를 감안해 어제부터 넉넉히 읽고 걸러내요)
      const from = new Date(Date.now() - 24 * 3600000).toISOString()
      const r = await sb.from('practice_sessions').select('id,versions,title,starts_at,duration_min')
        .contains('versions', [version]).gte('starts_at', from).order('starts_at', { ascending: true }).limit(10)
      if (!alive) return
      if (r.error) { setState('error'); return }
      const next = ((r.data ?? []) as Room[]).find(x => Date.parse(x.starts_at) + x.duration_min * 60000 > Date.now()) ?? null
      setRoom(next); setState('ok')
    })()
    return () => { alive = false }
  }, [version])

  const mine = localTz()
  const md = (d: string) => d.slice(5).replace('-', '/')
  let line = ''
  if (room) {
    const a = wallOf(room.starts_at, tz)
    line = `${md(a.date)} ${a.time}–${hhmmAdd(a.time, room.duration_min)}`
    if (mine !== tz) {
      const l = wallOf(room.starts_at, mine)
      line += ` (${l.date !== a.date ? md(l.date) + ' ' : ''}${l.time}–${hhmmAdd(l.time, room.duration_min)})`
    }
  }

  return (
    <Link href="/schedule" className="block bg-white rounded-2xl border border-pink-100 px-4 py-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">🗓 {en ? 'Together practice schedule' : '함께 수행 일정'}</p>
        <span className="text-xs text-pink-500">{en ? 'View' : '보기'} ›</span>
      </div>
      <p className="text-xs text-stone-500 mt-1">
        {state === 'loading' && (en ? 'Loading…' : '불러오는 중…')}
        {state === 'error' && (en ? 'Tap to view the schedule' : '눌러서 일정을 확인해보세요')}
        {state === 'ok' && (room
          ? <>{en ? 'Next room' : '다음 방'} · {line} · {room.title}</>
          : (en ? 'No upcoming rooms are scheduled yet.' : '아직 예정된 방이 없어요.'))}
      </p>
      {state === 'ok' && room && mine !== tz && (
        <p className="text-[11px] text-stone-300 mt-0.5">{en ? 'Eastern Time (your time in parentheses)' : `한국 시간 (괄호는 내 기기 시간)`}</p>
      )}
    </Link>
  )
}
