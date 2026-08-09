// 勋章系统 + 连击打卡
// 8 枚勋章
import { db } from '@/db/schema'

export interface BadgeDef {
  code: string
  name: string
  description: string
  emoji: string
}

export const BADGES: BadgeDef[] = [
  { code: 'first-step', name: '小小起步', description: '完成第 1 关挑战', emoji: '🐣' },
  { code: 'single-vowel', name: '单韵母小达人', description: '完成第 1 课', emoji: '🎵' },
  { code: 'initial-master', name: '声母全通关', description: '完成 L03-L08 全部', emoji: '🎤' },
  { code: 'final-master', name: '复韵母小专家', description: '完成 L09-L11 全部', emoji: '🎹' },
  { code: 'nasal-challenger', name: '鼻音挑战者', description: '完成 L12-L13 全部', emoji: '🎺' },
  { code: 'error-crusher', name: '错题克星', description: '错题本清空', emoji: '🛡️' },
  { code: 'streak-7', name: '连击王', description: '连续 7 天学习', emoji: '🔥' },
  { code: 'pinyin-champion', name: '拼音小状元', description: '13 课全完成', emoji: '👑' },
  // 老师视角新增：教学里程碑
  { code: 'tone-doctor', name: '标调小博士', description: 'L01-L13 标调全对 50 道', emoji: '🎓' },
  { code: 'sound-distinguish', name: '平翘舌辨音', description: 'L07+L08 圈选全对', emoji: '👂' },
  { code: 'error-streak-10', name: '错题连击 10', description: '连续 10 次错题重做全对', emoji: '💎' },
]

export async function awardBadge(code: string): Promise<boolean> {
  const existing = await db.badges.where('code').equals(code).first()
  if (existing) return false
  await db.badges.add({ code, earnedAt: Date.now() })
  return true
}

export async function checkBadges(lessonId: string, justPassed: boolean) {
  if (!justPassed) return
  // 第一次通关任意一关 → first-step
  await awardBadge('first-step')
  // 完成 L01 → single-vowel
  if (lessonId === 'L01') await awardBadge('single-vowel')
  // 完成 L03-L08 → initial-master
  if (['L03','L04','L05','L06','L07','L08'].includes(lessonId)) {
    const allDone = await checkAllCompleted(['L03','L04','L05','L06','L07','L08'])
    if (allDone) await awardBadge('initial-master')
  }
  // 完成 L09-L11 → final-master
  if (['L09','L10','L11'].includes(lessonId)) {
    const allDone = await checkAllCompleted(['L09','L10','L11'])
    if (allDone) await awardBadge('final-master')
  }
  // 完成 L12-L13 → nasal-challenger
  if (['L12','L13'].includes(lessonId)) {
    const allDone = await checkAllCompleted(['L12','L13'])
    if (allDone) await awardBadge('nasal-challenger')
  }
  // 13 课全完成
  const all13 = await checkAllCompleted(['L01','L02','L03','L04','L05','L06','L07','L08','L09','L10','L11','L12','L13'])
  if (all13) await awardBadge('pinyin-champion')
}

async function checkAllCompleted(ids: string[]): Promise<boolean> {
  for (const id of ids) {
    const r = await db.lessons.get(id)
    if (!r || r.stars === 0) return false
  }
  return true
}

// 错题本清空检测（每次进入错题本时调用）
export async function checkErrorBookEmpty() {
  const count = await db.errorItems.count()
  if (count === 0) await awardBadge('error-crusher')
}

// 连续打卡
import { isYesterday, todayStr } from './schedule'

export async function updateStreak() {
  const sk = await db.streak.get('singleton')
  if (!sk) return
  const today = todayStr()
  if (sk.lastDate === today) return  // 今天已打过
  if (sk.lastDate && isYesterday(today, sk.lastDate)) {
    const newCurrent = sk.current + 1
    await db.streak.update('singleton', {
      current: newCurrent,
      longest: Math.max(sk.longest, newCurrent),
      lastDate: today,
    })
    if (newCurrent >= 7) await awardBadge('streak-7')
  } else {
    // 断了或者第一次
    await db.streak.update('singleton', {
      current: 1,
      longest: Math.max(sk.longest, 1),
      lastDate: today,
    })
  }
}
