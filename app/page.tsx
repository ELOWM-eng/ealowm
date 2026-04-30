import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AuthForm from '@/components/AuthForm'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #fdf2f8 0%, #fdf8f0 70%)' }}>

      <section className="max-w-2xl mx-auto px-4 pt-16 pb-12 text-center animate-fade-up">
        <img src="/logo.jpg" alt="EALOWM 로고"
          className="w-32 h-32 mx-auto rounded-full object-cover shadow-sm mb-6" />
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-gowun)', color: '#1a1410' }}>
          이로움
        </h1>
        <p className="text-sm tracking-widest text-amber-700 mb-4 uppercase">EALOWM</p>
        <p className="text-base text-stone-500 leading-relaxed">
          Elevate A Lotus Of Wisdom<br/>
          <span className="text-sm text-stone-400">지혜의 씨앗으로 자비의 연꽃 피우기</span>
        </p>
      </section>

     <section className="max-w-2xl mx-auto px-4 mb-12 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h2 className="text-base font-bold text-stone-800 mb-4" style={{ fontFamily: 'var(--font-gowun)' }}>
            프로그램 소개 · Program Introduction
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            신라 시대 원측(圓測, 613–696) 스님의 『무량의경소』(無量義經疏)에서 제시된
            여섯 가지 수행 단계를 바탕으로 개발된 <strong>12단계 중독 예방 및 마음 치유 자기돌봄 프로그램</strong>입니다.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            음주, 약물, 흡연, 게임, SNS, 쇼핑, 인간관계 등
            일상에서 쉽게 빠져들 수 있는 다양한 중독으로부터 자신을 지키고,
            건강한 마음의 힘을 기르는 실천 여정입니다.
          </p>
          <div className="border-t border-stone-100 pt-4">
            <p className="text-sm text-stone-500 leading-relaxed mb-3">
              This is a <strong>12-step addiction prevention and mind-healing self-care program</strong> developed based on the six stages of practice presented in the <em>Muryanguigyeongso</em> (無量義經疏) by the Silla Dynasty monk Woncheuk (圓測, 613–696).
            </p>
            <p className="text-sm text-stone-500 leading-relaxed">
              It is a practical journey to protect yourself from various addictions easily encountered in daily life, such as alcohol, drugs, smoking, gaming, SNS, shopping, and interpersonal relationships, and to cultivate the strength of a healthy mind.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-base font-bold text-stone-700 mb-4 px-1" style={{ fontFamily: 'var(--font-gowun)' }}>
          워크북 구성 · Workbook Sessoon
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { num: '1회기 · Sesson1', title: '무상관 · The Formless', sub: '변화와 벗어남 · Change & Liberation', type: 'gwan' },
            { num: '2회기 · Sesson2', title: '세속관 · The Secular', sub: '번뇌와 끊어냄 · Affliction & Release', type: 'gwan' },
            { num: '3회기 · Sesson3', title: '자비관 · The Compassion', sub: '인정과 따뜻함 · Acceptance & Warmth', type: 'gwan' },
            { num: '4회기 · Sesson4', title: '보시행 · The Generosity', sub: '나눔과 이타심 · Sharing & Altruism', type: 'haeng' },
            { num: '5회기 · Sesson5', title: '지계행 · The Ethical Conduct', sub: '도덕과 절제함 · Virtue & Moderation', type: 'haeng' },
            { num: '6회기 · Sesson6', title: '인욕행 · The Forbearance', sub: '인내와 평온함 · Patience & Serenity', type: 'haeng' },
            { num: '7회기 · Sesson7', title: '사상관 · The Four of Forms', sub: '비움과 덧없음 · Detachment & Impermanence', type: 'gwan' },
            { num: '8회기 · Sesson8', title: '생멸관 · The Arising and Ceasing', sub: '살핌과 자각함 · Mindfulness & Awareness', type: 'gwan' },
            { num: '9회기 · Sesson9', title: '무량관 · The Infinite', sub: '믿음과 무한함 · Trust & Limitlessness', type: 'gwan' },
            { num: '10회기 · Sesson10', title: '정진행 · The Diligence', sub: '노력과 성장함 · Effort & Growth', type: 'haeng' },
            { num: '11회기 · Sesson11', title: '선정행 · The Concentration', sub: '집중과 고요함 · Focus & Stillness', type: 'haeng' },
            { num: '12회기 · Sesson12', title: '지혜행 The Wisdom· ', sub: '통찰과 깨달음 · Insight & Awakening', type: 'haeng' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-stone-100">
              <p className="text-xs text-stone-400 mb-0.5">{s.num}</p>
              <p className="text-sm font-bold text-stone-800" style={{ fontFamily: 'var(--font-gowun)' }}>{s.title}</p>
              <p className="text-xs text-stone-500 mt-0.5">{s.sub}</p>
              <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                s.type === 'gwan' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {s.type === 'gwan' ? '육관행 · The Sixfold Contemplation' : '육바라밀 · The Six Pāramitās'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
          <p className="text-sm text-stone-500 mb-2">문의 · Contact</p>
          <a href="https://instagram.com/16bon_won33" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @16bon_won33
          </a>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 p-8">
          <AuthForm />
        </div>
        <p className="mt-6 text-xs text-stone-400 text-center leading-relaxed">
          원측(圓測, 613–696) 『무량의경소』(無量義經疏) 기반<br/>
          중독 예방 및 마음 치유 프로그램<br/>
          <span className="text-stone-300">·</span><br/>
          Based on Woncheuk's <em>Muryanguigyeongso</em><br/>
          A 12-step addiction prevention & mind-healing program
        </p>
      </section>

    </main>
  )
}