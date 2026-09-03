// 艾宾浩斯遗忘曲线复习引擎（SM-2 简化版）
// 间隔序列：1 → 2 → 4 → 7 → 15 → 30 天（记住后间隔翻倍增长，答错回炉）
// 跨 app 共享：localStorage 同域。key 形如 'en:apple' / 'zh:lesson-L01'
//
// 接入模式：
//   srs.learn('en:apple', 'en', 'apple')   ← 首次学到（点读/上课）
//   srs.reviewResult('en:apple', true)     ← 复习/练习中答对或答错
//   srs.due('en')                           ← 到期队列（app 首页提醒入口）

const KEY = 'kids_srs_v1'

export type SrsApp = 'en' | 'zh'

export interface SrsItem {
  key: string
  app: SrsApp
  label: string
  box: number // 间隔盒索引：0=刚学 … 5=30天盒
  learnedAt: number
  nextReviewAt: number // ms 时间戳（按天粒度对齐）
  reviews: number
  lapses: number // 答错次数
}

const INTERVALS_DAYS = [1, 2, 4, 7, 15, 30]

function dayStart(ts = Date.now()): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

interface SrsState {
  items: Record<string, SrsItem>
}

function load(): SrsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as SrsState
      if (s && typeof s.items === 'object') return s
    }
  } catch {
    /* 损坏重置 */
  }
  return { items: {} }
}

function save(s: SrsState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 静默：复习数据丢失可接受，不阻塞学习 */
  }
}

/** 首次学习（已存在则只刷新 label，不动进度） */
export function learn(key: string, app: SrsApp, label: string) {
  const s = load()
  if (s.items[key]) return
  s.items[key] = {
    key,
    app,
    label,
    box: 0,
    learnedAt: Date.now(),
    nextReviewAt: dayStart() + INTERVALS_DAYS[0] * 86400000,
    reviews: 0,
    lapses: 0,
  }
  save(s)
}

/** 复习结果：对 → 升盒；错 → 回第 0 盒重来 */
export function reviewResult(key: string, correct: boolean) {
  const s = load()
  const it = s.items[key]
  if (!it) return
  it.reviews += 1
  if (correct) {
    it.box = Math.min(it.box + 1, INTERVALS_DAYS.length - 1)
  } else {
    it.box = 0
    it.lapses += 1
  }
  it.nextReviewAt = dayStart() + INTERVALS_DAYS[it.box] * 86400000
  save(s)
}

/** 到期项（nextReviewAt <= 今天）；按到期先后排序 */
export function due(app?: SrsApp): SrsItem[] {
  const s = load()
  const now = dayStart()
  return Object.values(s.items)
    .filter((it) => (app ? it.app === app : true) && it.nextReviewAt <= now)
    .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
}

/** 到期数量（提醒徽章用，轻量） */
export function dueCount(app?: SrsApp): number {
  return due(app).length
}

/** 全部学习项（家长面板看进度） */
export function allItems(app?: SrsApp): SrsItem[] {
  const s = load()
  return Object.values(s.items).filter((it) => (app ? it.app === app : true))
}

/** 艾宾浩斯间隔说明（UI 展示用） */
export const INTERVALS = INTERVALS_DAYS
