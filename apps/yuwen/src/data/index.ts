// 年级数据统一门面：按 ACTIVE_GRADE 路由 1年级/2年级 课程、单元、课文
import type { Grade, Lesson, UnitInfo, LessonText } from './types'
import { ACTIVE_GRADE } from './grade'
import { GRADE1_LESSONS, GRADE1_UNITS } from './grade1/lessons'
import { TEXTS as GRADE1_TEXTS } from './grade1/texts'
import { GRADE2_LESSONS, GRADE2_UNITS } from './grade2/lessons'
import { TEXTS as GRADE2_TEXTS } from './grade2/texts'

export const LESSONS_BY_GRADE: Record<Grade, Lesson[]> = {
  '1': GRADE1_LESSONS,
  '2': GRADE2_LESSONS,
}
export const UNITS_BY_GRADE: Record<Grade, UnitInfo[]> = {
  '1': GRADE1_UNITS,
  '2': GRADE2_UNITS,
}
export const TEXTS_BY_GRADE: Record<Grade, Record<string, LessonText>> = {
  '1': GRADE1_TEXTS,
  '2': GRADE2_TEXTS,
}

export { ACTIVE_GRADE, GRADE_LABEL } from './grade'

/** 当前年级全部课程（按单元排序） */
export function activeLessons(): Lesson[] {
  return LESSONS_BY_GRADE[ACTIVE_GRADE]
}

/** 当前年级课程查找；找不到再全年级兜底 */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS_BY_GRADE[ACTIVE_GRADE].find(l => l.id === id)
    ?? GRADE1_LESSONS.find(l => l.id === id)
    ?? GRADE2_LESSONS.find(l => l.id === id)
}

/** 课文正文（老师页覆盖优先）：覆盖存 localStorage `teacher-override-{grade}-{textId}` */
export function getLessonText(grade: Grade, textId: string): LessonText | undefined {
  try {
    const raw = localStorage.getItem(`teacher-override-${grade}-${textId}`)
    if (raw) {
      const lines = JSON.parse(raw) as string[]
      const base = TEXTS_BY_GRADE[grade][textId]
      if (base && Array.isArray(lines) && lines.length > 0) {
        return { ...base, lines }
      }
    }
  } catch { /* 忽略坏数据 */ }
  return TEXTS_BY_GRADE[grade][textId]
}

/** 本课"会认字"：从课文正文取不重复汉字（前 16 个），排除标点/数字 */
export function lessonChars(text: LessonText): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of text.lines) {
    for (const ch of line) {
      if (/[\u4e00-\u9fff]/.test(ch) && !seen.has(ch)) {
        seen.add(ch)
        out.push(ch)
        if (out.length >= 16) return out
      }
    }
  }
  return out
}
