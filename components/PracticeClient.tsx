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

type Tab = 'bodyscan' | 'focus' | 'theme'

const AVATARS = [
  { id: 'girl', src: '/avatars/girl.png' },
  { id: 'boy-casual', src: '/avatars/boy-casual.png' },
  { id: 'boy-uniform', src: '/avatars/boy-uniform.png' },
  { id: 'woman', src: '/avatars/woman.png' },
]

const STORAGE_KEY = 'ealowm_avatar'

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

  // 저장된 아바타 불러오기 (브라우저 저장소가 막혀 있어도 동작하도록 try/catch)
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      if (v && AVATARS.some(a => a.id === v)) setAvatar(v)
    } catch {}
    setLoaded(true)
  }, [])

  // 화면을 떠날 때 재생 정지
  useEffect(() => {
    const a = audioRef.current
    return () => { a?.pause() }
  }, [])

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
    { key: 'focus', label: isEn ? 'Focus Meditation' : '집중명상', tracks: set.focus },
    { key: 'theme', label: isEn ? 'Theme Songs' : '테마곡', tracks: themeTracks },
  ]
  const activeTab = tabs.find(t => t.key === tab) ?? tabs[0]

  function pickAvatar(id: string) {
    setAvatar(id)
    setChoosing(false)
    try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  }

  function playTrack(t: PracticeTrack) {
    const a = audioRef.current
    if (!a) return
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
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={e => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration)}
        onError={() => { setError(true); setPlaying(false) }}
      />

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            ← {isEn ? 'Dashboard' : '대시보드'}
          </button>
          <span className="text-sm font-medium text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
            {isEn ? 'Mind Practice' : '마음 수행'}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">

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
            <div className="grid grid-cols-2 gap-3">
              {AVATARS.map((a, i) => (
                <button key={a.id}
                  onClick={() => pickAvatar(a.id)}
                  className={`rounded-2xl border-2 bg-white p-3 transition-all hover:border-pink-300 hover:shadow-md ${
                    avatar === a.id ? 'border-pink-400' : 'border-stone-100'
                  }`}>
                  <img src={a.src} alt={isEn ? `Avatar ${i + 1}` : `아바타 ${i + 1}`}
                    className="mx-auto" style={{ height: '190px', width: 'auto', objectFit: 'contain' }} />
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
          <div className="animate-fade-up space-y-5">

            {/* 장면 */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm"
              style={{ height: '360px', background: 'linear-gradient(180deg, #2a1a14 0%, #4a2c1d 62%, #6b4226 62%, #4a2c1d 100%)' }}>
              {/* 은은한 빛 */}
              <div className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: '24px', width: '240px', height: '240px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,214,150,0.55) 0%, rgba(255,214,150,0) 70%)',
                  animation: 'ealowm-glow 5s ease-in-out infinite',
                  animationPlayState: playing ? 'running' : 'paused',
                }} />
              {/* 방석 */}
              <div className="absolute left-1/2 -translate-x-1/2"
                style={{ bottom: '26px', width: '240px', height: '34px', borderRadius: '50%', background: 'rgba(217,79,136,0.5)', filter: 'blur(1px)' }} />
              {/* 아바타 (앉은 모습) */}
              <div className="absolute left-0 right-0 flex justify-center" style={{ bottom: '38px' }}>
                <img src={currentAvatar.src} alt="avatar"
                  style={{
                    height: '270px', width: 'auto', objectFit: 'contain',
                    transformOrigin: '50% 100%',
                    animation: 'ealowm-breathe 4s ease-in-out infinite',
                    animationPlayState: playing ? 'running' : 'paused',
                  }} />
              </div>
              {/* 재생 중인 제목 */}
              <div className="absolute top-4 left-0 right-0 text-center px-4">
                <p className="text-xs text-amber-100/80">
                  {track ? track.title : (isEn ? 'Choose a practice below' : '아래에서 수행을 선택해보세요')}
                </p>
              </div>
              <button onClick={() => setChoosing(true)}
                className="absolute top-3 right-3 text-xs px-3 py-1.5 rounded-full bg-white/15 text-white/90 hover:bg-white/25 transition-all">
                {isEn ? 'Change avatar' : '아바타 변경'}
              </button>
            </div>

            {/* 플레이어 */}
            <div className="bg-white rounded-2xl border border-stone-100 p-4">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} disabled={!track}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0 disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #e673a8, #d94f88)' }}
                  aria-label={playing ? 'pause' : 'play'}>
                  {playing ? '❚❚' : '▶'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {track ? track.title : (isEn ? 'Nothing selected' : '선택된 수행이 없어요')}
                  </p>
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

            {/* 탭 */}
            <div className="flex border-b border-stone-100">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 py-2.5 text-sm transition-all ${
                    tab === t.key
                      ? 'text-pink-600 border-b-2 border-pink-500 font-medium'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* 목록 */}
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

          </div>
        )}
      </main>
    </div>
  )
}
