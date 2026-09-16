import { useEffect, useState } from 'react'
import { parseHomework, type HomeworkEntry } from './parser'
import { homeworkUrl } from './oss'

export type HomeworkStatus = 'loading' | 'ok' | 'empty' | 'error'

export interface HomeworkState {
  status: HomeworkStatus
  entries: HomeworkEntry[]
  /** 解析时发现的游离行（家长文件写错时给个温和提示，不影响正常条目展示） */
  orphans: number
  errorMessage?: string
  reload: () => void
}

// 打勾只存本机（家长电脑与 pad 物理隔离，已知并接受）。
// key 与学科+条目内容绑定：家长换了作业内容，旧勾自动失效。
const CHECKS_KEY = 'kids_homework_checks_v1'

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

export function useHomework(): HomeworkState {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<HomeworkState>({
    status: 'loading', entries: [], orphans: 0, reload: () => setTick((t) => t + 1),
  })

  useEffect(() => {
    let cancelled = false
    fetch(homeworkUrl(), { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        const { entries, orphans } = parseHomework(text.replace(/^\uFEFF/, ''))
        if (cancelled) return
        setState((s) => ({
          ...s,
          status: entries.length ? 'ok' : 'empty',
          entries,
          orphans: orphans.length,
          errorMessage: undefined,
        }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // 404 = 家长还没传过作业，等同"没有作业"；其余网络问题才报错。
        const msg = err instanceof Error ? err.message : String(err)
        const notFound = msg.includes('404')
        setState((s) => ({
          ...s,
          status: notFound ? 'empty' : 'error',
          entries: [],
          orphans: 0,
          errorMessage: notFound ? undefined : msg,
        }))
      })
    return () => { cancelled = true }
  }, [tick])

  return state
}
