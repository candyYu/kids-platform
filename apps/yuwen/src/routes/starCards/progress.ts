// 摘星卡自评进度：只存本机（与作业打勾同理，pad 单机使用）。
// 每个条目三态：未评 / 'star' 会读得☆ / 'wrong' 读错（标红，等家长带读）。
// 另有整卡熟练程度 rating（卡面三档：熟练 / 比较熟练 / 加油）。
import { useSyncExternalStore } from 'react'

export type ItemMark = 'star' | 'wrong'
export type CardRating = 'proficient' | 'familiar' | 'practice' | null

export interface CardProgress {
  marks: Record<string, ItemMark>
  rating: CardRating
  date?: string
}

type ProgressMap = Record<number, CardProgress>

const KEY = 'star_card_progress_v1'

function load(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as ProgressMap
  } catch {
    return {}
  }
}

let cache: ProgressMap = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* 存储满不影响使用 */
  }
  listeners.forEach(l => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  window.addEventListener('storage', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', l)
  }
}

export function useProgress(): ProgressMap {
  return useSyncExternalStore(subscribe, () => cache)
}

export function itemKey(sectionIndex: number, itemIndex: number): string {
  return `${sectionIndex}-${itemIndex}`
}

export function getCard(lesson: number): CardProgress {
  return cache[lesson] || { marks: {}, rating: null }
}

export function cycleMark(lesson: number, key: string) {
  const card = cache[lesson] || { marks: {}, rating: null }
  const cur = card.marks[key]
  const next: ItemMark | undefined =
    cur === undefined ? 'star' : cur === 'star' ? 'wrong' : undefined
  if (next === undefined) delete card.marks[key]
  else card.marks[key] = next
  card.date = new Date().toISOString().slice(0, 10)
  cache = { ...cache, [lesson]: card }
  persist()
}

export function setRating(lesson: number, rating: CardRating) {
  const card = cache[lesson] || { marks: {}, rating: null }
  card.rating = card.rating === rating ? null : rating
  card.date = new Date().toISOString().slice(0, 10)
  cache = { ...cache, [lesson]: card }
  persist()
}

/** 统计一张卡的☆数（按条目标星数，非卡面 declaredStars 口径，仅本机自励用） */
export function markCounts(p: CardProgress) {
  let star = 0
  let wrong = 0
  for (const v of Object.values(p.marks)) {
    if (v === 'star') star++
    else if (v === 'wrong') wrong++
  }
  return { star, wrong }
}
