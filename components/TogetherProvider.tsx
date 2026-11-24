'use client'

// 함께 수행: 운영자가 정한 시간에 '참여'를 누르면, 앱을 쓰는 동안(마음 수행·워크북 모두)
// 같은 방에 있는 사람들의 닉네임과 아바타가 화면 아래에 보여요.
// app/layout.tsx 의 바깥 틀에 넣어서, 페이지를 옮겨 다녀도 접속이 유지돼요.

import { companionOf } from '@/lib/companions'
import { ACTIVITY_EVENT, getActivity, activityLabel, isActivity } from '@/lib/activity'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'
import {
  JOIN_BEFORE_MIN, SHOW_BEFORE_HOURS, NICK_MAX,
  normalizeNickname, validateNickname,
} from '@/lib/together-config'

type Sess = { id: string; title: string; starts_at: string; duration_min: number }
type Person = { key: string; nickname: string; avatar: string }
type Meta = { nickname: string; avatar: string; activity?: string }
type SecretRoom = { id: string; title: string; closes_at: string }
type SPerson = Person & { activity: string }
type Focus = { week_start: string; text_ko: string; text_en: string | null }

const AVATAR_KEY = 'ealowm_avatar'          // 마음 수행에서 고른 아바타
const JOINED_KEY = 'ealowm_together_joined' // 참여 중이던 일정 (새로고침 후 자동으로 다시 들어오기 위해)
const SECRET_KEY = 'ealowm_secret_joined'   // 참여 중이던 비밀방 (새로고침 후 비밀번호를 다시 묻지 않기 위해)
const AVATAR_IDS = ['girl', 'boy-casual', 'boy-uniform', 'woman']
const MAX_SESSION_MIN = 240

// 해당 시간대의 오늘(YYYY-MM-DD)과, 그 날짜에서 n일 뒤
const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10)

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
  const [avatarChoice, setAvatarChoice] = useState('girl')
  const [busy, setBusy] = useState(false)
  const [focusRows, setFocusRows] = useState<Focus[]>([])
  const [netErr, setNetErr] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const joinedSessionRef = useRef<string | null>(null) // 지금 들어가 있는 일정

  // ----- 비밀방 (출석·도장과 상관없이 따로 있는 방. 성인·영문만) -----
  const [secretRooms, setSecretRooms] = useState<SecretRoom[]>([])
  const [secretList, setSecretList] = useState(false)
  const [secretPick, setSecretPick] = useState<SecretRoom | null>(null)
  const [secretPw, setSecretPw] = useState('')
  const [secretNick, setSecretNick] = useState('')
  const [secretErr, setSecretErr] = useState('')
  const [secretBusy, setSecretBusy] = useState(false)
  const [secretJoined, setSecretJoined] = useState<SecretRoom | null>(null)
  const [secretPeople, setSecretPeople] = useState<SPerson[]>([])
  const [secretPanel, setSecretPanel] = useState(false)
  const [secretNet, setSecretNet] = useState(false)
  const secretChRef = useRef<RealtimeChannel | null>(null)
  const secretMetaRef = useRef<{ nickname: string; avatar: string }>({ nickname: '', avatar: 'girl' })
  const lastActRef = useRef('')

  const isEn = version === 'en'
  const isYouth = version === 'youth' // 청소년 방은 닉네임을 받지도, 보여주지도 않고 아바타와 인원수만 보여요
  const L = isEn
    ? {
        title: 'Practice together', join: 'Join', notYet: `Opens ${JOIN_BEFORE_MIN} min before`,
        peopleSuffix: '', inRoom: 'Practicing together', leave: 'Leave',
        nickTitle: 'Choose a nickname and companion', avatarTitle: 'Choose your companion', avatarHint: 'Others in the room can see your companion.', nickLabel: 'Nickname', nickHint: 'Please do not use your real name. While you are in the room, others can see your nickname and companion. Your certificate will be issued under this nickname.',
        nickPlaceholder: 'Nickname', cancel: 'Cancel', ok: 'Join',
        saveFail: 'Could not save. Please try again.', net: 'Connection is unstable…',
        guide: `You can join from ${JOIN_BEFORE_MIN} minutes before the start.`,
        secBtn: '🔒 Private rooms', secTitle: 'Private rooms', secEmpty: 'No private rooms are open now.',
        secUntil: 'Open until', secPw: 'Password', secPwPh: 'Enter the password', secEnter: 'Enter', secBack: 'Back', secClose: 'Close',
        secPwNeed: 'Please enter the password.', secWrong: 'That password is not correct.',
        secLocked: 'Too many wrong tries. Please try again in 10 minutes.', secClosed: 'This room has closed.',
        secDenied: 'You cannot enter this room.', secFail: 'Could not connect. Please try again.', secIn: 'Private room',
        secNote: 'This room is separate from the scheduled sessions and is not counted in your attendance.',
      }
    : {
        title: '함께 수행', join: '참여', notYet: `${JOIN_BEFORE_MIN}분 전부터`,
        peopleSuffix: '명', inRoom: '함께 수행 중', leave: '나가기',
        nickTitle: '닉네임과 도반을 정해주세요', avatarTitle: '참여할 도반을 골라주세요', avatarHint: '참여하는 동안 같은 방 사람들에게 도반이 보여요.', nickLabel: '닉네임', nickHint: '실명은 쓰지 말아주세요. 참여하는 동안 같은 방 사람들에게 닉네임과 도반이 보여요. 닉네임으로 수료증이 발급돼요.',
        nickPlaceholder: '닉네임', cancel: '취소', ok: '참여하기',
        saveFail: '저장하지 못했어요. 다시 시도해주세요.', net: '연결이 불안정해요…',
        guide: `시작 ${JOIN_BEFORE_MIN}분 전부터 참여할 수 있어요.`,
        secBtn: '🔒 비밀방', secTitle: '비밀방', secEmpty: '지금 열려 있는 비밀방이 없어요.',
        secUntil: '열려 있는 시간', secPw: '비밀번호', secPwPh: '비밀번호를 입력해주세요', secEnter: '입장', secBack: '뒤로', secClose: '닫기',
        secPwNeed: '비밀번호를 입력해주세요.', secWrong: '비밀번호가 맞지 않아요.',
        secLocked: '여러 번 틀려서 잠시 막혔어요. 10분 뒤에 다시 해주세요.', secClosed: '닫힌 방이에요.',
        secDenied: '이 방에는 들어갈 수 없어요.', secFail: '연결하지 못했어요. 다시 시도해주세요.', secIn: '비밀방',
        secNote: '일정에 있는 함께 수행과는 따로 있는 방이에요. 출석과 수료에는 들어가지 않아요.',
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
    const sid = joinedSessionRef.current
    channelRef.current = null
    joinedSessionRef.current = null
    if (sid) { try { await sb().rpc('attend_ping', { p_session: sid }) } catch {} } // 나가기 직전 마지막 출석 확인
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

  // ----- 비밀방 나가기 -----
  const leaveSecret = useCallback(async () => {
    const ch = secretChRef.current
    secretChRef.current = null
    setSecretJoined(null)
    setSecretPeople([])
    setSecretPanel(false)
    setSecretNet(false)
    lastActRef.current = ''
    try { localStorage.removeItem(SECRET_KEY) } catch {}
    if (ch) {
      try { await ch.untrack() } catch {}
      try { await sb().removeChannel(ch) } catch {}
    }
  }, [])

  // ----- 내 버전·닉네임 불러오기 (1분마다·화면에 돌아올 때 다시 읽어서, 버전을 바꾸면 따라가요) -----
  const loadProfile = useCallback(async (uid: string) => {
    const client = sb()
    const g = await client.from('user_goals').select('version').eq('user_id', uid).maybeSingle()
    const p = await client.from('practice_profiles').select('nickname').eq('user_id', uid).maybeSingle()
    if (!g.error) setVersion((g.data?.version as string | undefined) ?? null)
    if (!p.error) setNickname((p.data?.nickname as string | undefined) ?? null)
  }, [])

  useEffect(() => {
    if (userId === undefined) return // 로그인 확인 전에는 아무것도 지우지 않아요 (새로고침 후 자동 재입장용)
    if (userId === null) {
      setVersion(null); setNickname(null); setSession(null); setSecretRooms([])
      void leave()
      void leaveSecret()
      return
    }
    void loadProfile(userId)
    const id = window.setInterval(() => void loadProfile(userId), 60000)
    const onVis = () => { if (document.visibilityState === 'visible') void loadProfile(userId) }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [userId, leave, leaveSecret, loadProfile])

  // ----- 이번 주 집중 문구 (몇 줄 안 되어서 한 번만 읽어요) -----
  useEffect(() => {
    if (!userId) return
    void sb().from('practice_weekly_focus').select('week_start,text_ko,text_en').order('week_start').then(({ data, error }) => {
      if (!error) setFocusRows((data ?? []) as Focus[])
    })
  }, [userId])

  // 버전이 바뀌면 이전 방에서 나가고 일정도 새로 읽어요
  const prevVersionRef = useRef<string | null>(null)
  useEffect(() => {
    if (prevVersionRef.current !== null && prevVersionRef.current !== version) {
      setSession(null)
      setSecretRooms([])
      void leave()
      void leaveSecret()
    }
    prevVersionRef.current = version
  }, [version, leave, leaveSecret])

  // ----- 진행 중이거나 다음 일정 불러오기 (1분마다) -----
  const loadSession = useCallback(async () => {
    if (!version) return
    const since = new Date(Date.now() - MAX_SESSION_MIN * 60000).toISOString()
    const { data, error } = await sb()
      .from('practice_sessions')
      .select('id,title,starts_at,duration_min')
      .contains('versions', [version])
      .gte('starts_at', since)
      .order('starts_at', { ascending: true })
      .limit(10)
    if (error) return // 일시적인 오류로 일정이 사라진 것처럼 처리하지 않아요
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
  const joinWith = useCallback(async (nick: string, avatarId?: string) => {
    if (!session || !userId || channelRef.current) return
    const client = sb()
    const avatar = avatarId && AVATAR_IDS.includes(avatarId) ? avatarId : readAvatar()
    const ch = client.channel(`together:${session.id}`, { config: { presence: { key: userId } } })
    channelRef.current = ch
    joinedSessionRef.current = session.id
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState<Meta>()
      const list: Person[] = Object.entries(st)
        .map(([key, metas]) => ({ key, nickname: metas[0]?.nickname ?? '', avatar: metas[0]?.avatar ?? 'girl' }))
      setPeople(list)
    })
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setNetErr(false)
        await ch.track({ nickname: isYouth ? '' : nick, avatar }) // 참여할 때 한 번만 보내요 (Presence 호출 한도 때문)
        try { await client.rpc('attend_join', { p_session: joinedSessionRef.current }) } catch {} // 출석 기록 (성인·영문만 서버에서 받아요)
        setJoined(true)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setNetErr(true)
      }
    })
    try { localStorage.setItem(JOINED_KEY, `${userId}|${session.id}`) } catch {}
  }, [session, userId, isYouth])

  // 참여 중에는 1분마다 "아직 있어요"를 서버에 알려요 (20분 머물기 확인용)
  useEffect(() => {
    if (!joined) return
    const id = window.setInterval(() => {
      const sid = joinedSessionRef.current
      if (sid) void sb().rpc('attend_ping', { p_session: sid })
    }, 60000)
    return () => window.clearInterval(id)
  }, [joined])

  // 새로고침해도 약속 시간 안이면 자동으로 다시 들어와요
  useEffect(() => {
    if (joined || channelRef.current || !canJoin || !session || !version) return
    if (!isYouth && !nickname) return
    let flag = ''
    try { flag = localStorage.getItem(JOINED_KEY) ?? '' } catch {}
    if (userId && flag === `${userId}|${session.id}`) void joinWith(isYouth ? '' : (nickname ?? ''))
  }, [canJoin, nickname, session, joined, joinWith, userId, version, isYouth])

  // 참여 중인 방과 지금 보이는 일정이 달라지면(일정이 바뀌거나 사라지면) 나가요
  useEffect(() => {
    if (joined && joinedSessionRef.current && session?.id !== joinedSessionRef.current) void leave()
  }, [joined, session, leave])

  // 일정이 끝나면 자동으로 나가요
  useEffect(() => {
    if (joined && session && now >= end) void leave()
  }, [joined, session, now, end, leave])

  // 앱이 완전히 사라질 때 연결 정리
  useEffect(() => () => {
    const ch = channelRef.current
    channelRef.current = null
    if (ch) void sb().removeChannel(ch)
    const sch = secretChRef.current
    secretChRef.current = null
    if (sch) void sb().removeChannel(sch)
  }, [])

  // ----- 열려 있는 비밀방 목록 (1분마다) — 성인·영문만. 아직 SQL 을 안 돌렸으면 조용히 비워 둬요 -----
  const loadSecret = useCallback(async () => {
    if (!version || version === 'youth') { setSecretRooms([]); return }
    const { data, error } = await sb()
      .from('secret_rooms')
      .select('id,title,closes_at')
      .gt('closes_at', new Date().toISOString())
      .order('closes_at', { ascending: true })
    if (error) return
    setSecretRooms((data ?? []) as SecretRoom[])
  }, [version])

  useEffect(() => {
    if (!userId || !version || version === 'youth') return
    void loadSecret()
    const id = window.setInterval(() => void loadSecret(), 60000)
    const onVis = () => { if (document.visibilityState === 'visible') void loadSecret() }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [userId, version, loadSecret])

  // 비밀방 입장 (비밀번호를 맞힌 사람이 받은 열쇠(token)가 방 이름에 들어가요)
  const joinSecret = useCallback(async (room: SecretRoom, token: string, nick: string) => {
    if (!userId) return
    if (secretChRef.current) await leaveSecret()
    const avatar = readAvatar()
    secretMetaRef.current = { nickname: nick, avatar }
    const ch = sb().channel(`secret:${room.id}:${token}`, { config: { presence: { key: userId } } })
    secretChRef.current = ch
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState<Meta>()
      setSecretPeople(Object.entries(st).map(([key, metas]) => ({
        key, nickname: metas[0]?.nickname ?? '', avatar: metas[0]?.avatar ?? 'girl', activity: metas[0]?.activity ?? '',
      })))
    })
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setSecretNet(false)
        const a = getActivity() ?? ''
        lastActRef.current = a
        await ch.track({ nickname: nick, avatar, activity: a })
        setSecretJoined(room)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setSecretNet(true)
      }
    })
    try { localStorage.setItem(SECRET_KEY, JSON.stringify({ u: userId, r: room.id, t: token, n: nick })) } catch {}
  }, [userId, leaveSecret])

  // 새로고침해도 비밀방이 열려 있으면 다시 들어와요
  useEffect(() => {
    if (secretJoined || secretChRef.current || !userId || secretRooms.length === 0) return
    try {
      const raw = localStorage.getItem(SECRET_KEY)
      if (!raw) return
      const f = JSON.parse(raw) as { u: string; r: string; t: string; n: string }
      const room = secretRooms.find(x => x.id === f.r)
      if (f.u === userId && room && f.t && f.n) void joinSecret(room, f.t, f.n)
    } catch {}
  }, [secretRooms, secretJoined, userId, joinSecret])

  // 닫히는 시각이 지나면 나가요
  useEffect(() => {
    if (secretJoined && now >= Date.parse(secretJoined.closes_at)) void leaveSecret()
  }, [secretJoined, now, leaveSecret])

  // 지금 하는 수행이 바뀌면 비밀방 사람들에게 알려요 (바뀐 뒤 0.8초 기다렸다가 한 번만)
  useEffect(() => {
    if (!secretJoined) return
    let timer: number | undefined
    const send = () => {
      const ch = secretChRef.current
      if (!ch) return
      const a = getActivity() ?? ''
      if (a === lastActRef.current) return
      lastActRef.current = a
      void ch.track({ ...secretMetaRef.current, activity: a })
    }
    const onAct = () => { window.clearTimeout(timer); timer = window.setTimeout(send, 800) }
    window.addEventListener(ACTIVITY_EVENT, onAct)
    return () => { window.removeEventListener(ACTIVITY_EVENT, onAct); window.clearTimeout(timer) }
  }, [secretJoined])

  function openSecretList() {
    setSecretPick(null); setSecretPw(''); setSecretErr('')
    setSecretNick(nickname ?? '')
    setSecretList(true)
  }

  async function submitSecret() {
    if (!secretPick || !userId || secretBusy) return
    let n = nickname ?? ''
    if (!n) {
      const err = validateNickname(secretNick, isEn)
      if (err) { setSecretErr(err); return }
      n = normalizeNickname(secretNick)
    }
    if (!secretPw) { setSecretErr(L.secPwNeed); return }
    setSecretBusy(true)
    const { data, error } = await sb().rpc('secret_room_enter', { p_room: secretPick.id, p_password: secretPw })
    const res = data as { ok?: boolean; code?: string; token?: string } | null
    if (error || !res) { setSecretBusy(false); setSecretErr(L.secFail); return }
    if (!res.ok || !res.token) {
      setSecretBusy(false)
      setSecretErr(res.code === 'wrong' ? L.secWrong : res.code === 'locked' ? L.secLocked : res.code === 'closed' ? L.secClosed : res.code === 'denied' ? L.secDenied : L.secFail)
      return
    }
    if (!nickname) {
      const up = await sb().from('practice_profiles').upsert({ user_id: userId, nickname: n })
      if (up.error) { setSecretBusy(false); setSecretErr(L.saveFail); return }
      setNickname(n)
    }
    setSecretBusy(false)
    const room = secretPick
    setSecretPick(null); setSecretPw(''); setSecretList(false)
    await joinSecret(room, res.token, n)
  }

  const fmtUntil = (iso: string) => new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', ...(isEn ? { timeZoneName: 'short' as const } : {}),
  }).format(new Date(iso))

  function onJoinClick() {
    if (!canJoin) return
    setNickInput(nickname ?? '')
    setNickErr('')
    setAvatarChoice(readAvatar())
    setModal(true)
  }

  async function submitJoin() {
    if (!userId) return
    let n = ''
    if (!isYouth) {
      const err = validateNickname(nickInput, isEn)
      if (err) { setNickErr(err); return }
      n = normalizeNickname(nickInput)
      if (n !== nickname) {
        setBusy(true)
        const { error } = await sb().from('practice_profiles').upsert({ user_id: userId, nickname: n })
        setBusy(false)
        if (error) { setNickErr(L.saveFail); return }
        setNickname(n)
      }
    }
    try { localStorage.setItem(AVATAR_KEY, avatarChoice) } catch {} // 마음 수행의 아바타도 같이 바뀌어요
    setModal(false)
    void joinWith(n, avatarChoice)
  }

  const timeText = session
    ? new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
        month: 'long', day: 'numeric', weekday: 'short',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      }).format(new Date(start))
    : ''

  const showBar = (visible || joined) && !!session
  const showSecret = !!userId && !isYouth && (secretRooms.length > 0 || !!secretJoined)

  // 오늘 날짜(영문=미국 동부, 그 밖=한국) 기준으로 7일 안에 시작한 가장 최근 주의 문구
  const todayStr = todayIn(isEn ? 'America/New_York' : 'Asia/Seoul')
  const focusRow = [...focusRows].reverse().find(f => f.week_start <= todayStr && todayStr < addDays(f.week_start, 7))
  const focusText = focusRow ? (isEn ? (focusRow.text_en ?? focusRow.text_ko) : focusRow.text_ko) : ''

  return (
    <>
      {children}

      {(showBar || showSecret) && (
        <>
          <div aria-hidden className={showBar && showSecret ? 'h-36' : 'h-24'} />
          <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {showSecret && (
              <>
                {secretJoined && secretPanel && (
                  <div className="mb-2 bg-white rounded-2xl border border-purple-100 shadow-lg p-3 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {secretPeople.map(p => (
                        <li key={p.key} className="flex items-center gap-2 min-w-0">
                          <img src={`/avatars/${p.avatar}.png`} alt="" className="w-8 h-8 rounded-full object-cover object-top bg-pink-50 flex-shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm text-stone-600 truncate">{p.nickname}</span>
                            {isActivity(p.activity) && (
                              <span className="block text-xs text-purple-500 truncate">{activityLabel(p.activity, isEn)}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mb-2 bg-white rounded-2xl border border-purple-100 shadow-lg">
                  {secretJoined ? (
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <button onClick={() => setSecretPanel(v => !v)} className="flex items-center gap-3 flex-1 min-w-0 text-left" aria-expanded={secretPanel}>
                        <span className="flex -space-x-2 flex-shrink-0">
                          {secretPeople.slice(0, 5).map(p => (
                            <img key={p.key} src={`/avatars/${p.avatar}.png`} alt=""
                              className="w-7 h-7 rounded-full object-cover object-top bg-pink-50 border-2 border-white" />
                          ))}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-stone-700 truncate">🔒 {L.secIn} · {secretPeople.length}{L.peopleSuffix}</span>
                          <span className="block text-xs text-stone-400 truncate">{secretNet ? L.net : secretJoined.title}</span>
                        </span>
                      </button>
                      <button onClick={() => void leaveSecret()} className="text-xs text-stone-500 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-50 flex-shrink-0">
                        {L.leave}
                      </button>
                    </div>
                  ) : (
                    <button onClick={openSecretList} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-purple-600">
                      <span>{L.secBtn}</span>
                      <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2 py-0.5">{secretRooms.length}</span>
                    </button>
                  )}
                </div>
              </>
            )}
            {showBar && session && (
              <>
            {joined && panel && (
              <div className="mb-2 bg-white rounded-2xl border border-pink-100 shadow-lg p-3 max-h-60 overflow-y-auto">
                {isYouth ? (
                  <ul className="flex flex-wrap gap-2" aria-label={`${people.length}${L.peopleSuffix}`}>
                    {people.map(p => (
                      <li key={p.key}>
                        <img src={`/avatars/${p.avatar}.png`} alt="" className="w-9 h-9 rounded-full object-cover object-top bg-pink-50" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-2 gap-2">
                    {people.map(p => (
                      <li key={p.key} className="flex items-center gap-2 min-w-0">
                        <img src={`/avatars/${p.avatar}.png`} alt="" className="w-8 h-8 rounded-full object-cover object-top bg-pink-50 flex-shrink-0" />
                        <span className="text-sm text-stone-600 truncate">{p.nickname}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
                  {focusText && <p className="text-xs text-pink-600 mt-2 leading-relaxed">🌿 {focusText}</p>}
                  {!canJoin && <p className="text-xs text-stone-300 mt-2">{L.guide}</p>}
                  <div className="flex gap-4 mt-2">
                    <Link href="/schedule" className="text-xs text-pink-500">🗓 {isEn ? 'Schedule' : '일정 보기'}</Link>
                    {!isYouth && (
                      <Link href="/stamps" className="text-xs text-pink-500">📅 {isEn ? 'My stamps' : '내 도장'}</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </>
      )}

      {secretList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <p className="text-base font-medium text-stone-700">🔒 {L.secTitle}</p>
            {!secretPick ? (
              <>
                <p className="text-xs text-stone-400 leading-relaxed">{L.secNote}</p>
                {secretRooms.length === 0
                  ? <p className="text-sm text-stone-400">{L.secEmpty}</p>
                  : <ul className="space-y-2">
                      {secretRooms.map(r => (
                        <li key={r.id}>
                          <button onClick={() => { setSecretPick(r); setSecretPw(''); setSecretErr('') }}
                            className="w-full text-left border border-stone-100 rounded-xl px-4 py-3 hover:border-purple-200">
                            <span className="block text-sm font-medium text-stone-700">{r.title}</span>
                            <span className="block text-xs text-stone-400 mt-0.5">{L.secUntil} · ~ {fmtUntil(r.closes_at)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>}
                <button onClick={() => setSecretList(false)} className="w-full py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500">{L.secClose}</button>
              </>
            ) : (
              <>
                <p className="text-sm text-stone-600">{secretPick.title}</p>
                {!nickname && (
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">{L.nickLabel}</label>
                    <input value={secretNick} maxLength={NICK_MAX + 4}
                      onChange={e => { setSecretNick(e.target.value); setSecretErr('') }}
                      placeholder={L.nickPlaceholder}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-300" />
                    <p className="text-[11px] text-stone-400 leading-relaxed mt-1">{L.nickHint}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-stone-400 mb-1">{L.secPw}</label>
                  <input type="password" value={secretPw} autoFocus autoComplete="off"
                    onChange={e => { setSecretPw(e.target.value); setSecretErr('') }}
                    onKeyDown={e => { if (e.key === 'Enter') void submitSecret() }}
                    placeholder={L.secPwPh}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-300" />
                  {secretErr && <p className="text-xs text-red-500 mt-1.5">{secretErr}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSecretPick(null); setSecretErr('') }} className="flex-1 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500">{L.secBack}</button>
                  <button onClick={() => void submitSecret()} disabled={secretBusy}
                    className="flex-1 py-2.5 rounded-xl text-sm text-white bg-purple-500 disabled:opacity-60">{L.secEnter}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <p className="text-base font-medium text-stone-700">{isYouth || nickname ? L.avatarTitle : L.nickTitle}</p>
            <p className="text-xs text-stone-400 leading-relaxed">{isYouth ? L.avatarHint : L.nickHint}</p>

            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {AVATAR_IDS.map(id => {
                const c = companionOf(id)
                return (
                  <button key={id} type="button" role="radio" aria-checked={avatarChoice === id} data-avatar={id}
                    onClick={() => setAvatarChoice(id)}
                    className={`rounded-xl p-2 text-left transition-all ${avatarChoice === id ? 'bg-pink-50 ring-2 ring-pink-400' : 'ring-1 ring-stone-100'}`}>
                    <img src={`/avatars/${id}.png`} alt="" className="w-full aspect-square rounded-lg object-cover object-top" />
                    {c && (
                      <>
                        <span className="block text-sm font-medium text-stone-700 text-center mt-1">{isEn ? `${c.en} (${c.hanja})` : `${c.ko} (${c.hanja})`}</span>
                        <span className="block text-[11px] text-stone-400 leading-relaxed mt-1">{isEn ? c.descEn : c.descKo}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {!isYouth && (
              <div>
                <label className="block text-xs text-stone-400 mb-1">{L.nickLabel}</label>
                <input value={nickInput} maxLength={NICK_MAX + 4}
                  onChange={e => { setNickInput(e.target.value); setNickErr('') }}
                  onKeyDown={e => { if (e.key === 'Enter' && !busy) void submitJoin() }}
                  placeholder={L.nickPlaceholder} autoFocus={!nickname}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-300" />
                {nickErr && <p className="text-xs text-red-500 mt-1.5">{nickErr}</p>}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500">{L.cancel}</button>
              <button onClick={() => void submitJoin()} disabled={busy}
                className="flex-1 py-2.5 rounded-xl text-sm text-white bg-pink-500 disabled:opacity-60">{L.ok}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
