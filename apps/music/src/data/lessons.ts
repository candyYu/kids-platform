import type { Lesson, ReviewChallenge } from '@/types'

// ===== S1 复习闯关 =====

export const reviewChallenges: ReviewChallenge[] = [
  {
    challengeId: 'R1',
    name: '节奏复习关',
    description: 'ta / ti-ti / 休止 / 二分 / 全音符',
    passThreshold: 0.8,
    questions: [
      {
        id: 'R1-Q1',
        type: 'ternary',
        audio: { rhythm: ['quarter', 'quarter', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [
          { label: 'ta ta ta ta', rhythmPattern: 'quarter' },
          { label: 'ti-ti ti-ti ta ta', rhythmPattern: 'two-eighths' },
          { label: 'ta ta-a ta ta', rhythmPattern: 'half' },
        ],
        correctIndex: 0,
      },
      {
        id: 'R1-Q2',
        type: 'ternary',
        audio: { rhythm: ['two-eighths', 'two-eighths', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [
          { label: 'ta ta ta ta', rhythmPattern: 'quarter' },
          { label: 'ti-ti ti-ti ta ta', rhythmPattern: 'two-eighths' },
          { label: 'ta-a ta ta', rhythmPattern: 'half' },
        ],
        correctIndex: 1,
      },
      {
        id: 'R1-Q3',
        type: 'ternary',
        audio: { rhythm: ['quarter', 'quarter-rest', 'quarter', 'quarter-rest'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [
          { label: 'ta 休 ta 休', rhythmPattern: 'quarter-rest' },
          { label: 'ta ta ta ta', rhythmPattern: 'quarter' },
          { label: 'ti-ti ti-ti ti-ti ti-ti', rhythmPattern: 'two-eighths' },
        ],
        correctIndex: 0,
      },
      {
        id: 'R1-Q4',
        type: 'ternary',
        audio: { rhythm: ['half', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [
          { label: 'ta ta ta ta', rhythmPattern: 'quarter' },
          { label: 'ta-a ta ta', rhythmPattern: 'half' },
          { label: 'ta-a-a-a', rhythmPattern: 'whole' },
        ],
        correctIndex: 1,
      },
      {
        id: 'R1-Q5',
        type: 'ternary',
        audio: { rhythm: ['half', 'half'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [
          { label: 'ta-a ta-a', rhythmPattern: 'half' },
          { label: 'ta ta ta ta', rhythmPattern: 'quarter' },
          { label: 'ta-a-a-a', rhythmPattern: 'whole' },
        ],
        correctIndex: 0,
        intent: '全音符感觉',
      },
    ],
  },
  {
    challengeId: 'R2',
    name: '音高复习关',
    description: 'do-re-mi-sol-la 听辨 + 高低方向',
    passThreshold: 0.8,
    questions: [
      {
        id: 'R2-Q1',
        type: 'ternary',
        audio: { rhythm: ['quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['C4'] },
        options: [
          { label: 'do' },
          { label: 're' },
          { label: 'mi' },
        ],
        correctIndex: 0,
      },
      {
        id: 'R2-Q2',
        type: 'ternary',
        audio: { rhythm: ['quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['G4'] },
        options: [
          { label: 'do' },
          { label: 'mi' },
          { label: 'sol' },
        ],
        correctIndex: 2,
      },
      {
        id: 'R2-Q3',
        type: 'ternary',
        audio: { rhythm: ['quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['A4'] },
        options: [
          { label: 'sol' },
          { label: 'la' },
          { label: 'do' },
        ],
        correctIndex: 1,
      },
      {
        id: 'R2-Q4',
        type: 'ternary',
        audio: { rhythm: ['quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['C4', 'E4'] },
        options: [
          { label: '上楼' },
          { label: '下楼' },
          { label: '原地' },
        ],
        correctIndex: 0,
      },
      {
        id: 'R2-Q5',
        type: 'ternary',
        audio: { rhythm: ['quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['G4', 'E4'] },
        options: [
          { label: '上楼' },
          { label: '下楼' },
          { label: '原地' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    challengeId: 'R3',
    name: '谱面复习关',
    description: '五线谱识音 + 简谱识音',
    passThreshold: 0.8,
    questions: [
      {
        id: 'R3-Q1',
        type: 'ternary',
        audio: { notes: ['G4'], rhythm: ['quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [{ label: 'G' }, { label: 'F' }, { label: 'E' }],
        correctIndex: 0,
        intent: '高音谱表第二线是 G',
      },
      {
        id: 'R3-Q2',
        type: 'ternary',
        audio: { notes: ['C5'], rhythm: ['quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [{ label: 'C' }, { label: 'D' }, { label: 'E' }],
        correctIndex: 0,
        intent: '第三间是 C',
      },
      {
        id: 'R3-Q3',
        type: 'binary',
        audio: { notes: ['C4', 'D4', 'E4'], rhythm: ['quarter', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [{ label: '1 2 3 = do re mi' }, { label: '1 2 3 = re mi fa' }],
        correctIndex: 0,
        intent: '简谱数字',
      },
      {
        id: 'R3-Q4',
        type: 'ternary',
        audio: { notes: ['C4', 'D4', 'E4', 'F4'], rhythm: ['quarter', 'quarter', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
        options: [{ label: '4 拍' }, { label: '3 拍' }, { label: '2 拍' }],
        correctIndex: 0,
        intent: '4/4 拍号',
      },
      {
        id: 'R3-Q5',
        type: 'binary',
        audio: { notes: ['C4', 'D4', 'E4'], rhythm: ['quarter', 'quarter', 'quarter'], timeSignature: [3, 4], tempo: 60, bars: 1 },
        options: [{ label: '强 弱 弱' }, { label: '强 弱' }],
        correctIndex: 0,
        intent: '3/4 拍号强弱',
      },
    ],
  },
]

// ===== S2 L05 样板课 =====

export const lessonL05: Lesson = {
  lessonId: 'S2-L05',
  lessonName: '前八后十六',
  stage: 'S2',
  trainingPoint: '前八后十六 ♪𝅘𝅥𝅯𝅘𝅥𝅯，Kodály 读法 ti · ti-ri',
  kodalyReading: 'ti · ti-ri',
  timeSignature: [4, 4],
  tempo: 60,
  segments: ['warmup', 'lecture', 'dictation', 'sightReading', 'singing', 'summary'],
  dictationQuestions: [
    {
      id: 'L05-Q1',
      type: 'binary',
      audio: { rhythm: ['eighth-two-sixteenths', 'eighth-two-sixteenths', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
      options: [
        { label: 'ti · ti-ri（前八后十六）', rhythmPattern: 'eighth-two-sixteenths' },
        { label: 'ti-ri-ti-ri（四个十六分）', rhythmPattern: 'four-sixteenths' },
      ],
      correctIndex: 0,
      intent: '基础区分',
    },
    {
      id: 'L05-Q2',
      type: 'binary',
      audio: { rhythm: ['two-sixteenths-eighth', 'two-sixteenths-eighth', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1 },
      options: [
        { label: 'ti · ti-ri（前八后十六）', rhythmPattern: 'eighth-two-sixteenths' },
        { label: 'ti-ri · ti（前十六后八）', rhythmPattern: 'two-sixteenths-eighth' },
      ],
      correctIndex: 1,
      intent: '最易混对比',
    },
    {
      id: 'L05-Q3',
      type: 'ternary',
      audio: { rhythm: ['eighth-two-sixteenths', 'quarter', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 2 },
      options: [
        { label: '前八后十六 + ta', rhythmPattern: 'eighth-two-sixteenths' },
        { label: '四个十六分 + ta', rhythmPattern: 'four-sixteenths' },
        { label: '前十六后八 + ta', rhythmPattern: 'two-sixteenths-eighth' },
      ],
      correctIndex: 0,
    },
    {
      id: 'L05-Q4',
      type: 'ternary',
      audio: { rhythm: ['eighth-two-sixteenths', 'eighth-two-sixteenths', 'quarter', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 2 },
      options: [
        { label: '前八后十六 x2 + ta', rhythmPattern: 'eighth-two-sixteenths' },
        { label: '四个十六分 x2 + ta', rhythmPattern: 'four-sixteenths' },
        { label: '前十六后八 x2 + ta', rhythmPattern: 'two-sixteenths-eighth' },
      ],
      correctIndex: 0,
    },
    {
      id: 'L05-Q5',
      type: 'binary',
      audio: { rhythm: ['eighth-two-sixteenths', 'quarter', 'two-eighths', 'quarter'], timeSignature: [4, 4], tempo: 60, bars: 1, notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'C4'] },
      options: [
        { label: '有 ti · ti-ri' },
        { label: '没有 ti · ti-ri' },
      ],
      correctIndex: 0,
      intent: '真实旋律语境识别',
    },
  ],
  passThreshold: 0.8,
  nextLesson: 'S2-L06',
  reviewLesson: 'S2-L04',
  unlocked: true,
}
