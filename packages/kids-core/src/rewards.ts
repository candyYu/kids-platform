// 平台级激励：星星 / 连续打卡 / 奖励兑换商店
// 跨 app 共享：各 app 部署在同一域（candyYu.github.io）下，localStorage 天然共享。
// key 统一前缀 kids_，版本化避免脏数据。
// 纯 localStorage + 无依赖，任何 app 直接 import（vite 编译 TS 源码）。

const KEY = 'kids_rewards_v1'
const SHOP_KEY = 'kids_shop_v1'
const DAILY_CAP = 60 // 每日星星上限：防刷（练一练无限循环时尤其重要）

export interface ShopItem {
  id: string
  name: string // 如"和妈妈下一盘棋"
  emoji: string
  cost: number
}

export interface RedeemRecord {
  id: string
  name: string
  cost: number
  at: number
}

interface Streak {
  current: number
  longest: number
  lastDate: string // YYYY-MM-DD
}

interface RewardState {
  stars: number
  streak: Streak
  redeemed: RedeemRecord[]
  dailyEarned: { date: string; earned: number }
}

function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}

function load(): RewardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as RewardState
  } catch {
    /* 损坏则重置 */
  }
  return { stars: 0, streak: { current: 0, longest: 0, lastDate: '' }, redeemed: [], dailyEarned: { date: '', earned: 0 } }
}

function save(s: RewardState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 存储满等异常静默：激励丢失可接受，不能影响学习主流程 */
  }
}

/** 加星星（每日上限内）；返回实际加到的数量 */
export function addStars(n: number): number {
  if (n <= 0) return 0
  const s = load()
  const today = todayStr()
  if (s.dailyEarned.date !== today) s.dailyEarned = { date: today, earned: 0 }
  const room = Math.max(0, DAILY_CAP - s.dailyEarned.earned)
  const add = Math.min(n, room)
  if (add <= 0) return 0
  s.stars += add
  s.dailyEarned.earned += add
  save(s)
  return add
}

export function getStars(): number {
  return load().stars
}

/** 今日已得 / 上限（UI 进度条用） */
export function getDailyProgress(): { earned: number; cap: number } {
  const s = load()
  const today = todayStr()
  return { earned: s.dailyEarned.date === today ? s.dailyEarned.earned : 0, cap: DAILY_CAP }
}

/**
 * 学习行为打卡：任何 app 里发生学习行为（上课/点读/答对）时调用。
 * - 当天首次 → streak.current + 1
 * - 隔天（昨天有记录）→ 连续 +1
 * - 断档（昨天没有）→ current 重置为 1
 */
export function touchStreak(): Streak {
  const s = load()
  const today = todayStr()
  if (s.streak.lastDate === today) return s.streak // 今天已打过
  s.streak.current = s.streak.lastDate === yesterdayStr() ? s.streak.current + 1 : 1
  s.streak.longest = Math.max(s.streak.longest, s.streak.current)
  s.streak.lastDate = today
  save(s)
  return s.streak
}

export function getStreak(): Streak {
  return load().streak
}

// ---------------- 奖励兑换商店 ----------------

const DEFAULT_SHOP: ShopItem[] = [
  { id: 'd1', name: '看一集动画片（15分钟）', emoji: '📺', cost: 20 },
  { id: 'd2', name: '和妈妈玩一局桌游', emoji: '🎲', cost: 30 },
  { id: 'd3', name: '周末去公园野餐', emoji: '🧺', cost: 80 },
  { id: 'd4', name: '一个新绘本/新玩具', emoji: '🎁', cost: 120 },
]

export function getShop(): ShopItem[] {
  try {
    const raw = localStorage.getItem(SHOP_KEY)
    if (raw) return JSON.parse(raw) as ShopItem[]
  } catch {
    /* fallthrough */
  }
  return DEFAULT_SHOP
}

/** 家长配置商店（覆盖默认） */
export function setShop(items: ShopItem[]) {
  try {
    localStorage.setItem(SHOP_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function resetShop() {
  try {
    localStorage.removeItem(SHOP_KEY)
  } catch {
    /* ignore */
  }
}

/** 兑换：星星够 → 扣星 + 记录；返回是否成功 */
export function redeem(item: ShopItem): boolean {
  const s = load()
  if (s.stars < item.cost) return false
  s.stars -= item.cost
  s.redeemed.push({ id: item.id, name: item.name, cost: item.cost, at: Date.now() })
  save(s)
  return true
}

export function getRedeemed(): RedeemRecord[] {
  return load().redeemed
}
