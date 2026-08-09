import Dexie, { type Table } from 'dexie'
import type { LessonProgress, EarTrainingProgress, Recording, Badge, PracticeSession } from '@/types'

export class MusicDB extends Dexie {
  lessonProgress!: Table<LessonProgress, string>
  earTraining!: Table<EarTrainingProgress, string>
  recordings!: Table<Recording, string>
  badges!: Table<Badge, string>
  practiceSessions!: Table<PracticeSession, number>

  constructor() {
    super('KidsMusicApp')
    this.version(2).stores({
      lessonProgress: 'lessonId',
      earTraining: 'type',
      recordings: 'id, lessonId, createdAt',
      badges: 'id',
      practiceSessions: '++id, date, lessonId',
    })
  }
}

export const db = new MusicDB()
