// 일요일 "본원의 편지" — 일요일에 함께 수행 '참여'를 누르면 그 주 회기의 편지가 뜨고, 이용자가 답장을 남길 수 있어요.
// 1주차는 직접 쓰신 문구 그대로이고, 2~12주차는 같은 틀에 회기 이름과 '초점 주제'(워크북 표)를 넣어 만든 초안이에요.
// 아래 SENSE 의 문장은 자유롭게 고쳐도 돼요. (ko = 한글 화면, en = 영문 화면)

import { SESSION_NAMES } from '@/lib/practice-config'
import { programTz, wallOf } from '@/lib/schedule-util'

/** 프로그램 1주차가 시작되는 월요일 (한국·미국 동부 모두 이 날짜 기준으로 주차를 세요) */
export const PROGRAM_START = '2026-11-23'
export const TOTAL_WEEKS = 12

// 주차별 질문 한 문장 (편지 둘째 문단 뒷부분)
const SENSE: Record<number, { ko: string; en: string }> = {
  1: {
    ko: '우리의 몸과 감정, 생각 등 모든 것이 고정되어 있지 않고 끊임없이 변화하고 있음을 느껴보셨나요?',
    en: 'Have you noticed that our bodies, emotions, thoughts, and everything around us are not fixed but constantly changing?',
  },
  2: {
    ko: '마음을 괴롭히는 번뇌와 집착이 일어나는 순간을 알아차리고, 그것에서 한 걸음 벗어나 보는 경험이 있으셨나요?',
    en: 'Did you notice moments when afflictions and cravings arose in your mind, and moments when you could step back and let them go?',
  },
  3: {
    ko: '있는 그대로의 나와 다른 사람을 인정하고, 따뜻한 마음을 건네는 순간이 있으셨나요?',
    en: 'Were there moments when you accepted yourself and others just as they are, and offered a little warmth?',
  },
  4: {
    ko: '작은 나눔이나 다른 사람을 위한 마음을 실천해 본 순간이 있으셨나요?',
    en: 'Were there moments when you shared something small or acted with care for someone else?',
  },
  5: {
    ko: '스스로 정한 약속을 지키고, 알맞게 절제해 본 순간이 있으셨나요?',
    en: 'Were there moments when you kept a promise to yourself or practiced moderation?',
  },
  6: {
    ko: '힘든 순간을 견디며 마음의 평온을 되찾아 본 경험이 있으셨나요?',
    en: 'Were there difficult moments when you stayed patient and found some calm again?',
  },
  7: {
    ko: '생겨나고, 머물고, 변하고, 사라지는 흐름을 바라보며 마음을 비워 보는 경험이 있으셨나요?',
    en: 'Did you watch things arise, stay, change, and pass away, and feel your mind become a little lighter?',
  },
  8: {
    ko: '마음이 일어나고 사라지는 모습을 살피고, 있는 그대로 알아차려 보셨나요?',
    en: 'Did you watch your mind as thoughts and feelings arose and faded, and simply notice them as they were?',
  },
  9: {
    ko: '내 안의 한계 없는 가능성을 믿어 보는 순간이 있으셨나요?',
    en: 'Were there moments when you trusted in the limitless possibilities within you?',
  },
  10: {
    ko: '작더라도 꾸준히 노력하며, 조금씩 자라고 있음을 느껴보셨나요?',
    en: 'Have you felt yourself growing, little by little, through steady effort, however small?',
  },
  11: {
    ko: '마음을 한곳에 모으고, 고요함에 머물러 보는 순간이 있으셨나요?',
    en: 'Were there moments when you gathered your mind in one place and rested in stillness?',
  },
  12: {
    ko: '그동안의 수행을 통해 새롭게 보이거나 깨닫게 된 것이 있으셨나요?',
    en: 'Is there something you have come to see or realize through your practice so far?',
  },
}

export type Letter = { title: string; paragraphs: string[]; sign: string }

/** 영문 이름 앞의 "The " 를 떼어 문장에 자연스럽게 넣어요 (예: The Formless → Formless) */
const enName = (n: string) => n.replace(/^The\s+/i, '')

export function letterFor(week: number, en: boolean): Letter | null {
  const names = SESSION_NAMES[`s${week}`]
  const sense = SENSE[week]
  if (!names || !sense) return null
  if (en) {
    const n = enName(names.en)
    return {
      title: `Week ${week}: How Was Your ${n} Practice?`,
      paragraphs: [
        `How has your ${n} practice been going this week? ${sense.en}`,
        `I'm curious about what you experienced, felt, or noticed during your practice this week.`,
        `What does ${n} mean to you?\nAn emoji, a single word, or a short sentence is perfectly fine. If you didn't notice anything in particular, that's okay too.`,
        `Feel free to reply and share your experience with us.`,
        `Let's continue our practice together, one day at a time.`,
      ],
      sign: '— Bonwon 🪷',
    }
  }
  const n = names.ko
  return {
    title: `${week}주차 ${n}, 어떻게 보내셨나요?`,
    paragraphs: [
      `한 주 동안 ${n} 실천을 잘 이어오셨나요? ${sense.ko}`,
      `이번 한 주 동안 ${n}을 실천하면서 어떤 느낌이나 생각이 들었는지 궁금합니다.`,
      `여러분에게 ${n}은 어떤 의미였나요?\n이모티콘 하나도 좋고, 한 단어나 짧은 한 문장도 좋아요. 특별한 느낌이 없었다면 그것도 괜찮습니다.`,
      `부담 없이 여러분의 이야기를 답장으로 들려주세요.`,
      `함께 수행하는 여러분의 하루하루를 응원합니다.`,
    ],
    sign: '— 본원 드림 🪷',
  }
}

/**
 * 이 일정이 "일요일"이면 그 주차(1~12)를, 아니면 null 을 돌려줘요.
 * 날짜는 버전별 기준 시간대(성인=한국, 영문=미국 동부)로 봐요.
 */
export function sundayWeek(startsAtIso: string, version: string | null): number | null {
  if (version !== 'adult' && version !== 'en') return null // 청소년 버전은 편지가 없어요
  const { date } = wallOf(startsAtIso, programTz(version))
  const days = Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(PROGRAM_START + 'T00:00:00Z')) / 86400000)
  if (days < 0 || days % 7 !== 6) return null
  const week = Math.floor(days / 7) + 1
  return week >= 1 && week <= TOTAL_WEEKS ? week : null
}
