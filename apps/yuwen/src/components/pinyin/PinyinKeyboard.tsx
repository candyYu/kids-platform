// 9 键拼音小键盘（支持单音节 + 多音节累积输入）
// 顶部四线三格：当前在写的音节
// 9 键布局：
//   声调 4 个 + 间隔 1 个
//   韵母 6-9 个
//   声母 9-12 个
//   操作：清空 / 听我的 / 提交
// 多音节模式：点"·"间隔符提交当前音节到结果，输下一个音节
import { useMemo, useState } from 'react'
import { speakPinyin, speakHanzi } from '@/audio/tts'
import { Icon } from '@/components/icons/Icon'

// 23 声母 + 24 韵母（人教版）
const INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w']
// 23 声母 + 35 韵母（人教版完整版：含整体认读音节的复合韵母）
// 注意：ian/uan/üan/iang/uang/iong 等整体认读韵母必须包含，否则 nián/yuán/yáng 等孩子无法答
const FINALS = [
  // 单韵母 6
  'a', 'o', 'e', 'i', 'u', 'ü',
  // 复韵母 8
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe',
  // 特殊 1
  'er',
  // 前鼻韵母 4
  'an', 'en', 'in', 'un', 'ün',
  // 后鼻韵母 4
  'ang', 'eng', 'ing', 'ong',
  // 整体认读 / 复合韵母 9（人教版必学）
  'ia', 'ua', 'uo', 'uai', 'iao', 'ian', 'uan', 'iang', 'uang',
  'iong', 'üan',
]
const TONE_MARKS = ['\u0304', '\u0301', '\u030C', '\u0300']  // 1-2-3-4

interface Props {
  // 当前的目标答案（用于显示"目标"灰色字）
  target?: string
  // 目标答案对应的汉字（"听一听"按钮走 speakHanzi 路径）
  // 例：target='ní tǔ'（拼音） → targetHanzi='泥土'（汉字）→ 听写用汉字读
  targetHanzi?: string
  // 答对回调（userInput 是已答的完整拼音，多音节用空格分隔）
  onSubmit: (pinyin: string) => void
  // 允许的声调
  maxTone?: 1 | 2 | 3 | 4 | 'any'
  // 是否限制为某课（用于智能推荐按键）
  // undefined=显示全部声母；空数组=不显示声母区；非空数组=只显示命中的
  hintInitials?: string[]
  hintFinals?: string[]
  // 单韵母课模式：L01 完全隐藏声母区（a/o/e 不需要声母）
  // L02 不传 finalsOnly（需要 y/w 声母 + 整体认读）
  finalsOnly?: boolean
  // 是否允许多音节累积输入（默认 true；false = 单音节 1 次提交）
  multiSyllable?: boolean
}

export function PinyinKeyboard({
  target,
  targetHanzi,
  onSubmit,
  maxTone = 'any',
  hintInitials,
  hintFinals,
  finalsOnly = false,
  multiSyllable = true,
}: Props) {
  // 当前正在拼写的音节
  const [init, setInit] = useState<string>('')
  const [fin, setFin] = useState<string>('')
  const [tone, setTone] = useState<number>(0)
  // 已累积提交的音节（用空格分隔），例如 ['mā','ma'] → 显示 "mā ma"
  const [committed, setCommitted] = useState<string[]>([])

  const current = buildPinyin(init, fin, tone)
  // 完整结果显示：已提交 + 当前未完成
  const display = [...committed, current].filter(Boolean).join(' ')
  const isComplete = current !== ''  // 当前有音节可提交/累积
  // 目标答案拆音节数（用于显示"第 N/M 音节"进度）
  const targetSylCount = (target || '').trim().split(/\s+/).filter(Boolean).length
  // 当前第几个音节：已提交 N 个 + 当前正在拼算 1 个（如果 current 非空）→ 至少显示 1
  const currentSylIdx = Math.max(1, committed.length + (current ? 1 : 0))

  const filteredInitials = useMemo(() => {
    if (finalsOnly) return []
    if (hintInitials === undefined) return INITIALS
    if (hintInitials.length === 0) return []
    const set = new Set(hintInitials)
    const hit = INITIALS.filter(i => set.has(i))
    return hit.length > 0 ? hit : INITIALS
  }, [hintInitials, finalsOnly])

  const filteredFinals = useMemo(() => {
    if (!hintFinals || hintFinals.length === 0) return FINALS
    const stripTone = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const expanded: string[] = []
    for (const f of hintFinals) {
      const parts = f.split(/\s+/).filter(Boolean)
      for (const p of parts) expanded.push(p, stripTone(p))
    }
    const set = new Set(expanded)
    const hit = FINALS.filter(f => set.has(f))
    return hit.length > 0 ? hit : FINALS
  }, [hintFinals])

  // 累积音节：把当前音节加到 committed，清空 init/fin/tone
  const commitCurrent = () => {
    if (!current) return
    setCommitted([...committed, current])
    setInit('')
    setFin('')
    setTone(0)
  }
  // 撤销最后一个已提交音节（回退到编辑）
  const undoLast = () => {
    if (committed.length === 0) return
    const last = committed[committed.length - 1]
    // 把 last 重新填回 init/fin/tone（解析"fā" → init='f', fin='a', tone=1）
    setCommitted(committed.slice(0, -1))
    const parsed = parsePinyin(last)
    setInit(parsed.init)
    setFin(parsed.fin)
    setTone(parsed.tone)
  }
  // 全部清空
  const clearAll = () => {
    setCommitted([])
    setInit('')
    setFin('')
    setTone(0)
  }
  // 听"目标"：用 targetHanzi 走 speakHanzi，否则切片 speakPinyin
  const listenTarget = () => {
    if (targetHanzi) {
      void speakHanzi(targetHanzi)
    } else if (target) {
      const syls = target.split(/\s+/).filter(Boolean)
      void playSequence(syls, targetHanzi)
    }
  }
  // 听"单音节"：用 speakPinyin 切片（带 fallbackHanzi，speakPinyin 内部会传给 speakHanzi）
  const listenSyl = (s: string) => {
    // 如果 targetHanzi 存在且 target 是单音节，把整个 targetHanzi 当 fallback
    const fallback = targetHanzi && target && !target.includes(' ') ? targetHanzi : undefined
    void speakPinyin(s, { fallbackHanzi: fallback })
  }
  // 提交：拼成完整答案传给 onSubmit
  const submit = () => {
    const finalAnswer = [...committed, current].filter(Boolean).join(' ')
    if (!finalAnswer) return
    onSubmit(finalAnswer)
  }

  return (
    <div>
      {/* 顶部：已答音节 + 当前音节 + 目标提示 */}
      <div className="paper-card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {/* 已答的音节（可点击编辑/删除的小 chip） */}
            {committed.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mb-1">
                {committed.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-pig-100 text-pig-700 rounded-pill text-sm pinyin-char"
                  >
                    <button
                      onClick={() => {
                        // 把这个音节回填到 init/fin/tone，删除 committed 里这个
                        const parsed = parsePinyin(s)
                        setCommitted([...committed.slice(0, idx), ...committed.slice(idx + 1)])
                        setInit(parsed.init)
                        setFin(parsed.fin)
                        setTone(parsed.tone)
                      }}
                      className="font-bold active:scale-95"
                      title="点我编辑"
                    >
                      {s}
                    </button>
                    <button
                      onClick={() => setCommitted([...committed.slice(0, idx), ...committed.slice(idx + 1)])}
                      className="text-pig-500 hover:text-pig-700 active:scale-95"
                      title="删除"
                      aria-label={`删除 ${s}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* 当前在写的音节（大字） */}
            <div className="text-5xl pinyin-char font-bold text-sea-900 min-h-[60px] flex items-center">
              {current || <span className="text-pig-200 text-3xl">?</span>}
            </div>
            {/* 进度提示：第 N/M 音节 */}
            {multiSyllable && targetSylCount > 1 && (
              <p className="text-xs text-pig-500 mt-1">
                第 {Math.min(currentSylIdx, targetSylCount)} / {targetSylCount} 个音节
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={listenTarget}
              className="px-4 py-2 bg-pig-500 text-white rounded-pill text-sm active:scale-95 flex items-center gap-1 shadow-bubble"
              aria-label="听发音"
            >
              <Icon name="volume" size={18} strokeWidth={2.4} />
              <span className="font-bold">听</span>
            </button>
          </div>
        </div>
      </div>

      {/* 声调键 + 间隔键 */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[1, 2, 3, 4].map(t => (
          <button
            key={t}
            onClick={() => setTone(t === tone ? 0 : t)}
            className={`py-3 rounded-soft text-child-lg font-bold pinyin-char transition ${
              tone === t
                ? 'bg-sun-500 text-white shadow-lift'
                : 'bg-white text-pig-700 border-2 border-pig-100 active:scale-95'
            }`}
          >
            {['ˉ', 'ˊ', 'ˇ', 'ˋ'][t - 1]}
          </button>
        ))}
        {/* 间隔符键：累积当前音节，进入下一个 */}
        {multiSyllable && (
          <button
            onClick={commitCurrent}
            disabled={!isComplete}
            className={`py-3 rounded-soft text-child font-bold transition ${
              isComplete
                ? 'bg-sea-100 text-sea-900 border-2 border-sea-300 active:scale-95'
                : 'bg-slate-50 text-slate-300 border-2 border-slate-100 cursor-not-allowed'
            }`}
            title="加一个音节"
          >
            · 下个
          </button>
        )}
      </div>

      {/* 韵母键 */}
      <div className="mb-2">
        <p className="text-xs text-pig-500 mb-1 px-1">韵母</p>
        <div className={`grid gap-2 ${
          filteredFinals.length <= 3 ? 'grid-cols-3' :
          filteredFinals.length <= 6 ? 'grid-cols-6' : 'grid-cols-8'
        }`}>
          {filteredFinals.map(f => (
            <button
              key={f}
              onClick={() => setFin(f === fin ? '' : f)}
              className={`py-3 rounded-soft pinyin-char text-child font-bold transition ${
                fin === f
                  ? 'bg-pig-700 text-white shadow-lift'
                  : 'bg-white text-sea-900 border-2 border-pig-100 active:scale-95'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 声母键（如果有）*/}
      {filteredInitials.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-pig-500 mb-1 px-1">声母</p>
          <div className="grid grid-cols-8 gap-1">
            {filteredInitials.map(i => (
              <button
                key={i}
                onClick={() => setInit(i === init ? '' : i)}
                className={`py-2 rounded-soft pinyin-char text-sm font-bold transition ${
                  init === i
                    ? 'bg-pig-700 text-white'
                    : 'bg-white text-sea-900 border border-pig-100 active:scale-95'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 操作 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={clearAll}
          className="py-3 rounded-soft bg-cream-100 text-pig-700 border border-pig-100 text-sm font-bold active:scale-95"
        >
          清空
        </button>
        <button
          onClick={undoLast}
          disabled={committed.length === 0}
          className={`py-3 rounded-soft text-sm font-bold active:scale-95 transition ${
            committed.length > 0
              ? 'bg-cream-200 text-pig-700 border border-pig-200'
              : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
          }`}
        >
          撤销 ↶
        </button>
        <button
          onClick={submit}
          disabled={!isComplete && committed.length === 0}
          className={`py-3 rounded-soft text-sm font-bold active:scale-95 transition ${
            isComplete || committed.length > 0
              ? 'bg-pig-700 text-white shadow-bubble'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          提交 ✓
        </button>
      </div>
    </div>
  )
}

// 按空格分隔的音节，逐个调用 speakPinyin
async function playSequence(syllables: string[], fallbackHanzi?: string) {
  for (const s of syllables) {
    await speakPinyin(s, { fallbackHanzi })
    // 给每个音节留 100ms 间隔
    await new Promise(r => setTimeout(r, 100))
  }
}

// 拼音构造
function buildPinyin(init: string, fin: string, tone: number): string {
  if (!init && !fin) return ''
  const base = init + fin
  if (tone === 0) return base
  return applyTone(base, tone as 1 | 2 | 3 | 4)
}

// 声调打到字母正上方（人教版标调规则）
function applyTone(base: string, tone: 1 | 2 | 3 | 4): string {
  const chars: string[] = Array.from(base)
  // 1. 有 a → 标 a
  const aIdx = chars.indexOf('a')
  if (aIdx >= 0) {
    chars[aIdx] = chars[aIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 2. 没 a 有 o → 标 o
  const oIdx = chars.indexOf('o')
  if (oIdx >= 0) {
    chars[oIdx] = chars[oIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 3. 没 a/o 有 e → 标 e
  const eIdx = chars.indexOf('e')
  if (eIdx >= 0) {
    chars[eIdx] = chars[eIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 4. 有 i+u（iu/ui 标后规则）
  const iIdx = chars.indexOf('i')
  const uIdx = chars.indexOf('u')
  const vIdx = chars.indexOf('ü')
  // 4a. 同时有 i 和 u：i 在前（iu）标 u，i 在后（ui）标 i
  if (iIdx >= 0 && uIdx >= 0) {
    const idx = iIdx < uIdx ? uIdx : iIdx
    chars[idx] = chars[idx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 4b. 只有 i（hi/bi/yi/...）→ 标 i
  if (iIdx >= 0) {
    chars[iIdx] = chars[iIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 4c. 只有 u（wu/bu/gu/...）→ 标 u
  if (uIdx >= 0) {
    chars[uIdx] = chars[uIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 4d. 只有 ü（nǚ/lǜ/...）→ 标 ü（jqx+ü 在键盘上 u 和 ü 是分开的）
  if (vIdx >= 0) {
    chars[vIdx] = chars[vIdx] + TONE_MARKS[tone - 1]
    return chars.join('')
  }
  // 5. 兜底（整体认读 zhi/chi/shi/ri 这种无元音的）：不标
  return base
}

// 反向解析：'fā' → { init:'f', fin:'a', tone:1 }（用于撤销恢复）
function parsePinyin(syl: string): { init: string; fin: string; tone: number } {
  // 先 NFC 化，再 NFD 拆声调
  const nfc = syl.normalize('NFC')
  // 找声母（按长度优先：zh/ch/sh）
  const ALL_INIT = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']
  let init = ''
  for (const i of ALL_INIT) {
    if (nfc.toLowerCase().startsWith(i)) { init = i; break }
  }
  const rest = nfc.slice(init.length)
  // 拆声调
  const nfd = rest.normalize('NFD')
  let fin = ''
  let tone = 0
  for (const ch of nfd) {
    const code = ch.codePointAt(0) || 0
    if (code >= 0x0300 && code <= 0x036f) {
      // 组合符
      if (code === 0x0304) tone = 1
      else if (code === 0x0301) tone = 2
      else if (code === 0x030C) tone = 3
      else if (code === 0x0300) tone = 4
    } else {
      fin += ch
    }
  }
  return { init, fin, tone }
}
