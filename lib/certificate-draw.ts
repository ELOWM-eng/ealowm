// 수료증 그림 그리기 (캔버스). 외부 라이브러리 없이 PNG 이미지를 만들어요.

export type CertData = {
  lang: 'ko' | 'en'
  kind: 'cohort' | 'full'
  program: string   // 기수 이름 (또는 12주 완주면 프로그램 이름)
  nickname: string
  period: string    // 기간 문구
  issued: string    // 발급일 문구
  number: string    // 수료 번호
}

export const CERT_W = 1200
export const CERT_H = 1700

const SERIF = '"Noto Serif KR","Nanum Myeongjo","AppleMyungjo","Batang","Noto Serif CJK KR",serif'

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  // 한글은 글자 단위로, 영문은 단어 단위로 줄을 바꿔요
  const tokens = text.includes(' ') && /[A-Za-z]/.test(text) ? text.split(/(\s+)/) : Array.from(text)
  const lines: string[] = []
  let cur = ''
  for (const t of tokens) {
    const next = cur + t
    if (ctx.measureText(next).width > maxW && cur.trim() !== '') { lines.push(cur.trim()); cur = t.trimStart() } else cur = next
  }
  if (cur.trim()) lines.push(cur.trim())
  return lines
}

function lotus(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  const petal = (angle: number, len: number, wid: number, fill: string) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((angle * Math.PI) / 180)
    ctx.beginPath(); ctx.ellipse(0, -len / 2, wid, len / 2, 0, 0, Math.PI * 2)
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#d6779f'; ctx.stroke(); ctx.restore()
  }
  ;[-70, 70].forEach(a => petal(a, 120 * s, 34 * s, '#f9d5e3'))
  ;[-38, 38].forEach(a => petal(a, 150 * s, 38 * s, '#f5b9d0'))
  petal(0, 175 * s, 42 * s, '#f1a0c0')
  ctx.beginPath(); ctx.moveTo(cx - 120 * s, cy + 8); ctx.quadraticCurveTo(cx, cy + 40 * s, cx + 120 * s, cy + 8)
  ctx.lineWidth = 4; ctx.strokeStyle = '#d6779f'; ctx.stroke()
}

export function drawCertificate(canvas: HTMLCanvasElement, d: CertData) {
  canvas.width = CERT_W; canvas.height = CERT_H
  const ctx = canvas.getContext('2d')!
  const ko = d.lang === 'ko'
  const W = CERT_W, H = CERT_H

  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#fffafc'); g.addColorStop(1, '#fdeaf2')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // 이중 테두리
  ctx.lineWidth = 6; ctx.strokeStyle = '#e59ab9'; ctx.strokeRect(50, 50, W - 100, H - 100)
  ctx.lineWidth = 2; ctx.strokeStyle = '#f0c3d6'; ctx.strokeRect(72, 72, W - 144, H - 144)

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  lotus(ctx, W / 2, 330, 1)

  ctx.fillStyle = '#b36a8a'; ctx.font = `500 34px ${SERIF}`
  ctx.fillText(ko ? '이로움 · EALOWM' : 'EALOWM · 이로움', W / 2, 430)

  ctx.fillStyle = '#9d2f60'; ctx.font = `700 ${ko ? 92 : 76}px ${SERIF}`
  const title = d.kind === 'full'
    ? (ko ? '12주 완주 증서' : 'Certificate of 12-Week Completion')
    : (ko ? '수 료 증' : 'Certificate of Completion')
  const titleLines = ctx.measureText(title).width > W - 220 ? wrap(ctx, title, W - 220) : [title]
  titleLines.forEach((l, i) => ctx.fillText(l, W / 2, 560 + i * 92))
  const off = (titleLines.length - 1) * 92

  // 닉네임
  ctx.fillStyle = '#3f2a35'
  let size = 84
  ctx.font = `700 ${size}px ${SERIF}`
  while (ctx.measureText(d.nickname).width > W - 300 && size > 40) { size -= 4; ctx.font = `700 ${size}px ${SERIF}` }
  ctx.fillText(d.nickname, W / 2, 790 + off)
  ctx.lineWidth = 3; ctx.strokeStyle = '#e59ab9'
  ctx.beginPath(); ctx.moveTo(300, 830 + off); ctx.lineTo(W - 300, 830 + off); ctx.stroke()

  // 본문
  const body = ko
    ? `위 사람은 이로움 함께 수행 〈${d.program}〉\n${d.period}\n${d.kind === 'full' ? '전 과정을' : '과정을'} 수료하였기에 이를 증서로 드립니다.`
    : `has completed ${d.program}\n${d.period}`
  ctx.fillStyle = '#5b4a52'; ctx.font = `400 ${ko ? 42 : 40}px ${SERIF}`
  let y = 960 + off
  for (const para of body.split('\n')) {
    for (const l of wrap(ctx, para, W - 300)) { ctx.fillText(l, W / 2, y); y += 70 }
  }

  // 하단: 발급일 / 수료 번호
  ctx.fillStyle = '#5b4a52'; ctx.font = `400 34px ${SERIF}`
  ctx.fillText(ko ? `발급일  ${d.issued}` : `Issued  ${d.issued}`, W / 2, 1400)
  ctx.fillText(ko ? `수료 번호  ${d.number}` : `No.  ${d.number}`, W / 2, 1460)

  ctx.fillStyle = '#b9a3ac'; ctx.font = `400 24px ${SERIF}`
  ctx.fillText(ko ? '앱에 보관된 참여 기록에 따른 수료증이며, 공식 증명서는 아닙니다.' : 'Based on participation records kept in the app. This is not an official certificate.', W / 2, 1580)
}
