// 도반(캐릭터) 4명의 이름과 소개. 도반 고르는 화면 두 곳(마음 수행·함께 수행)이 같이 써요.
export const COMPANIONS = [
  {
    id: 'girl', // 교복 여성
    ko: '우미', hanja: '友美', en: 'Umi',
    descKo: "우미(友美)는 '아름다운 벗'. 차분하고 깊이 생각하며, 말보다 먼저 듣습니다. 이로 곁에서 질문 하나로 방향을 바꿔 줍니다.",
    descEn: 'Umi (友美) means "beautiful friend." Calm and thoughtful, Umi listens before speaking. By Iro\'s side, Umi can change the direction of a conversation with just one question.',
  },
  {
    id: 'boy-casual', // 평상복 남성
    ko: '본원', hanja: '本願', en: 'Bonwon',
    descKo: "본원(本願)은 이 여정의 뿌리입니다. '나도 이롭고, 다른 사람도 함께 이롭기를' 바라는 마음을 품고, 조용하고 담담한 목소리로 길을 안내합니다.",
    descEn: 'Bonwon (本願) is the root of this journey. With the heartfelt wish, "May this journey benefit both myself and others," Bonwon gently guides the way with a calm and steady voice.',
  },
  {
    id: 'boy-uniform', // 교복 남성
    ko: '이로', hanja: '利路', en: 'Iro',
    descKo: "이로(利路)는 '이로운 길'. 솔직하고 즉각적이며, 가끔 엉뚱합니다. 자기 실수를 숨기지 않고, 그 안에서 배우는 법을 알고 있습니다.",
    descEn: 'Iro (利路) means "the beneficial path." Honest, spontaneous, and sometimes delightfully offbeat, Iro never hides mistakes and knows how to learn from them.',
  },
  {
    id: 'woman', // 평상복 여성
    ko: '혜련', hanja: '慧蓮', en: 'Hyeryeon',
    descKo: "혜련(慧蓮)은 '지혜의 연꽃'이에요. 세 친구와 나란히 걸으며, 여러분 곁에서 이 여정을 함께 안내합니다.",
    descEn: 'Hyeryeon (慧蓮) means "Lotus of Wisdom." Walking alongside the three friends, she helps guide you through this journey.',
  },
]
export const companionOf = (id: string) => COMPANIONS.find(c => c.id === id)
