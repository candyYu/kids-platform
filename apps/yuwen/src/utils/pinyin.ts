// 拼音工具：声调、ü 省略、j q x 规则
// 完整拼音音节表（按人教版部编版）
// 格式：{ base: 'ma', tones: ['mā','má','mǎ','mà'] }

export const TONE_MARKS = ['\u0304', '\u0301', '\u030C', '\u0300'] as const  // 1-2-3-4 声
export const TONE_CHARS = ['ˉ', 'ˊ', 'ˇ', 'ˋ'] as const

// 标调规则：ü 标调在 u 上（去两点后）
// i u 并列标在后
export function applyTone(base: string, tone: 1 | 2 | 3 | 4): string {
  // 找到主元音位置
  const chars: string[] = Array.from(base)
  // 优先规则：i u 并列 → 标后
  let idx = -1
  const hasIU = chars.includes('i') && chars.includes('u')
  const lastIU = Math.max(chars.lastIndexOf('i'), chars.lastIndexOf('u'))
  if (hasIU) {
    idx = lastIU
  } else {
    for (let i = chars.length - 1; i >= 0; i--) {
      if ('aeiouü'.includes(chars[i])) {
        idx = i
        break
      }
    }
  }
  if (idx < 0) return base
  const mark = TONE_MARKS[tone - 1]
  chars[idx] = chars[idx] + mark
  return chars.join('')
}

// j q x + ü → u 省略两点
export function jqxUmlaut(syllable: string): string {
  // 找出 j/q/x 后的 ü，替换为 u
  return syllable.replace(/([jqx])ü/g, '$1u')
}

// 标点转换：ü → v 在英文场景
export function uToV(s: string): string {
  return s.replace(/ü/g, 'v')
}
export function vToU(s: string): string {
  return s.replace(/v/g, 'ü')
}

// 对比两个拼音（去声调后比对）
export function comparePinyin(a: string, b: string, ignoreTone = false): boolean {
  const norm = (s: string) => s.replace(/[\u0304\u0301\u030C\u0300]/g, '').toLowerCase().trim()
  const na = norm(a)
  const nb = norm(b)
  if (ignoreTone) return na === nb
  return a.trim() === b.trim()
}

// 严格比较两个拼音（统一 NFC 化，统一小写，统一 jqx ü→u 后比较）
// 解决"答案 fā (NFC U+0101) vs 键盘输出 fà (NFD a+0300)" 不匹配问题
export function equalPinyin(a: string, b: string, ignoreTone = false): boolean {
  // 规范化单音节：NFC + NFD 拆声调 + jqx ü→u + 小写
  const normShape = (s: string) =>
    s.normalize('NFC')
     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // 拆出所有组合符
     .replace(/([jqx])ü/g, '$1u')
     .toLowerCase()
     .replace(/\s+/g, '')
  // 规范化单音节：保留声调
  const normWithTone = (s: string) =>
    s.normalize('NFC')
     .replace(/([jqx])ü/g, '$1u')
     .toLowerCase()
     .replace(/\s+/g, '')
  const normFn = ignoreTone ? normShape : normWithTone
  const sylA = a.trim().split(/\s+/).filter(Boolean)
  const sylB = b.trim().split(/\s+/).filter(Boolean)
  if (sylA.length !== sylB.length) return false
  return sylA.every((sa, i) => normFn(sa) === normFn(sylB[i]))
}

// 随机打乱
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
