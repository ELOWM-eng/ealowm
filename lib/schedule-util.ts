// 함께 수행 일정 달력·운영자 화면이 같이 쓰는 시간 도구 (라이브러리 없이 Intl 만 사용)

export type Room = { id: string; versions: string[]; title: string; starts_at: string; duration_min: number }

export const KST = 'Asia/Seoul'
export const ET = 'America/New_York'

type P = Record<string, string>
function parts(ms: number, tz: string): P {
  const out: P = {}
  for (const p of new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(ms))) out[p.type] = p.value
  return out
}

/** 그 시간대에서 본 날짜(YYYY-MM-DD)와 시각(HH:mm) */
export function wallOf(iso: string, tz: string): { date: string; time: string } {
  const p = parts(Date.parse(iso), tz)
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}

/** 그 시간대의 "날짜 + 시각" → 실제 순간(UTC). 서머타임이 있는 시간대도 맞게 계산해요. */
export function wallToUtc(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  let utc = wall
  for (let i = 0; i < 3; i++) {
    const p = parts(utc, tz)
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute)
    utc = utc - (asUtc - wall)
  }
  return new Date(utc)
}

export const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
export const localTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/** 버전별로 도장·일정을 세는 기준 시간대 (영문=미국 동부, 그 외=한국) */
export const programTz = (version: string | null) => (version === 'en' ? ET : KST)

export function hhmmAdd(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const t = (h * 60 + m + minutes) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
