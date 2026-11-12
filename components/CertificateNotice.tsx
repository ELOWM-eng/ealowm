'use client'

// 대시보드용 수료증 알림: 기수가 끝나고 수료 기준을 채웠으면 "수료증 보기"를 보여줘요.
// 1기 전반부가 끝난 다음 날, 후반부가 끝난 다음 날(12주 완주 증서 포함)에 자동으로 나타나요. (날짜는 practice_cohorts 표의 값으로 계산해요)

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

type Cohort = { id: number; name_ko: string; name_en: string; start_date: string; weeks: number; pass_percent: number }
type Item = { key: string; href: string; label: string }

const DAY = 86400000
const toMs = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
const SEEN_KEY = 'ealowm-cert-notice-seen'

export default function CertificateNotice({ version }: { version: string }) {
  const en = version === 'en'
  const [items, setItems] = useState<Item[]>([])
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (version === 'youth') return // 청소년 버전은 출석 도장·수료증을 쓰지 않아요
    let alive = true
    ;(async () => {
      const sb = createClient()
      const { data: u } = await sb.auth.getUser()
      if (!u.user) return
      const c = await sb.from('practice_cohorts').select('*').order('start_date', { ascending: true })
      const list = (c.data ?? []) as Cohort[]
      if (c.error || !list.length) return
      const today = todayIn(en ? 'America/New_York' : 'Asia/Seoul')
      const endOf = (co: Cohort) => toIso(toMs(co.start_date) + (co.weeks * 7 - 1) * DAY)
      // 아직 끝난 기수가 없으면 출석 기록을 읽을 필요도 없어요
      if (!list.some(co => today > endOf(co))) return
      const last = list[list.length - 1]
      const r = await sb.rpc('my_attendance_days', { p_from: list[0].start_date, p_to: endOf(last) })
      if (r.error) return
      const days = new Set<string>((r.data ?? []).map((x: { day: string }) => x.day))
      const stat = list.map(co => {
        const total = co.weeks * 7
        const need = Math.ceil((total * co.pass_percent) / 100)
        let count = 0
        for (let i = 0; i < total; i++) if (days.has(toIso(toMs(co.start_date) + i * DAY))) count++
        return { co, ok: count >= need, ended: today > endOf(co) }
      })
      const found: Item[] = []
      stat.forEach(s => {
        if (s.ok && s.ended) found.push({ key: `c${s.co.id}`, href: `/certificate?c=${s.co.id}`, label: en ? s.co.name_en : s.co.name_ko })
      })
      if (list.length > 1 && stat.every(s => s.ok && s.ended)) {
        found.push({ key: 'full', href: '/certificate?c=full', label: en ? '12-week completion certificate' : '12주 완주 증서' })
      }
      if (!alive || !found.length) return
      let seen = ''
      try { seen = localStorage.getItem(SEEN_KEY) ?? '' } catch {}
      // 새 수료증이 생기면(키가 달라지면) 닫았어도 다시 보여줘요
      if (seen === found.map(f => f.key).join(',')) setHidden(true)
      setItems(found)
    })()
    return () => { alive = false }
  }, [version, en])

  if (!items.length || hidden) return null

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, items.map(f => f.key).join(',')) } catch {}
    setHidden(true)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-amber-900">
          🎓 {en ? 'Your certificate is ready' : '수료증이 준비됐어요'}
        </p>
        <button onClick={close} aria-label={en ? 'Close' : '닫기'} className="text-amber-700/70 text-sm leading-none px-1">✕</button>
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {items.map(f => (
          <Link key={f.key} href={f.href} className="flex items-center justify-between rounded-xl bg-white border border-amber-200 px-3 py-2 text-xs text-stone-700 hover:shadow-sm">
            <span>{f.label}</span>
            <span className="text-pink-500">{en ? 'View certificate' : '수료증 보기'} ›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
