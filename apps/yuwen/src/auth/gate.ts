// 与 apps/web/src/auth/gate.ts 存储格式保持一致
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

export function redirectToLogin(fromPath: string) {
  window.location.replace('/?from=' + encodeURIComponent(fromPath))
}
