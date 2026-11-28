'use client'

// 운영자 전용: 일요일 "본원의 편지"에 이용자가 남긴 답장을 주차별로 봐요.
// 운영자가 아닌 계정에는 화면이 열리지 않고, 서버(RPC)도 운영자가 아니면 막아요.

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { SESSION_NAMES } from '@/lib/practice-config'
import { TOTAL_WEEKS } from '@/lib/sunday-letters'

type Row = { id: string; week_no: number; version: string | null; nickname: string | null; body: string; created_at: string }
const VLABEL: Record<string, string> = { adult: '성인', en: '영문', youth: '청소년' }
const fmt = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso))

export default function AdminRepliesPage() {
  const [state, setState] = useState<'loading' | 'ok' | 'deny' | 'login'>('loading')
  const [rows, setRows] = useState<Row[]>([])
  const [week, setWeek] = useState<number | 0>(0) // 0 = 전체
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    ;(async () => {
      const sb = createClient()
      const { data: u } = await sb.auth.getUser()
      if (!u.user) { setState('login'); return }
      const a = await sb.rpc('is_practice_admin')
      setState(a.data === true ? 'ok' : 'deny')
    })()
  }, [])

  const load = useCallback(async () => {
    setMsg('')
    const { data, error } = await createClient().rpc('admin_list_sunday_replies', { p_week: null })
    if (error) { setMsg('불러오지 못했어요. sunday-replies-setup.sql 을 실행했는지 확인해 주세요.'); return }
    setRows((data ?? []) as Row[])
  }, [])
  useEffect(() => { if (state === 'ok') void load() }, [state, load])

  const counts = useMemo(() => {
    const c: Record<number, number> = {}
    rows.forEach(r => { c[r.week_no] = (c[r.week_no] ?? 0) + 1 })
    return c
  }, [rows])
  const shown = rows.filter(r => !week || r.week_no === week)

  async function copyAll() {
    const lines = shown.map(r => `${r.week_no}주차\t${VLABEL[r.version ?? ''] ?? ''}\t${r.nickname ?? '(닉네임 없음)'}\t${fmt(r.created_at)}\t${r.body.replace(/\s+/g, ' ')}`)
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { setMsg('복사하지 못했어요.') }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-stone-700">💌 일요일 답장</h1>
        <Link href="/admin/schedule" className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5">일정 관리</Link>
      </div>

      {state === 'loading' && <p className="text-sm text-stone-400">불러오는 중…</p>}
      {state === 'login' && <p className="text-sm text-stone-500">먼저 로그인해주세요.</p>}
      {state === 'deny' && <p className="text-sm text-stone-500">운영자만 열 수 있는 화면이에요.</p>}

      {state === 'ok' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <select value={week} onChange={e => setWeek(Number(e.target.value))}
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value={0}>전체 ({rows.length})</option>
              {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>{w}주차 {SESSION_NAMES[`s${w}`]?.ko} ({counts[w] ?? 0})</option>
              ))}
            </select>
            <button onClick={() => void load()} className="text-xs border border-stone-200 rounded-lg px-3 text-stone-500">새로고침</button>
            <button onClick={() => void copyAll()} disabled={!shown.length} className="text-xs border border-stone-200 rounded-lg px-3 text-stone-500 disabled:opacity-40">
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
          {msg && <p className="text-xs text-red-500">{msg}</p>}
          {!msg && shown.length === 0 && <p className="text-sm text-stone-400 py-6 text-center">아직 받은 답장이 없어요.</p>}
          <ul className="space-y-2">
            {shown.map(r => (
              <li key={r.id} className="bg-white rounded-2xl border border-stone-100 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>{r.week_no}주차 {SESSION_NAMES[`s${r.week_no}`]?.ko} · {VLABEL[r.version ?? ''] ?? '-'}</span>
                  <span>{fmt(r.created_at)} (한국 시간)</span>
                </div>
                <p className="text-sm font-medium text-stone-700">{r.nickname ?? '(닉네임 없음)'}</p>
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap break-words">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
