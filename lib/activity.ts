// 지금 무엇을 수행 중인지 알려 주는 작은 공용 저장소 (비밀방에서 닉네임 옆에 보여요)
// 마음 수행 화면·워크북 화면이 setActivity 로 알리고, 함께 수행 화면(TogetherProvider)이 읽어요.

export type Activity = 'zazen' | 'tea' | 'theme' | 'body' | 'focus' | 'reflect'

const KO: Record<Activity, string> = {
  zazen: '좌선 중',
  tea: '한 잔 수행 중',
  theme: '테마곡 듣는 중',
  body: '몸 관찰 수행 중',
  focus: '주의 집중 수행 중',
  reflect: '자기 성찰 중',
}
const EN: Record<Activity, string> = {
  zazen: 'Silent sitting',
  tea: 'Tea practice',
  theme: 'Listening to a song',
  body: 'Body observation',
  focus: 'Focused attention',
  reflect: 'Self-reflection',
}

export function activityLabel(a: string | null | undefined, en: boolean): string {
  if (!a) return ''
  const t = en ? EN : KO
  return (t as Record<string, string>)[a] ?? ''
}

export function isActivity(a: unknown): a is Activity {
  return typeof a === 'string' && a in KO
}

let current: Activity | null = null
export const ACTIVITY_EVENT = 'ealowm:activity'

export function getActivity(): Activity | null {
  return current
}

export function setActivity(a: Activity | null) {
  if (a === current) return
  current = a
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ACTIVITY_EVENT))
}
