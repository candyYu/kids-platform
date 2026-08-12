// 小提琴练习统计（localStorage，本地存储，不上传）
const STORAGE_KEY = 'violin-stats-v1'

export interface ViolinRedemption {
  /** 兑换时间戳 */
  at: number
  /** 兑换的奖励名称 */
  reward: string
}

export interface ViolinStats {
  /** 总有效练习秒数（累计，跨天） */
  totalSeconds: number
  /** 当前这一颗星星的进度 0~600（10 分钟 = 600 秒） */
  currentProgress: number
  /** 已获得星星总数 */
  stars: number
  /** 已兑换次数（从 stars 里扣除，但单独记录方便统计） */
  redeemed: number
  /** 练习日期（YYYY-MM-DD 去重） */
  practiceDates: string[]
  /** 家长配置的奖励池（选第一个未满 10 颗的） */
  rewards: string[]
  /** 兑换历史 */
  redemptions: ViolinRedemption[]
  /** 今天累计有效秒数（用于首页小任务） */
  todaySeconds: number
  /** 上次更新 todaySeconds 的日期 */
  todayDate: string
  version: 1
}

const DEFAULT_REWARDS = ['一次公园游玩', '一本新绘本', '一个小礼物']

const EMPTY: ViolinStats = {
  totalSeconds: 0,
  currentProgress: 0,
  stars: 0,
  redeemed: 0,
  practiceDates: [],
  rewards: [...DEFAULT_REWARDS],
  redemptions: [],
  todaySeconds: 0,
  todayDate: '',
  version: 1,
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadViolinStats(): ViolinStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY, rewards: [...DEFAULT_REWARDS] }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY, rewards: [...DEFAULT_REWARDS] }
    const today = todayStr()
    // 跨天重置 todaySeconds
    let todaySeconds = parsed.todaySeconds
    if (parsed.todayDate !== today) todaySeconds = 0
    return {
      totalSeconds: Number.isFinite(parsed.totalSeconds) ? parsed.totalSeconds : 0,
      currentProgress: Number.isFinite(parsed.currentProgress) ? Math.min(600, parsed.currentProgress) : 0,
      stars: Number.isFinite(parsed.stars) ? parsed.stars : 0,
      redeemed: Number.isFinite(parsed.redeemed) ? parsed.redeemed : 0,
      practiceDates: Array.isArray(parsed.practiceDates) ? parsed.practiceDates : [],
      rewards: Array.isArray(parsed.rewards) && parsed.rewards.length > 0 ? parsed.rewards : [...DEFAULT_REWARDS],
      redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : [],
      todaySeconds,
      todayDate: today,
      version: 1,
    }
  } catch {
    return { ...EMPTY, rewards: [...DEFAULT_REWARDS] }
  }
}

function save(stats: ViolinStats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)) } catch {}
}

/** 加有效练习秒数。返回本次新增触发的星星数（一般是 0 或 1，理论上可能 2）。 */
export function addViolinPractice(seconds: number): { newStars: number; newProgress: number } {
  if (seconds <= 0) return { newStars: 0, newProgress: 0 }
  const stats = loadViolinStats()
  const today = todayStr()
  if (stats.todayDate !== today) {
    stats.todayDate = today
    stats.todaySeconds = 0
  }
  stats.totalSeconds += seconds
  stats.todaySeconds += seconds
  if (!stats.practiceDates.includes(today)) stats.practiceDates.push(today)
  stats.currentProgress += seconds

  let newStars = 0
  while (stats.currentProgress >= 600) {
    stats.currentProgress -= 600
    stats.stars += 1
    newStars += 1
  }
  save(stats)
  return { newStars, newProgress: stats.currentProgress }
}

export function setViolinRewards(rewards: string[]) {
  const stats = loadViolinStats()
  stats.rewards = rewards.map(s => s.trim()).filter(Boolean)
  save(stats)
}

export function redeemReward(reward: string): boolean {
  const stats = loadViolinStats()
  if (stats.stars < 10) return false
  stats.stars -= 10
  stats.redeemed += 1
  stats.redemptions.unshift({ at: Date.now(), reward })
  if (stats.redemptions.length > 20) stats.redemptions.length = 20
  save(stats)
  return true
}

export function practicedToday(): boolean {
  const stats = loadViolinStats()
  return stats.todayDate === todayStr() && stats.todaySeconds > 0
}

export function totalMinutes(s: ViolinStats): number {
  return Math.floor(s.totalSeconds / 60)
}
