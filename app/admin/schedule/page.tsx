'use client'

// 운영자 전용: 날짜를 골라 그날의 방을 보고, 추가·수정·삭제해요.
// 운영자가 아닌 계정에는 화면이 열리지 않고, 설령 열려도 서버(RLS)가 쓰기를 막아요.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Room, KST, ET, wallOf, wallToUtc, todayIn, hhmmAdd } from '@/lib/schedule-util'

const VERSIONS: { key: string; label: string }[] = [
  { key: 'adult', label: '성인' },
  { key: 'en', label: '영문' },
  { key: 'youth', label: '청소년' },
]
type SecretRow = { id: string; versions: string[]; title: string; closes_at: string }
const vLabel = (v: string[]) => v.map(k => VERSIONS.find(x => x.key === k)?.label ?? k).join('·')

export default function AdminSchedulePage() {
  const [state, setState] = useState<'loading' | 'ok' | 'deny' | 'login'>('loading')
  const [tz, setTz] = useState<string>(KST) // 화면에 보일 시간대 = 입력할 시간대
  const [date, setDate] = useState(todayIn(KST))
  const [rooms, setRooms] = useState<Room[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // 입력칸
  const [fVersions, setFVersions] = useState<string[]>(['adult'])
  const [fTitle, setFTitle] = useState('')
  const [fTime, setFTime] = useState('20:00')
  const [fDur, setFDur] = useState(120)
  const [editId, setEditId] = useState<string | null>(null)

  // 비밀방 (출석·도장과 상관없이 따로 열리는 방 — 성인·영문만)
  const [secRows, setSecRows] = useState<SecretRow[]>([])
  const [sTitle, setSTitle] = useState('')
  const [sPw, setSPw] = useState('')
  const [sHours, setSHours] = useState(3)
  const [sVersions, setSVersions] = useState<string[]>(['adult'])
  const [sMsg, setSMsg] = useState('')

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
    const sb = createClient()
    const from = wallToUtc(date, '00:00', tz).toISOString()
    const to = wallToUtc(date, '23:59', tz).toISOString()
    const r = await sb.from('practice_sessions').select('id,versions,title,starts_at,duration_min')
      .gte('starts_at', from).lte('starts_at', to).order('starts_at', { ascending: true })
    if (r.error) { setMsg('불러오지 못했어요: ' + r.error.message); return }
    setRooms((r.data ?? []) as Room[])
  }, [date, tz])

  useEffect(() => { if (state === 'ok') void load() }, [state, load])

  const loadSecret = useCallback(async () => {
    const sb = createClient()
    const r = await sb.from('secret_rooms').select('id,versions,title,closes_at').order('closes_at', { ascending: false }).limit(20)
    if (r.error) { setSMsg('비밀방을 불러오지 못했어요 (secret-rooms-setup.sql 을 실행했는지 확인해주세요): ' + r.error.message); return }
    setSecRows((r.data ?? []) as SecretRow[])
  }, [])
  useEffect(() => { if (state === 'ok') void loadSecret() }, [state, loadSecret])

  async function createSecret() {
    setSMsg('')
    if (!sTitle.trim()) { setSMsg('방 이름을 적어주세요.'); return }
    if (sPw.length < 4) { setSMsg('비밀번호는 4자 이상으로 해주세요.'); return }
    if (!sVersions.length) { setSMsg('열어줄 버전을 하나 이상 골라주세요.'); return }
    if (!(sHours >= 1 && sHours <= 72)) { setSMsg('열어 두는 시간은 1~72시간으로 해주세요.'); return }
    setBusy(true)
    const sb = createClient()
    const r = await sb.rpc('admin_create_secret_room', { p_versions: sVersions, p_title: sTitle.trim(), p_password: sPw, p_hours: Math.round(sHours) })
    setBusy(false)
    if (r.error) { setSMsg('만들지 못했어요: ' + r.error.message); return }
    setSMsg(`비밀방을 열었어요. 비밀번호는 다시 볼 수 없으니 따로 적어 두세요: ${sPw}`)
    setSTitle(''); setSPw('')
    void loadSecret()
  }

  async function removeSecret(r: SecretRow) {
    if (!window.confirm(`비밀방 "${r.title}" 을(를) 지울까요? 안에 있는 사람은 다음 확인 때 나가져요.`)) return
    setBusy(true)
    const sb = createClient()
    const res = await sb.from('secret_rooms').delete().eq('id', r.id)
    setBusy(false)
    if (res.error) { setSMsg('지우지 못했어요: ' + res.error.message); return }
    setSMsg('지웠어요.')
    void loadSecret()
  }

  function reset() { setEditId(null); setFTitle(''); setFTime('20:00'); setFDur(120); setFVersions(['adult']) }

  function startEdit(r: Room) {
    setEditId(r.id); setFTitle(r.title); setFTime(wallOf(r.starts_at, tz).time); setFDur(r.duration_min); setFVersions(r.versions)
    setMsg('')
  }

  async function save() {
    setMsg('')
    if (!fTitle.trim()) { setMsg('방 이름을 적어주세요.'); return }
    if (!fVersions.length) { setMsg('보여줄 버전을 하나 이상 골라주세요.'); return }
    if (fDur < 5 || fDur > 240) { setMsg('길이는 5~240분 사이로 해주세요.'); return }
    setBusy(true)
    const sb = createClient()
    const starts_at = wallToUtc(date, fTime, tz).toISOString()
    const row = { versions: fVersions, title: fTitle.trim(), starts_at, duration_min: fDur }
    const r = editId
      ? await sb.from('practice_sessions').update(row).eq('id', editId)
      : await sb.from('practice_sessions').insert(row)
    setBusy(false)
    if (r.error) { setMsg('저장하지 못했어요: ' + r.error.message); return }
    setMsg(editId ? '수정했어요.' : '추가했어요.')
    reset(); void load()
  }

  async function remove(r: Room) {
    if (!window.confirm(`"${r.title}" (${wallOf(r.starts_at, tz).time}) 방을 삭제할까요? 이미 쌓인 출석 도장은 남아요.`)) return
    setBusy(true)
    const sb = createClient()
    const res = await sb.from('practice_sessions').delete().eq('id', r.id)
    setBusy(false)
    if (res.error) { setMsg('삭제하지 못했어요: ' + res.error.message); return }
    setMsg('삭제했어요.')
    if (editId === r.id) reset()
    void load()
  }

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-stone-700">⚙ 일정 관리</h1>
        <Link href="/schedule" className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-1.5">일정 달력</Link>
      </div>

      {state === 'loading' && <p className="text-sm text-stone-400">불러오는 중…</p>}
      {state === 'login' && <p className="text-sm text-stone-500">먼저 로그인해주세요.</p>}
      {state === 'deny' && <p className="text-sm text-stone-500">운영자만 열 수 있는 화면이에요.</p>}

      {state === 'ok' && (
        <div className="space-y-4">
          <section className="bg-white rounded-2xl border border-stone-100 p-4 space-y-3">
            <div className="flex gap-2">
              <input type="date" value={date} onChange={e => { setDate(e.target.value); reset() }}
                className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm" />
              <select value={tz} onChange={e => setTz(e.target.value)} className="border border-stone-200 rounded-lg px-2 py-2 text-sm">
                <option value={KST}>한국 시간</option>
                <option value={ET}>미국 동부</option>
              </select>
            </div>
            <p className="text-[11px] text-stone-400">고른 시간대 기준의 날짜·시각으로 보고 입력해요.</p>

            {rooms.length === 0
              ? <p className="text-sm text-stone-400">이 날은 방이 없어요.</p>
              : <ul className="space-y-2">
                  {rooms.map(r => (
                    <li key={r.id} data-room={r.id} className="flex items-center gap-2 text-sm border border-stone-100 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-700 truncate">{r.title}</p>
                        <p className="text-[11px] text-stone-400">
                          {wallOf(r.starts_at, tz).time}–{hhmmAdd(wallOf(r.starts_at, tz).time, r.duration_min)} · {vLabel(r.versions)}
                        </p>
                      </div>
                      <button disabled={busy} onClick={() => startEdit(r)} className="text-xs text-stone-500 border border-stone-200 rounded-lg px-2 py-1">수정</button>
                      <button disabled={busy} onClick={() => void remove(r)} className="text-xs text-red-400 border border-red-100 rounded-lg px-2 py-1">삭제</button>
                    </li>
                  ))}
                </ul>}
          </section>

          <section className="bg-white rounded-2xl border border-pink-100 p-4 space-y-3">
            <h2 className="text-sm font-medium text-stone-700">{editId ? '방 수정' : '방 추가'} · {date}</h2>
            <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="방 이름 (예: 저녁 수행)"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <label className="flex-1 text-[11px] text-stone-400">시작 시각
                <input type="time" value={fTime} onChange={e => setFTime(e.target.value)} className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700" />
              </label>
              <label className="flex-1 text-[11px] text-stone-400">길이(분)
                <input type="number" min={5} max={240} value={fDur} onChange={e => setFDur(Number(e.target.value))} className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700" />
              </label>
            </div>
            <div className="flex gap-3 text-sm text-stone-600">
              {VERSIONS.map(v => (
                <label key={v.key} className="flex items-center gap-1">
                  <input type="checkbox" checked={fVersions.includes(v.key)}
                    onChange={e => setFVersions(e.target.checked ? [...fVersions, v.key] : fVersions.filter(k => k !== v.key))} />
                  {v.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => void save()} className="flex-1 py-2.5 rounded-xl text-sm text-white bg-pink-500 disabled:opacity-50">
                {editId ? '수정 저장' : '추가'}
              </button>
              {editId && <button onClick={reset} className="px-4 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500">취소</button>}
            </div>
            {msg && <p className="text-xs text-stone-500">{msg}</p>}
          </section>

          <section className="bg-white rounded-2xl border border-purple-100 p-4 space-y-3">
            <h2 className="text-sm font-medium text-stone-700">🔒 비밀방 열기</h2>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              일정과 따로 열리는 방이에요. 출석·도장·수료에는 들어가지 않고, 비밀번호를 아는 사람만 들어올 수 있어요.
              방 안에서는 닉네임 옆에 지금 하는 수행이 보여요. (성인·영문만)
            </p>
            {secRows.length > 0 && (
              <ul className="space-y-2">
                {secRows.map(r => {
                  const open = Date.parse(r.closes_at) > Date.now()
                  return (
                    <li key={r.id} className="flex items-center gap-2 text-sm border border-stone-100 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className={`truncate ${open ? 'text-stone-700' : 'text-stone-400'}`}>{r.title}</p>
                        <p className="text-[11px] text-stone-400">
                          {open ? '열려 있음' : '닫힘'} · ~{wallOf(r.closes_at, tz).date} {wallOf(r.closes_at, tz).time} · {vLabel(r.versions)}
                        </p>
                      </div>
                      <button disabled={busy} onClick={() => void removeSecret(r)} className="text-xs text-red-400 border border-red-100 rounded-lg px-2 py-1">삭제</button>
                    </li>
                  )
                })}
              </ul>
            )}
            <input value={sTitle} onChange={e => setSTitle(e.target.value)} placeholder="방 이름 (예: 이로움 벗들의 방)"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <label className="flex-1 text-[11px] text-stone-400">비밀번호 (4자 이상)
                <input value={sPw} onChange={e => setSPw(e.target.value)} autoComplete="off" className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700" />
              </label>
              <label className="w-28 text-[11px] text-stone-400">열어 둘 시간
                <input type="number" min={1} max={72} value={sHours} onChange={e => setSHours(Number(e.target.value))} className="mt-1 w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700" />
              </label>
            </div>
            <div className="flex gap-3 text-sm text-stone-600">
              {VERSIONS.filter(v => v.key !== 'youth').map(v => (
                <label key={v.key} className="flex items-center gap-1">
                  <input type="checkbox" checked={sVersions.includes(v.key)}
                    onChange={e => setSVersions(e.target.checked ? [...sVersions, v.key] : sVersions.filter(k => k !== v.key))} />
                  {v.label}
                </label>
              ))}
            </div>
            <button disabled={busy} onClick={() => void createSecret()} className="w-full py-2.5 rounded-xl text-sm text-white bg-purple-500 disabled:opacity-50">비밀방 열기</button>
            {sMsg && <p className="text-xs text-stone-500 break-words">{sMsg}</p>}
          </section>
        </div>
      )}
    </main>
  )
}
