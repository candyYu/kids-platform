// 年级通用数据类型（1年级 / 2年级共用 schema，内容物理分开）
export type Grade = '1' | '2'
export type LessonKind = 'pinyin' | 'reading' | 'hanzi'

export interface Lesson {
  id: string
  grade: Grade
  unit: number          // 0=我上学了/开篇, 1-8 单元
  kind: LessonKind
  code: string          // 显示：'第1课' / '识字1' / '我上学了'
  name: string
  theme: string         // 副标题/内容说明
  videoFile?: string    // 拼音课教学视频（相对 /videos/）
  textId?: string       // grade1/grade2 texts.ts 键
  no?: string           // 生字表课号（认字数据用）
  group?: string        // 生字表分组
}

export interface UnitInfo {
  no: number
  label: string
  kind: 'intro' | 'hanzi' | 'pinyin' | 'reading'
}

export interface LessonText {
  id: string
  title?: string
  author?: string
  lines: string[]
}
