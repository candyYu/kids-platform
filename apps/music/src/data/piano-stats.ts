// 钢琴小游戏统计（轻量 localStorage，不入 IndexedDB，避免迁移）
// 只统计家长关心的：每首歌完成次数、最后完成时间、自由弹总时长、累计天数

const STORAGE_KEY = 'piano-stats-v1'

export interface PianoSongStat {
  /** 完成次数（整首跟弹到底） */
  completions: number
  /** 最后一次完成的 ISO 时间 */
  lastCompletedAt: string | null
}

export interface PianoStats {
  /** 按歌曲 id 聚合 */
  songs: Record<string, PianoSongStat>
  /** 自由弹累计秒数 */
  freePlaySeconds: number
  /** 有过练习的日期（YYYY-MM-DD，去重），用于打卡 & 连续天数 */
  practiceDates: string[]
  /** 统计版本，未来字段变更用 */
  version: 1
}

const EMPTY: PianoStats = {
  songs: {},
  freePlaySeconds: 0,
  practiceDates: [],
  version: 1,
}

export function loadPianoStats(): PianoStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY }
    return {
      songs: parsed.songs && typeof parsed.songs === 'object' ? parsed.songs : {},
      freePlaySeconds: Number.isFinite(parsed.freePlaySeconds) ? parsed.freePlaySeconds : 0,
      practiceDates: Array.isArray(parsed.practiceDates) ? parsed.practiceDates : [],
      version: 1,
    }
  } catch {
    return { ...EMPTY }
  }
}

function save(stats: PianoStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // 配额满或隐私模式，静默忽略
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function markToday(stats: PianoStats) {
  const d = todayStr()
  if (!stats.practiceDates.includes(d)) stats.practiceDates.push(d)
}

/** 跟弹完整弹完一首歌 */
export function recordSongComplete(songId: string) {
  const stats = loadPianoStats()
  const cur = stats.songs[songId] ?? { completions: 0, lastCompletedAt: null }
  cur.completions += 1
  cur.lastCompletedAt = new Date().toISOString()
  stats.songs[songId] = cur
  markToday(stats)
  save(stats)
}

/** 累加自由弹时长（秒）。阈值 <0.5 秒忽略，防止误触 */
export function addFreePlayTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0.5) return
  const stats = loadPianoStats()
  stats.freePlaySeconds += Math.round(seconds)
  markToday(stats)
  save(stats)
}

/** 计算连续练习天数（与 store.calcStreak 同逻辑） */
export function calcPianoStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = Array.from(new Set(dates)).sort()
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (!sorted.includes(today) && !sorted.includes(yesterday)) return 0
  let streak = 0
  let cursor = sorted.includes(today) ? today : yesterday
  while (sorted.includes(cursor)) {
    streak++
    cursor = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10)
  }
  return streak
}
