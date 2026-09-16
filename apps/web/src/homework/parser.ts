// OSS 作业文本解析器 —— 与 scripts/oss/upload-homework.py 的 parse_homework 行为一致。
// 文件按学科分块：学科行（可独占一行或同行带内容）开始一块，其后的行都属于该科，
// 直到下一个学科行。# 注释与空行忽略。
//
// 之所以 TS 和 Python 各实现一遍：家长端脚本在本地预校验拦坏文件，
// 孩子端 web 直接解析同一文本，两处必须语义一致（由各自测试锁定）。

export type Subject = '语文' | '数学' | '英语' | '小提琴'

export interface HomeworkEntry {
  subject: Subject
  /** 该学科下的多条要求（已去掉编号之外的原文） */
  lines: string[]
  /** 内容里出现「摘星卡第N课」时的课次，否则 null（「摘星本P1」是纸质本页码，不匹配） */
  starCardLesson: number | null
}

export interface ParseResult {
  entries: HomeworkEntry[]
  /** 学科行之外、没有归属学科的游离行（1 起行号 + 原文） */
  orphans: { lineNo: number; text: string }[]
}

const SUBJECTS: Subject[] = ['语文', '数学', '英语', '小提琴']
const SUBJECT_RE = /^(语文|数学|英语|小提琴)(?:[ \t]+(.*))?$/
const STARCARD_RE = /摘星卡第?\s*(\d+)\s*课/

export function parseHomework(text: string): ParseResult {
  const entries: HomeworkEntry[] = []
  const orphans: { lineNo: number; text: string }[] = []
  let current: HomeworkEntry | null = null

  text.split(/\r?\n/).forEach((raw, idx) => {
    const lineNo = idx + 1
    const stripped = raw.trim()
    if (!stripped || stripped.startsWith('#')) return

    const m = SUBJECT_RE.exec(stripped)
    if (m) {
      current = { subject: m[1] as Subject, lines: [], starCardLesson: null }
      entries.push(current)
      const inline = (m[2] ?? '').trim()
      if (inline) current.lines.push(inline)
      return
    }
    if (!current) {
      orphans.push({ lineNo, text: raw })
      return
    }
    current.lines.push(stripped)
  })

  // 空学科块（如「数学」下面没内容）与挂摘星卡课次，在收集完后统一处理
  const filled = entries.filter((e) => e.lines.length > 0)
  for (const e of filled) {
    const mm = STARCARD_RE.exec(e.lines.join('\n'))
    e.starCardLesson = mm ? Number(mm[1]) : null
  }

  return { entries: filled, orphans }
}
