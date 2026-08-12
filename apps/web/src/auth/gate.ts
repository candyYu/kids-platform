// 统一密码 gate：用 sessionStorage + localStorage 双保险
// 所有三个子应用都从这个模块读取 unlocked 状态，保证从门户进来后子页面不再重复问密码
//
// 工作原理：
// 1. 用户在 web 门户输入正确密码后，写入 sessionStorage（当前标签页会话）
//    以及 localStorage（跨标签页/刷新都保留 7 天）
// 2. music / yuwen 子应用启动时检查同一份 localStorage，有记录就直接放行
// 3. 提供一个 logout() 清除记录（将来需要时可以在家长报告里加按钮）
//
// 注意：这只是防君子不防小人，6 位数字密码对 6 岁孩子够用了，
// 不是真的安全机制——代码公开在 GitHub 上，任何人都能看到默认密码。
// 真正的访问控制要在服务端做，这个静态站做不到。

const STORAGE_KEY = 'kids-platform-unlocked'
const SESSION_KEY = 'kids-platform-unlocked-session'
// localStorage 记录 7 天后过期，避免永久解锁
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function isUnlocked(): boolean {
  try {
    // sessionStorage 优先级最高（当前标签页内一定通过）
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

export function setUnlocked() {
  try {
    sessionStorage.setItem(SESSION_KEY, 'yes')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }))
  } catch {}
}

export function lockAll() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
