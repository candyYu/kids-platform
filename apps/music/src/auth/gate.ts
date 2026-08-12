// 统一密码 gate 客户端（music / yuwen 子应用用）
// 与 apps/web/src/auth/gate.ts 存储格式保持一致，localStorage 跨子路径共享
//
// 任何子应用启动时先调 isUnlocked()，如果没解锁就跳回门户 /?from=music 让用户输密码
// 解锁后 7 天内不再问

const STORAGE_KEY = 'kids-platform-unlocked'
const SESSION_KEY = 'kids-platform-unlocked-session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function isUnlocked(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY) === 'yes') return true
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const { ts } = JSON.parse(raw)
    if (typeof ts !== 'number') return false
    if (Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return false
    }
    return true
  } catch {
    return false
  }
}

/** 跳回门户输密码，带上来源以便登录后跳回（可选，门户目前不读这个参数） */
export function redirectToLogin(fromPath: string) {
  // 门户在根路径 /，子应用在 /music、/yuwen
  // 用 replace 避免在历史里留下登录页
  window.location.replace('/?from=' + encodeURIComponent(fromPath))
}
