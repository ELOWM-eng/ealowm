'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('이메일 또는 비밀번호를 확인해주세요.')
      } else {
        window.location.href = '/select-version'
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) {
        setError('회원가입 중 오류가 발생했습니다.')
      } else {
        setMessage('확인 이메일을 발송했습니다. 이메일을 확인해주세요.')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-base font-medium text-stone-700 mb-6"
        style={{ fontFamily: 'var(--font-gowun)' }}>
        {mode === 'login' ? '로그인 · Sign In' : '회원가입 · Sign Up'}
      </h2>

      <div>
        <label className="block text-xs text-stone-500 mb-1">이메일</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-200 bg-stone-50
            focus:outline-none focus:border-pink-300 focus:bg-white transition-colors"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-xs text-stone-500 mb-1">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-stone-200 bg-stone-50
            focus:outline-none focus:border-pink-300 focus:bg-white transition-colors"
          placeholder="6자리 이상"
        />
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {message && <p className="text-xs text-teal-600 text-center">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all
          disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: loading ? '#ccc' : 'linear-gradient(135deg, #d94f88, #c2306a)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
            처리 중... · Processing...
          </span>
        ) : mode === 'login' ? '로그인 · Sign In' : '회원가입 · Sign Up'}
      </button>

      <p className="text-center text-xs text-stone-400 pt-1">
        {mode === 'login' ? '아직 계정이 없으신가요? · New here?' : '이미 계정이 있으신가요? · Already have an account?'}
        {' '}
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}
          className="text-pink-500 hover:text-pink-600 font-medium"
        >
          {mode === 'login' ? '회원가입 · Sign Up' : '로그인 · Sign In'}
        </button>
      </p>
    </form>
  )
}
