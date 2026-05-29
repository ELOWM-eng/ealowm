'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import clsx from 'clsx'

interface Props {
  userId: string
  version: string
  checkPoint: string
  firstResult?: { scores: Record<string, number>; created_at: string } | null
}

type Track = 'adult' | 'teen'

interface Question {
  axis: string
  text: string
  axis_key: string
  opts: { text: string; score: number }[]
}

const Q_ADULT: Question[] = [
  {
    axis: '축 1 · 빈도와 조건',
    text: '최근 한 달 동안, 습관적인 중독 행동이 얼마나 자주 일어났나요?',
    axis_key: 'freq',
    opts: [
      { text: '주 1~2회 정도, 특정 상황(스트레스, 술자리 등)에서만 한다', score: 1 },
      { text: '거의 매일 하지만, 안 하는 날도 있다', score: 2 },
      { text: '매일 하고, 여러 상황에서 반복된다', score: 3 },
      { text: '기분이나 상황에 상관없이 하루에도 여러 번 한다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '습관화된 중독 행동을 하고 나서도 "더 하고 싶다", "아직 부족하다"는 느낌이 드나요?',
    axis_key: 'tan',
    opts: [
      { text: '거의 없다. 하고 나면 충분하다고 느낀다', score: 1 },
      { text: '가끔 더 하고 싶은 마음이 든다', score: 2 },
      { text: '자주 그렇다. 멈추기가 쉽지 않다', score: 3 },
      { text: '항상 그렇다. 얼마를 해도 만족이 안 된다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '습관화된 중독 행동을 못 하게 되거나 갑자기 끊어야 할 때 어떤가요?',
    axis_key: 'jip',
    opts: [
      { text: '별로 불편하지 않다. 없어도 괜찮다', score: 1 },
      { text: '약간 허전하거나 신경 쓰인다', score: 2 },
      { text: '불안하고 초조하다. 머릿속에 자꾸 생각난다', score: 3 },
      { text: '심하게 불편하거나 공허하다. 다른 게 손에 잡히지 않는다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '누군가 습관화된 중독 행동을 못 하게 막거나 지적할 때 어떤 마음이 드나요?',
    axis_key: 'hwa',
    opts: [
      { text: '별로 화가 나지 않는다. 수긍이 된다', score: 1 },
      { text: '약간 짜증이 나지만 금방 가라앉는다', score: 2 },
      { text: '꽤 강한 짜증이나 분노가 올라온다', score: 3 },
      { text: '통제하기 어려운 화가 난다. 관계가 나빠지기도 했다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '"이건 좋지 않은데..." 하면서도 습관화된 중독 행동을 멈추기 어려운가요?',
    axis_key: 'mi',
    opts: [
      { text: '거의 없다. 스스로 판단하고 조절할 수 있다', score: 1 },
      { text: '가끔 그렇다. 알면서도 그냥 하게 된다', score: 2 },
      { text: '자주 그렇다. 알면서도 멈추기가 어렵다', score: 3 },
      { text: '항상 그렇다. 왜 하는지도 모르겠는데 반복된다', score: 4 },
    ]
  },
  {
    axis: '축 3 · 영향 범위',
    text: '습관화된 중독 행동이 나와 주변 사람들의 일상에 어떤 영향을 주고 있나요?',
    axis_key: 'impact',
    opts: [
      { text: '나 자신에게만 영향을 주고, 타인에게는 거의 없다', score: 1 },
      { text: '가족이나 동료가 간접적으로 영향을 받을 수 있다', score: 2 },
      { text: '주변 사람들이 내 변화를 느끼고 걱정하기도 한다', score: 3 },
      { text: '관계, 직장, 건강 등 일상 전반에 분명한 영향을 미치고 있다', score: 4 },
    ]
  },
  {
    axis: '축 4 · 알아차림 수준',
    text: '습관화된 중독 행동이 일어날 때, 나는 언제 "아, 또 하고 있구나" 하고 알아차리나요?',
    axis_key: 'aware',
    opts: [
      { text: '하기 전에 미리 알아차리고, 할지 말지 선택할 수 있다', score: 1 },
      { text: '막 시작할 때쯤 알아차린다', score: 2 },
      { text: '하는 도중에 알아차린다', score: 3 },
      { text: '다 끝나고 나서야 "또 했네" 하고 알아차린다', score: 4 },
    ]
  },
]

const Q_TEEN: Question[] = [
  {
    axis: '축 1 · 빈도와 조건',
    text: '최근 한 달 동안, 습관화된 중독 행동이 얼마나 자주 일어났나요?',
    axis_key: 'freq',
    opts: [
      { text: '주 1~2번 정도, 특별한 상황에서만 한다', score: 1 },
      { text: '거의 매일 하지만, 안 하는 날도 있다', score: 2 },
      { text: '매일 하고, 여러 상황에서 반복된다', score: 3 },
      { text: '기분이나 상황에 상관없이 하루에도 여러 번 한다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '습관화된 중독 행동을 하고 나서도 "더 하고 싶다", "아직 부족하다"는 느낌이 드나요?',
    axis_key: 'tan',
    opts: [
      { text: '거의 없다. 하고 나면 충분하다고 느낀다', score: 1 },
      { text: '가끔 더 하고 싶은 마음이 든다', score: 2 },
      { text: '자주 그렇다. 멈추기가 쉽지 않다', score: 3 },
      { text: '항상 그렇다. 얼마를 해도 만족이 안 된다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '습관화된 중독 행동을 못 하게 되거나 갑자기 끊어야 할 때 어떤가요?',
    axis_key: 'jip',
    opts: [
      { text: '별로 불편하지 않다. 없어도 괜찮다', score: 1 },
      { text: '약간 허전하거나 신경 쓰인다', score: 2 },
      { text: '불안하고 초조하다. 머릿속에 자꾸 생각난다', score: 3 },
      { text: '심하게 불편하거나 공허하다. 다른 게 손에 잡히지 않는다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '부모님이나 친구가 습관화된 중독 행동을 못 하게 막거나 지적할 때 어떤 마음이 드나요?',
    axis_key: 'hwa',
    opts: [
      { text: '별로 화가 나지 않는다. 이해가 된다', score: 1 },
      { text: '약간 짜증이 나지만 금방 가라앉는다', score: 2 },
      { text: '꽤 강한 짜증이나 화가 올라온다', score: 3 },
      { text: '참기 어려운 화가 난다. 다퉈본 적도 있다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴',
    text: '"이건 좋지 않은데..." 하면서도 습관화된 중독 행동을 멈추기 어려운가요?',
    axis_key: 'mi',
    opts: [
      { text: '거의 없다. 스스로 판단하고 조절할 수 있다', score: 1 },
      { text: '가끔 그렇다. 알면서도 그냥 하게 된다', score: 2 },
      { text: '자주 그렇다. 알면서도 멈추기가 어렵다', score: 3 },
      { text: '항상 그렇다. 왜 하는지도 모르겠는데 반복된다', score: 4 },
    ]
  },
  {
    axis: '축 3 · 영향 범위',
    text: '습관화된 중독 행동이 나와 친구·가족의 일상에 어떤 영향을 주고 있나요?',
    axis_key: 'impact',
    opts: [
      { text: '나 자신에게만 영향을 주고, 다른 사람에게는 거의 없다', score: 1 },
      { text: '가족이나 친구가 간접적으로 영향을 받을 수 있다', score: 2 },
      { text: '주변 사람들이 내 변화를 느끼고 걱정하기도 한다', score: 3 },
      { text: '관계, 학교생활, 건강 등에 분명한 영향을 미치고 있다', score: 4 },
    ]
  },
  {
    axis: '축 4 · 알아차림 수준',
    text: '습관화된 중독 행동이 일어날 때, 나는 언제 "아, 또 하고 있구나" 하고 알아차리나요?',
    axis_key: 'aware',
    opts: [
      { text: '하기 전에 미리 알아차리고, 할지 말지 선택할 수 있다', score: 1 },
      { text: '막 시작할 때쯤 알아차린다', score: 2 },
      { text: '하는 도중에 알아차린다', score: 3 },
      { text: '다 끝나고 나서야 "또 했네" 하고 알아차린다', score: 4 },
    ]
  },
]

const Q_EN: Question[] = [
  {
    axis: 'Axis 1 · Frequency & Condition(Formless)',
    text: 'How often does this habitual addictive behavior occur?',
    axis_key: 'freq',
    opts: [
      { text: '1–2 times a week, only in specific situations', score: 1 },
      { text: 'Almost every day, with some pattern', score: 2 },
      { text: 'Every day, repeating in various situations', score: 3 },
      { text: 'Almost always, regardless of mood or situation', score: 4 },
    ]
  },
  {
    axis: 'Axis 2 · Mind Pattern(Secular)',
    text: 'Before doing the havitual addictive behavior, do you feel "I want more" or "it\'s not enough"?',
    axis_key: 'tan',
    opts: [
      { text: 'Rarely', score: 1 },
      { text: 'Sometimes', score: 2 },
      { text: 'Often — this feeling drives the behavior', score: 3 },
      { text: 'Always — I feel anxious without it', score: 4 },
    ]
  },
  {
    axis: 'Axis 2 · Mind Pattern(Secular)',
    text: 'When you can\'t do the havitual addictive behavior or stop, do you feel fear of losing something?',
    axis_key: 'jip',
    opts: [
      { text: 'Rarely', score: 1 },
      { text: 'Occasionally uncomfortable', score: 2 },
      { text: 'Often anxious without it', score: 3 },
      { text: 'Always — feel empty or deeply uncomfortable without it', score: 4 },
    ]
  },
  {
    axis: 'Axis 2 · Mind Pattern(Secular)',
    text: 'When interrupted or prevented from doing the havitual addictive behavior, do you feel irritation or anger?',
    axis_key: 'hwa',
    opts: [
      { text: 'Rarely', score: 1 },
      { text: 'Sometimes irritated', score: 2 },
      { text: 'Often — strong irritation or anger arises', score: 3 },
      { text: 'Always — anger that is hard to control', score: 4 },
    ]
  },
  {
    axis: 'Axis 2 · Mind Pattern(Secular)',
    text: 'Even knowing this behavior is not good for you, do you find it hard to stop?',
    axis_key: 'mi',
    opts: [
      { text: 'Rarely — I can judge and regulate myself', score: 1 },
      { text: 'Sometimes — I do it even knowing I shouldn\'t', score: 2 },
      { text: 'Often — I know but can\'t stop', score: 3 },
      { text: 'Always — I repeat it without knowing why', score: 4 },
    ]
  },
  {
    axis: 'Axis 3 · Scope of Impact(Compassion)',
    text: 'How does this havitual addictive behavior affect you and the people around you?',
    axis_key: 'impact',
    opts: [
      { text: 'Only affects me — little impact on others', score: 1 },
      { text: 'May indirectly affect those around me', score: 2 },
      { text: 'People around me are noticing changes', score: 3 },
      { text: 'Clearly affecting my relationships or daily life', score: 4 },
    ]
  },
  {
    axis: 'Axis 4 · Awareness Level(Arising & Ceasing)',
    text: 'When the havitual addictive behavior occurs, at what point do you become aware of it?',
    axis_key: 'aware',
    opts: [
      { text: 'I notice it before the behavior happens', score: 1 },
      { text: 'I notice it as the behavior begins', score: 2 },
      { text: 'I notice it while doing it', score: 3 },
      { text: 'I only notice it after it\'s done', score: 4 },
    ]
  },
]

export default function AwarenessCheck({ userId, version, checkPoint, firstResult }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEn = version === 'en'
  const isYouth = version === 'youth'

  const [screen, setScreen] = useState<'intro' | 'questions' | 'result'>('intro')
  const [track, setTrack] = useState<Track | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)

  

  const activeQuestions = isEn ? Q_EN : isYouth ? Q_TEEN : track === 'teen' ? Q_TEEN : Q_ADULT

  async function startCheck() {
    if (!isEn && !isYouth) setTrack('adult')
    setScreen('questions')
    setCurrent(0)
    setAnswers({})
  }

  function selectOpt(optIdx: number) {
    setAnswers(prev => ({ ...prev, [current]: optIdx }))
  }

  async function nextQ() {
    if (current < activeQuestions.length - 1) {
      setCurrent(prev => prev + 1)
    } else {
      await saveAndShowResults()
    }
  }

  function prevQ() {
    if (current > 0) setCurrent(prev => prev - 1)
  }

  async function saveAndShowResults() {
    setSaving(true)
    console.log('checkPoint:', checkPoint)
    const scores: Record<string, number> = {}
    activeQuestions.forEach((q, i) => {
      if (!scores[q.axis_key]) scores[q.axis_key] = 0
      scores[q.axis_key] += q.opts[answers[i]].score
    })

    // start일 때는 기존 데이터가 없을 때만 저장
    if (checkPoint === 'start') {
      const { data: existing } = await supabase
        .from('awareness_check')
        .select('id')
        .eq('user_id', userId)
        .eq('version', version)
        .eq('check_point', 'start')
        .single()
      if (!existing) {
        await supabase.from('awareness_check').insert({
          user_id: userId,
          version,
          track: isEn ? 'en' : (track ?? 'adult'),
          scores,
          check_point: 'start',
        })
      }
    } else {
      await supabase.from('awareness_check').insert({
        user_id: userId,
        version,
        track: isEn ? 'en' : (track ?? 'adult'),
        scores,
        check_point: checkPoint,
      })
    }
    setSaving(false)
    setScreen('result')
  }

  function restart() {
    setTrack(null)
    setCurrent(0)
    setAnswers({})
    setScreen('intro')
  }

  // 결과 계산
  const scores: Record<string, number> = {}
  activeQuestions.forEach((q, i) => {
    if (answers[i] === undefined) return
    if (!scores[q.axis_key]) scores[q.axis_key] = 0
    scores[q.axis_key] += q.opts[answers[i]]?.score ?? 1
  })

  const freq = scores['freq'] ?? 1
  const tan = scores['tan'] ?? 1
  const jip = scores['jip'] ?? 1
  const hwa = scores['hwa'] ?? 1
  const mi = scores['mi'] ?? 1
  const impact = scores['impact'] ?? 1
  const aware = scores['aware'] ?? 1

  const tanPct = Math.round((tan / 4) * 100)
  const jipPct = Math.round((jip / 4) * 100)
  const hwaPct = Math.round((hwa / 4) * 100)
  const freqPct = Math.round((freq / 4) * 100)
  const impactPct = Math.round((impact / 4) * 100)
  const awarePct = Math.round((aware / 4) * 100)

  const dominantMind = (() => {
    const vals = [tan, jip, hwa, mi]
    const maxVal = Math.max(...vals)
    const maxIdxs = vals.map((v, i) => v === maxVal ? i : -1).filter(i => i >= 0)
    if (maxIdxs.length === 4) return 3 // 전체 균형
    if (maxIdxs.length === 1) return maxIdxs[0] // 단독 우세
    if (maxIdxs.length === 2) {
      const pair = maxIdxs.join('-')
      if (pair === '0-1') return 4 // 탐냄·집착
      if (pair === '0-2') return 5 // 탐냄·화냄
      if (pair === '0-3') return 7 // 탐냄·미혹
      if (pair === '1-2') return 6 // 집착·화냄
      if (pair === '1-3') return 8 // 집착·미혹
      if (pair === '2-3') return 9 // 화냄·미혹
    }
    // 3개 동률 → 가장 낮은 것 제외하고 균형
    return 3
  })()

  const freqLabel = isEn
    ? ['Occasional', 'Regular', 'Repetitive', 'Automatic'][freq - 1]
    : ['가끔 (주 1~2회)', '거의 매일', '매일 반복', '하루에도 여러 번'][freq - 1]

  const awareLabel = isEn
    ? ['Aware before', 'Aware at start', 'Aware during', 'Aware after'][aware - 1]
    : ['하기 전에 알아차림', '시작할 때 알아차림', '하는 중에 알아차림', '끝난 후에 알아차림'][aware - 1]

  const impactLabel = isEn
    ? ['Internal only', 'Indirect effect', 'Noticed by others', 'Affecting relationships'][impact - 1]
    : ['나에게만 영향', '주변에 간접 영향', '주변이 걱정함', '일상 전반에 영향'][impact - 1]

  const awareColor = ['#1D9E75', '#639922', '#BA7517', '#A32D2D'][aware - 1]
  const freqColor = ['#1D9E75', '#639922', '#BA7517', '#A32D2D'][freq - 1]
  const impactColor = ['#1D9E75', '#639922', '#BA7517', '#A32D2D'][impact - 1]
  const dominantColor = ({
    0: '#3266ad', 1: '#BA7517', 2: '#A32D2D', 3: '#1D9E75',
    4: '#6a4ab5', 5: '#7a3a3a', 6: '#8a5a17',
    7: '#2a6a8a', 8: '#6a5a17', 9: '#8a3a6a',
  } as Record<number, string>)[dominantMind] ?? '#1D9E75'
  const dominantMindLabel = isEn ? {
    0: 'Greed', 1: 'Attachment', 2: 'Anger', 3: 'Balanced(mltiple)',
    4: 'Greed·Attachment', 5: 'Greed·Anger', 6: 'Attachment·Anger',
    7: 'Greed·Delusion', 8: 'Attachment·Delusion', 9: 'Anger·Delusion',
  }[dominantMind] ?? 'Balanced' : {
    0: '탐냄', 1: '집착', 2: '화냄', 3: '균형(복수)',
    4: '탐냄·집착', 5: '탐냄·화냄', 6: '집착·화냄',
    7: '탐냄·미혹', 8: '집착·미혹', 9: '화냄·미혹',
  }[dominantMind] ?? '균형'

  const seedMsg = isEn ? [
    'The seed of awareness is already awake within you.',
    'Awareness is at the threshold of action. You are moving forward.',
    'You have begun to notice within the flow. This awareness is the beginning of change.',
    'This is a place where the first seed of awareness is needed. Using this tool is itself the first step.',
  ][aware - 1] : [
    '이미 알아차림의 힘이 깨어 있어요. 행동하기 전에 멈출 수 있다는 것 — 그게 가장 큰 변화의 씨앗이에요.',
    '행동을 시작하는 순간 알아차린다는 건 정말 중요한 신호예요. 조금만 더 앞당기면 선택이 생겨요.',
    '하는 도중에라도 알아차린다는 건 흐름 안에서 깨어 있다는 뜻이에요. 이 알아차림이 변화의 시작이에요.',
    '끝나고 나서야 알아차리는 건 아직 자동으로 움직이고 있다는 신호예요. 하지만 이 도구를 쓰는 것 자체가 이미 첫 걸음이에요.',
  ][aware - 1]

  const mindMsgs: Record<number, string> = isEn ? {
    0: '"The wanting mind" is mainly driving this habit. When conditions change, this mind can also change.',
    1: '"The fear of losing mind" is holding this habit. Practicing letting go is the key.',
    2: '"The mind that rises when things don\'t go as wished" is connected to this habit. Noticing it alone is already one step.',
    3: 'Three or more minds are balanced. Each arises in different situations. Observing which one moves most in daily life is the practice.',
    4: 'Greed and Attachment are moving together. The wanting and the fear of losing are both present. Noticing which one arises first is the practice.',
    5: 'Greed and Anger are moving together. Wanting more and resisting interruption are both present. A moment of pause between the two is the beginning.',
    6: 'Attachment and Anger are moving together. The fear of losing and the resistance to change are connected. Observing them gently is the first step.',
    7: 'Greed and Delusion are moving together. Wanting more while not knowing why — this is where the habit deepens. Simply noticing this is already awareness.',
    8: 'Attachment and Delusion are moving together. Holding on without knowing why — gently asking "what am I holding?" is the beginning.',
    9: 'Anger and Delusion are moving together. Resistance arising without knowing why — noticing that moment is the first step.',
  } : {
    0: '지금 이 습관을 주로 이끄는 건 "더 원하는 마음"이에요. 얼마를 해도 부족한 느낌 — 그 마음을 알아차리는 것만으로도 변화가 시작돼요. 조건이 바뀌면 이 마음도 달라질 수 있어요.',
    1: '"잃기 싫은 마음"이 이 습관을 붙들고 있어요. 없으면 불안하고, 멈추면 허전한 느낌 — 그 마음을 부드럽게 바라보는 연습이 열쇠예요.',
    2: '뜻대로 안 될 때, 막히거나 지적받을 때 올라오는 짜증이나 분노가 이 습관과 연결되어 있어요. 그 화가 올라오는 순간을 알아차리는 것만으로도 한 걸음이에요.',
    3: '여러 마음이 상황에 따라 번갈아 나타나고 있어요. 오늘 어떤 마음이 가장 먼저 움직였는지 하루 한 번 돌아보는 것이 실천이에요.',
    4: '"더 원하는 마음"과 "잃기 싫은 마음"이 함께 움직이고 있어요. 이 두 마음이 언제 먼저 일어나는지 알아차리는 것이 실천이에요.',
    5: '"더 원하는 마음"과 "막히면 화나는 마음"이 함께 움직이고 있어요. 그 사이에서 한 박자 멈추는 것이 시작이에요.',
    6: '"잃기 싫은 마음"과 "막히면 화나는 마음"이 연결되어 있어요. 그 마음들을 싸우지 않고 부드럽게 바라보는 것이 첫 걸음이에요.',
    7: '"더 원하는 마음"과 "왜 하는지 모르는 마음"이 함께 움직이고 있어요. 이 자리에서 습관이 가장 깊어져요. 그것을 알아차리는 것 자체가 이미 깨어 있는 거예요.',
    8: '"잃기 싫은 마음"과 "왜 붙드는지 모르는 마음"이 함께 있어요. "내가 지금 무엇을 붙들고 있지?"라고 부드럽게 물어보는 것이 시작이에요.',
    9: '"화나는 마음"과 "왜 화가 나는지 모르는 마음"이 연결되어 있어요. 그 순간을 알아차리는 것이 첫 걸음이에요.',
  }
  const mindMsg = mindMsgs[dominantMind] ?? mindMsgs[3]
  const pct = Math.round((current / activeQuestions.length) * 100)

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% -20%, #fdf2f8 0%, #fdf8f0 60%)' }}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-pink-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1 -ml-1">
            ← {isEn ? 'Dashboard' : '대시보드'}
          </button>
          <span className="text-sm font-medium text-stone-700" style={{ fontFamily: 'var(--font-gowun)' }}>
            {isEn ? 'Awareness Check' : '나의 습관 패턴 알아차리기'}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">

        {/* 인트로 화면 */}
        {screen === 'intro' && (
          <div className="animate-fade-up space-y-6">
            <div className="text-center py-6">
              <p className="text-5xl mb-4">🪷</p>
              <h1 className="text-2xl font-bold text-stone-800 mb-3" style={{ fontFamily: 'var(--font-gowun)' }}>
                {isEn ? 'Awareness Check' : '나의 습관 패턴 알아차리기'}
              </h1>
              <p className="text-sm text-stone-500 leading-relaxed">
                {isEn
                  ? 'This is not a diagnosis.\nIt is a mirror that reflects the flow of your mind\nas it moves within you, right now.'
                  : '이 도구는 진단이 아닙니다.\n지금 이 순간, 내 안에서 움직이는 마음의 흐름을\n있는 그대로 바라보는 거울입니다.'}
              </p>
            </div>

            

            <button
              onClick={startCheck}
              disabled={false}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
              {isEn ? 'Start →' : '시작하기 →'}
            </button>
          </div>
        )}

        {/* 질문 화면 */}
        {screen === 'questions' && (
          <div className="animate-fade-up space-y-5">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }} />
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs font-medium text-teal-600 mb-2">{activeQuestions[current].axis}</p>
              <p className="text-sm text-stone-800 leading-relaxed mb-4">{activeQuestions[current].text}</p>
              <div className="space-y-2">
                {activeQuestions[current].opts.map((opt, i) => (
                  <button key={i}
                    onClick={() => selectOpt(i)}
                    className={clsx(
                      'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                      answers[current] === i
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-stone-100 bg-white hover:border-stone-200'
                    )}>
                    <div className={clsx(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
                      answers[current] === i ? 'border-teal-500 bg-teal-500' : 'border-stone-300'
                    )}>
                      {answers[current] === i && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">{opt.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-stone-400 text-right">{current + 1} / {activeQuestions.length}</p>

            <div className="flex gap-3">
              <button
                onClick={prevQ}
                disabled={current === 0}
                className="px-5 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-40 transition-all">
                ← {isEn ? 'Back' : '이전'}
              </button>
              <button
                onClick={nextQ}
                disabled={answers[current] === undefined || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all"
                style={{ background: 'linear-gradient(135deg, #5dcaa5, #1D9E75)' }}>
                {saving ? '...' : current === activeQuestions.length - 1
                  ? (isEn ? 'See Results →' : '결과 보기 →')
                  : (isEn ? 'Next →' : '다음 →')}
              </button>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {screen === 'result' && (
          <div className="animate-fade-up space-y-5">
            <div className="text-center py-6">
              <p className="text-5xl mb-3">🪷</p>
              <h2 className="text-xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'var(--font-gowun)' }}>
                {isEn ? 'My Habit Pattern Awareness' : '나의 습관 흐름 알아차리기'}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                {isEn
                  ? 'This is not a diagnosis.\nThis is the result of seeing the flow within you as it is.'
                  : '이것은 진단이 아닙니다.\n지금 이 순간, 내 안의 흐름을 있는 그대로 바라본 결과입니다.'}
              </p>
            </div>

            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              {isEn ? 'Current State Across Four Axes' : '네 가지 축으로 본 지금 나의 상태'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* 빈도 */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <p className="text-xs text-stone-400 mb-1">{isEn ? 'Frequency (Formless)' : '빈도와 조건 (무상관)'}</p>
                <p className="text-sm font-bold mb-2" style={{ color: freqColor }}>{freqLabel}</p>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${freqPct}%`, background: freqColor }} />
                </div>
              </div>

              {/* 알아차림 */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <p className="text-xs text-stone-400 mb-1">{isEn ? 'Awareness (Arising & Ceasing)' : '알아차림 수준 (생멸관)'}</p>
                <p className="text-sm font-bold mb-2" style={{ color: awareColor }}>{awareLabel}</p>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${awarePct}%`, background: awareColor }} />
                </div>
              </div>

              {/* 영향 */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <p className="text-xs text-stone-400 mb-1">{isEn ? 'Scope of Impact (Compassion)' : '영향 범위 (자비관)'}</p>
                <p className="text-sm font-bold mb-2" style={{ color: impactColor }}>{impactLabel}</p>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${impactPct}%`, background: impactColor }} />
                </div>
              </div>

              {/* 마음 패턴 */}
              <div className="bg-white rounded-2xl border border-stone-100 p-4">
                <p className="text-xs text-stone-400 mb-1">{isEn ? 'Mind Pattern (Secular)' : '주된 마음 패턴 (세속관)'}</p>
                <p className="text-sm font-bold mb-2" style={{ color: dominantColor }}>
                  {dominantMind >= 3
                    ? dominantMindLabel
                    : `${dominantMindLabel}${isEn ? ' dominant' : '이 우세'}`}
                </p>
                <div className="space-y-1.5">
                  {[
                    { label: isEn ? 'Greed' : '탐냄', val: tan, pct: tanPct, color: '#3266ad' },
                    { label: isEn ? 'Attachment' : '집착', val: jip, pct: jipPct, color: '#BA7517' },
                    { label: isEn ? 'Anger' : '화냄', val: hwa, pct: hwaPct, color: '#A32D2D' },
                    { label: isEn ? 'Delusion' : '미혹', val: mi, pct: Math.round((mi / 4) * 100), color: '#2a6a8a' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-xs text-stone-400 w-14 flex-shrink-0">{m.label}</span>
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                      </div>
                      <span className="text-xs text-stone-400 w-4 text-right">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              {isEn ? 'Seed of Awareness Message' : '알아차림 씨앗 메시지'}
            </p>

            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs text-stone-400 mb-2">{isEn ? 'About Awareness' : '지금 이 순간, 알아차림에 대해'}</p>
              <p className="text-sm text-stone-700 leading-relaxed">{seedMsg}</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <p className="text-xs text-stone-400 mb-2">{isEn ? 'About Your Main Mind Pattern' : '주된 마음 패턴에 대해'}</p>
              <p className="text-sm text-stone-700 leading-relaxed">{mindMsg}</p>
            </div>

            <div className="bg-teal-50 border-l-4 border-teal-400 rounded-r-xl p-4">
              <p className="text-xs text-teal-700 leading-relaxed">
                {checkPoint === 'end'
                  ? (isEn
                    ? 'You have completed the 12-week journey. Addiction is not a fixed part of you — it is a phenomenon formed by conditions. The practice of looking within continues.'
                    : '12주 여정을 마쳤습니다. 중독은 고정된 나의 일부가 아니라, 조건에 따라 형성된 하나의 현상입니다. 내 안을 바라보는 실천은 계속됩니다.')
                  : (isEn
                    ? 'This result shows the starting point of your 12-week journey. Addiction is not a fixed part of you — it is a phenomenon formed by conditions. When conditions change, it can change too.'
                    : '이 결과는 12주 여정의 출발점을 보여줍니다. 중독은 고정된 나의 일부가 아니라, 조건에 따라 형성된 하나의 현상입니다. 조건이 바뀌면 변할 수 있습니다.')}
              </p>
            </div>
{checkPoint === 'end' && firstResult && (() => {
              const fs = firstResult.scores
              const axes = [
                { key: 'freq', label: isEn ? 'Frequency' : '빈도', labels: isEn ? ['Occasional','Regular','Repetitive','Automatic'] : ['간헐적','규칙적','반복적','자동적'], colors: ['#1D9E75','#639922','#BA7517','#A32D2D'] },
                { key: 'aware', label: isEn ? 'Awareness' : '알아차림', labels: isEn ? ['Before','At start','During','After'] : ['행동 전','시작 시','행동 중','사후'], colors: ['#1D9E75','#639922','#BA7517','#A32D2D'] },
                { key: 'impact', label: isEn ? 'Impact' : '영향 범위', labels: isEn ? ['Internal','Indirect','Noticed','Affecting'] : ['자기 내부','간접적','주변 표현','관계 영향'], colors: ['#1D9E75','#639922','#BA7517','#A32D2D'] },
              ]
              const mindKeys = ['tan','jip','hwa','mi']
              const mindLabelMap: Record<string, string> = isEn
                ? { tan: 'Greed', jip: 'Attachment', hwa: 'Anger', mi: 'Delusion' }
                : { tan: '탐냄', jip: '집착', hwa: '화냄', mi: '미혹' }
              const mindColors: Record<string, string> = { tan: '#3266ad', jip: '#BA7517', hwa: '#A32D2D', mi: '#2a6a8a' }

              const getTopKey = (src: Record<string, number>) => {
                const vals = mindKeys.map(k => src[k] ?? 0)
                const maxVal = Math.max(...vals)
                if (maxVal === 0) return 'balanced'
                const topKeys = mindKeys.filter(k => (src[k] ?? 0) === maxVal)
                return topKeys.length === 1 ? topKeys[0] : 'balanced'
              }
              const firstDominantKey = getTopKey(fs)
              const nowDominantKey = getTopKey(scores)
              console.log('fs:', fs, 'firstDominant:', firstDominantKey)
              console.log('scores:', scores, 'nowDominant:', nowDominantKey)

              // 변화 분석
              const awareChange = (fs['aware'] ?? 1) - (scores['aware'] ?? 1)
              const freqChange = (fs['freq'] ?? 1) - (scores['freq'] ?? 1)
              const impactChange = (fs['impact'] ?? 1) - (scores['impact'] ?? 1)

              const getChangeMsg = () => {
                const msgs = []

                // 알아차림 변화
                if (awareChange > 0) msgs.push(isEn
                  ? `Awareness improved by ${awareChange} level${awareChange > 1 ? 's' : ''} — noticing earlier than before.`
                  : `알아차림이 ${awareChange}단계 빨라졌습니다. 이전보다 더 일찍 알아차리고 있습니다.`)
                else if (awareChange < 0) msgs.push(isEn
                  ? `Awareness shifted later by ${Math.abs(awareChange)} level${Math.abs(awareChange) > 1 ? 's' : ''} — this is also information worth observing.`
                  : `알아차림이 ${Math.abs(awareChange)}단계 늦어졌습니다. 이것도 바라볼 가치 있는 정보입니다.`)
                else msgs.push(isEn
                  ? 'Awareness level remains the same — the practice of noticing continues.'
                  : '알아차림 수준이 같습니다. 바라보는 실천이 이어지고 있습니다.')

                // 빈도 변화
                if (freqChange > 0) msgs.push(isEn
                  ? `Frequency decreased by ${freqChange} level${freqChange > 1 ? 's' : ''} — the habit is occurring less often.`
                  : `빈도가 ${freqChange}단계 줄었습니다. 습관이 덜 자주 일어나고 있습니다.`)
                else if (freqChange < 0) msgs.push(isEn
                  ? `Frequency increased by ${Math.abs(freqChange)} level${Math.abs(freqChange) > 1 ? 's' : ''} — observing what conditions are behind this is the practice.`
                  : `빈도가 ${Math.abs(freqChange)}단계 늘었습니다. 어떤 조건이 작용하는지 관찰하는 것이 실천입니다.`)
                else msgs.push(isEn
                  ? 'Frequency is unchanged — notice what situations trigger it.'
                  : '빈도는 변화 없습니다. 어떤 상황에서 일어나는지 알아차려 보세요.')

                // 마음 패턴 상세 분석
                const mindChanges = mindKeys.map(k => ({
                  key: k,
                  label: mindLabelMap[k],
                  before: fs[k] ?? 0,
                  after: scores[k] ?? 0,
                  diff: (fs[k] ?? 0) - (scores[k] ?? 0),
                }))

                const decreased = mindChanges.filter(m => m.diff > 0)
                const increased = mindChanges.filter(m => m.diff < 0)
                const unchanged = mindChanges.filter(m => m.diff === 0)

                let mindDetail = ''
                if (isEn) {
                  if (decreased.length > 0)
                    mindDetail += `${decreased.map(m => `${m.label}(${m.before}→${m.after})`).join(', ')} decreased. `
                  if (increased.length > 0)
                    mindDetail += `${increased.map(m => `${m.label}(${m.before}→${m.after})`).join(', ')} increased. `
                  if (unchanged.length > 0)
                    mindDetail += `${unchanged.map(m => m.label).join(', ')} unchanged. `
                } else {
                  if (decreased.length > 0)
                    mindDetail += `${decreased.map(m => `${m.label}(${m.before}→${m.after})`).join(', ')}이 줄었습니다. `
                  if (increased.length > 0)
                    mindDetail += `${increased.map(m => `${m.label}(${m.before}→${m.after})`).join(', ')}이 늘었습니다. `
                  if (unchanged.length > 0)
                    mindDetail += `${unchanged.map(m => m.label).join(', ')}은 변화 없습니다. `
                }

                // 주된 마음 변화
                const balancedLabel = isEn ? 'Balanced' : '균형'
                const firstLabel = firstDominantKey === 'balanced' ? balancedLabel : mindLabelMap[firstDominantKey]
                const nowLabel = nowDominantKey === 'balanced' ? balancedLabel : mindLabelMap[nowDominantKey]

                let mindMsg = ''
                if (firstDominantKey === 'balanced' && nowDominantKey === 'balanced') {
                  mindMsg = isEn
                    ? 'The mind pattern remains balanced across all. Observing which one arises first in daily life is the practice.'
                    : '마음 패턴이 처음과 마찬가지로 균형 있게 나타나고 있습니다. 일상에서 어느 마음이 먼저 일어나는지 관찰하는 것이 실천입니다.'
                } else if (firstDominantKey !== nowDominantKey) {
                  mindMsg = isEn
                    ? `The dominant mind shifted from ${firstLabel} to ${nowLabel}. ${mindDetail}This shift itself is a sign of change.`
                    : `주된 마음이 ${firstLabel}에서 ${nowLabel}으로 변화했습니다. ${mindDetail}이 변화 자체가 움직임의 신호입니다.`
                } else {
                  mindMsg = isEn
                    ? `The dominant mind remains ${nowLabel}. ${mindDetail}Continuing to observe this mind is the practice.`
                    : `주된 마음이 여전히 ${nowLabel}입니다. ${mindDetail}이 마음을 계속 바라보는 것이 실천입니다.`
                }
                msgs.push(mindMsg)

                return msgs
              }
                

              return (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                    {isEn ? '12-Week Change: Before & After' : '12주 여정 전후 변화'}
                  </p>

                  {/* 축별 비교 */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-5">
                    {axes.map(ax => {
                      const before = fs[ax.key] ?? 1
                      const after = scores[ax.key] ?? 1
                      const diff = before - after
                      return (
                        <div key={ax.key}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-stone-600">{ax.label}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              diff > 0 ? 'bg-teal-50 text-teal-600' :
                              diff < 0 ? 'bg-red-50 text-red-400' :
                              'bg-stone-50 text-stone-400'
                            }`}>
                              {diff > 0 ? `▼ ${diff} ${isEn ? 'improved' : '개선'}` :
                               diff < 0 ? `▲ ${Math.abs(diff)} ${isEn ? 'increased' : '증가'}` :
                               (isEn ? '─ unchanged' : '─ 변화없음')}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-300 w-8 flex-shrink-0">{isEn ? 'Start' : '처음'}</span>
                              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full opacity-40" style={{ width: `${Math.round((before/4)*100)}%`, background: ax.colors[before-1] }} />
                              </div>
                              <span className="text-xs text-stone-400 w-16 text-right flex-shrink-0">{ax.labels[before-1]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-stone-600 w-8 flex-shrink-0">{isEn ? 'Now' : '지금'}</span>
                              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.round((after/4)*100)}%`, background: ax.colors[after-1] }} />
                              </div>
                              <span className="text-xs font-medium w-16 text-right flex-shrink-0" style={{ color: ax.colors[after-1] }}>{ax.labels[after-1]}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* 마음 패턴 비교 */}
                    <div className="pt-3 border-t border-stone-100">
                      <p className="text-xs font-medium text-stone-600 mb-3">{isEn ? 'Mind Pattern' : '마음 패턴'}</p>
                      {mindKeys.map(k => {
                        const before = fs[k] ?? 1
                        const after = scores[k] ?? 1
                        const diff = before - after
                        return (
                          <div key={k} className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-stone-400 w-10 flex-shrink-0">{mindLabelMap[k]}</span>
                            <div className="flex-1 flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full opacity-40" style={{ width: `${Math.round((before/4)*100)}%`, background: mindColors[k] }} />
                              </div>
                              <span className="text-xs text-stone-300 w-3 text-center">→</span>
                              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.round((after/4)*100)}%`, background: mindColors[k] }} />
                              </div>
                            </div>
                            <span className={`text-xs font-medium w-8 text-right flex-shrink-0 ${diff > 0 ? 'text-teal-600' : diff < 0 ? 'text-red-400' : 'text-stone-300'}`}>
                              {diff > 0 ? `▼${diff}` : diff < 0 ? `▲${Math.abs(diff)}` : '─'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 변화 분석 메시지 */}
                  <div className="space-y-2">
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                      {isEn ? 'Analysis' : '변화 분석'}
                    </p>
                    {getChangeMsg().map((msg, i) => (
                      <div key={i} className="bg-white rounded-xl border border-stone-100 p-4">
                        <p className="text-sm text-stone-700 leading-relaxed">{msg}</p>
                      </div>
                    ))}
                  </div>

                  {/* 마무리 메시지 */}
                  <div className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-5 border border-pink-100">
                    <p className="text-xs text-stone-400 mb-2">{isEn ? '12-Week Journey' : '12주 여정을 마치며'}</p>
                    <p className="text-sm text-stone-700 leading-relaxed" style={{ fontFamily: 'var(--font-gowun)' }}>
                      {isEn
                        ? 'The fact that you have arrived here means the seed of awareness has already sprouted. Whatever the numbers show, the practice of looking within is itself the journey.'
                        : '여기까지 도착했다는 것 자체가, 알아차림의 씨앗이 이미 싹을 틔웠다는 증거입니다. 숫자가 무엇을 보여주든, 내 안을 바라보는 실천 자체가 이미 여정입니다.'}
                    </p>
                  </div>
                </div>
              )
            })()}
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="flex-1 py-2.5 rounded-xl text-sm border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all">
                {isEn ? 'Check Again' : '다시 살펴보기'}
              </button>
              <button
                onClick={async () => {
                  if (checkPoint === 'end') {
                    await supabase.from('session_records').delete().eq('user_id', userId)
                    await supabase.from('awareness_check').delete().eq('user_id', userId)
                    await supabase.from('user_goals').update({ addiction_goal: '' }).eq('user_id', userId)
                    await new Promise(resolve => setTimeout(resolve, 500))
                  }
                  router.push('/dashboard')
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #e673a8, #d94f88)' }}>
                {isEn ? 'Go to Dashboard' : '대시보드로 →'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}