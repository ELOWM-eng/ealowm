// 함께 수행 설정 파일 — 닉네임 규칙과 입장 시간은 여기서 바꿀 수 있어요.

export const JOIN_BEFORE_MIN = 10      // 시작 몇 분 전부터 '참여' 버튼을 켤지
export const SHOW_BEFORE_HOURS = 24    // 시작 몇 시간 전부터 하단 안내를 보여줄지
export const NICK_MIN = 2
export const NICK_MAX = 12

// 운영자가 직접 채우는 금지어 목록 (이 단어가 들어간 닉네임은 막혀요). 예: ['단어1', '단어2']
export const BANNED_WORDS: string[] = []

// 통째로 똑같으면 막는 이름 (캐릭터·운영자 사칭 방지)
const RESERVED_EXACT = ['본원', '이로', '우미', '이로움', 'ealowm']
// 일부라도 들어가면 막는 단어
const RESERVED_CONTAINS = ['운영자', '관리자', 'admin']

// 한글·영문·숫자·공백·밑줄·하이픈만 허용
const ALLOWED = /^[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ_\- ]+$/

export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

// 문제가 있으면 안내 문구를, 괜찮으면 null을 돌려줘요.
export function validateNickname(raw: string, en: boolean): string | null {
  const n = normalizeNickname(raw)
  if (n.length < NICK_MIN || n.length > NICK_MAX) {
    return en ? `Use ${NICK_MIN}–${NICK_MAX} characters.` : `${NICK_MIN}~${NICK_MAX}자로 적어주세요.`
  }
  if (!ALLOWED.test(n)) {
    return en
      ? 'Use only letters, numbers, spaces, _ and -.'
      : '한글·영문·숫자·공백·_ · - 만 쓸 수 있어요.'
  }
  const key = n.toLowerCase().replace(/\s/g, '')
  if (
    RESERVED_EXACT.includes(key) ||
    RESERVED_CONTAINS.some(w => key.includes(w)) ||
    BANNED_WORDS.some(w => w && key.includes(w.toLowerCase().replace(/\s/g, '')))
  ) {
    return en ? 'This nickname cannot be used.' : '사용할 수 없는 닉네임이에요.'
  }
  return null
}
