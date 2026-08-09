// 错题推送的艾宾浩斯曲线
// 错题时进入错题本；答对一次后 nextReviewAt 推到下一阶段
// 错题答对 3 次后从错题本移除

export type ReviewPhase = 0 | 1 | 2 | 3  // 0=当天, 1=1天后, 2=3天后, 3=7天后

const PHASE_DAYS: Record<ReviewPhase, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
}

export function nextReviewDate(currentPhase: ReviewPhase): number {
  const days = PHASE_DAYS[currentPhase]
  return Date.now() + days * 24 * 60 * 60 * 1000
}

export function nextPhase(currentPhase: ReviewPhase): ReviewPhase {
  return Math.min(3, currentPhase + 1) as ReviewPhase
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isYesterday(today: string, last: string): boolean {
  const t = new Date(today)
  const l = new Date(last)
  const diff = (t.getTime() - l.getTime()) / (24 * 60 * 60 * 1000)
  return diff >= 1 && diff < 2
}

// 错题"复习紧急度"：nextReviewAt 越近越靠前
// 已过 due 的题目会排在最前
export function errorUrgency(nextReviewAt: number): number {
  return nextReviewAt - Date.now()
}
