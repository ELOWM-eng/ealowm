'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  PRACTICE_TRACKS,
  THEME_SESSIONS,
  SESSION_NAMES,
  type PracticeTrack,
  type PracticeVersion,
} from '@/lib/practice-config'

interface Props {
  version: PracticeVersion
}

type Tab = 'bodyscan' | 'focus' | 'zazen' | 'tea' | 'theme'
type ZStatus = 'idle' | 'running' | 'paused' | 'done'

// 차 명상 4단계 (그림 파일 이름: /avatars/tea/{아바타}-{key}.webp)
const TEA_STEPS = [
  { key: 'look',  ko: '색 관찰',     en: 'Look',   koDo: '차나 커피의 색을 관찰해봐요',   enDo: 'Look closely at the color of your tea or coffee.' },
  { key: 'smell', ko: '향 맡기',     en: 'Smell',  koDo: '차나 커피의 향을 맡아봐요',     enDo: 'Breathe in the aroma of your tea or coffee.' },
  { key: 'sip',   ko: '차 마시기',   en: 'Sip',    koDo: '차나 커피를 마셔봐요',     enDo: 'Take a sip of your tea or coffee.' },
  { key: 'savor', ko: '맛 음미하기', en: 'Savor',  koDo: '차나 커피의 맛을 음미해봐요',   enDo: 'Savor the taste of your tea or coffee.' },
]
const TEA_SEC_KEY = 'ealowm_tea_sec'
const TEA_PRESETS = [30, 60, 120, 180] // 한 단계당 시간(초)

const AVATARS = [
  { id: 'girl', src: '/avatars/girl.png' },
  { id: 'boy-casual', src: '/avatars/boy-casual.png' },
  { id: 'boy-uniform', src: '/avatars/boy-uniform.png' },
  { id: 'woman', src: '/avatars/woman.png' },
]

const STORAGE_KEY = 'ealowm_avatar'
const ZAZEN_STORAGE_KEY = 'ealowm_zazen_min'
const ZAZEN_VOL_KEY = 'ealowm_zazen_vol'
const LOOP_KEY = 'ealowm_loop'
const ROTATE_HINT_KEY = 'ealowm_rotate_hint' // '1' 이면 가로 화면 안내를 다시 보여주지 않아요
const ZAZEN_PRESETS = [5, 10, 15, 20, 30, 45]

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PracticeClient({ version }: Props) {
  const router = useRouter()
  const isEn = version === 'en'
  const audioRef = useRef<HTMLAudioElement>(null)

  const [loaded, setLoaded] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [tab, setTab] = useState<Tab>('bodyscan')
  const [track, setTrack] = useState<PracticeTrack | null>(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [error, setError] = useState(false)
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off') // 반복 재생 방식
  const [landscape, setLandscape] = useState(false) // 휴대폰을 옆으로 돌렸는지
  const [touch, setTouch] = useState(false) // 터치 기기(휴대폰·태블릿)인지
  const [hintDismissed, setHintDismissed] = useState(true) // 가로 화면 안내를 닫았는지 (불러오기 전에는 숨김)

  // 좌선 타이머
  const [zText, setZText] = useState('10')
  const [zStatus, setZStatus] = useState<ZStatus>('idle')
  const [zRemain, setZRemain] = useState(0)
  const [zSound, setZSound] = useState(true)
  const soundRef = useRef(true)
  const [zVol, setZVol] = useState(80) // 종소리 크기 (0~100)
  const volRef = useRef(0.8)
  const endAtRef = useRef(0)
  const zTotalRef = useRef(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const bellTimersRef = useRef<number[]>([])
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null)

  // 차 명상
  const [tSec, setTSec] = useState(60) // 한 단계당 시간(초)
  const [tStatus, setTStatus] = useState<ZStatus>('idle')
  const [tStep, setTStep] = useState(0)
  const [tRemain, setTRemain] = useState(0)
  const tEndRef = useRef(0)
  const tStepRef = useRef(0)

  // 저장된 아바타·좌선 시간 불러오기 (브라우저 저장소가 막혀 있어도 동작하도록 try/catch)
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v && AVATARS.some(a => a.id === v)) setAvatar(v)
      const z = localStorage.getItem(ZAZEN_STORAGE_KEY)
      if (z && /^\d+$/.test(z) && Number(z) >= 1 && Number(z) <= 180) setZText(z)
      const ts = localStorage.getItem(TEA_SEC_KEY)
      if (ts && TEA_PRESETS.includes(Number(ts))) setTSec(Number(ts))
      const rep = localStorage.getItem(LOOP_KEY)
      if (rep === 'all' || rep === 'one') setRepeat(rep)
      const vol = localStorage.getItem(ZAZEN_VOL_KEY)
      if (vol && /^\d+$/.test(vol) && Number(vol) <= 100) {
        setZVol(Number(vol))
        volRef.current = Number(vol) / 100
      }
    } catch {}
    let dismissed = false
    try { dismissed = localStorage.getItem(ROTATE_HINT_KEY) === '1' } catch {}
    setHintDismissed(dismissed)
    setTouch(window.matchMedia('(pointer: coarse)').matches)
    setLoaded(true)
  }, [])

  // 이미 휴대폰을 옆으로 돌려 본 사람에게는 안내를 다시 보여주지 않아요
  useEffect(() => {
    if (landscape && touch) dismissHint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landscape, touch])

  function dismissHint() {
    setHintDismissed(true)
    try { localStorage.setItem(ROTATE_HINT_KEY, '1') } catch {}
  }

  // 휴대폰을 옆으로 돌리면 가로 배치로 자동 전환
  // (키보드가 올라와 화면 높이가 줄어드는 경우와 구분하려고 기기의 회전 방향을 우선 확인해요)
  useEffect(() => {
    const check = () => {
      // 글자를 입력하는 중(키보드가 올라온 상태)에는 배치를 바꾸지 않아요
      const el = document.activeElement as HTMLInputElement | null
      if (el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type !== 'range'))) return
      const so = window.screen.orientation
      const land = so && so.type
        ? so.type.startsWith('landscape')
        : window.innerWidth > window.innerHeight
      setLandscape(land && window.innerWidth >= 560)
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    const so = window.screen.orientation
    so?.addEventListener?.('change', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
      so?.removeEventListener?.('change', check)
    }
  }, [])

  // 화면을 떠날 때 정리
  useEffect(() => {
    const a = audioRef.current
    return () => {
      a?.pause()
      bellTimersRef.current.forEach(t => window.clearTimeout(t))
      try { wakeRef.current?.release() } catch {}
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  // ---------- 좌선 타이머 ----------
  const zValid = /^\d+$/.test(zText) && Number(zText) >= 1 && Number(zText) <= 180

  function getCtx(): AudioContext | null {
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        ctxRef.current = new AC()
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume().catch(() => {})
      return ctxRef.current
    } catch {
      return null
    }
  }

  function strike(ctx: AudioContext) {
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.9 * volRef.current), now + 0.03)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 7)
    master.connect(ctx.destination)
    ;[[1, 0.6], [2.76, 0.25], [5.4, 0.1]].forEach(([mult, gain]) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 280 * mult
      g.gain.value = gain
      o.connect(g)
      g.connect(master)
      o.start(now)
      o.stop(now + 7.2)
    })
  }

  function ringBell(strikes: number) {
    if (!soundRef.current) return
    const ctx = getCtx()
    if (!ctx) return
    for (let k = 0; k < strikes; k++) {
      const t = window.setTimeout(() => strike(ctx), k * 4500)
      bellTimersRef.current.push(t)
    }
  }

  function clearBells() {
    bellTimersRef.current.forEach(t => window.clearTimeout(t))
    bellTimersRef.current = []
  }

  async function lockScreen() {
    try {
      const wl = (navigator as unknown as {
        wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> }
      }).wakeLock
      if (wl && !wakeRef.current) wakeRef.current = await wl.request('screen')
    } catch {}
  }

  function unlockScreen() {
    try { wakeRef.current?.release() } catch {}
    wakeRef.current = null
  }

  function toggleSound() {
    soundRef.current = !soundRef.current
    setZSound(soundRef.current)
  }

  function changeVolume(v: number) {
    setZVol(v)
    volRef.current = v / 100
    try { localStorage.setItem(ZAZEN_VOL_KEY, String(v)) } catch {}
  }

  // 종소리 한 번 들어보기
  function previewBell() {
    const ctx = getCtx()
    if (ctx) strike(ctx)
  }

  function startZazen() {
    if (!zValid) return
    audioRef.current?.pause()
    if (tStatus !== 'idle') stopTea()
    clearBells()
    const total = Number(zText) * 60
    zTotalRef.current = total
    endAtRef.current = Date.now() + total * 1000
    setZRemain(total)
    setZStatus('running')
    lockScreen()
    ringBell(3)
    try { localStorage.setItem(ZAZEN_STORAGE_KEY, zText) } catch {}
  }

  function pauseZazen() {
    setZStatus('paused')
    unlockScreen()
  }

  function resumeZazen() {
    endAtRef.current = Date.now() + zRemain * 1000
    setZStatus('running')
    lockScreen()
  }

  function stopZazen() {
    clearBells()
    unlockScreen()
    setZStatus('idle')
    setZRemain(0)
  }

  // ---------- 차 명상 ----------
  function startTea() {
    audioRef.current?.pause()
    if (zStatus !== 'idle') stopZazen()
    clearBells()
    tStepRef.current = 0
    setTStep(0)
    tEndRef.current = Date.now() + tSec * 1000
    setTRemain(tSec)
    setTStatus('running')
    lockScreen()
    ringBell(1)
    try { localStorage.setItem(TEA_SEC_KEY, String(tSec)) } catch {}
  }

  function finishTea() {
    setTStatus('done')
    unlockScreen()
    ringBell(3)
  }

  // 이전·다음 단계로 직접 이동
  function goTeaStep(i: number) {
    if (i < 0) i = 0
    if (i > TEA_STEPS.length - 1) { finishTea(); return }
    tStepRef.current = i
    setTStep(i)
    tEndRef.current = Date.now() + tSec * 1000
    setTRemain(tSec)
    ringBell(1)
  }

  function pauseTea() {
    setTStatus('paused')
    unlockScreen()
  }

  function resumeTea() {
    tEndRef.current = Date.now() + tRemain * 1000
    setTStatus('running')
    lockScreen()
  }

  function stopTea() {
    clearBells()
    unlockScreen()
    setTStatus('idle')
    setTStep(0)
    tStepRef.current = 0
    setTRemain(0)
  }

  // 단계 시간 계산 (시각 기준이라 화면이 잠깐 꺼졌다 켜져도 맞게 이어져요)
  useEffect(() => {
    if (tStatus !== 'running') return
    const tick = () => {
      const last = TEA_STEPS.length - 1
      let changed = false
      while (Date.now() >= tEndRef.current) {
        if (tStepRef.current >= last) { finishTea(); return }
        tStepRef.current += 1
        tEndRef.current += tSec * 1000
        changed = true
      }
      if (changed) { setTStep(tStepRef.current); ringBell(1) }
      setTRemain(Math.max(0, Math.ceil((tEndRef.current - Date.now()) / 1000)))
    }
    const id = window.setInterval(tick, 250)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        wakeRef.current = null
        lockScreen()
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tStatus])

  // 남은 시간 계산 (시각 기준이라 화면이 잠깐 꺼졌다 켜져도 정확해요)
  useEffect(() => {
    if (zStatus !== 'running') return
    const tick = () => {
      const rem = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setZRemain(rem)
      if (rem <= 0) {
        setZStatus('done')
        unlockScreen()
        ringBell(3)
      }
    }
    const id = window.setInterval(tick, 250)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        wakeRef.current = null
        lockScreen()
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zStatus])

  // ---------- 음성 안내 ----------
  const set = PRACTICE_TRACKS[version]
  const themeTracks: PracticeTrack[] = THEME_SESSIONS.map(id => {
    const n = id.replace('s', '')
    const name = SESSION_NAMES[id]
    return {
      id: `theme-${id}`,
      title: isEn ? `Session ${n} · ${name?.en ?? ''}` : `${n}회기 · ${name?.ko ?? ''}`,
      src: isEn ? `/audio-en/${id}.mp3` : `/audio/${id}.mp3`,
    }
  })

  const tabs: { key: Tab; label: string; tracks: PracticeTrack[] }[] = [
    { key: 'bodyscan', label: isEn ? 'Body Scan' : '바디스캔', tracks: set.bodyscan },
    { key: 'focus', label: isEn ? 'Focus' : '주의집중 수행', tracks: set.focus },
    { key: 'zazen', label: isEn ? 'Silent Sit' : '좌선', tracks: [] },
    { key: 'tea', label: isEn ? 'Tea' : '한 잔 수행', tracks: [] },
    { key: 'theme', label: isEn ? 'Songs' : '테마곡', tracks: themeTracks },
  ]
  const activeTab = tabs.find(t => t.key === tab) ?? tabs[0]

  // 반복 안 함 → 전곡 반복 → 한 곡 반복 → (처음으로)
  function cycleRepeat() {
    const next = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off'
    setRepeat(next)
    try { localStorage.setItem(LOOP_KEY, next) } catch {}
  }

  // 곡이 끝났을 때: 전곡 반복이면 같은 목록의 다음 곡을 재생(마지막 곡 다음은 첫 곡)
  function handleEnded() {
    setPlaying(false)
    if (repeat !== 'all' || !track) return
    const list = tabs.find(t => t.tracks.some(x => x.id === track.id))?.tracks ?? []
    if (list.length === 0) return
    const i = list.findIndex(x => x.id === track.id)
    playTrack(list[(i + 1) % list.length])
  }

  function pickAvatar(id: string) {
    setAvatar(id)
    setChoosing(false)
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  }

  function playTrack(t: PracticeTrack) {
    const a = audioRef.current
    if (!a) return
    if (zStatus !== 'idle') stopZazen()
    if (tStatus !== 'idle') stopTea()
    if (track?.id === t.id) {
      if (a.paused) a.play().catch(() => setPlaying(false))
      else a.pause()
      return
    }
    setTrack(t)
    setError(false)
    setCur(0)
    setDur(0)
    a.src = t.src
    a.load()
    a.play().catch(() => setPlaying(false))
  }

  function togglePlay() {
    const a = audioRef.current
    if (!a || !track) return
    if (a.paused) a.play().catch(() => setPlaying(false))
    else a.pause()
  }

  function seek(v: number) {
    const a = audioRef.current
    if (!a) return
    a.currentTime = v
    setCur(v)
  }

  const currentAvatar = AVATARS.find(a => a.id === avatar)
  const showChooser = loaded && (!currentAvatar || choosing)
  const alive = playing || zStatus === 'running' || tStatus === 'running'
  const teaIdx = tStatus === 'done' ? TEA_STEPS.length - 1 : tStep // 지금 보여줄 차 명상 그림
  const teaStep = TEA_STEPS[teaIdx]
  const showRotateHint = touch && !landscape && !hintDismissed
  const zActive = zStatus === 'running' || zStatus === 'paused'
  const unit = isEn ? 'min' : '분'

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -20%, #fdf2f8 0%, #fdf8f0 60%)' }}>
      <style>{`
        @keyframes ealowm-breathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.025) translateY(-3px); }
        }
        @keyframes ealowm-glow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.08); }
        }
      `}</style>

      <audio
        ref={audioRef}
        loop={repeat === 'one'}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={e => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration)}
        onError={() => { setError(true); setPlaying(false) }}
      />

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className={`${landscape ? 'max-w-5xl' : 'max-w-2xl'} mx-auto px-4 py-3 flex items-center gap-3`}>
          <button onClick={() => router.push('/dashboard')}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            ← {isEn ? 'Dashboard' : '대시보드'}
          </button>
          <span className="text-sm font-medium text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
            {isEn ? 'Mind Practice' : '마음 수행'}
          </span>
        </div>
      </header>

      <main className={`${landscape ? 'max-w-5xl py-4 pb-10' : 'max-w-2xl py-6 pb-24'} mx-auto px-4`}>

        {/* 아바타 선택 */}
        {showChooser && (
          <div className="animate-fade-up">
            <div className="text-center mb-6">
              <p className="text-3xl mb-2">🪷</p>
              <h1 className="text-lg font-bold text-stone-800" style={{ fontFamily: 'var(--font-gowun)' }}>
                {isEn ? 'Choose your avatar' : '함께할 아바타를 골라주세요'}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                {isEn ? 'You can change it anytime.' : '나중에 언제든 바꿀 수 있어요.'}
              </p>
            </div>
            <div className={`grid gap-3 ${landscape ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {AVATARS.map((a, i) => (
                <button key={a.id}
                  onClick={() => pickAvatar(a.id)}
                  className={`rounded-2xl border-2 bg-white p-3 transition-all hover:border-pink-300 hover:shadow-md ${
                    avatar === a.id ? 'border-pink-400' : 'border-stone-100'
                  }`}>
                  <img src={a.src} alt={isEn ? `Avatar ${i + 1}` : `아바타 ${i + 1}`}
                    className="mx-auto" style={{ height: landscape ? '150px' : '190px', width: 'auto', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
            {choosing && currentAvatar && (
              <button onClick={() => setChoosing(false)}
                className="w-full mt-4 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                {isEn ? 'Cancel' : '취소'}
              </button>
            )}
          </div>
        )}

        {/* 수행 공간 */}
        {loaded && currentAvatar && !choosing && (
          <div className={`animate-fade-up ${landscape ? 'flex gap-5 items-start' : 'space-y-5'}`}>

            {/* 왼쪽(가로 보기) 또는 위쪽(세로 보기): 장면 */}
            <div className={landscape ? 'w-[44%] flex-shrink-0 sticky top-[4.25rem]' : ''}>

            {/* 장면 — 크기는 --sh 하나로 정해져서 세로·가로 모두 같은 비율로 그려져요 */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm"
              style={{
                '--sh': landscape ? 'clamp(220px, calc(100vh - 100px), 440px)' : '360px',
                height: 'var(--sh)',
                background: 'linear-gradient(180deg, #2a1a14 0%, #4a2c1d 62%, #6b4226 62%, #4a2c1d 100%)',
              } as React.CSSProperties}>
              {/* 은은한 빛 */}
              <div className="absolute left-0 right-0 flex justify-center" style={{ top: 'calc(var(--sh) * 0.067)' }}>
                <div
                  style={{
                    width: 'calc(var(--sh) * 0.667)', height: 'calc(var(--sh) * 0.667)', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,214,150,0.55) 0%, rgba(255,214,150,0) 70%)',
                    animation: 'ealowm-glow 5s ease-in-out infinite',
                    animationPlayState: alive ? 'running' : 'paused',
                  }} />
              </div>
              {/* 방석 */}
              {/* (차 명상의 '돗자리 있는 아바타'는 그림에 돗자리가 이미 있어서 방석을 숨겨요) */}
              {!(tab === 'tea' && currentAvatar.id === 'boy-casual') && (
                <div className="absolute left-1/2 -translate-x-1/2"
                  style={{ bottom: 'calc(var(--sh) * 0.072)', width: 'calc(var(--sh) * 0.667)', height: 'calc(var(--sh) * 0.094)', borderRadius: '50%', background: 'rgba(217,79,136,0.5)', filter: 'blur(1px)' }} />
              )}
              {/* 아바타 (앉은 모습) */}
              <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: 'calc(var(--sh) * 0.105)' }}>
                {tab === 'tea' ? (
                  // 차 명상: 4장을 겹쳐 두고 단계에 맞는 한 장만 보여줘요 (미리 불러와져서 바뀔 때 끊기지 않아요)
                  <div className="relative"
                    style={{
                      height: 'calc(var(--sh) * 0.75)', aspectRatio: '672 / 900',
                      transformOrigin: '50% 100%',
                      animation: 'ealowm-breathe 4s ease-in-out infinite',
                      animationPlayState: alive ? 'running' : 'paused',
                    }}>
                    {TEA_STEPS.map((s, i) => (
                      <img key={s.key} src={`/avatars/tea/${currentAvatar.id}-${s.key}.webp`}
                        alt={i === teaIdx ? 'avatar' : ''} aria-hidden={i !== teaIdx}
                        className="absolute inset-0 w-full h-full"
                        style={{ objectFit: 'contain', opacity: i === teaIdx ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                    ))}
                  </div>
                ) : (
                  <img src={currentAvatar.src} alt="avatar"
                    style={{
                      height: 'calc(var(--sh) * 0.75)', width: 'auto', objectFit: 'contain',
                      transformOrigin: '50% 100%',
                      animation: 'ealowm-breathe 4s ease-in-out infinite',
                      animationPlayState: alive ? 'running' : 'paused',
                    }} />
                )}
              </div>
              {/* 상단 문구 */}
              <div className="absolute top-4 left-0 right-0 text-center px-4">
                <p className="text-xs text-amber-100/80">
                  {zActive
                    ? `${isEn ? 'Silent sitting' : '좌선 중'} · ${fmt(zRemain)}`
                    : tab === 'tea'
                      ? (tStatus === 'idle'
                          ? (isEn ? 'Tea practice' : '한 잔 수행')
                          : `${isEn ? 'Tea practice' : '한 잔 수행'} · ${isEn ? teaStep.en : teaStep.ko}`)
                    : track
                      ? track.title
                      : (isEn ? 'Choose a practice' : '수행을 선택해보세요')}
                </p>
              </div>
              <button onClick={() => setChoosing(true)}
                className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full bg-white/15 text-white/90 hover:bg-white/25 transition-all">
                {isEn ? 'Change avatar' : '아바타 변경'}
              </button>
            </div>

            </div>

            {/* 오른쪽(가로 보기) 또는 아래쪽(세로 보기): 플레이어·탭·목록 */}
            <div className={landscape ? 'flex-1 min-w-0 space-y-4' : 'space-y-5'}>

            {/* 가로 화면 안내 (세로로 든 터치 기기에서, 닫으면 다시 나오지 않아요) */}
            {showRotateHint && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <span className="text-sm leading-5">📱</span>
                <p className="flex-1 text-xs text-amber-800/80 leading-5">
                  {isEn
                    ? 'Turn your phone sideways to use landscape view (auto-rotate must be on).'
                    : '휴대폰 자동 회전이 켜져 있으면, 옆으로 돌려 가로 화면으로 볼 수 있어요.'}
                </p>
                <button onClick={dismissHint} aria-label={isEn ? 'Close' : '닫기'}
                  className="text-stone-400 hover:text-stone-600 text-sm leading-5 px-1">
                  ✕
                </button>
              </div>
            )}

            {/* 플레이어 (음성 안내 탭에서만) */}
            {tab !== 'zazen' && tab !== 'tea' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} disabled={!track}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #e673a8, #d94f88)' }}
                    aria-label={playing ? 'pause' : 'play'}>
                    {playing ? '❚❚' : '▶'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-stone-700 truncate">
                        {track ? track.title : (isEn ? 'Nothing selected' : '선택된 수행이 없어요')}
                      </p>
                      <button onClick={cycleRepeat} aria-pressed={repeat !== 'off'}
                        className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 transition-all ${
                          repeat !== 'off'
                            ? 'bg-pink-50 border-pink-300 text-pink-600 font-medium'
                            : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                        }`}>
                        {repeat === 'one'
                          ? `🔂 ${isEn ? 'Repeat one' : '한곡 반복'}`
                          : repeat === 'all'
                            ? `🔁 ${isEn ? 'Repeat all' : '전곡 반복'}`
                            : `🔁 ${isEn ? 'Repeat off' : '반복 안 함'}`}
                      </button>
                    </div>
                    <input type="range" min={0} max={dur || 0} step={1} value={Math.min(cur, dur || 0)}
                      onChange={e => seek(Number(e.target.value))}
                      disabled={!track || !dur}
                      className="w-full mt-1 accent-pink-500" />
                    <div className="flex justify-between text-xs text-stone-400">
                      <span>{fmt(cur)}</span>
                      <span>{fmt(dur)}</span>
                    </div>
                  </div>
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-2">
                    {isEn ? 'The audio could not be loaded. It may not be uploaded yet.' : '음원을 불러오지 못했어요. 아직 준비 중일 수 있어요.'}
                  </p>
                )}
              </div>
            )}

            {/* 탭 */}
            <div className="flex border-b border-stone-100">
              {tabs.map(t => (
                <button key={t.key} onClick={() => { if (t.key !== 'tea' && tStatus !== 'idle') stopTea(); setTab(t.key) }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-all ${
                    tab === t.key
                      ? 'text-pink-600 border-b-2 border-pink-500 font-medium'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* 좌선 타이머 */}
            {tab === 'zazen' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-5">

                {zStatus === 'idle' && (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
                        {isEn ? 'Sit quietly for a time you choose' : '시간을 정해 조용히 앉아보세요'}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {isEn
                          ? 'The bell rings three times at the start and again when the time is up.'
                          : '시작할 때와 시간이 다 되었을 때, 종소리가 세 번씩 울려요.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {ZAZEN_PRESETS.map(m => (
                        <button key={m} onClick={() => setZText(String(m))}
                          className={`py-2.5 rounded-xl text-sm transition-all ${
                            zText === String(m)
                              ? 'bg-pink-500 text-white'
                              : 'bg-white border border-stone-200 text-stone-500 hover:border-pink-200'
                          }`}>
                          {m}{unit}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-stone-400">{isEn ? 'Custom' : '직접 입력'}</span>
                      <input type="text" inputMode="numeric" value={zText}
                        onChange={e => setZText(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                        className="w-20 text-center text-sm py-2 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:border-pink-300" />
                      <span className="text-xs text-stone-400">{unit}</span>
                    </div>
                    {!zValid && (
                      <p className="text-xs text-red-400 text-center">
                        {isEn ? 'Enter a number from 1 to 180.' : '1~180 사이의 숫자를 입력해주세요.'}
                      </p>
                    )}

                    <button onClick={toggleSound}
                      className="mx-auto flex items-center gap-2 text-xs text-stone-500">
                      <span className={`w-9 h-5 rounded-full relative transition-all ${zSound ? 'bg-pink-400' : 'bg-stone-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${zSound ? 'left-[18px]' : 'left-0.5'}`} />
                      </span>
                      {isEn ? 'Bell sound' : '종소리'}
                    </button>

                    {zSound && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 flex-shrink-0">{isEn ? 'Volume' : '소리 크기'}</span>
                        <input type="range" min={0} max={100} step={5} value={zVol}
                          onChange={e => changeVolume(Number(e.target.value))}
                          className="flex-1 accent-pink-500" />
                        <button onClick={previewBell}
                          className="text-xs px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 flex-shrink-0">
                          ▶ {isEn ? 'Listen' : '들어보기'}
                        </button>
                      </div>
                    )}

                    <button onClick={startZazen} disabled={!zValid}
                      className="w-full py-3 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all"
                      style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                      {isEn ? 'Begin' : '좌선 시작'}
                    </button>

                    <p className="text-xs text-stone-300 text-center">
                      {isEn ? 'Keep the screen on so the bell can sound.' : '종소리가 울리려면 화면을 켜 둔 채로 해주세요.'}
                    </p>
                  </>
                )}

                {zActive && (
                  <>
                    <div className="text-center">
                      <p className="text-5xl font-light text-stone-700 tabular-nums" style={{ fontFamily: 'var(--font-gowun)' }}>
                        {fmt(zRemain)}
                      </p>
                      <p className="text-xs text-stone-400 mt-2">
                        {zStatus === 'paused'
                          ? (isEn ? 'Paused' : '잠시 멈춤')
                          : (isEn ? 'Sitting in silence' : '조용히 앉아 있는 중')}
                      </p>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full transition-all"
                        style={{ width: `${zTotalRef.current ? Math.round((1 - zRemain / zTotalRef.current) * 100) : 0}%` }} />
                    </div>
                    <div className="flex gap-3">
                      {zStatus === 'running' ? (
                        <button onClick={pauseZazen}
                          className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                          {isEn ? 'Pause' : '잠시 멈춤'}
                        </button>
                      ) : (
                        <button onClick={resumeZazen}
                          className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all"
                          style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                          {isEn ? 'Resume' : '다시 이어서'}
                        </button>
                      )}
                      <button onClick={stopZazen}
                        className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                        {isEn ? 'End' : '마치기'}
                      </button>
                    </div>
                  </>
                )}

                {zStatus === 'done' && (
                  <div className="text-center space-y-4">
                    <p className="text-3xl">🪷</p>
                    <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                      {isEn
                        ? <>You sat for {Math.round(zTotalRef.current / 60)} minutes.<br/>Thank you for sitting with yourself.</>
                        : <>{Math.round(zTotalRef.current / 60)}분 동안 앉아 계셨어요.<br/>수고하셨습니다.</>}
                    </p>
                    <button onClick={stopZazen}
                      className="w-full py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                      {isEn ? 'Sit again' : '다시 하기'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 차 명상 */}
            {tab === 'tea' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-5">

                {tStatus === 'idle' && (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                        {isEn
                          ? 'Drink tea or coffee together, and turn your attention to yourself.'
                          : '함께 차나 커피를 마시면서 자신에게 집중해봐요'}
                      </p>
                    </div>

                    <ol className="space-y-2">
                      {TEA_STEPS.map((s, i) => (
                        <li key={s.key} className="flex items-center gap-3 text-sm text-stone-600">
                          <span className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span>{isEn ? s.enDo : s.koDo}</span>
                        </li>
                      ))}
                    </ol>

                    <div>
                      <p className="text-xs text-stone-400 text-center mb-2">{isEn ? 'Time for each step' : '한 단계당 시간'}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {TEA_PRESETS.map(sec => (
                          <button key={sec} onClick={() => setTSec(sec)}
                            className={`py-2.5 rounded-xl text-sm transition-all ${
                              tSec === sec
                                ? 'bg-pink-500 text-white'
                                : 'bg-white border border-stone-200 text-stone-500 hover:border-pink-200'
                            }`}>
                            {sec < 60 ? `${sec}${isEn ? 's' : '초'}` : `${sec / 60}${isEn ? ' min' : '분'}`}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-stone-300 text-center mt-2">
                        {isEn
                          ? `About ${Math.round((tSec * TEA_STEPS.length) / 60)} min in total (${tSec}s × ${TEA_STEPS.length} steps)`
                          : `전체 약 ${Math.round((tSec * TEA_STEPS.length) / 60)}분 (${tSec}초 × ${TEA_STEPS.length}단계)`}
                      </p>
                    </div>

                    <button onClick={toggleSound}
                      className="mx-auto flex items-center gap-2 text-xs text-stone-500">
                      <span className={`w-9 h-5 rounded-full relative transition-all ${zSound ? 'bg-pink-400' : 'bg-stone-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${zSound ? 'left-[18px]' : 'left-0.5'}`} />
                      </span>
                      {isEn ? 'Bell between steps' : '단계가 바뀔 때 종소리'}
                    </button>

                    <button onClick={startTea}
                      className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                      {isEn ? 'Begin' : '한 잔 수행 시작'}
                    </button>

                    <p className="text-xs text-stone-300 text-center">
                      {isEn ? 'Have your tea or coffee ready, and keep the screen on.' : '차나 커피를 미리 준비하고, 화면을 켜 둔 채로 해주세요.'}
                    </p>
                  </>
                )}

                {(tStatus === 'running' || tStatus === 'paused') && (
                  <>
                    <div className="flex justify-center gap-2">
                      {TEA_STEPS.map((s, i) => (
                        <span key={s.key}
                          className={`h-1.5 rounded-full transition-all ${i === tStep ? 'w-8 bg-pink-500' : i < tStep ? 'w-4 bg-pink-200' : 'w-4 bg-stone-100'}`} />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-stone-400">{tStep + 1} / {TEA_STEPS.length}</p>
                      <p className="text-lg font-medium text-stone-700 mt-1" style={{ fontFamily: 'var(--font-gowun)' }}>
                        {isEn ? TEA_STEPS[tStep].en : TEA_STEPS[tStep].ko}
                      </p>
                      <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                        {isEn ? TEA_STEPS[tStep].enDo : TEA_STEPS[tStep].koDo}
                      </p>
                      <p className="text-3xl font-light text-stone-600 tabular-nums mt-4">{fmt(tRemain)}</p>
                      {tStatus === 'paused' && (
                        <p className="text-xs text-stone-400 mt-1">{isEn ? 'Paused' : '잠시 멈춤'}</p>
                      )}
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full transition-all"
                        style={{ width: `${tSec ? Math.round((1 - tRemain / tSec) * 100) : 0}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => goTeaStep(tStep - 1)} disabled={tStep === 0}
                        className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-all">
                        ‹ {isEn ? 'Back' : '이전'}
                      </button>
                      {tStatus === 'running' ? (
                        <button onClick={pauseTea}
                          className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                          {isEn ? 'Pause' : '잠시 멈춤'}
                        </button>
                      ) : (
                        <button onClick={resumeTea}
                          className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all"
                          style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                          {isEn ? 'Resume' : '이어서'}
                        </button>
                      )}
                      <button onClick={() => goTeaStep(tStep + 1)}
                        className="flex-1 py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                        {tStep === TEA_STEPS.length - 1 ? (isEn ? 'Finish' : '마치기') : (isEn ? 'Next' : '다음')} ›
                      </button>
                    </div>
                    <button onClick={stopTea} className="mx-auto block text-xs text-stone-400 hover:text-stone-600">
                      {isEn ? 'End now' : '그만두기'}
                    </button>
                  </>
                )}

                {tStatus === 'done' && (
                  <div className="text-center space-y-4">
                    <p className="text-3xl">🪷</p>
                    <p className="text-sm text-stone-600 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                      {isEn
                        ? <>You have finished all four steps.<br/>Thank you for drinking with yourself.</>
                        : <>네 단계를 모두 마쳤어요.<br/>수고하셨습니다.</>}
                    </p>
                    <button onClick={stopTea}
                      className="w-full py-3 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                      {isEn ? 'Again' : '다시 하기'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 목록 */}
            {tab !== 'zazen' && tab !== 'tea' && (
              <div className="space-y-2">
                {activeTab.tracks.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-2xl mb-2">🪷</p>
                    <p className="text-sm text-stone-400">
                      {isEn ? 'Coming soon.' : '음성 안내를 준비 중이에요.'}
                    </p>
                  </div>
                )}
                {activeTab.tracks.map(t => {
                  const active = track?.id === t.id
                  return (
                    <button key={t.id} onClick={() => playTrack(t)}
                      className={`w-full text-left bg-white rounded-xl p-4 border transition-all flex items-center gap-3 ${
                        active ? 'border-pink-300 shadow-sm' : 'border-stone-100 hover:border-pink-200'
                      }`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        active ? 'bg-pink-500 text-white' : 'bg-stone-100 text-stone-400'
                      }`}>
                        {active && playing ? '❚❚' : '▶'}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-stone-700">{t.title}</span>
                        {t.desc && <span className="block text-xs text-stone-400 mt-0.5">{t.desc}</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            </div>

          </div>
        )}
      </main>
    </div>
  )
}
