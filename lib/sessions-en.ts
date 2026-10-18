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
      note: 'What is The Formless.\n\nThe Formless is the recognition that everything in this world, ourselves, others, materials, things, and emotions, is not fixed or permanent, but constantly changing. In other words, it is the insight that all phenomena are in a state of continuous flux, and that nothing remains the same forever.\n\nFor example, we may have noticed that our physical condition today feels different from yesterday. Or perhaps we felt anxious an hour ago, but now we feel at ease, This is evidence that our emotions are constantly changing. This is the practice of The Formless. Noticing that the plant we are caring for looks slightly different today compared to yesterday is another way of acknowledging The Formless. Such changes can be discovered throughout our daily lives.\n\nAll of our sensory and mental experiences, What we see, hear, smell, taste, touch, and think, are in a constant state of fluctuation. There is no fixed sensation or eternal thought. Every experience arises, fades away, and reappears in new forms. Understanding that nothing is fixed and that all things possess the nature of change is the essence of The Formless.\n\nAnother example is the object we call a cup. Even this seemingly simple item does not possess a fixed meaning of function. One person may use it for coffee, another for water, and yet another as a small flower pot.\n\nIts meaning shifts depending on how it is used, and its identity is not fixed. Recognizing that even the existence of objects is shaped by ever-changing relationships is the wisdom of The Formless.\n\nWhat habitual addictive behavior are you currently experiencing. How does this behavior affect you.\n\nAddiction may appear to be a fixed habit. In the cycle of repetitive behaviors and automatic reactions, it can feel as though change is impossible. However, through the insight of The Formless, we can begin to see that even addiction is not permanent. The moment we become aware of the flow of addiction, and even pause it for single instant, is the moment the door to change begins to open. Addiction is not a fixed part of the self, but a phenomenon that arises and adapts according to conditions. To understand that a life shaped by addiction can change, is the beginning of transformation grounded in The Formless.',
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
      declaration: 'We must break free from habitual addictive behaviors that once felt eternal by understanding that all phenomena have no fixed essence. Let go of the life of addiction and move toward a life of wisdom.',
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
      note: 'What is The Secular.\n\nThe Secular is the recognition that certain mental states, like greed, anger, ignorance, and attachment, ultimately lead to suffering and undesirable outcomes. Greed refers to the excessive desire to possess more than one needs, or the wish to take what belongs to others. It is a craving for what one does not yet have, or maybe never will. Anger arises when things do not go as we wish. It includes feelings of hostility, resentment, and the urge to harm others. Ignorance is the inability to see things as they truly are, and the tendency to believe in distorted and false views. Attachment is the desire to hold on to certain people, objects, or states once we have obtained them. It is the unwillingness to let go of what we already have. These negative mental states cause suffering in daily life. They often lead to inner turmoil, conflicts with others, and long-lasting regret.\n\nFor example, imagine someone who enjoys watching videos on their smart phone and suppose there is an important task they must complete today. If someone says, “Why not stop watching and take care of the task first?”, how might they respond? If they did not let the chains of addiction distract them, and if they choose to stop watching and focus on the task, they will likely be able to complete it successfully.\n\nHowever, if they feel irritated or angry in response, that reaction is an expression of anger. At the same time, their reluctance to stop watching reflects attachment to the video. If the emotions of anger and attachment grow stronger, the person might say something hurtful to the other individual, or the situation may even escalate into a conflict.\n\nLet’s consider another example. There is someone who has a habit of drinking alcohol in almost every situation, whether they are feeling good or bad, whether things are going well or not. One day, this person ends up drinking with someone they never really liked. As the alcohol takes effect, unpleasant memories resurface, and a feeling of anger begins to rise.\n\nAs a result, they become overly sensitive to minor comments or actions from others, leading to an argument and causing emotional harm. Had they not been drinking that day, would such anger and conflict have occurred? The likelihood would have been much lower. This exhibits how habitual addictive behavior stimulates greed, anger, ignorance, and attachment. It drives us to cling to specific emotions or objects. Eventually this leads to unskillful words and actions, and brings about suffering as a result.\n\nWhat is the state of your mind in this present moment. Are you being swayed by greed, anger, ignorance, or attachment.\n\nThe Secular is the eye of insight that recognizes the movements and consequences of negative mental states stemming from habitual addictive behaviors. Through the practice of continuous awareness and not being swayed by emotions, we can cultivate a wiser and more peaceful life.',
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
      declaration: 'We know that the habitual addictive behaviors rooted within us give rise to thoughts of Greed, Anger, Ignorance, and Attachment. These ultimately bring suffering into our lives.',
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
      note: 'What is The Compassion.\n\nThe Compassion is the cultivation of a mind that seeks to understand and heal from our own negative emotions and actions. It is also an attitude of mind that ponders even the words and actions of those who have caused us pain with compassion, and strives to understand the roots of their suffering as well. We cannot live in this world alone. We live within a web of relationships with family, friends, colleagues, and supervisors. In these relationships, our words and actions affect others, just as theirs affect us. The Compassion is the practice of recognizing the suffering that arises within these interactions, and nurturing a sincere wish to relieve that suffering for both ourselves and others.\n\nFor example, imagine someone becomes irritated or angry when told, “Why don’t you stop looking at your phone?”. That emotion is not just a fleeting feeling, it can have a real impact on the person’s body and mind. Their blood pressure may rise, a sense of tightness might occur in the chest, and these negative emotions could be verbalized through hurtful words directed at others.\n\nIn these moments, The Compassion begins by acknowledging the fact that one has felt such emotions and acted in certain ways. Acknowledgment is not about blaming ourselves, it is the starting point for moving in a healthier direction. This compassion is not in a self-critical way, but a willingness to understand and support ourselves in order to deduce suffering.\n\nOnce this recognition has occurred, the next step is the practice of restoration. Because we have come to understand that our actions and emotions may have negatively affected both ourselves and others, we are now called to make a conscious effort to move in a better direction. In this process, sometimes what is needed is an apology from the mind; other times, a tangible act of amends. These amends can be a kind word, a small gesture of care, or sincere attention to the well-being of another. The Compassion is the mindful practice of breaking the cycle of suffering and restoring harmony within our relationships.\n\nOn the other hand, there may be times when someone directs anger or hurtful words at us, even though we acted with good intentions and did nothing wrong.\n\nHow can we respond in such a moment? Should we react with anger in return? Or can we try to understand the suffering that lies beneath their emotions? We might begin by asking ourselves the following questions:\n\nWhat might have caused them to react that way? Could it be that they, too, are carrying a wounded mind, similar to me?\n\nSuch questions help us to understand the imperfections of others, and from that understanding arises compassion, a heartfelt wish to feel and share their suffering. What truly matters is that how we respond to the words and actions of others is ultimately our own choice. We can choose to react with anger, or we can choose to respond with compassion. The Compassion offers us a path at the moment of choice, a way to help both ourselves and others be free from suffering.',
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
      declaration: 'We recognize the suffering that we and others experience as a result of habitual addictive behaviors. In this process, we acknowledge our wrong actions and give rise to a compassionate intention to relieve that suffering.',
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
      note: 'What is The Generosity.\n\nThe Generosity is the practice of compassion that benefits both ourselves and others. It is a path of spiritual cultivation that involves letting go of greed and attachment. In our daily lives, we may knowingly or unknowingly, influence others in positive ways, but at times we may also cause harm through our words or actions in the same way. Likewise, we ourselves can be wounded by the words or actions of others. In this web of relationships, what kind of practice can we undertake? It is through The Generosity that we can embody a compassionate mind through concrete action.\n\nThe Generosity can be exhibited through giving. There are three types of giving.\n\nThe first is giving through material means. This is the most familiar form of generosity, sharing what we have, such as possessions, time, or skills, with others. Examples include donating goods or money to those affected by natural disasters or accidents, helping someone carry heavy bags, or offering to drive for someone with physical difficulties. When practicing The Generosity in this way, it is important not to hold feelings of reluctance or attachment toward what we are giving. Only when we give freely, without expecting anything in return and without clinging, does The Generosity become a powerful practice for reducing greed and attachment.\n\nThe second type of giving is aiding in the removal of fear. This refers to acts that offer emotional support and a sense of safety to those experiencing psychological or emotional distress. Examples include listening to someone who is struggling and offering them words of comfort, participating in activities that protect marginalized groups, volunteering in hospice care, or providing counseling and support foe individuals facing suicidal crises or recovering from violence. Giving is not merely a matter of words or actions, it is the compassionate practice of helping someone feel that they are no longer alone.\n\nThe third form of giving is sharing the truth and supporting others by sharing this wisdom. Truth refers to the insight that all phenomena are not fixed and have a forever malleable essence, and it points to a way of living grounded in wisdom. It is a guiding teaching that helps us navigate life with clarity. By practicing according to this truth, the path opens toward liberation from suffering and the realization of genuine happiness. Examples include helping someone in distress understand the truth and guiding them toward a more wholesome path, leading meditation sessions, teaching character development to youth, or facilitating recovery programs for those struggling with addiction. The Generosity in this form goes beyond the transmission of knowledge. It is a deep practice of compassion that helps others reflect on their lives and find release from suffering.\n\nUltimately, The Generosity is a practice that not only reduces our own greed and attachment, but also awakens compassion for both ourselves and others, leading to concrete acts of care and support. Through The Generosity, we can gradually let go of our inner clinging, and engage in actions that help others be free from suffering and difficulty. This is the path of giving, and the way compassion can be expressed through everyday life.',
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
      declaration: 'We let go of the thoughts of Greed, Anger, Ignorance, and Attachment for the benefit of ourselves and others. Through the wholehearted practice of voluntary giving with both body and mind, we walk a path that brings to both self and others.',
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
      note: 'What is The Ethical Conduct.\n\nThe Ethical Conduct refers to the practice of living according to moral and ethical principles that we should follow throughout our lives. These principles are not merely external constraints, but internal standards that guide our lives in the right direction and express compassion. From birth to death, we form relationships with many people, grow in various environments, hold jobs, and live within society. If we go through these stages of life without the guidance of moral and ethical principles, the consequences are likely to negatively affect not only ourselves, but also those around us.\n\nThere are five basic principles that we are fundamentally capable of following. These five principles are not simply prohibitions, but wise guidelines for living a peaceful and harmonious life.\n\nThe first principle is to cherish, love, and protect all living beings without causing harm. This is not merely a commandment of “Do not kill,” but a call to cultivate a mind of compassion and protection toward all forms of life. It includes not only human beings, but also animals, plants, and all other living beings. This principle also involves refraining from violent behavior toward others, as well as valuing our own life and  refraining from harming ourselves.\n\nThe second principle is to not take what is not given. This means refraining from desiring things that do not belong to us and avoiding the pursuit of unjust gain or achievements. It includes avoidance of actions such as stealing others’ possessions, taking credit for others’ work, or gaining benefits through dishonest means. Restraint from greed and the ability to be content with what one has are at the mind of practicing The Ethical Conduct.\n\nThe third principle is not to engage in actions that cause harm to others. Such harmful actions often arise from unwholesome states of mind, such as greed, anger, ignorance, or attachment, and they can result in both physical and mental harm to others. Examples include a person in a committed relationship engaging in inappropriate relations with others, forcing someone into a relationship against their will, obsessively clinging to someone, or causing them physical or mental injury. This principle is not merely about external behavior, it is also a practice of clearly observing the state of our mind and regulating our actions accordingly.\n\nThe fourth principle concerns the use of speech: to speak truthfully and to avoid harmful language. Through words, we can offer comfort, but we can also inflict deep wounds. Speech that blames others, uses abusive language, tells lies, deceives, or creates division, can cause harm. In contrast, speech that is honest, warm, and altruistic has the power to nurture relationships and to heal the mind.\n\nThe fifth principle is to avoid anything that clouds a clear and healthy mind. This includes not only addiction to substances such as alcohol and drugs, but also behavioral addictions such as gambling, gaming, excessive use of social media, and unhealthy attachment to relationships. Such behaviors cloud our discernment, interfere with right judgment and awareness, and lead to suffering for both ourselves and others. Maintaining mental clarity forms the essential foundation for living a wise and mindful life.\n\nAs we go through life, it is natural for anyone to make mistakes. What truly matters, however, is the ability to reflect on ourselves after making a mistake and to renew our intention not to repeat it.\n\nThe Ethical Conduct is a form of wisdom that helps us establish principles for our own lives, put those principles into practice, and build healthy relationships with others. When we lead our lives with wisdom, our lives can become stable and filled with trust. Within that trust, we can cultivate peace and true happiness.',
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
      declaration: 'We vow to cherish life. We vow to refrain from taking what belongs to others. We vow to avoid wrong doings. We vow to practice honest speech. We vow to keep our minds clear and unclouded.',
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
      note: 'hat is The Forbearance.\n\nThe Forbearance refers to the practical attitude of maintaining inner calm without being swept away by emotions in the midst of negative interactions or environments. It goes further to include understanding and working to transform such situations. It is not merely about suppressing or enduring suffering, but rather about training the mind and practicing compassion even while experiencing pain and hardship. Everyone has experienced moments of being criticized or placed in unfair situations. At time, we may face despair due to illness, poverty, lack of achievement, or failure. In these negative conditions, we often feel the urge to become angry or to rebel. However, when we react immediately to such emotions, we lose our inner balance and fall deeper into suffering.\n\nThe Forbearance is the strengthening of the mind to regulate emotions, maintain inner stillness, and protect ourselves at the very moment when negative relationships or situations arise. It is not mere emotional suppression, but a practice of seeing harmful actions as arising from the ignorance of others, their inability to see life clearly, and responding with understanding, forgiveness, and compassion. Rather than hating others, The Forbearance begins with the awareness that they, too, may be suffering in their own way.\n\nFurthermore, The Forbearance is not limited to interpersonal conflicts; it is also the patient acceptance of the conditions and circumstances in which one lives. Life does not always go the way we wish. External factors, such as weather, health, financial conditions, social status, and the gap between effort and outcome, often change beyond our control, and sometimes these changes test us. It is natural to feel discouraged or want to give up when facing difficult circumstances in life. The Forbearance is the practice of calming the mind even in the face of unavoidable situations, and cultivating an attitude of acceptance rather than complaint or resentment.\n\nWe are not always happy, nor are we always unhappy. Looking back on our lives, we can find moments of joy and gratitude, as well as times of sorrow and suffering. Life exists within a constant flow of change. Therefore, we cannot always turn our reality into something only good. What matters most is developing the inner strength to stay grounded and not lose ourselves, no matter what the circumstances may be.\n\nThe Forbearance is also a practice of accepting true reality. It involves recognizing the truth of impermanence, that everything constantly changes, and understanding that greed, anger, ignorance, and attachment ultimately lead to suffering. The Forbearance is, at its core, the attitude of willingly letting go of greed, anger, ignorance, and attachment.\n\nUltimately, The Forbearance is the path of forgiving those who cause us harm, accepting the conditions we cannot change, and living in accordance with true principles. Through this practice, we become less affected by negative situations and develop a mind that is free from emotional turmoil and external conditions. It is also the foundation for a compassionate and peaceful life.',
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
    id: 's7', num: 'Session 7', title: 'Four stages of Form', sub: 'Detachment & Impermanence', type: 'gwan', week: 7,
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
      note: 'What is The Four stages of  Form.\n\nThe Four stages of  Form refers to a deep awareness that all things, without exception, arise, stay, change, and eventually disappear. This is not just a theoretical concept, but a direct insight into the reality that nothing remains as it is forever. To arise means that something which did not exist before has now come into being. To stay means that what has arisen remains in its state for a while. However, this staying is not a state of eternal stillness, it naturally leads to change. And finally, all things inevitably disappear. These four phases, arising, staying, changing, and disappearing, are the shared flow that all conditioned things undergo.\n\nFor example, imagine that a memory of a meeting with a friend suddenly comes to mind. In that moment, a thought arises. Then, for a while, our mind stays with that thought, perhaps thinking about what we will do together. But the thought does not last long. It soon changes into another thought, and eventually, the original thought disappears. In this way, our mind, emotions, and thoughts are constantly repeating the cycle of arising, staying, changing, and disappearing. Our bodies also follow this same flow. We are born, we grow, and for a period of time, we stay in a relatively healthy state. However, as we age, our bodies gradually change, and eventually, we fall ill or weaken, reaching the stage of disappearance known as death.\n\nThis four-phase process applies not only to human life, but also to animals, plants, and even objects and social relationships. Think of a toy we cherished as a child. That toy once arose, it came into existence one day. For a while, it stayed as it was, in its original form. But over time, it began to change. Perhaps it broke, or its color faded. Eventually, we stopped using it, and it disappeared from our daily life.\n\nIn the same way, everything that comes into being may appear to stay unchanged for a time, but in reality, it is always changing, and ultimately, it will disappear. What about our emotions? Most of us can recall a time in the past when we felt strong greed or attachment toward something.\n\nDo you still hold on to attachment toward that object or experience, or has it already disappeared and faded away from your life?\n\nThe objects of our greed and attachment rarely last. Possessions, appearance, status, relationships, even our own bodies, do not remain fixed; they inevitably change and disappear. The Four stages of  Form is not just about knowing that all things arise, stay, change, and disappear. It offers wisdom for living a more beneficial and meaningful life based on that truth. Letting go of greed and attachment is the foundation of The Four stages of Form. It invites us to place our attention on the present moment and on our relationships with those around us.\n\nFrom this grounded awareness, we can focus on the good we are able to do gere and now. Everything will eventually disappear. That is why this moment is so precious. To recognize the truth of The Four stages of  Form through all things, states, and material conditions is the beginning of a path that benefits both ourselves and others.',
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
      note: 'What is The Arising and Ceasing.\n\nThe Arising and Ceasing refers to the mindful awareness of all phenomena constantly arising and ceasing in our everyday life. This understanding is rooted in what we have previously explored as The Four stages of  Form, the insight that all things go through the phases of arising, staying, changing, and disappearing. Through The Four stages of  Form, we have come to realize the truth that all objects, states, and material conditions in this world follow a certain process and eventually fade away. The Arising and Ceasing is the practical observation of that truth in the present. In other words, The Arising and Ceasing means paying close attention to the present moment, and clearly noticing every experience as it arises and ceases.\n\nFor example, imagine we are eating a meal. As the food enters our mouth, is chewed, and swallowed, it begins to cease. Alternatively, consider a fragrant smell. We notice it, and then it ceases. Sweat arises and ceases. Memories arise and cease. Joyful feelings arise and soon cease. All our actions exist within this flow of arising and ceasing. Everything we experience is part of this continuous pattern. Things arise for a moment and then cease. No emotion, thought, or sensation lasts forever. The Arising and Ceasing is a practice that helps us become aware of these constant changes and bring our attention back to the present moment.\n\nEven if only for a day, or during a set period of time, when we live with awareness of what arises and ceases, we can reflect more clearly on the thoughts we had, the actions we took, and the emotions we experienced during that time of mindful attention. By reflecting on our day in this way, we may naturally come to recognize the following:\n\nWhat action or thoughts had a positive impact on yourself or others.\n\nWhat action or words had a negative effect on yourself or others.\n\nWhat experiences brought you a sense of peace.\n\nWhat experiences left you feeling discomfort or unease.\n\nThis kind of awareness is a form of practice. It allows us to regulate our lives and guide ourselves in a better direction. When we fail to notice our experiences, we are unable to truly understand or transform them. However, when we live with conscious awareness moment by moment, we no longer react unconsciously or fall into the same patterns of suffering.\n\nThe Arising and Ceasing is not a practice limited to sitting still in silence. It is a way of living with self-awareness and mindfulness in everyday life. The essence of The Arising and Ceasing lies in the attitude of consistently observing our actions and thoughts, and making a sincere effort to guide ourselves in the right direction. We often place more attention on others, their emotions, reactions, and judgments, than on ourselves. Such a life keeps us from truly seeing who we are.\n\nThat is why The Arising and Ceasing is a practice of turning attention inward, not to others, but fully to ourselves. It is a practice that guides us to fully live this present moment by being aware of each thought, emotion, and movement that arises within us. Arising and ceasing occur continuously. But when we become aware of them, they are no longer just repetitive patterns, they become gateways to awareness. Through these gateways of awareness, we can move toward a more compassionate and conscious way of living.',
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
      note: 'What is The Infinite.\n\nThe Infinite is the practice of recognizing that within each of us exists an immeasurable and positive source of strength. Throughout life, we encounter many joyful experiences, but we also face countless forms of suffering. At times, the problems created by suffering may feel overwhelming in their size and complexity. However, The Infinite reminds us that our capacity to overcome suffering is just as boundless. An important insight of The Infinite is the recognition that, even when we face suffering or problems we cannot solve on our own, there are always social relationships and networks of support around us that can help us move through the pain. In other words, The Infinite is the recognition that we can always ask others for help, and that within us exists an infinite capacity for inner strength and resilience to overcome suffering. At the same time, an important aspect of The Infinite is the awareness that we, too, can be a source of strength for others. There are many people in the world who suffer for various reasons, and we can approach them with genuine care and compassion. This inner compassion and the willingness to connect with others through solidarity are both expressions of infinite potential. In life, unexpected suffering can arise at any time and in any place.\n\nHowever, by facing the nature of suffering directly, and by learning and practicing the Right Truths, we can cultivate the strength to overcome difficulties.\n\nThe Right Truths include: 1) Nothing in this world is fixed; everything is in constant change. 2) The mind states of greed, anger, ignorance, and attachment are the roots of suffering. 3) Within our minds, there exists a warm and compassionate nature that can benefit both ourselves and others. 4) All beings follow a flow of arising, staying, changing, and disappearing. 5) All phenomena are continuously arising and ceasing in each moment. As we learn, realize, and embody these truths, we begin to uncover the boundless wisdom and compassion that lie dormant within us.\n\nFrom the moment we are born, we grow within countless social relationships. It begins with our families, then expands to include friends and teachers at school, colleagues and supervisors at work, and members of clubs, local communities, and online networks. These relationships can sometimes be a source of pain.\n\nHowever, they also create a valuable network of support where we can ask for help, depend on others, and receive healing. Recognizing that there are many people around us who can offer help, and at the same time, realizing that we, too, can be a source of support for others, is the very expression of the boundless potential that exists within relationships, as taught by The Infinite. The Infinite is not merely about cultivating a vague sense of hope. It is a practice that speaks clearly to us, saying:\n\nSuffering may be endless but so is our strength to overcome it.\n\nProblems keep appearing but so do the people who can help us overcome them.\n\nWhen we deeply recognize and embody this truth in our lives, we begin to restore our stable sense of self and compassionate nature, allowing us to live with greater wisdom and inner freedom.',
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
      note: 'What is The Diligence.\n\nThe Diligence refers to the continuous and dedicated effort to abandon unwholesome thoughts and wrong actions, and to cultivate wholesome thoughts and right actions. It is the steady practice of transforming our boundless inner potential into reality through committed and mindful living.\n\nTo embody The Diligence in everyday life, we are invited to: 1) Learn and apply true teachings, while practicing generosity for the benefit of ourselves and others. 2) Keep moral and ethical principles through self-awareness and integrity. 3) Avoid being controlled by negative emotions or unpredictable circumstances. 4) Accept all things as they are, with clarity and openness. 5) Continually practice wholesome thoughts and right actions. 6) Regularly reflect on and focus the mind with conscious attention. Such an attitude is the very practice of The Diligence. Through it, we gradually move toward a life of wisdom, compassion, and true happiness.\n\nWhat matters most in The Diligence is steady and consistent practice. Wholesome thoughts and right actions are not cultivated overnight. It takes continual focus and conscious effort, until both body and mind become familiar with them, and until these wholesome qualities take root as a natural part of our daily lives. This is the path of staying centered and intentionally moving toward what is right.\n\nThe Diligence is built upon six core directions of practice.\n\nFirst, it is the will to not fear obstacles. This means moving forward with a steady and courageous mind, without being shaken by the difficulties and challenges that may arise while living a life of truth.\n\nSecond, it is the practice of abandoning unwholesome thoughts and wrong actions that have already arisen. This involves recognizing negative states of mind or actions in the present and making a sincere effort to reduce and let them go.\n\nThird, it is the practice of preventing unwholesome thoughts and wrong actions that have not yet arisen. This means adjusting our daily habits and environment to prevent the arising of negative emotions and thoughts, and to avoid engaging in wrong actions.\n\nFourth, it is the practice of maintaining wholesome thoughts and right actions, and living in accordance with moral principles. This includes sustaining positive mental states and living with integrity, consistently practicing moral principles in daily life.\n\nFifth, it is the practice of increasing wholesome thoughts and right actions. This means actively deepening and expanding the wholesome thoughts and right actions that are already present.\n\nSixth, it is the practice of sharing wisdom and compassion with others. Through this, we extend the insight and kindness gained through practice, offering benefits and happiness not only to ourselves but also to those around us.\n\nThe Diligence is not merely about working hard. It is a wise and intentional practice of discerning what to stop, what to guard against, what to uphold, and what to cultivate. At every moment, we have the power to choose what to say, how to respond, and which direction to take. The accumulation of these choices is what shapes a diligent life. The Diligence is an inner energy and ethical responsibility that continually purifies the self and contributes to the betterment of the world through daily practice. This path is not quick, but it leads to deep and lasting transformation.',
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
      note: 'What is The Concentration.\n\nThe Concentration refers to the practice of calming the mind through methods such as Seon(Zen, 禪), meditation, or mindfulness, focusing on a single object, and staying awake and attentive in the present moment. This practice helps to settle a mind that is easily swayed by external temptations or internal emotions, guiding it into a stable state of concentration. When we are able to focus on ourselves, the mind becomes calm and steady. A calm and steady mind becomes the foundation for taming greed, anger, anxiety, and distraction, and restoring balance and ease in life.\n\nThe Concentration is not limited to a single method as there are many ways to approach it. For example:\n\nFirst, focusing attention on a single object, such as the breath, sound, scent, physical sensations, or bodily feelings, to calm a scattered mind and remain fully present in the moment.\n\nSecond, observing the truth of The Formless, that nothing is fixed and all things are constantly changing, to gain insight into the nature of reality and to accept things just as they are.\n\nThird, sitting quietly at a designated time and place, allowing the mind to settle in stillness and clarity.\n\nFourth, remaining mindful of our words, actions, and emotions in everyday life, moment by moment.\n\nAlso, Focusing the mind can be practiced alone, with family or friends, or through participation in programs and community activities. There are many ways to return to ourselves in daily life, and with a clear intention, this practice can be done anytime, anywhere.\n\nStarting can feel difficult or unfamiliar for everyone, but if we gradually increase the time, 5 minutes, 10 minutes, then 15 minutes each day, to focus on ourselves, our body and mind will begin to adapt. Overtime, concentration becomes a natural part of daily life.\n\nWe don’t need to set a specific time and place. Whenever the moment arises, simply pause and bring our attention to our breath, sensations, or bodily movements, here and now, in the present moment. For example:\n\nFirst, noticing the process of eating food entering the mouth, being chewed, and swallowed.\n\nSecond, focusing deeply on the sounds coming through the ears while listening to music.\n\nThird, pausing a video to observe breath or eye movement without judgment.\n\nFourth, recognizing sensations or emotions arising from attentive awareness of actions and thoughts.\n\nAny time, any place, and any situation can become a field for practicing The Concentration. Regular practice of The Concentration nurtures inner calm and awareness. Through this practice, the mind becomes strong, less swayed by emotions, less entangled in thoughts, and more stable in the flow of life. The Concentration is not reserved for special people. Even a small, sincere effort to stay present, in the middle of a busy day, can guide life toward greater stillness and inner stability.',
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
      note: 'What is The Wisdom.\n\nThe Wisdom is a practice rooted in the previous 11 sessions, guiding us to clearly understand all of our experiences and to move forward with a wholesome mind and right actions. The 11 sessions journey, beginning with The Formless, The Secular, The Compassion, The Generosity, The Ethical Conduct, The Forbearance, The Four stages of  Form, The Arising and Ceasing, The Infinite, The Diligence, and The Concentration, has been a path of realizing that the emotions and circumstances we experience are not random, but arise from clear causes and effects.\n\nThroughout this journey, we have learned a fundamental truth: habitual addictive behaviors are deeply connected to the mind’s tendencies toward greed, anger, ignorance, and attachment. Together, we have walked the path of gradually releasing these negative tendencies. Now, in this final session, we are invited to embrace the wisdom that brings benefit to both ourselves and others. In truth, each of us carries the seed of wisdom within. Yet the hardships, suffering, and repeated wounds of life often cloud this seed, making us forget that it is there.\n\nHowever, through the practices in all 11 sessions, we have come to recognize how to pause and let go of unwholesome thoughts and wrong actions, how to be mindful so that negative patterns do not arise again, and how to discover and expand the wholesome thoughts and right actions already present within us. These 11 sessions were, in fact, the beginning of The Wisdom. And each practice has nourished the seed of wisdom in our mind, helping it grow with clarity, strength, and compassion. As time passes and practice accumulates, the seed gradually grows and eventually blossoms into a lotus of compassion. This lotus of compassion becomes a flower that offers warmth and benefit not only to ourselves but also to all beings around.\n\nWisdom strengthens and expands the mind. It nurtures the inner power to remain centered and undisturbed amid the many events of life. Compassion softens and warms the mind. It opens us to the suffering of others and gives us the strength to care for them with kindness. Wisdom is the direction, compassion is the way. When we see clearly through wisdom and act kindly through compassion, we become beings who truly benefit both ourselves and others.',
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