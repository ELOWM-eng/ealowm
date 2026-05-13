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
    axis: '축 1 · 빈도와 조건(무상관)',
    text: '자신의 습관화된 중독 행동이 일어나는 빈도는 어느 정도인가요?',
    axis_key: 'freq',
    opts: [
      { text: '일주일에 1~2번, 특정 상황에서만 일어난다', score: 1 },
      { text: '거의 매일, 어느 정도 패턴이 있다', score: 2 },
      { text: '매일, 여러 가지 다른 상황에서 반복된다', score: 3 },
      { text: '기분이나 상황에 관계없이 거의 항상 일어난다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 하기 전, "아, 뭔가 부족해", "충분하지 않다"는 생각 때문에 마음이 조급해지나요?',
    axis_key: 'tan',
    opts: [
      { text: '거의 없다. 지금 상태로도 충분히 괜찮다', score: 1 },
      { text: '가끔, 중독 행동을 하고 싶은 마음이 든다', score: 2 },
      { text: '자주, "하고 싶다"는 생각에 사로잡혀 다른 일에 집중하기 어렵다', score: 3 },
      { text: '항상, 중독 행동을 하지 않으면 허전에서 견딜 수 없다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 못 하거나 멈출 때, 즐거움을 뺏기는 것 같아 불안한가요?',
    axis_key: 'jip',
    opts: [
      { text: '거의 없다. 언제든 멈출 수 있다', score: 1 },
      { text: '아주 잠깐 아쉽거나 허전한 기분이 든다', score: 2 },
      { text: '자주, 그 대상 없이는 하루가 제대로 안 돌아갈 것 같아 불안하다', score: 3 },
      { text: '항상, 그것이 없으면 심한 불편이나 공허함을 느낀다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 못 하게 방해하거나 상황이 안 도와줄 때, 분노와 짜증을 참기 어려운가요?',
    axis_key: 'hwa',
    opts: [
      { text: '거의 없다. "그럴 수도 있지"하고 유연하게 넘긴다', score: 1 },
      { text: '순간적으로 툴툴거리거나 기분이 조금 상한다', score: 2 },
      { text: '자주, 내 즐거움을 방해하는 사람이나 상황에 강한 짜증이나 분노가 일어난다', score: 3 },
      { text: '항상, 강한 분노가 생겨 감정 조절이 안 된다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동이 자신에게 좋지 않다는 것을 알면서도 멈추기 어렵나요?',
    axis_key: 'mi',
    opts: [
      { text: '거의 없다. 내가 왜 하는지 알고 스스로 잘 조절한다', score: 1 },
      { text: '가끔, "딱 한번만 더 하자"며 스스로 타협한다', score: 2 },
      { text: '자주, 후회할 걸 알면서도 의지가 마음대로 안 된다', score: 3 },
      { text: '항상, 왜 하는지도 모르면서 무의식적으로 반복된다', score: 4 },
    ]
  },
   {
    axis: '축 3 · 영향 범위(자비관)',
    text: '습관화된 중독 행동이 나 자신과 주변 사람들에게 부정적인 영향을 주나요?',
    axis_key: 'impact',
    opts: [
      { text: '나 자신에게만 영향을 주고, 타인에게는 거의 영향이 없다', score: 1 },
      { text: '간접적으로 주변에 영향을 줄 수 있다', score: 2 },
      { text: '주변 사람들이 내 행동에 대해 느끼고 있다', score: 3 },
      { text: '관계나 일상에 분명한 영향을 미치고 있다', score: 4 },
    ]
  },
  {
    axis: '축 4 · 알아차림 수준(생멸관)',
    text: '습관화된 중독 행동이 일어날 때, 언제 알아차리게 되나요?',
    axis_key: 'aware',
    opts: [
      { text: '행동하기 전에 미리 알아차린다', score: 1 },
      { text: '행동을 시작할 때쯤 알아차린다', score: 2 },
      { text: '행동 중에 알아차린다', score: 3 },
      { text: '행동이 끝난 후에야 알아차린다', score: 4 },
    ]
  },
]

const Q_TEEN: Question[] = [
  {
    axis: '축 1 · 빈도와 조건(무상관)',
    text: '자신의 습관화된 중독 행동이 얼마나 자주 일어나나요?',
    axis_key: 'freq',
    opts: [
      { text: '일주일에 1~2번, 특별한 상황에서만 한다', score: 1 },
      { text: '거의 매일, 어느 정도 패턴이 생겼다', score: 2 },
      { text: '매일, 여러 상황에서 반복된다', score: 3 },
      { text: '기분이나 상황에 상관없이 거의 항상 한다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 하기 전, "더 하고 싶다"거나 "뭔가 심심하다"는 느낌이 드나요?',
    axis_key: 'tan',
    opts: [
      { text: '거의 없다. 안 해도 상관없고, 지금도 즐겁다', score: 1 },
      { text: '가끔, "심심한데 좀 해볼까?"하는 생각이 든다"', score: 2 },
      { text: '자주, 머리속에 그 생각뿐이라 공부나 달ㄴ 일이 손에 안 잡힌다', score: 3 },
      { text: '항상, 계속 그걸 하고 있지 않으면 인생이 재미없고, 허전하다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 못 하거나 멈출 때, 불안하거나 뭔가 잃은 느낌이 드나요?',
    axis_key: 'jip',
    opts: [
      { text: '거의 없다. 못 하게 되면 그냥 다른 거 하면 된다', score: 1 },
      { text: '조금 아쉽긴 하지만 금방 잊어버린다', score: 2 },
      { text: '자주, 그것 없이는 하루를 버티기 힘들 것 같아 자꾸 신경이 쓰인다', score: 3 },
      { text: '항상, 나의 일부가 떨어진 것 같고 없으면 너무 불안한 기분이 든다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동을 방해받거나 못 하게 될 때 짜증이나 화가 나나요?',
    axis_key: 'hwa',
    opts: [
      { text: '거의 없다. 받아들이고 기분 나쁘지 않게 멈춘다', score: 1 },
      { text: '순간적으로 조금 짜증이 나서 투덜거리게 된다', score: 2 },
      { text: '자주, 내 즐거움을 방해하는 상황이나 사람이 너무 밉고 화가 난다', score: 3 },
      { text: '항상, 건드리기만 해도 터질 것 같고 분노 조절이 안 된다', score: 4 },
    ]
  },
  {
    axis: '축 2 · 마음 패턴(세속관)',
    text: '습관화된 중독 행동이 좋지 않다는 걸 알면서도 자신도 모르게 이미 그걸 하고 있나요?',
    axis_key: 'mi',
    opts: [
      { text: '거의 없다. 내가 지금 무엇을 해야 할지 알고 스스로 멈출 수 있다', score: 1 },
      { text: '가끔, 알면서도 "5분만 더 해야지"라며 그냥 하게 된다', score: 2 },
      { text: '자주, 후회할 걸 알면서도 내 의지대로 멈추는게 너무 힘들다', score: 3 },
      { text: '항상, 왜 하는지도 모르면서 영혼 없이 반복된다', score: 4 },
    ]
  },
  {
    axis: '축 3 · 영향 범위(자비관)',
    text: '습관화된 중독 행동이 나 자신과 친구·가족에게 부정적인 영향을 주나요?',
    axis_key: 'impact',
    opts: [
      { text: '나 자신에게만 영향을 주고, 다른 사람에게는 거의 없다', score: 1 },
      { text: '간접적으로 주변에 영향을 줄 수 있다', score: 2 },
      { text: '친구나 가족이 내 변화에 대해 느끼고 있다', score: 3 },
      { text: '관계나 학교생활에 분명한 영향을 미치고 있다', score: 4 },
    ]
  },
  {
    axis: '축 4 · 알아차림 수준(생멸관)',
    text: '습관화된 중독 행동이 일어날 때, 언제 알아차리게 되나요?',
    axis_key: 'aware',
    opts: [
      { text: '행동하기 전에 미리 알아차린다', score: 1 },
      { text: '행동을 시작할 때쯤 알아차린다', score: 2 },
      { text: '행동 중에 알아차린다', score: 3 },
      { text: '행동이 끝난 후에야 알아차린다', score: 4 },
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
    : ['간헐적', '규칙적', '반복적', '자동적'][freq - 1]

  const awareLabel = isEn
    ? ['Aware before', 'Aware at start', 'Aware during', 'Aware after'][aware - 1]
    : ['행동 전 알아차림', '시작 시 알아차림', '행동 중 알아차림', '사후 알아차림'][aware - 1]

  const impactLabel = isEn
    ? ['Internal only', 'Indirect effect', 'Noticed by others', 'Affecting relationships'][impact - 1]
    : ['자기 내부', '간접적 영향', '주변에 표현됨', '관계에 영향'][impact - 1]

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
    '이미 알아차림의 씨앗이 깨어 있습니다.',
    '알아차림이 행동의 문턱에 있습니다. 한 발 더 앞으로 나아가고 있습니다.',
    '흐름 안에서 알아차리기 시작했습니다. 이 알아차림이 변화의 시작입니다.',
    '알아차림의 첫 씨앗이 필요한 자리입니다. 이 도구를 사용하는 것 자체가 첫 걸음입니다.',
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
    0: '"더 원하는 마음"이 이 습관을 주로 이끌고 있습니다. 조건이 바뀌면 이 마음도 변할 수 있습니다.',
    1: '"잃기 싫은 마음"이 이 습관을 붙들고 있습니다. 놓아두는 연습이 열쇠가 됩니다.',
    2: '"뜻대로 안 될 때 일어나는 마음"이 이 습관과 연결되어 있습니다. 알아차리는 것만으로도 한 걸음입니다.',
    3: '여러 마음이 균형 있게 나타나고 있습니다. 각각 다른 상황에서 일어납니다. 일상에서 어느 마음이 가장 자주 움직이는지 관찰하는 것이 실천입니다.',
    4: '탐냄과 집착이 함께 움직이고 있습니다. 더 원하는 마음과 잃기 싫은 마음이 동시에 작동합니다. 어느 마음이 먼저 일어나는지 알아차리는 것이 실천입니다.',
    5: '탐냄과 화냄이 함께 움직이고 있습니다. 더 원하는 마음과 방해받을 때 올라오는 저항이 연결되어 있습니다. 그 사이에 한 박자 멈추는 것이 시작입니다.',
    6: '집착과 화냄이 함께 움직이고 있습니다. 잃기 싫은 마음과 변화에 대한 저항이 연결되어 있습니다. 그 마음을 부드럽게 바라보는 것이 첫 걸음입니다.',
    7: '탐냄과 미혹이 함께 움직이고 있습니다. 왜 하는지도 모르면서 더 원하는 마음 — 이 자리에서 습관이 깊어집니다. 그것을 알아차리는 것만으로도 이미 깨어 있는 것입니다.',
    8: '집착과 미혹이 함께 움직이고 있습니다. 왜 붙들고 있는지도 모르면서 놓지 못하는 마음 — "무엇을 붙들고 있는가"를 부드럽게 물어보는 것이 시작입니다.',
    9: '화냄과 미혹이 함께 움직이고 있습니다. 왜 화가 나는지도 모르면서 올라오는 저항 — 그 순간을 알아차리는 것이 첫 걸음입니다.',
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
                {isEn
                  ? 'This result shows the starting point of your 12-week journey. Addiction is not a fixed part of you — it is a phenomenon formed by conditions. When conditions change, it can change too.'
                  : '이 결과는 12주 여정의 출발점을 보여줍니다. 중독은 고정된 나의 일부가 아니라, 조건에 따라 형성된 하나의 현상입니다. 조건이 바뀌면 변할 수 있습니다.'}
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

              const firstDominantKey = mindKeys.reduce((a, b) => (fs[b] ?? 0) > (fs[a] ?? 0) ? b : a)
              const nowDominantKey = mindKeys.reduce((a, b) => (scores[b] ?? 0) > (scores[a] ?? 0) ? b : a)

              // 변화 분석
              const awareChange = (fs['aware'] ?? 1) - (scores['aware'] ?? 1)
              const freqChange = (fs['freq'] ?? 1) - (scores['freq'] ?? 1)
              const impactChange = (fs['impact'] ?? 1) - (scores['impact'] ?? 1)

              const getChangeMsg = () => {
                const msgs = []
                if (awareChange > 0) msgs.push(isEn ? `Awareness improved by ${awareChange} level${awareChange > 1 ? 's' : ''} — noticing earlier than before.` : `알아차림이 ${awareChange}단계 빨라졌습니다. 이전보다 더 일찍 알아차리고 있습니다.`)
                else if (awareChange < 0) msgs.push(isEn ? `Awareness shifted later by ${Math.abs(awareChange)} level${Math.abs(awareChange) > 1 ? 's' : ''} — this is also information worth observing.` : `알아차림이 ${Math.abs(awareChange)}단계 늦어졌습니다. 이것도 바라볼 가치 있는 정보입니다.`)
                else msgs.push(isEn ? 'Awareness level remains the same — the practice of noticing continues.' : '알아차림 수준이 같습니다. 바라보는 실천이 이어지고 있습니다.')

                if (freqChange > 0) msgs.push(isEn ? `Frequency decreased by ${freqChange} level${freqChange > 1 ? 's' : ''} — the habit is occurring less often.` : `빈도가 ${freqChange}단계 줄었습니다. 습관이 덜 자주 일어나고 있습니다.`)
                else if (freqChange < 0) msgs.push(isEn ? `Frequency increased by ${Math.abs(freqChange)} level${Math.abs(freqChange) > 1 ? 's' : ''} — observing what conditions are behind this is the practice.` : `빈도가 ${Math.abs(freqChange)}단계 늘었습니다. 어떤 조건이 작용하는지 관찰하는 것이 실천입니다.`)
                else msgs.push(isEn ? 'Frequency is unchanged — notice what situations trigger it.' : '빈도는 변화 없습니다. 어떤 상황에서 일어나는지 알아차려 보세요.')

                if (firstDominantKey !== nowDominantKey) msgs.push(isEn
                  ? `The dominant mind pattern shifted from ${mindLabelMap[firstDominantKey]} to ${mindLabelMap[nowDominantKey]}. This shift itself is a sign of change.`
                  : `주된 마음 패턴이 ${mindLabelMap[firstDominantKey]}에서 ${mindLabelMap[nowDominantKey]}으로 변화했습니다. 이 변화 자체가 움직임의 신호입니다.`)
                else msgs.push(isEn
                  ? `The dominant mind pattern remains ${mindLabelMap[nowDominantKey]}. Continuing to observe this mind is the practice.`
                  : `주된 마음 패턴이 여전히 ${mindLabelMap[nowDominantKey]}입니다. 이 마음을 계속 바라보는 것이 실천입니다.`)

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