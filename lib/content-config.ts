export type ContentConfig = {
  care: number
  cards: number[]
}

export const CONTENT_ADULT: Record<string, ContentConfig> = {
  s1:  { care: 1, cards: [8, 8] },
  s2:  { care: 1, cards: [8, 7] },
  s3:  { care: 0, cards: [11] },
  s4:  { care: 0, cards: [8] },
  s5:  { care: 0, cards: [8] },
  s6:  { care: 0, cards: [8] },
  s7:  { care: 0, cards: [8] },
  s8:  { care: 0, cards: [8] },
  s9:  { care: 0, cards: [9] },
  s10: { care: 0, cards: [9] },
  s11: { care: 0, cards: [8] },
  s12: { care: 0, cards: [9] },
}

export const CONTENT_YOUTH: Record<string, ContentConfig> = {
  s1:  { care: 1, cards: [6, 10] },
  s2:  { care: 1, cards: [8, 9] },
  s3:  { care: 0, cards: [9] },
  s4:  { care: 0, cards: [7] },
  s5:  { care: 0, cards: [7] },
  s6:  { care: 0, cards: [7] },
  s7:  { care: 0, cards: [7] },
  s8:  { care: 0, cards: [7] },
  s9:  { care: 0, cards: [7] },
  s10: { care: 0, cards: [7] },
  s11: { care: 0, cards: [7] },
  s12: { care: 0, cards: [7] },
}