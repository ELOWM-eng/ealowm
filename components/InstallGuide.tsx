'use client'

import { useState } from 'react'

export default function InstallGuide() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko')
  const [device, setDevice] = useState<'iphone' | 'android'>('iphone')
  const [open, setOpen] = useState(false)

  const isEn = lang === 'en'

  const steps = {
    iphone: {
      ko: [
        {
          num: 1,
          title: 'Safari에서 주소 입력하기',
          desc: '아이폰의 Safari 브라우저를 열고 주소창에 ealowm.vercel.app을 입력해요.',
          note: '⚠️ 반드시 Safari를 사용하세요. Chrome에서는 설치가 안 돼요.',
          noteColor: 'text-red-400 bg-red-50',
        },
        {
          num: 2,
          title: '하단 공유 버튼 누르기',
          desc: '화면 하단 가운데에 있는 네모 위에 화살표 모양 버튼을 눌러요. (공유 버튼)',
          note: '⬆️ Safari 하단 가운데 버튼이에요.',
          noteColor: 'text-stone-500 bg-stone-50',
        },
        {
          num: 3,
          title: '홈 화면에 추가 선택하기',
          desc: '메뉴에서 아래로 스크롤하여 「홈 화면에 추가」를 찾아 눌러요.',
          note: '➕ 홈 화면에 추가',
          noteColor: 'text-pink-500 bg-pink-50 font-bold',
        },
        {
          num: 4,
          title: '추가 버튼 누르기',
          desc: '오른쪽 위의 「추가」버튼을 누르면 홈 화면에 이로움 아이콘이 나타나요.',
          note: '✅ 이제 앱처럼 바로 실행할 수 있어요!',
          noteColor: 'text-teal-600 bg-teal-50',
        },
      ],
      en: [
        {
          num: 1,
          title: 'Open Safari & Enter the URL',
          desc: 'Open the Safari browser on your iPhone and type ealowm.vercel.app in the address bar.',
          note: '⚠️ Please use Safari only. Installation does not work on Chrome.',
          noteColor: 'text-red-400 bg-red-50',
        },
        {
          num: 2,
          title: 'Tap the Share Button',
          desc: 'Tap the box with an arrow pointing up at the center of the bottom bar. (Share button)',
          note: '⬆️ It\'s the button at the center of Safari\'s bottom bar.',
          noteColor: 'text-stone-500 bg-stone-50',
        },
        {
          num: 3,
          title: 'Select "Add to Home Screen"',
          desc: 'Scroll down in the menu and find "Add to Home Screen" — tap it.',
          note: '➕ Add to Home Screen',
          noteColor: 'text-pink-500 bg-pink-50 font-bold',
        },
        {
          num: 4,
          title: 'Tap Add to Confirm',
          desc: 'Tap "Add" in the top right. The EALOWM icon will appear on your home screen.',
          note: '✅ You can now launch it just like any other app!',
          noteColor: 'text-teal-600 bg-teal-50',
        },
      ],
    },
    android: {
      ko: [
        {
          num: 1,
          title: 'Chrome에서 주소 입력하기',
          desc: '안드로이드의 Chrome 브라우저를 열고 주소창에 ealowm.vercel.app을 입력해요.',
          note: '✅ Chrome 브라우저를 사용하세요. 삼성 브라우저도 가능해요.',
          noteColor: 'text-teal-600 bg-teal-50',
        },
        {
          num: 2,
          title: '오른쪽 위 점 세 개 누르기',
          desc: 'Chrome 브라우저 오른쪽 위에 있는 점 세 개(⋮) 버튼을 눌러 메뉴를 열어요.',
          note: '⋮ Chrome 오른쪽 상단 버튼이에요.',
          noteColor: 'text-stone-500 bg-stone-50',
        },
        {
          num: 3,
          title: '홈 화면에 추가 선택하기',
          desc: '메뉴에서 「홈 화면에 추가」를 찾아 눌러요. 팝업이 뜨면 「추가」를 눌러요.',
          note: '📲 홈 화면에 추가',
          noteColor: 'text-green-600 bg-green-50 font-bold',
        },
        {
          num: 4,
          title: '추가 버튼 누르기',
          desc: '팝업창에서 앱 이름을 확인하고 「추가」버튼을 눌러요.',
          note: '✅ 홈 화면에 이로움 아이콘이 나타나요!',
          noteColor: 'text-teal-600 bg-teal-50',
        },
      ],
      en: [
        {
          num: 1,
          title: 'Open Chrome & Enter the URL',
          desc: 'Open the Chrome browser on your Android and type ealowm.vercel.app in the address bar.',
          note: '✅ Use the Chrome browser. Samsung Internet also works.',
          noteColor: 'text-teal-600 bg-teal-50',
        },
        {
          num: 2,
          title: 'Tap the Three Dots in the Top Right',
          desc: 'Tap the three-dot menu (⋮) in the top right corner of Chrome to open the options menu.',
          note: '⋮ It\'s the button in the top right of Chrome.',
          noteColor: 'text-stone-500 bg-stone-50',
        },
        {
          num: 3,
          title: 'Select "Add to Home Screen"',
          desc: 'Find "Add to Home Screen" in the menu and tap it. When a popup appears, tap "Add".',
          note: '📲 Add to Home Screen',
          noteColor: 'text-green-600 bg-green-50 font-bold',
        },
        {
          num: 4,
          title: 'Tap Add to Confirm',
          desc: 'Confirm the app name in the popup and tap the "Add" button.',
          note: '✅ The EALOWM icon will appear on your home screen!',
          noteColor: 'text-teal-600 bg-teal-50',
        },
      ],
    },
  }

  const currentSteps = steps[device][lang]

  return (
    <section className="max-w-2xl mx-auto px-4 pb-8 animate-fade-up">
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">

        {/* 헤더 - 클릭하면 열림/닫힘 */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-lg">📲</span>
            <span className="text-sm font-bold text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
              {isEn ? '앱 설치 방법 · How to Install the App · ' : '앱 설치 방법 · How to Install the App'}
            </span>
          </div>
          <span className="text-stone-400 text-sm">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div className="px-5 pb-5 border-t border-stone-100">

            {/* 언어 전환 */}
            <div className="flex justify-end gap-2 mt-4 mb-4">
              <button
                onClick={() => setLang('ko')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'ko' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                한국어
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                English
              </button>
            </div>

            {/* 기기 선택 */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setDevice('iphone')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  device === 'iphone'
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-50 text-stone-500 border border-stone-200'
                }`}>
                🍎 iPhone
              </button>
              <button
                onClick={() => setDevice('android')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  device === 'android'
                    ? 'bg-green-600 text-white'
                    : 'bg-stone-50 text-stone-500 border border-stone-200'
                }`}>
                🤖 Android
              </button>
            </div>

            {/* 단계별 가이드 */}
            <div className="space-y-3">
              {currentSteps.map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 text-white ${
                    device === 'iphone' ? 'bg-stone-800' : 'bg-green-600'
                  }`}>
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-stone-700 mb-1">{step.title}</p>
                    <p className="text-xs text-stone-500 leading-relaxed mb-1.5">{step.desc}</p>
                    <div className={`text-xs px-3 py-1.5 rounded-lg ${step.noteColor}`}>
                      {step.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 완료 메시지 */}
            <div className={`mt-4 p-4 rounded-xl text-center ${
              device === 'iphone'
                ? 'bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-100'
                : 'bg-gradient-to-r from-green-50 to-teal-50 border border-green-100'
            }`}>
              <p className="text-2xl mb-1">📱🪷</p>
              <p className="text-sm font-bold text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
                {isEn ? 'Installation Complete!' : '설치 완료!'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {isEn
                  ? 'EALOWM now appears on your Home Screen. Launch it just like any other app!'
                  : '홈 화면에 이로움 아이콘이 생겨요. 이제 앱처럼 바로 실행할 수 있어요!'}
              </p>
              <p className="text-xs font-bold text-stone-400 mt-2">ealowm.vercel.app</p>
            </div>

          </div>
        )}
      </div>
    </section>
  )
}