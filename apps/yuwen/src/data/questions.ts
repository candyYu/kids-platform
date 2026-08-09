// 题型定义（基于 PDF 44 页识别的 13 种核心题型）
// 阶段3-4 使用这些题型出题

export type QuestionType =
  | 'trace'              // A 拼音描红
  | 'imageToSyllable'    // B 看图写拼音
  | 'syllableCompose'    // C 拼一拼写一写（中心声母+韵母）
  | 'syllableSplit'      // D 音节拆分
  | 'markTone'           // E 标声调
  | 'circle'             // F 辨析圈选
  | 'connect'            // G 图文/音节连线
  | 'pickByChar'         // H 看字选拼音
  | 'pickBySyllable'     // I 看拼音选字
  | 'fillBlank'          // J 补全音节
  | 'classifyTone'       // K 按声调分类
  | 'writeAlphabet'      // L 字母表默写
  | 'judge'              // M 判断对错
  | 'sequencePick'       // N 圈选正确顺序（p01 三题用到的）

export interface BaseQuestion {
  id: string                 // 唯一 ID，如 "L01-q01"
  lessonId: string           // 关联课
  type: QuestionType
  prompt: string             // 题面文字
  promptPinyin?: string      // 题面注音
  hint?: string              // 提示
}

// 题目联合类型（按 type 区分）
export type Question =
  | (BaseQuestion & { type: 'trace'; target: string; rows: number; colsPerRow: number })
  | (BaseQuestion & { type: 'imageToSyllable'; imageEmoji: string; imageDesc: string; answer: string })
  | (BaseQuestion & { type: 'syllableCompose'; initial: string; finals: string[]; answer: string })
  | (BaseQuestion & { type: 'syllableSplit'; syllable: string; answer: { initial: string; final: string; tone: number } })
  | (BaseQuestion & { type: 'markTone'; base: string; options: number[]; answer: number })
  | (BaseQuestion & { type: 'circle'; items: string[]; rule: string; answerIndices: number[] })
  | (BaseQuestion & { type: 'connect'; lefts: { id: string; label: string }[]; rights: { id: string; label: string }[]; answer: [string, string][] })
  | (BaseQuestion & { type: 'pickByChar'; char: string; options: string[]; answer: string })
  | (BaseQuestion & { type: 'pickBySyllable'; syllable: string; options: { char: string; imageEmoji?: string }[]; answer: string })
  | (BaseQuestion & { type: 'fillBlank'; pattern: string; options: string[]; answer: string })
  | (BaseQuestion & { type: 'classifyTone'; syllables: string[]; answer: { tone: number; items: string[] }[] })
  | (BaseQuestion & { type: 'writeAlphabet'; scope: 'initial' | 'final'; answer: string[] })
  | (BaseQuestion & { type: 'judge'; item: string; answer: boolean })
  | (BaseQuestion & { type: 'sequencePick'; prompt: string; options: { emoji: string; sequence: string[]; correct: boolean }[] })

// L01 占位题库（从 PDF p01 视觉识别结果转换）
// 真实题库后续按 PDF 抽页细读慢慢补
export const SAMPLE_QUESTIONS_L01: Question[] = [
  {
    id: 'L01-q01',
    lessonId: 'L01',
    type: 'trace',
    prompt: '读一读，写一写',
    promptPinyin: 'dú yī dú, xiě yī xiě',
    target: 'a',
    rows: 3,
    colsPerRow: 7,
  },
  {
    id: 'L01-q02',
    lessonId: 'L01',
    type: 'imageToSyllable',
    prompt: '根据图片，写出对应的声调',
    promptPinyin: 'gēn jù tú piàn, xiě chū duì yìng de shēng diào',
    imageEmoji: '🚗',
    imageDesc: '小汽车行驶路线对应四个声调',
    answer: 'ā á ǎ à',
  },
  {
    id: 'L01-q03',
    lessonId: 'L01',
    type: 'sequencePick',
    prompt: '沿正确声调顺序的小动物能吃到食物，圈出来',
    options: [
      { emoji: '🐵', sequence: ['ā', 'á', 'à', 'á'], correct: false },
      { emoji: '🐱', sequence: ['ā', 'á', 'ǎ', 'à'], correct: true },
      { emoji: '🦒', sequence: ['á', 'ā', 'ǎ', 'à'], correct: false },
    ],
  },
]

export function getQuestionsForLesson(lessonId: string): Question[] {
  if (lessonId === 'L01') return SAMPLE_QUESTIONS_L01
  return []
}
