'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

interface Props {
  userId: string
}

const VERSIONS = [
  {
    id: 'adult',
    label: '성인용',
    sublabel: '이로움',
    desc: '지혜의 씨앗으로 자비의 연꽃 피우기',
    emoji: '🌸',
    color: 'from-pink-50 to-pink-100',
    border: 'border-pink-200',
    text: 'text-pink-700',
    btn: 'linear-gradient(135deg, #e673a8, #d94f88)',
  },
  {
    id: 'youth',
    label: '청소년용',
    sublabel: '이로움',
    desc: '지혜의 씨앗으로 자비의 연꽃 피우기',
    emoji: '🌱',
    color: 'from-teal-50 to-teal-100',
    border: 'border-teal-200',
    text: 'text-teal-700',
    btn: 'linear-gradient(135deg, #5dcaa5, #1D9E75)',
  },
  {
    id: 'en',
    label: 'English',
    sublabel: 'EALOWM',
    desc: 'Elevate A Lotus Of Wisdom',
    emoji: '🌍',
    color: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-700',
    btn: 'linear-gradient(135deg, #EF9F27, #BA7517)',
  },
]

export default function VersionSelectClient({ userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  async function selectVersion(versionId: string) {
    setLoading(versionId)
    const { data: existing } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase.from('user_goals')
        .update({ version: versionId })
        .eq('user_id', userId)
    } else {
      await supabase.from('user_goals')
        .insert({ user_id: userId, version: versionId })
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #fdf2f8 0%, #fdf8f0 70%)' }}>

      <div className="text-center mb-10 animate-fade-up">
        <img src="/logo.jpg" alt="EALOWM 로고"
          className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm mb-4" />
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-gowun)', color: '#1a1410' }}>
          이로움 · EALOWM
        </h1>
        <p className="text-sm text-stone-500">어떤 버전으로 시작하실건가요?</p>
      </div>

      <div className="w-full max-w-sm space-y-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {VERSIONS.map(v => (
          <button key={v.id}
            onClick={() => selectVersion(v.id)}
            disabled={loading !== null}
            className={`w-full p-5 rounded-2xl border-2 ${v.border} bg-gradient-to-br ${v.color}
              text-left transition-all hover:shadow-md disabled:opacity-60`}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{v.emoji}</span>
              <div className="flex-1">
                <p className={`text-base font-bold ${v.text}`} style={{ fontFamily: 'var(--font-gowun)' }}>
                  {v.label} · {v.sublabel}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{v.desc}</p>
              </div>
              {loading === v.id && (
                <span className="w-5 h-5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-stone-400 text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
        버전은 나중에 설정에서 변경할 수 있습니다.
      </p>
    </main>
  )
}