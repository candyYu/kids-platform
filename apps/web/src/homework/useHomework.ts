import { useEffect, useState } from 'react'
import { parseHomework, type HomeworkEntry } from './parser'
import { homeworkUrl } from './oss'

export type HomeworkStatus = 'loading' | 'ok' | 'empty' | 'error' | 'stale'

export interface HomeworkState {
  status: HomeworkStatus
  entries: HomeworkEntry[]
  /** 解析时发现的游离行（家长文件写错时给个温和提示，不影响正常条目展示） */
  orphans: number
  /** stale=网络失败，正在展示本机上次成功拉到的作业 */
  staleNote?: string
  errorMessage?: string
  /** 当前作业内容指纹：领奖去重按"日期+指纹"，家长改了作业可重新挣一颗 */
  fingerprint: string
  reload: () => void
}

// 打勾只存本机（家长电脑与 pad 物理隔离，已知并接受）。
// key 与学科+条目内容绑定：家长换了作业内容，旧勾自动失效。
const CHECKS_KEY = 'kids_homework_checks_v1'
// 上次成功拉到的作业全文：网络抖动 / OSS 配置问题时兜底展示，不用干瞪眼。
const LAST_OK_KEY = 'kids_homework_last_v1'
// UTF-8 BOM，用转义序列写避免源文件里混入不可见字符。
const BOM_REGEX = new RegExp('^\\uFEFF')

const FETCH_TIMEOUT_MS = 8000
const RETRY_DELAY_MS = 800
// 内存缓存：首页入口和作业页同一次打开会先后挂载，30s 内复用同一份拉取结果，
// 不让弱网 pad 对同一个小文件发两次请求。错误结果不缓存。
const MEM_TTL_MS = 30_000
let memCache: { at: number; result: FetchResult } | null = null

export function loadChecks(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CHECKS_KEY) || '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

export function entryCheckKey(subject: string, line: string): string {
  return `${subject}::${line}`
}

export function toggleCheck(key: string, checked: boolean) {
  const checks = loadChecks()
  if (checked) checks[key] = true
  else delete checks[key]
  try {
    localStorage.setItem(CHECKS_KEY, JSON.stringify(checks))
  } catch {
    /* 存储满不影响主流程 */
  }
}

interface ParsedCache {
  entries: HomeworkEntry[]
  orphans: number
}

function saveLastOk(text: string) {
  try {
    localStorage.setItem(LAST_OK_KEY, JSON.stringify({ text, savedAt: Date.now() }))
  } catch {
    /* 存储满/隐私模式不影响主流程 */
  }
}

function loadLastOk(): ParsedCache | null {
  try {
    const raw = localStorage.getItem(LAST_OK_KEY)
    if (!raw) return null
    const { text } = JSON.parse(raw) as { text: string }
    const parsed = parseHomework(text.replace(BOM_REGEX, ''))
    if (!parsed.entries.length) return null
    return { entries: parsed.entries, orphans: parsed.orphans.length }
  } catch {
    return null
  }
}

// 带超时的 fetch（AbortController）：OSS 挂住时不会无限"正在取作业"
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { cache: 'no-store', signal: ctrl.signal })
    .finally(() => clearTimeout(timer))
}

// 简单稳定指纹（djb2）：只用于区分"作业内容是否变了"，不需要加密强度
function fingerprintOfEntries(entries: HomeworkEntry[]): string {
  const text = entries.map((e) => `${e.subject}:${e.lines.join('|')}`).join('||')
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

interface FetchResult {
  status: 'ok' | 'empty'
  entries: HomeworkEntry[]
  orphans: number
  text: string
  fingerprint: string
}

async function fetchHomework(force = false): Promise<FetchResult> {
  if (!force && memCache && Date.now() - memCache.at < MEM_TTL_MS) {
    return memCache.result
  }
  // 网络抖动重试 1 次；CORS 类硬性错误重试也没用，但一次重试成本很低、能救弱网
  let lastErr: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(homeworkUrl(), FETCH_TIMEOUT_MS)
      // 404 = 家长还没传过作业，等同"没有作业"
      if (res.status === 404) {
        const r: FetchResult = { status: 'empty', entries: [], orphans: 0, text: '', fingerprint: '' }
        memCache = { at: Date.now(), result: r }
        return r
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      const { entries, orphans } = parseHomework(text.replace(BOM_REGEX, ''))
      if (!entries.length) {
        const r: FetchResult = { status: 'empty', entries: [], orphans: orphans.length, text, fingerprint: '' }
        memCache = { at: Date.now(), result: r }
        return r
      }
      const r: FetchResult = { status: 'ok', entries, orphans: orphans.length, text, fingerprint: fingerprintOfEntries(entries) }
      memCache = { at: Date.now(), result: r }
      return r
    } catch (e) {
      lastErr = e
      if (attempt === 0) await new Promise((r2) => setTimeout(r2, RETRY_DELAY_MS))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

export function useHomework(): HomeworkState {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<HomeworkState>({
    status: 'loading', entries: [], orphans: 0, fingerprint: '',
    reload: () => setTick((t) => t + 1),
  })

  useEffect(() => {
    let cancelled = false
    fetchHomework(tick > 0)
      .then((r) => {
        if (cancelled) return
        if (r.status === 'empty') {
          setState((s) => ({
            ...s, status: 'empty', entries: [], orphans: 0, fingerprint: '',
            staleNote: undefined, errorMessage: undefined,
          }))
          return
        }
        saveLastOk(r.text)
        setState((s) => ({
          ...s, status: 'ok', entries: r.entries, orphans: r.orphans, fingerprint: r.fingerprint,
          staleNote: undefined, errorMessage: undefined,
        }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        const cached = loadLastOk()
        if (cached) {
          // 有上次成功内容：照常展示，只在顶部加一条小字提示，孩子照样能做作业
          setState((s) => ({
            ...s, status: 'stale', entries: cached.entries, orphans: cached.orphans,
            fingerprint: s.fingerprint || fingerprintOfEntries(cached.entries),
            staleNote: '网络没连上，显示的是上次的作业', errorMessage: msg,
          }))
        } else {
          setState((s) => ({
            ...s, status: 'error', entries: [], orphans: 0, fingerprint: '',
            staleNote: undefined, errorMessage: msg,
          }))
        }
      })
    return () => { cancelled = true }
  }, [tick])

  return state
}
