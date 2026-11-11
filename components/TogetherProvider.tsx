'use client'

// 함께 수행: 운영자가 정한 시간에 '참여'를 누르면, 앱을 쓰는 동안(마음 수행·워크북 모두)
// 같은 방에 있는 사람들의 닉네임과 아바타가 화면 아래에 보여요.
// app/layout.tsx 의 바깥 틀에 넣어서, 페이지를 옮겨 다녀도 접속이 유지돼요.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'
import {
  JOIN_BEFORE_MIN, SHOW_BEFORE_HOURS, NICK_MAX,
  normalizeNickname, validateNickname,
} from '@/lib/together-config'

type Sess = { id: string; title: string; starts_at: string; duration_min: number }
type Person = { key: string; nickname: string; avatar: string }
type Meta = { nickname: string; avatar: string }

const AVATAR_KEY = 'ealowm_avatar'          // 마음 수행에서 고른 아바타
const JOINED_KEY = 'ealowm_together_joined' // 참여 중이던 일정 (새로고침 후 자동으로 다시 들어오기 위해)
const AVATAR_IDS = ['girl', 'boy-casual', 'boy-uniform', 'woman']
const MAX_SESSION_MIN = 240

function readAvatar(): string {
  try {
    const v = localStorage.getItem(AVATAR_KEY)
    if (v && AVATAR_IDS.includes(v)) return v
  } catch {}
  return 'girl'
}

let browserClient: ReturnType<typeof createClient> | null = null
function sb() {
  if (!browserClient) browserClient = createClient()
  return browserClient
}

export default function TogetherProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined) // undefined = 아직 확인 전
  const [version, setVersion] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [session, setSession] = useState<Sess | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [joined, setJoined] = useState(false)
  const [people, setPeople] = useState<Person[]>([])
  const [panel, setPanel] = useState(false)
  const [modal, setModal] = useState(false)
  const [nickInput, setNickInput] = useState('')
  const [nickErr, setNickErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [netErr, setNetErr] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const isEn = version === 'en'
  const L = isEn
    ? {
        title: 'Practice together', join: 'Join', notYet: `Opens ${JOIN_BEFORE_MIN} min before`,
        peopleSuffix: '', inRoom: 'Practicing together', leave: 'Leave',
        nickTitle: 'Choose a nickname', nickHint: 'Please do not use your real name. While you are in the room, others can see your nickname and avatar.',
        nickPlaceholder: 'Nickname', cancel: 'Cancel', ok: 'Join',
        saveFail: 'Could not save. Please try again.', net: 'Connection is unstable…',
        guide: `You can join from ${JOIN_BEFORE_MIN} minutes before the start.`,
      }
    : {
        title: '함께 수행', join: '참여', notYet: `${JOIN_BEFORE_MIN}분 전부터`,
        peopleSuffix: '명', inRoom: '함께 수행 중', leave: '나가기',
        nickTitle: '닉네임을 정해주세요', nickHint: '실명은 쓰지 말아주세요. 참여하는 동안 같은 방 사람들에게 닉네임과 아바타가 보여요.',
        nickPlaceholder: '닉네임', cancel: '취소', ok: '참여하기',
        saveFail: '저장하지 못했어요. 다시 시도해주세요.', net: '연결이 불안정해요…',
        guide: `시작 ${JOIN_BEFORE_MIN}분 전부터 참여할 수 있어요.`,
      }

  // ----- 로그인 상태 -----
  useEffect(() => {
    let alive = true
    const client = sb()
    client.auth.getUser().then(({ data }) => { if (alive) setUserId(data.user?.id ?? null) })
    const { data: sub } = client.auth.onAuthStateChange((_e, s) => { setUserId(s?.user?.id ?? null) })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  // ----- 나가기 -----
  const leave = useCallback(async () => {
    const ch = channelRef.current
    channelRef.current = null
    setJoined(false)
    setPeople([])
    setPanel(false)
    setNetErr(false)
    try { localStorage.removeItem(JOINED_KEY) } catch {}
    if (ch) {
      try { await ch.untrack() } catch {}
      try { await sb().removeChannel(ch) } catch {}
    }
  }, [])

  // ----- 내 버전·닉네임 불러오기 -----
  useEffect(() => {
    if (userId === undefined) return // 로그인 확인 전에는 아무것도 지우지 않아요 (새로고침 후 자동 재입장용)
    if (userId === null) {
      setVersion(null); setNickname(null); setSession(null)
      void leave()
      return
    }
    let alive = true
    ;(async () => {
      const client = sb()
      const g = await client.from('user_goals').select('version').eq('user_id', userId).maybeSingle()
      const p = await client.from('practice_profiles').select('nickname').eq('user_id', userId).maybeSingle()
      if (!alive) return
      setVersion((g.data?.version as string | undefined) ?? null)
      setNickname((p.data?.nickname as string | undefined) ?? null)
    })()
    return () => { alive = false }
  }, [userId, leave])

  // ----- 진행 중이거나 다음 일정 불러오기 (1분마다) -----
  const loadSession = useCallback(async () => {
    if (!version) return
    const since = new Date(Date.now() - MAX_SESSION_MIN * 60000).toISOString()
    const { data } = await sb()
      .from('practice_sessions')
      .select('id,title,starts_at,duration_min')
      .eq('version', version)
      .gte('starts_at', since)
      .order('starts_at', { ascending: true })
      .limit(10)
    const list = (data ?? []) as Sess[]
    const cur = list.find(s => Date.parse(s.starts_at) + s.duration_min * 60000 > Date.now()) ?? null
    setSession(cur)
  }, [version])

  useEffect(() => {
    if (!version) return
    void loadSession()
    const id = window.setInterval(() => void loadSession(), 60000)
    const onVis = () => { if (document.visibilityState === 'visible') void loadSession() }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [version, loadSession])

  // ----- 현재 시각 (15초마다) -----
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(id)
  }, [])

  const start = session ? Date.parse(session.starts_at) : 0
  const end = session ? start + session.duration_min * 60000 : 0
  const canJoin = !!session && now >= start - JOIN_BEFORE_MIN * 60000 && now < end
  const visible = !!session && !!userId && now >= start - SHOW_BEFORE_HOURS * 3600000 && now < end

  // ----- 참여 -----
  const joinWith = useCallback(async (nick: string) => {
    if (!session || !userId || channelRef.current) return
    const client = sb()
    const avatar = readAvatar()
    const ch = client.channel(`together:${session.id}`, { config: { presence: { key: userId } } })
    channelRef.current = ch
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState<Meta>()
      const list: Person[] = Object.entries(st)
        .map(([key, metas]) => ({ key, nickname: metas[0]?.nickname ?? '', avatar: metas[0]?.avatar ?? 'girl' }))
        .filter(p => p.nickname)
      setPeople(list)
    })
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setNetErr(false)
        await ch.track({ nickname: nick, avatar }) // 참여할 때 한 번만 보내요 (Presence 호출 한도 때문)
        setJoined(true)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setNetErr(true)
      }
    })
    try { localStorage.setItem(JOINED_KEY, `${userId}|${session.id}`) } catch {}
  }, [session, userId])

  // 새로고침해도 약속 시간 안이면 자동으로 다시 들어와요
  useEffect(() => {
    if (joined || channelRef.current || !canJoin || !nickname || !session) return
    let flag = ''
    try { flag = localStorage.getItem(JOINED_KEY) ?? '' } catch {}
    if (userId && flag === `${userId}|${session.id}`) void joinWith(nickname)
  }, [canJoin, nickname, session, joined, joinWith, userId])

  // 일정이 끝나면 자동으로 나가요
  useEffect(() => {
    if (joined && session && now >= end) void leave()
  }, [joined, session, now, end, leave])

  // 앱이 완전히 사라질 때 연결 정리
  useEffect(() => () => {
    const ch = channelRef.current
    channelRef.current = null
    if (ch) void sb().removeChannel(ch)
  }, [])

  function onJoinClick() {
    if (!canJoin) return
    if (nickname) void joinWith(nickname)
    else { setNickInput(''); setNickErr(''); setModal(true) }
  }

  async function submitNickname() {
    const err = validateNickname(nickInput, isEn)
    if (err) { setNickErr(err); return }
    if (!userId) return
    const n = normalizeNickname(nickInput)
    setBusy(true)
    const { error } = await sb().from('practice_profiles').upsert({ user_id: userId, nickname: n })
    setBusy(false)
    if (error) { setNickErr(L.saveFail); return }
    setNickname(n)
    setModal(false)
    void joinWith(n)
  }

  const timeText = session
    ? new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(start))
    : ''

  const showBar = (visible || joined) && !!session

  return (
    <>
      {children}

      {showBar && session && (
        <>
          <div aria-hidden className="h-24" />
          <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {joined && panel && (
              <div className="mb-2 bg-white rounded-2xl border border-pink-100 shadow-lg p-3 max-h-60 overflow-y-auto">
                <ul className="grid grid-cols-2 gap-2">
                  {people.map(p => (
                    <li key={p.key} className="flex items-center gap-2 min-w-0">
                      <img src={`/avatars/${p.avatar}.png`} alt="" className="w-8 h-8 rounded-full object-cover object-top bg-pink-50 flex-shrink-0" />
                      <span className="text-sm text-stone-600 truncate">{p.nickname}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-pink-100 shadow-lg">
              {joined ? (
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setPanel(v => !v)} className="flex items-center gap-3 flex-1 min-w-0 text-left" aria-expanded={panel}>
                    <span className="flex -space-x-2 flex-shrink-0">
                      {people.slice(0, 5).map(p => (
                        <img key={p.key} src={`/avatars/${p.avatar}.png`} alt=""
                          className="w-8 h-8 rounded-full object-cover object-top bg-pink-50 border-2 border-white" />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-stone-700 truncate">
                        {L.inRoom} · {people.length}{L.peopleSuffix}
                      </span>
                      <span className="block text-xs text-stone-400 truncate">
                        {netErr ? L.net : session.title}
                      </span>
                    </span>
                  </button>
                  <button onClick={() => void leave()} className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 flex-shrink-0">
                    {L.leave}
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-700 truncate">🪷 {session.title}</p>
                      <p className="text-xs text-stone-400 truncate">{timeText}</p>
                    </div>
                    <button onClick={onJoinClick} disabled={!canJoin}
                      className={`text-sm rounded-xl px-4 py-2 flex-shrink-0 transition-all ${
                        canJoin ? 'bg-pink-500 text-white' : 'bg-stone-100 text-stone-400'
                      }`}>
                      {canJoin ? L.join : L.notYet}
                    </button>
                  </div>
                  {!canJoin && <p className="text-xs text-stone-300 mt-2">{L.guide}</p>}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <p className="text-base font-medium text-stone-700">{L.nickTitle}</p>
            <p className="text-xs text-stone-400 leading-relaxed">{L.nickHint}</p>
            <div>
              <input value={nickInput} maxLength={NICK_MAX + 4}
                onChange={e => { setNickInput(e.target.value); setNickErr('') }}
                onKeyDown={e => { if (e.key === 'Enter' && !busy) void submitNickname() }}
                placeholder={L.nickPlaceholder} autoFocus
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-300" />
              {nickErr && <p className="text-xs text-red-500 mt-1.5">{nickErr}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500">{L.cancel}</button>
              <button onClick={() => void submitNickname()} disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm text-white bg-pink-500 disabled:opacity-60">{L.ok}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
