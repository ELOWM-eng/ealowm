export interface SessionRecord {
  id: string
  user_id: string
  session_id: string        // e.g. 's1', 's2', ...
  think_checks: boolean[]   // checklist item states
  practice_text: string
  reflect_texts: string[]   // 3 reflection answers
  completed: boolean
  updated_at: string
}

export interface SessionData {
  think_checks: (boolean | null | string)[]
  practice_texts: string[]
  reflect_texts: string[]
  completed: boolean
  version: string
}

export interface PracticeSession {
  id: string
  num: string
  title: string
  sub: string
  type: 'gwan' | 'haeng'
  week: number
  think: {
  q: string
  items: string[]
  note: string
 inputType?: 'yesno' | 'text' | 'select' | 'quiz' | 'typing' | 'timer' | 'checkbox' | 'mbti' | 'readonly'
mbtiGroups?: { label: string; code: string; items: string[] }[]
images?: string[]
wrongItems?: number[]
typingGroups?: { label: string; stages: string[]; image?: string }[]
}
  practice: {
    q: string
    placeholder: string
  }
  reflect: {
    qs: string[]
    declaration: string
  }
}