// Dexie 数据库 schema
// 表：lessons, progress, errorItems, badges, streak, settings, sessions
import Dexie, { Table } from 'dexie'
import { LESSONS_BY_GRADE } from '@/data'

export interface LessonRecord {
  id: string                    // 'L01' ... 'L13'
  unlocked: 0 | 1
  stars: number                 // 0-3
  bestScore: number             // 最高分
  completedAt?: number
}

export interface StageRecord {
  id?: number
  lessonId: string
  stage: 'intro' | 'demo' | 'dictation' | 'quiz' | 'challenge'
  score: number
  total: number
  completedAt: number
}

export interface ErrorItem {
  id?: number
  lessonId: string
  questionId: string
  type: string                  // QuestionType
  prompt: string
  answer: string | string[]
  wrongAnswer: string | string[]
  count: number
  lastWrongAt: number
  nextReviewAt: number          // 艾宾浩斯：错时即 push，1天后/3天后/7天后
  doneCount: number             // 重做答对累计
}

export interface BadgeRecord {
  id?: number
  code: string                  // 'first-lesson' etc
  earnedAt: number
}

export interface StreakRecord {
  id: 'singleton'               // 只有一条
  current: number
  longest: number
  lastDate: string              // YYYY-MM-DD
}

export interface SettingsRecord {
  id: 'singleton'
  dailyLimitMin: number
  restIntervalMin: number
  speechRate: number            // 0.5-2.0
  fontSize: 'm' | 'l' | 'xl'
  theme: 'warm' | 'cool'
  pin: string                   // 4 位家长 PIN（默认 '0000'）
}

export interface SessionRecord {
  id?: number
  lessonId: string
  startedAt: number
  endedAt?: number
  itemsAnswered: number
  itemsCorrect: number
}

class KidsYuwenDB extends Dexie {
  lessons!: Table<LessonRecord, string>
  stages!: Table<StageRecord, number>
  errorItems!: Table<ErrorItem, number>
  badges!: Table<BadgeRecord, number>
  streak!: Table<StreakRecord, string>
  settings!: Table<SettingsRecord, string>
  sessions!: Table<SessionRecord, number>

  constructor() {
    super('kids-yuwen')
    this.version(1).stores({
      lessons: 'id, unlocked, completedAt',
      stages: '++id, lessonId, stage, completedAt',
      errorItems: '++id, lessonId, questionId, nextReviewAt, count',
      badges: '++id, code, earnedAt',
      streak: 'id',
      settings: 'id',
      sessions: '++id, lessonId, startedAt',
    })
  }
}

export const db = new KidsYuwenDB()

// 初始化默认设置
export async function ensureDefaults() {
  const s = await db.settings.get('singleton')
  if (!s) {
    await db.settings.put({
      id: 'singleton',
      dailyLimitMin: 30,
      restIntervalMin: 20,
      speechRate: 0.9,
      fontSize: 'l',
      theme: 'warm',
      pin: '0000',
    })
  }
  const sk = await db.streak.get('singleton')
  if (!sk) {
    await db.streak.put({ id: 'singleton', current: 0, longest: 0, lastDate: '' })
  }
}

// 全部 lesson 记录（1年级+2年级，不存在则初始化；全部自由进入——家长按需选课，不做顺序锁）
export async function ensureLessons() {
  const grades = [
    { g: '1' as const, list: LESSONS_BY_GRADE['1'] },
    { g: '2' as const, list: LESSONS_BY_GRADE['2'] },
  ]
  for (const { list } of grades) {
    for (let i = 0; i < list.length; i++) {
      const id = list[i].id
      const existing = await db.lessons.get(id)
      if (!existing) {
        await db.lessons.put({
          id,
          unlocked: 1,
          stars: 0,
          bestScore: 0,
        })
      } else if (existing.unlocked !== 1) {
        // 迁移：老浏览器 DB 里被顺序锁锁住的拼音课，一次性放开
        await db.lessons.update(id, { unlocked: 1 })
      }
    }
  }
  // 隐藏解锁（开发模式）
  const params = new URLSearchParams(window.location.search)
  if (params.get('unlock') === 'all') {
    for (const { list } of grades) {
      for (const l of list) {
        await db.lessons.update(l.id, { unlocked: 1 })
      }
    }
  }
}
