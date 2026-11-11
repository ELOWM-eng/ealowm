'use client'

// 수료증 화면: 기수가 끝난 뒤, 기준을 채운 사람만 볼 수 있고 이미지(PNG)로 저장해요.
// 주소: /certificate?c=기수번호  (두 기수를 모두 수료했다면 /certificate?c=full 로 12주 완주 증서)

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { drawCertificate, type CertData } from '@/lib/certificate-draw'

type Cohort = { id: number; name_ko: string; name_en: string; start_date: string; weeks: number; pass_percent: number }

const DAY = 86400000
const toMs = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmt = (iso: string, ko: boolean) =>
  ko ? iso.replace(/-/g, '.') : `${MON[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8))}, ${iso.slice(0, 4)}`

type Result = { state: 'loading' | 'error' | 'login' | 'youth' | 'nonick' | 'notyet' | 'notfound' | 'ok'; data?: CertData }

export default function CertificatePage() {
  const [res, setRes] = useState<Result>({ state: 'loading' })
  const [url, setUrl] = useState('')
  const [en, setEn] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const q = new URLSearchParams(window.location.search).get('c') ?? ''
      const sb = createClient()
      const { data: u } = await sb.auth.getUser()
      if (!u.user) { if (alive) setRes({ state: 'login' }); return }
      const [c, g, p] = await Promise.all([
        sb.from('practice_cohorts').select('*').order('start_date', { ascending: true }),
        sb.from('user_goals').select('version').eq('user_id', u.user.id).maybeSingle(),
        sb.from('practice_profiles').select('nickname').eq('user_id', u.user.id).maybeSingle(),
      ])
      if (c.error || g.error || p.error) { if (alive) setRes({ state: 'error' }); return }
      const version = (g.data?.version as string | undefined) ?? null
      const isEn = version === 'en'
      if (alive) setEn(isEn)
      if (version === 'youth') { if (alive) setRes({ state: 'youth' }); return }
      const nickname = (p.data?.nickname as string | undefined) ?? ''
      if (!nickname) { if (alive) setRes({ state: 'nonick' }); return }
      const list = (c.data ?? []) as Cohort[]
      if (!list.length) { if (alive) setRes({ state: 'notfound' }); return }

      const last = list[list.length - 1]
      const lastEnd = toIso(toMs(last.start_date) + (last.weeks * 7 - 1) * DAY)
      const r = await sb.rpc('my_attendance_days', { p_from: list[0].start_date, p_to: lastEnd })
      if (r.error) { if (alive) setRes({ state: 'error' }); return }
      const days = new Set((r.data ?? []).map((x: { day: string }) => x.day))
      const today = todayIn(isEn ? 'America/New_York' : 'Asia/Seoul')

      const stat = (co: Cohort) => {
        const total = co.weeks * 7
        const need = Math.ceil((total * co.pass_percent) / 100)
        let count = 0
        for (let i = 0; i < total; i++) if (days.has(toIso(toMs(co.start_date) + i * DAY))) count++
        const end = toIso(toMs(co.start_date) + (total - 1) * DAY)
        return { ok: count >= need, end, ended: today > end }
      }
      const ko = !isEn
      const idPart = u.user.id.replace(/-/g, '').slice(0, 6).toUpperCase()
      let data: CertData
      if (q === 'full') {
        const sts = list.map(stat)
        if (list.length < 2 || !sts.every(s => s.ok)) { if (alive) setRes({ state: 'notfound' }); return }
        if (!sts.every(s => s.ended)) { if (alive) setRes({ state: 'notyet' }); return }
        const weeks = list.reduce((a, b) => a + b.weeks, 0)
        data = {
          lang: ko ? 'ko' : 'en', kind: 'full', nickname,
          program: ko ? `${weeks}주 과정` : `the ${weeks}-week EALOWM Practice Together program`,
          period: `${fmt(list[0].start_date, ko)} ~ ${fmt(lastEnd, ko)}`,
          issued: fmt(toIso(toMs(lastEnd) + DAY), ko), // 마지막 기수가 끝난 다음 날
          number: `EAL-FULL-${idPart}`,
        }
      } else {
        const co = list.find(x => String(x.id) === q)
        if (!co) { if (alive) setRes({ state: 'notfound' }); return }
        const s = stat(co)
        if (!s.ok) { if (alive) setRes({ state: 'notfound' }); return }
        if (!s.ended) { if (alive) setRes({ state: 'notyet' }); return }
        data = {
          lang: ko ? 'ko' : 'en', kind: 'cohort', nickname,
          program: ko ? co.name_ko : co.name_en,
          period: `${fmt(co.start_date, ko)} ~ ${fmt(s.end, ko)}`,
          issued: fmt(toIso(toMs(s.end) + DAY), ko), // 기수가 끝난 다음 날
          number: `EAL-C${co.id}-${idPart}`,
        }
      }
      if (alive) setRes({ state: 'ok', data })
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (res.state !== 'ok' || !res.data || !canvasRef.current) return
    let alive = true
    const run = async () => {
      try { await document.fonts.ready } catch {}
      if (!alive || !canvasRef.current) return
      drawCertificate(canvasRef.current, res.data!)
      setUrl(canvasRef.current.toDataURL('image/png'))
    }
    void run()
    return () => { alive = false }
  }, [res])

  const t = en
    ? { title: 'Certificate', back: 'Back', save: 'Save as image', hint: 'If it does not save, press and hold the image to save it.',
        loading: 'Loading…', error: 'Could not load. Please try again.', login: 'Please log in first.',
        youth: 'Certificates are not available for this version.', nonick: 'No nickname is set yet. Join a room once to set one.',
        notyet: 'Certificates are issued after the round ends.', notfound: 'No certificate is available for this round.' }
    : { title: '수료증', back: '돌아가기', save: '이미지로 저장', hint: '저장이 안 되면 이미지를 길게 눌러서 저장하세요.',
        loading: '불러오는 중…', error: '불러오지 못했어요. 다시 시도해주세요.', login: '먼저 로그인해주세요.',
        youth: '이 버전에서는 수료증을 사용하지 않아요.', nonick: '아직 닉네임이 없어요. 함께 수행에 한 번 참여하면 닉네임을 정할 수 있어요.',
        notyet: '기수가 끝난 뒤에 수료증을 받을 수 있어요.', notfound: '이 기수에서 받을 수 있는 수료증이 없어요.' }

  const file = res.data ? `ealowm-${res.data.number}.png` : 'ealowm-certificate.png'

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-stone-700">🪷 {t.title}</h1>
        <Link href="/stamps" className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5">{t.back}</Link>
      </div>
      {res.state !== 'ok' && <p className="text-sm text-stone-500">{t[res.state]}</p>}
      <canvas ref={canvasRef} className="hidden" />
      {res.state === 'ok' && (
        <div className="space-y-3">
          {url
            ? <img src={url} alt={t.title} className="w-full rounded-xl border border-pink-100 shadow" />
            : <p className="text-sm text-stone-400">{t.loading}</p>}
          {url && (
            <>
              <a href={url} download={file} className="block text-center text-sm bg-pink-500 text-white rounded-xl py-3">{t.save}</a>
              <p className="text-xs text-stone-400">{t.hint}</p>
            </>
          )}
        </div>
      )}
    </main>
  )
}
