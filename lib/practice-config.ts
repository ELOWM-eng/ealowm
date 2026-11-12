// 마음 수행 설정 파일 — 음원이 늘어나면 이 파일만 수정하면 돼요.
// 음성 파일 위치: public/practice/{adult|youth|en}/파일명.mp3

export type PracticeVersion = 'adult' | 'youth' | 'en'

export type PracticeTrack = {
  id: string
  title: string
  desc?: string
  src: string
}

type PracticeSet = {
  bodyscan: PracticeTrack[] // 바디스캔 음성 안내
  focus: PracticeTrack[]    // 집중명상 음성 안내
}

export const PRACTICE_TRACKS: Record<PracticeVersion, PracticeSet> = {
  adult: {
    bodyscan: [
      { id: 'a-bodyscan1', title: '바디스캔', desc: '몸 구석구석을 천천히 살피는 음성 안내', src: '/practice/adult/bodyscan1.mp3' },
    ],
    focus: [
      { id: 'a-focus1', title: '주의집중 수행', desc: '호흡에 마음을 모으는 음성 안내', src: '/practice/adult/focus1.mp3' },
    ],
  },
  youth: {
    bodyscan: [
      { id: 'y-bodyscan1', title: '바디스캔', desc: '몸 구석구석을 천천히 살피는 음성 안내', src: '/practice/youth/bodyscan1.mp3' },
    ],
    focus: [
      { id: 'y-focus1', title: '주의집중 수행', desc: '호흡에 마음을 모으는 음성 안내', src: '/practice/youth/focus1.mp3' },
    ],
  },
  // 영문 음성 안내가 준비되면 아래처럼 한 줄씩 추가하세요. (비어 있으면 'Coming soon.' 으로 표시돼요)
  // 예: { id: 'e-bodyscan1', title: 'Body Scan', desc: 'A guided scan of the body', src: '/practice/en/bodyscan1.mp3' },
  en: {
    bodyscan: [],
    focus: [],
  },
}

// 테마곡이 준비된 회기 (새 테마곡을 올리면 여기에 추가)
export const THEME_SESSIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12']

export const SESSION_NAMES: Record<string, { ko: string; en: string }> = {
  s1: { ko: '무상관', en: 'The Formless' },
  s2: { ko: '세속관', en: 'The Secular' },
  s3: { ko: '자비관', en: 'The Compassion' },
  s4: { ko: '보시행', en: 'The Generosity' },
  s5: { ko: '지계행', en: 'The Ethical Conduct' },
  s6: { ko: '인욕행', en: 'The Forbearance' },
  s7: { ko: '사상관', en: 'Four Stages of Form' },
  s8: { ko: '생멸관', en: 'The Arising and Ceasing' },
  s9: { ko: '무량관', en: 'The Infinite' },
  s10: { ko: '정진행', en: 'The Diligence' },
  s11: { ko: '선정행', en: 'The Concentration' },
  s12: { ko: '지혜행', en: 'The Wisdom' },
}

// 대시보드의 '마음 수행' 메뉴를 보여줄지 결정 (지금은 모든 버전에서 표시)
export function hasPractice(_version: string): boolean {
  return true
}
