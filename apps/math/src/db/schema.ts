import Dexie, { type Table } from 'dexie'

export type Grade = '1' | '2'
export type Op = '+' | '-' | '×' | '÷'

/** 每次作答记录（答题即记，用于今日进度 + 正确率） */
export interface AttemptRec {
  id?: number
  g: Grade
  topic: string
  expr: string
  userAns: string
  correct: 0 | 1
  ts: number
}

/** 错题（答错进，答对重练后移除） */
export interface ErrorRec {
  key: string              // expr 唯一
  g: Grade
  topic: string
  a: number
  op: Op
  b: number
  ans: number
  rem?: number
  expr: string
  prompt: string
  count: number
  lastWrongAt: number
}

/** 每日每组最佳成绩（星星） */
export interface DailyRec {
  key: string              // `${day}|${topic}`
  g: Grade
  day: string              // '2026-09-01'
  topic: string
  bestStars: number        // 0-3
  plays: number
  lastTs: number
}

class MathDB extends Dexie {
  attempts!: Table<AttemptRec, number>
  errors!: Table<ErrorRec, string>
  daily!: Table<DailyRec, string>

  constructor() {
    super('kids-math')
    this.version(1).stores({
      attempts: '++id, ts, topic, g',
      errors: 'key, topic, g, lastWrongAt',
      daily: 'key, g, day',
    })
  }
}

export const db = new MathDB()

export function today(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
