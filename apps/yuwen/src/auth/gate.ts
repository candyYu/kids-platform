// 与 apps/web/src/auth/gate.ts 存储格式保持一致
const STORAGE_KEY = 'kids-platform-unlocked'
const SESSION_KEY = 'kids-platform-unlocked-session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function isUnlocked(): boolean {
  // 本地 dev：跳过密码门（开发时不想每次重启 dev server 都输密码）
  // 生产环境 import.meta.env.DEV === false，正常走 localStorage/sessionStorage 校验
  if (import.meta.env.DEV) return true
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
  // dev 模式：门户在 5173，子应用在 5174/5175，必须换 origin
  // prod 模式：同源，跳根路径即可
  const target = import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5173/?from=${encodeURIComponent(fromPath)}`
    : `/?from=${encodeURIComponent(fromPath)}`
  window.location.replace(target)
}
