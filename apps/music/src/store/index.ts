import { create } from 'zustand'
import type { LessonProgress, EarTrainingProgress, Badge } from '@/types'
import { db } from '@/db'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = Array.from(new Set(dates)).sort()
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  // 必须今天或昨天练过才算有 streak
  if (!sorted.includes(today) && !sorted.includes(yesterday)) return 0
  let streak = 0
  let cursor = sorted.includes(today) ? today : yesterday
  while (sorted.includes(cursor)) {
    streak++
    cursor = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10)
  }
  return streak
}

interface AppState {
  lessonProgress: Record<string, LessonProgress>
  earProgress: Record<string, EarTrainingProgress>
  badges: Badge[]
  practiceDates: string[]
  streak: number
  loaded: boolean

  loadProgress: () => Promise<void>
  updateLessonProgress: (progress: LessonProgress) => Promise<void>
  updateEarProgress: (progress: EarTrainingProgress) => Promise<void>
  recordPractice: (lessonId: string, accuracy: number, duration: number) => Promise<void>
  checkBadges: (ctx: {
    lessonCompleted?: boolean
    reviewPerfect?: boolean
    sang?: boolean
  }) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  lessonProgress: {},
  earProgress: {},
  badges: [],
  practiceDates: [],
  streak: 0,
  loaded: false,

  loadProgress: async () => {
    const [lessons, ears, badgeRows, sessions] = await Promise.all([
      db.lessonProgress.toArray(),
      db.earTraining.toArray(),
      db.badges.toArray(),
      db.practiceSessions.toArray(),
    ])
    const lessonMap: Record<string, LessonProgress> = {}
    lessons.forEach((l) => { lessonMap[l.lessonId] = l })
    const earMap: Record<string, EarTrainingProgress> = {}
    ears.forEach((e) => { earMap[e.type] = e })
    const dates = sessions.map(s => s.date)
    set({
      lessonProgress: lessonMap,
      earProgress: earMap,
      badges: badgeRows,
      practiceDates: dates,
      streak: calcStreak(dates),
      loaded: true,
    })
  },

  updateLessonProgress: async (progress) => {
    await db.lessonProgress.put(progress)
    set({
      lessonProgress: { ...get().lessonProgress, [progress.lessonId]: progress },
    })
  },

  updateEarProgress: async (progress) => {
    await db.earTraining.put(progress)
    set({
      earProgress: { ...get().earProgress, [progress.type]: progress },
    })
  },

  recordPractice: async (lessonId, accuracy, duration) => {
    const date = todayStr()
    await db.practiceSessions.add({ date, lessonId, accuracy, duration })
    const dates = [...get().practiceDates, date]
    set({ practiceDates: dates, streak: calcStreak(dates) })
  },

  checkBadges: async (ctx) => {
    const state = get()
    const earned = new Set(state.badges.map(b => b.id))
    const newBadges: Badge[] = []
    const now = new Date().toISOString()
    const lp = state.lessonProgress
    const completedCount = Object.values(lp).filter(l => l.status === 'completed' || l.status === 'mastered').length

    const tryBadge = (id: string, cond: boolean) => {
      if (!earned.has(id) && cond) {
        newBadges.push({ id, earnedAt: now })
      }
    }

    tryBadge('first-lesson', ctx.lessonCompleted === true && completedCount >= 1)
    tryBadge('first-sing', ctx.sang === true)
    tryBadge('streak-3', state.streak >= 3)
    tryBadge('streak-7', state.streak >= 7)
    tryBadge('perfect-review', ctx.reviewPerfect === true)

    // 模块完成检查
    const rhythmDone = ['S2-L01','S2-L02','S2-L03','S2-L04','S2-L05','S2-L06','S2-L07','S2-L08']
      .every(id => lp[id]?.status === 'completed' || lp[id]?.status === 'mastered')
    tryBadge('rhythm-master', rhythmDone)

    const scaleDone = ['S2-L09','S2-L10','S2-L11','S2-L12','S2-L13','S2-L14']
      .every(id => lp[id]?.status === 'completed' || lp[id]?.status === 'mastered')
    tryBadge('scale-master', scaleDone)

    tryBadge('graduate', completedCount >= 24)

    if (newBadges.length > 0) {
      await db.badges.bulkPut(newBadges)
      set({ badges: [...state.badges, ...newBadges] })
    }
  },
}))
