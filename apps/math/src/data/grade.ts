// 年级判定：入口 URL ?g=1/2 设置，localStorage 持久（与语文应用同款机制，key 区分）
import type { Grade } from '@/db/schema'

const KEY = 'math-grade'

function init(): Grade {
  try {
    const p = new URLSearchParams(window.location.search).get('g')
    if (p === '1' || p === '2') localStorage.setItem(KEY, p)
    const saved = localStorage.getItem(KEY)
    if (saved === '1' || saved === '2') return saved
  } catch { /* 隐私模式 */ }
  return '1'
}

export const ACTIVE_GRADE: Grade = init()
export const GRADE_LABEL = ACTIVE_GRADE === '2' ? '二年级' : '一年级'
