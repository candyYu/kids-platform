// 作业全完成奖励：⭐×1，计入全平台 @kids/core 星星（奖励商店可兑换）。
// 防刷：同一"日期+作业内容指纹"只发一次——勾完取消再勾不会重复得星；
//       家长当天改了作业内容（指纹变），孩子重新完成可以再挣一颗。
// 每日总封顶仍由 addStars 的 DAILY_CAP(60) 兜底。
import { addStars } from '@kids/core'

const CLAIMED_KEY = 'kids_homework_star_v1'
// 领奖后广播，首页顶栏 ⭐ 数即时刷新
export const STARS_CHANGED_EVENT = 'kids:stars-changed'

function todayStr(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

interface ClaimRecord {
  claims: string[]
}

function loadClaims(): ClaimRecord {
  try {
    const raw = localStorage.getItem(CLAIMED_KEY)
    if (raw) return JSON.parse(raw) as ClaimRecord
  } catch {
    /* 脏数据重置 */
  }
  return { claims: [] }
}

function claimKey(fingerprint: string): string {
  return `${todayStr()}::${fingerprint}`
}

/** 这份作业今天是否已经领过完成星 */
export function isHomeworkStarClaimed(fingerprint: string): boolean {
  if (!fingerprint) return true
  const key = claimKey(fingerprint)
  return loadClaims().claims.includes(key)
}

/**
 * 触发完成奖励。返回实际得到的星星数（0 = 已领过 / 达到每日上限）。
 * 只有返回 >0 时才弹庆祝动画，避免重复打扰孩子。
 */
export function claimHomeworkStar(fingerprint: string): number {
  if (!fingerprint) return 0
  const rec = loadClaims()
  const key = claimKey(fingerprint)
  if (rec.claims.includes(key)) return 0
  const gained = addStars(1)
  // 即使撞每日 60 上限（gained=0）也记录，不再反复触发
  rec.claims.push(key)
  // 只留最近 30 条，localStorage 不无限长
  rec.claims = rec.claims.slice(-30)
  try {
    localStorage.setItem(CLAIMED_KEY, JSON.stringify(rec))
  } catch {
    /* ignore */
  }
  if (gained > 0) {
    try {
      window.dispatchEvent(new Event(STARS_CHANGED_EVENT))
    } catch {
      /* 非浏览器环境 */
    }
  }
  return gained
}
