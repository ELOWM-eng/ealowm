import type { PracticeSession } from '@/types'

export const EN_SESSIONS: PracticeSession[] = [
  {
    id: 's1', num: 'Session 1', title: 'Formless', sub: 'Change & Liberation', type: 'gwan', week: 1,
    think: {
      q: 'Read each statement and mark the ones that apply to you.',
      inputType: 'yesno' as const,
      items: [
        'I believe that I can live for eternity.',
        'I think there are possessions that can last for eternity.',
        'I feel like I’m still the same person I was at the age of five.',
        'I still hold on to the concerns I had when I was about ten years old.',
        'I feel that my addiction is a fixed part of who I am, and that I can’t break free from it.',
        'I know that everything that lives in this world is in constant state of change.',
        'I know that everything I own will eventually change or disappear.',
        'I know that my emotions and thoughts are not always the same and are constantly changing.',
        'I know that my current situation and environment are not permanent.',
        'I know that an object I considered to have a fixed purpose can be used in many different ways.'
      ],
      note: 'We cherish life, refrain from taking what belongs to others, avoid wrong doings, practice right speech, and stay away from anything that clouds the mind.',
    },
    practice: {
      q: 'Note any changes in your health and emotions since yesterday.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Organize your thoughts about how you would like to change and grow.',
        'Write down concrete actions you are ready to take to begin your transformation.',
      ],
      declaration: '"We, in order to break free from habitual addictive behaviors that once felt eternal, must gain insight into the truth that all phenomena have no fixed essence, let go of the life of addiction, and move toward a life of wisdom."',
    },
  },
  {
    id: 's2', num: 'Session 2', title: 'Secular', sub: 'Affliction & Release', type: 'gwan', week: 2,
    think: {
      q: 'Read each question and write your answer about yourself.',
      inputType: 'text' as const,
      items: [
        'What habitual addictive behavior are you currently experiencing?',
        'How has your habitual addictive behavior affected you physically?',
        'How has your habitual addictive behavior affected you mentally?',
        'Has your habitual addictive behavior ever stirred up feelings of greed? If so, greed for what?',
        'Has your habitual addictive behavior ever triggered feelings of anger? If so, What kind?',
        'Has your habitual addictive behavior ever led you to engage in wrong actions?',
        'Has your habitual addictive behavior ever caused feelings of attachment? If so, to what?',
        'Has your habitual addictive behavior ever had a negative impact on others?',
        'When negative emotions arose, how did you respond or act?',
        'What practices can you begin in order to break free from your habitual addictive behavior?',
      ],
      note: 'We know that the habitual addictive behaviors rooted within us give rise to thoughts of Greed, Anger, Ignorance, and Attachment, and ultimately leave painful consequences in our lives.',
    },
    practice: {
      q: 'What effort did you make today to break free from your habitual addictive behavior? Describe the emotions you felt, the choices you made, and the outcomes you experienced in that moment.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Take a moment to identify and organize the feelings you experienced throughout the change.',
        'After this change, reflect on and organize the practices you wish to continue.',
      ],
      declaration: '"We know that the habitual addictive behaviors rooted within us give rise to thoughts of Greed, Anger, Ignorance, and Attachment, and ultimately leave painful consequences in our lives."',
    },
  },
  {
    id: 's3', num: 'Session 3', title: 'Compassion', sub: 'Acceptance & Warmth', type: 'gwan', week: 3,
    think: {
      q: 'Read each statement and mark the ones that apply to you.',
      inputType: 'yesno' as const,
      items: [
        'When uncomfortable emotions arise, I am able to stay with them and observe them with focused attention.',
        'I have a warm and kind mind toward myself.',
        'I can heal the parts of me that have been hurt.',
        'Even in hard times, I trust myself and have the strength to overcome them.',
        'If someone has been hurt because of my actions, I can acknowledge mt wrong actions and offer a sincere apology.',
        'I can respond with kindness and warmth to others in difficult times.',
        'I am able to empathize with the person who hurt me.',
        'I am able to help even the person who hurt me when they are going through difficulties.',
        'I understand that I am interconnected with those around me, and that we continually influence one another.',
        'I acknowledge that I cannot live alone and that I exist within a web of social relationships.',
      ],
      note: 'We recognize the suffering experienced by ourselves and others as a result of habitual addictive behaviors. In this process, we acknowledge our wrong actions and give rise to a compassionate intention to relieve that suffering.',
    },
    practice: {
      q: 'Write a message to yourself in appreciation for the effort you made today. If someone hurt you today, or if you caused hurt to someone else, take a moment to reflect on how you would like to respond if a similar situation arises again.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Take a moment to reflect on and organize what you feel grateful for, both about yourself and about others.',
        'Identify and organize specific actions you can take to express your gratitude.',
      ],
      declaration: '"We recognize the suffering experienced by ourselves and others as a result of habitual addictive behaviors. In this process, we acknowledge our wrong actions and give rise to a compassionate intention to relieve that suffering."',
    },
  },
  {
    id: 's4', num: 'Session 4', title: 'Generosity', sub: 'Sharing & Altruism', type: 'haeng', week: 4,
    think: {
      q: 'When you help others, which form of support feels most natural and comfortable for you to practice? Feel free to select and mark the □ that applies to you. (Multiple selections allowed)',
      inputType: 'select' as const,
      images: ['/bossi1.jpg', '/bossi2.png', '/bossi3.png'],
      items: [
        'Sharing your possessions, time, or talents with others',
        'Providing emotional support and a sense of safety to someone in emotional distress',
        'Sharing your wisdom and helping others to live in accordance with them',
      ],
      note: 'We let go the thoughts of Greed, Anger, Ignorance, and Attachment for the sake of ourselves and others, and through the wholehearted practice of voluntary giving with both body and mind, we walk a path that benefits both self and others.',
    },
    practice: {
      q: 'Even the smallest act counts. Take a moment to recall a time today when you offered help to someone. What kind of support did you give? Write it down below.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Reflect on a moment of giving that remains most vivid in your memory. What did you do, and why does it stand out to you.',
        'Take a moment to organize the ways you would like to help others in the future.',
      ],
      declaration: '"We let go the thoughts of Greed, Anger, Ignorance, and Attachment for the sake of ourselves and others, and through the wholehearted practice of voluntary giving with both body and mind, we walk a path that benefits both self and others."',
    },
  },
  {
    id: 's5', num: 'Session 5', title: 'Ethical Conduct', sub: 'Virtue & Moderation', type: 'haeng', week: 5,
    think: {
      q: 'What moral and ethical principles are you currently practicing? Feel free to select and mark the □ that applies to you. (Multiple selections allowed)',
      inputType: 'select' as const,
      images: ['/jigye1.png', '/jigye2.png', '/jigye3.png', '/jigye4.png', '/jigye5.png'],
      items: [
        'Cherishing all life',
        'Not taking what is not give',
        'Refraining from harmful action',
        'Practicing right speech',
        'Avoiding anything that clouds the mind',
      ],
      note: 'We cherish life, refrain from taking what belongs to others, avoid wrong doings, practice right speech, and stay away from anything that clouds the mind.',
    },
    practice: {
      q: 'Take a moment to reflect on your day. Record the moral and ethical principles you practiced today.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Organize your thoughts and identify the moral principle that is the most important to you.',
        'Organize and write down specific actions you can take to uphold the principles.',
      ],
      declaration: '"We cherish life, refrain from taking what belongs to others, avoid wrong doings, practice right speech, and stay away from anything that clouds the mind."',
    },
  },
  {
    id: 's6', num: 'Session 6', title: 'Forbearance', sub: 'Patience & Serenity', type: 'haeng', week: 6,
    think: {
      q: 'Among the following, select all that reflect the practice of Forbearance.',
      inputType: 'quiz' as const,
      wrongItems: [0, 4, 8, 12],
      items: [
        'Reacting with anger or resistance',
        'Trying to understand the person who made you upset',
        'Maintaining inner calm',
        'Staying composed even in unavoidable situations',
        'Avoiding or denying uncomfortable environments',
        'Accepting the fundamental truths of life',
        'Regulating emotions in the present moment',
        'Being less swayed by negative situations',
        'Merely suppressing emotions',
        'Cultivating an attitude of acceptance',
        'Accepting your own conditions and environment',
        'Holding a mind of forgiveness and compassion',
        'Complaining about or giving up on your situation',
        'A mind free from attachment to emotions and conditions',
        'Living without losing yourself in any situation',
        'Nurturing a compassionate and peaceful mind',
      ],
      note: 'We do not react with anger to negative interactions such as criticism from others; we do not cling to difficult circumstances such as illness or poverty; instead, we receive the truth with a clear mind and put it into practice.',
    },
    practice: {
      q: 'Did you experience any negative interactions or situations today? If so, reflect and write about what kind of thoughts or emotions arose within you, and how you responded to them.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Reflect and organize a moment when you had to endure or practice forbearance.',
        'What did you learn from that experience. Take a moment to reflect and organize your insights.',
      ],
      declaration: '"We do not react with anger to negative interactions such as criticism from others; we do not cling to difficult circumstances such as illness or poverty; instead, we receive the truth with a clear mind and put it into practice."',
    },
  },
  {
    id: 's7', num: 'Session 7', title: 'Four of Form', sub: 'Detachment & Impermanence', type: 'gwan', week: 7,
    think: {
      q: 'Take a moment to slowly observe the image. As you become aware of the process of arising, staying, changing, and disappearing, type along with the words.',
      inputType: 'typing' as const,
      typingGroups: [
        { label: 'Thought', stages: ['Arise', 'Stay', 'Change', 'Disappear'], image: '/sasang1.png' },
        { label: 'Person', stages: ['Arise', 'Stay', 'Change', 'Disappear'], image: '/sasang2.png' },
        { label: 'Object', stages: ['Arise', 'Stay', 'Change', 'Disappear'], image: '/sasang3.png' },
        { label: 'Nature', stages: ['Arise', 'Stay', 'Change', 'Disappear'], image: '/sasang4.png' },
      ],
      items: [],
      note: 'We gain insight through the truth that our body, mind, and all things in the world arise, stay, change, and disappear and through this insight, we let go of the mind of Greed and Attachment.',
    },
    practice: {
      q: 'Spend a day mindfully observing your emotions, bodily sensations, and the things you use. Record how each of them arises, stays, changes, and disappears.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'What has arisen, stayed, changed, and disappeared in your life? Organize your thoughts and write them down.',
        'What did you learn from this reflection? Organize your thoughts and write down the insights you gained.',
      ],
      declaration: '"We gain insight through the truth that our body, mind, and all things in the world arise, stay, change, and disappear and through this insight, we let go of the mind of Greed and Attachment."',
    },
  },
  {
    id: 's8', num: 'Session 8', title: 'Arising and Ceasing', sub: 'Mindfulness & Awareness', type: 'gwan', week: 8,
    think: {
      q: 'Focus on this present moment. Then, after 30 seconds, gently bring your attention to any changes that have occurred. Write down the thoughts and emotions that arose at each point in time.',
      inputType: 'timer' as const,
      items: [],
      note: 'We understand that our body and mind are within a flow of change, arising and ceasing in every moment, and we bring full attention to them, moment by moment.',
    },
    practice: {
      q: 'Take 3 minutes during your day to focus on your mind. Notice what thoughts and emotions arise and cease during that time, and write them down with awareness.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Reflect on your life and identify the emotion that appears most frequently. Organize your thoughts and write them down.',
        'Reflect on how that emotion has affected you. Analyze your thoughts and write down its impact on your life.',
      ],
      declaration: '"We understand that our body and mind are within a flow of change, arising and ceasing in every moment, and we bring full attention to them, moment by moment."',
    },
  },
  {
    id: 's9', num: 'Session 9', title: 'Infinite', sub: 'Trust & Limitlessness', type: 'gwan', week: 9,
    think: {
      q: 'Reflect on your strengths and choose the ones that apply to you. Check the □ next to each one.',
      inputType: 'checkbox' as const,
      items: [
        'I have someone by my side who can support me when I’m struggling.',
        'I act with sincerity, and my words and actions are consistent.',
        'I understand others’ emotions and needs and build good relationships.',
        'I come up with new ideas and solve problems creatively.',
        'I aim to live with energy and vitality.',
        'I cooperate and take responsibility for my group or community.',
        'I seek to learn what I don’t know and aim for deep understanding.',
        'I treat everyone fairly, without prejudice.',
        'I make thoughtful decisions based on life experience and insight.',
        'I guide others in a positive direction and work well with them.',
        'I choose to do what is right, even in the face of fear.',
        'I form deep connections and approach others with warmth.',
        'I can regulate my impulses, emotions, and actions.',
        'I stay committed to my goals, even in the face of difficulties.',
        'I show kindness and try to help others.',
        'I feel and express gratitude for what I receive.',
      ],
      note: 'We acknowledge that countless forms of suffering arise throughout life, and at the same time, we recognize that the capacity to break free from suffering is just as immeasurable.',
    },
    practice: {
      q: 'What emotions did you experience today, and in what situations did they arise? How did you respond to them? Write down the strengths you discovered through your responses.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Take a moment to reflect and organize your personal strengths. Write them down clearly.',
        'Identify the strengths you want to develop going forward, and write down specific actions you can take to cultivate them.',
      ],
      declaration: '"We acknowledge that countless forms of suffering arise throughout life, and at the same time, we recognize that the capacity to break free from suffering is just as immeasurable."',
    },
  },
  {
    id: 's10', num: 'Session 10', title: 'Diligence', sub: 'Effort & Growth', type: 'haeng', week: 10,
    think: {
      q: 'Reflect on what practices and efforts you are currently making for inner growth and a happy life. Check the □ next to the ones that apply to you. (Multiple selections allowed)',
      inputType: 'select' as const,
      images: ['/jinjin1.png', '/jinjin2.png', '/jinjin3.png', '/jinjin4.png', '/jinjin5.png', '/jinjin6.png'],
      items: [
        'The will to not fear obstacles.',
        'The practice of abandoning unwholesome thoughts and wrong actions that have already arisen.',
        'The practice of preventing unwholesome thoughts and wrong actions that have not yet arisen.',
        'The practice of newly giving rise to wholesome thoughts and right actions that have not yet arisen',
        'The practice of maintaining wholesome thoughts and right actions, and living in accordance with moral principles.',
        'The practice of sharing wisdom and compassion with others.',
      ],
      note: 'We let go of unwholesome thoughts and wrong actions, and through repeated and steady practice of wholesome thoughts and right actions, we do not cease our efforts until we reach inner maturity and true happiness.',
    },
    practice: {
      q: 'Reflect on your day and record the efforts and practices you made toward inner growth and true happiness.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Organize your thoughts about what a happy life means to you. What does it look like in your daily reality?',
        'Organize the practices you can continue in order to live a happier life moving forward.',
      ],
      declaration: '"We let go of unwholesome thoughts and wrong actions, and through repeated and steady practice of wholesome thoughts and right actions, we do not cease our efforts until we reach inner maturity and true happiness."',
    },
  },
  {
    id: 's11', num: 'Session 11', title: 'Concentration', sub: 'Focus & Stillness', type: 'haeng', week: 11,
    think: {
      q: 'Think about which method of concentration best suits your personality. Choose the one that feels comfortable and sustainable for you, and check the □ next to it. Your concentration type will be revealed.',
      inputType: 'mbti' as const,
      mbtiGroups: [
        { label: 'Introvert (I)', code: 'I', items: [
          'Sitting in a quiet place of my own without interruption',
          'Focusing on the feeling of breath coming in and going out for 3 minutes',
          'Observing the thoughts that arise and disappear in my mind',
          'Honestly writing how I feel during the day in a journal or memo',
        ]},
        { label: 'Extrovert (E)', code: 'E', items: [
          'Focusing on the movements of my body while walking or moving',
          'Feeling the sensation of my feet touching the ground, counting "one, two"',
          'Feeling positive energy in a practice group with others',
          'Feeling what I am saying and what my voice is like during conversation',
        ]},
        { label: 'Sensing (S)', code: 'S', items: [
          'Focusing on the feeling of the present moment while eating',
          'Observing the sounds, air, and smells around me as they are',
          'Finding the hot or stuffy signals my body sends when I am angry',
          'Calming my mind by focusing on music or scents I like when stressed',
        ]},
        { label: 'Intuition (N)', code: 'N', items: [
          'Observing how my emotions change throughout the day',
          'Closing my eyes and imagining the most comfortable place or scene for me',
          'Thinking of complex thoughts that pop up as "just passing clouds"',
          'Picturing in my mind the people I care about becoming happy',
        ]},
        { label: 'Thinking (T)', code: 'T', items: [
          'Recording how my current mood influences my actions',
          'Sorting out the difference between habitual addictive actions and intentional actions',
          'Recording how my mind changed throughout the day as my own data',
          'Practicing understanding and becoming aware of how the mind works',
        ]},
        { label: 'Feeling (F)', code: 'F', items: [
          'Warmly accepting all the emotions I felt during the day without judgment',
          'Writing or drawing the emotions I felt during the day',
          'Creating one sentence of praise for myself and saying it to myself',
          'Gently sharing the good energy I felt with the people around me',
        ]},
        { label: 'Judging (J)', code: 'J', items: [
          'Setting aside just 10 minutes a day, at the same time every day, to take care of myself',
          'Following a meditation app or program with a set sequence step by step',
          'Writing a mind journal to organize my mind for the day',
          'Building the strength of the mind through the sense of stability felt in a regular routine',
        ]},
        { label: 'Perceiving (P)', code: 'P', items: [
          'Choosing the mind practice I want to do that day according to my mood, without following a format',
          'Immediately noticing the state of my mind when I suddenly feel bad',
          'Immediately noticing the changes that occur in every moment',
          'Freely practicing by treating every moment of daily life as an opportunity for care',
        ]},
      ],
      items: [],
      note: 'We do not lose our center in any situation, place, or condition. We remain continually awake, focusing and observing with awareness of our body and mind in each and every moment.',
    },
    practice: {
      q: 'Practice one method of concentration for a day. Then, reflect on and write down any emotions or shifts you noticed in your mind during the process.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Look back and organize the changes you have gone through during the past week.',
        'Reflect on and organize the emotions or flow of your mind that you experienced while practicing concentration.',
        'Reflect on and organize the mind concentration practices you wish to explore moving forward.',
      ],
      declaration: '"We do not lose our center in any situation, place, or condition. We remain continually awake, focusing and observing with awareness of our body and mind in each and every moment."',
    },
  },
  {
    id: 's12', num: 'Session 12', title: 'Wisdom', sub: 'Insight & Awakening', type: 'haeng', week: 12,
    think: {
      q: 'Reflect on your past practices and review the key insights.',
      inputType: 'readonly' as const,
      items: [
        'Change & Liberation\nWe, in order to break free from habitual addictive behaviors that once felt eternal, must gain insight into the truth that all phenomena have no fixed essence, let go of the life of addiction, and move toward a life of wisdom.',
        'Affliction & Release\nWe know that the habitual addictive behaviors rooted within us give rise to thoughts of Greed, Anger, Ignorance, and Attachment, and ultimately leave painful consequences in our lives.',
        'Acceptance & Warmth\nWe recognize the suffering experienced by ourselves and others as a result of habitual addictive behaviors. In this process, we acknowledge our wrong actions and give rise to a compassionate intention to relieve that suffering.',
        'Sharing & Altruism\nWe let go the thoughts of Greed, Anger, Ignorance, and Attachment for the sake of ourselves and others, and through the wholehearted practice of voluntary giving with both body and mind, we walk a path that benefits both self and others.',
        'Virtue & Moderation\nWe cherish life, refrain from taking what belongs to others, avoid wrong doings, practice right speech, and stay away from anything that clouds the mind.',
        'Patience & Serenity\nWe do not react with anger to negative interactions such as criticism from others; we do not cling to difficult circumstances such as illness or poverty; instead, we receive the truth with a clear mind and put it into practice.',
        'Detachment & Impermanence\nWe gain insight through the truth that our body, mind, and all things in the world arise, stay, change, and disappear and through this insight, we let go of the mind of Greed and Attachment.',
        'Mindfulness & Awareness\nWe understand that our body and mind are within a flow of change, arising and ceasing in every moment, and we bring full attention to them, moment by moment.',
        'Trust & Limitlessness\nWe acknowledge that countless forms of suffering arise throughout life, and at the same time, we recognize that the capacity to break free from suffering is just as immeasurable.',
        'Effort & Growth\nWe let go of unwholesome thoughts and wrong actions, and through repeated and steady practice of wholesome thoughts and right actions, we do not cease our efforts until we reach inner maturity and true happiness.',
        'Focus & Stillness\nWe do not lose our center in any situation, place, or condition. We remain continually awake, focusing and observing with awareness of our body and mind in each and every moment.',
      ],
      note: 'We discover the seed of wisdom that was hidden beneath the shadows of our inner mind through these stages of practice, nurture its sprouting and growth, and, in time, allow it to fully blossom into a lotus of compassion.',
    },
    practice: {
      q: 'Was there a moment today when you became aware of a habitual addictive behavior? Reflect on that moment and gently describe what emotion arose, what choice you made in response, and what insight or learning you gained from the experience.',
      placeholder: '',
    },
    reflect: {
      qs: [
        'Through this practice, what kind of aspects of yourself did you discover?',
        'What did you learn from this journey, and what kind of mind did you cultivate?',
        'From now on, please systematically organize your thoughts on how this practice connects with your life.',
      ],
      declaration: '"We discover the seed of wisdom that was hidden beneath the shadows of our inner mind through these stages of practice, nurture its sprouting and growth, and, in time, allow it to fully blossom into a lotus of compassion."',
    },
  },
]

export const EN_SESSIONS_BY_WEEK = EN_SESSIONS.reduce((acc, s) => {
  if (!acc[s.week]) acc[s.week] = []
  acc[s.week].push(s)
  return acc
}, {} as Record<number, PracticeSession[]>)