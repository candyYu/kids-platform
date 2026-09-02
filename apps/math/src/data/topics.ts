// 口算题目生成器：纯程序生成，无限题库，不依赖课本 PDF
// 题目范围对齐教材：
//   1年级（六年制通用）：20以内加减法（含进/退位）
//   2年级（妹娃·五四制青岛版重点）：乘法口诀、表内除法、有余数除法
import type { Grade } from '@/db/schema'

export type Op = '+' | '-' | '×' | '÷'

export interface Problem {
  a: number
  op: Op
  b: number
  ans: number
  rem?: number      // 有余数除法的余数（twoStage 题）
  expr: string      // 屏显：'3 + 5 = ?'
  prompt: string    // 中文读题：'三加五'
}

export interface Topic {
  id: string
  g: Grade
  name: string
  emoji: string
  desc: string
  twoStage?: boolean        // true = 先答商再答余数
  nextTerm?: boolean        // true = 下学期内容，首页默认折叠（保护动机）
  gen: (avoid?: string) => Problem
}

// ---------- 工具 ----------

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 1-99 转中文（读题用）：27 → 二十七，10 → 十，17 → 十七 */
export function numToCn(n: number): string {
  if (n < 10) return DIGITS[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const t = tens === 1 ? '十' : DIGITS[tens] + '十'
  return ones === 0 ? t : t + DIGITS[ones]
}

const OP_CN: Record<Op, string> = { '+': '加', '-': '减', '×': '乘', '÷': '除以' }

function mk(a: number, op: Op, b: number, ans: number, rem?: number): Problem {
  return {
    a, op, b, ans, rem,
    expr: `${a} ${op} ${b} = ?`,
    prompt: `${numToCn(a)}${OP_CN[op]}${numToCn(b)}`,
  }
}

/** 生成并避免与上一题完全一样 */
function dedupe(avoid: string | undefined, f: () => Problem): Problem {
  for (let i = 0; i < 20; i++) {
    const p = f()
    if (p.expr !== avoid) return p
  }
  return f()
}

// ---------- 题目池 ----------

// —— 一年级（六年制人教 2024 新版）——
// 1上：5以内加减 → 6~10加减 → 学期末 20以内进位加
// 1下：20以内退位减 → 100以内

const add10 = (avoid?: string) => dedupe(avoid, () => {
  const a = rnd(1, 9)
  const b = rnd(1, 10 - a)
  return mk(a, '+', b, a + b)
})

const sub10 = (avoid?: string) => dedupe(avoid, () => {
  const a = rnd(2, 10)
  const b = rnd(1, a - 1)
  return mk(a, '-', b, a - b)
})

const mix10 = (avoid?: string) => (Math.random() < 0.5 ? add10(avoid) : sub10(avoid))

/** 20以内进位加：个位相加满十（9+4、7+8 这类） */
const add20car = (avoid?: string) => dedupe(avoid, () => {
  for (let i = 0; i < 30; i++) {
    const a = rnd(2, 9)
    const b = rnd(2, 9)
    if (a + b >= 11) return mk(a, '+', b, a + b)
  }
  return mk(9, '+', 9, 18)
})

/** 20以内退位减：个位不够减（13-5、15-8 这类） */
const sub20borrow = (avoid?: string) => dedupe(avoid, () => {
  for (let i = 0; i < 30; i++) {
    const a = rnd(11, 18)
    const b = rnd(2, 9)
    if (b > a % 10) return mk(a, '-', b, a - b)   // 个位不够减=退位
  }
  return mk(13, '-', 5, 8)
})

const add20 = (avoid?: string) => dedupe(avoid, () => {
  const a = rnd(1, 19)
  const b = rnd(1, 20 - a)
  return mk(a, '+', b, a + b)
})

const sub20 = (avoid?: string) => dedupe(avoid, () => {
  const a = rnd(2, 20)
  const b = rnd(1, a - 1)
  return mk(a, '-', b, a - b)
})

const mix20 = (avoid?: string) => (Math.random() < 0.5 ? add20(avoid) : sub20(avoid))

// —— 二年级（人教 2024 新版）——
// 2上：1~6的表内乘法 → 1~6的表内除法；2下：有余数的除法

const mul16 = (avoid?: string) => dedupe(avoid, () => {
  const a = rnd(1, 6)
  const b = rnd(1, 6)
  return mk(a, '×', b, a * b)
})

const div16 = (avoid?: string) => dedupe(avoid, () => {
  const b = rnd(2, 6)
  const q = rnd(1, 6)
  return mk(b * q, '÷', b, q)
})

const mix16 = (avoid?: string) => (Math.random() < 0.5 ? mul16(avoid) : div16(avoid))

const divRem = (avoid?: string) => dedupe(avoid, () => {
  const b = rnd(2, 6)
  const q = rnd(1, 6)
  const r = rnd(1, b - 1)
  const p = mk(b * q + r, '÷', b, q, r)
  return p
})

// ---------- 年级题卡（按课本单元标注进度） ----------

export const TOPICS: Topic[] = [
  // 一年级
  { id: 'mix10', g: '1', name: '10以内加减', emoji: '🌱', desc: '本学期 · 5~10的加减法', gen: mix10 },
  { id: 'add20car', g: '1', name: '进位加法', emoji: '➕', desc: '学期末 · 20以内进位加', gen: add20car },
  { id: 'sub20borrow', g: '1', name: '退位减法', emoji: '➖', desc: '下学期 · 20以内退位减', gen: sub20borrow, nextTerm: true },
  { id: 'mix20', g: '1', name: '20以内混合', emoji: '🎲', desc: '综合挑战', gen: mix20 },
  // 二年级
  { id: 'mul16', g: '2', name: '乘法口诀', emoji: '✖️', desc: '本学期 · 1~6的表内乘法', gen: mul16 },
  { id: 'div16', g: '2', name: '表内除法', emoji: '➗', desc: '本学期 · 1~6的表内除法', gen: div16 },
  { id: 'mix16', g: '2', name: '乘除混合', emoji: '🎲', desc: '综合挑战', gen: mix16 },
  { id: 'divRem', g: '2', name: '有余数除法', emoji: '🧩', desc: '下学期 · 先商后余两步答', gen: divRem, twoStage: true, nextTerm: true },
]

export function topicsOf(g: Grade): Topic[] {
  return TOPICS.filter(t => t.g === g)
}

export function topicById(id: string): Topic | undefined {
  return TOPICS.find(t => t.id === id)
}

/** 一组练习 = 10 题 */
export function makeSession(topic: Topic, n = 10): Problem[] {
  const out: Problem[] = []
  for (let i = 0; i < n; i++) {
    out.push(topic.gen(out[i - 1]?.expr))
  }
  return out
}

/** 原地洗牌（Fisher-Yates） */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
