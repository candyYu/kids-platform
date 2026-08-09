// 13 种题型的统一渲染器
// 根据 Question.type 渲染对应组件

import { useState } from 'react'
import type { Question } from '@/data/questions'
import { FourLineRow, FourLineGrid } from '@/components/pinyin/FourLineGrid'
import { LetterCard } from '@/components/pinyin/LetterCard'
import { SpeakButton } from '@/components/pinyin/SpeakButton'
import { PinyinKeyboard } from '@/components/pinyin/PinyinKeyboard'
import { AnswerFeedback } from '@/components/feedback/AnswerFeedback'
import { comparePinyin, jqxUmlaut } from '@/utils/pinyin'
import { db } from '@/db/schema'
import { nextReviewDate } from '@/utils/schedule'
import { speakHanzi } from '@/audio/tts'
import { Icon } from '@/components/icons/Icon'

interface Props {
  question: Question
  onAnswer: (correct: boolean) => void
}

export function QuestionRenderer({ question, onAnswer }: Props) {
  // 通用：判对错后弹反馈
  const [feedback, setFeedback] = useState<{ correct: boolean; showAnswer?: string } | null>(null)

  const handleCorrect = () => {
    setFeedback({ correct: true })
  }
  const handleWrong = (showAnswer?: string) => {
    // 错题入错题本
    void saveErrorItem(question, '')
    setFeedback({ correct: false, showAnswer })
  }
  const continueFromFeedback = () => {
    const wasCorrect = feedback?.correct ?? false
    setFeedback(null)
    onAnswer(wasCorrect)
  }

  return (
    <div>
      <PromptArea question={question} />
      {renderBody(question, handleCorrect, handleWrong)}
      {feedback && (
        <AnswerFeedback
          correct={feedback.correct}
          showAnswer={feedback.showAnswer}
          onContinue={continueFromFeedback}
        />
      )}
    </div>
  )
}

function PromptArea({ question }: { question: Question }) {
  return (
    <div className="text-center mb-6">
      <p className="text-child-lg font-bold text-sea-900 mb-1">{question.prompt}</p>
      {question.promptPinyin && (
        <p className="text-sm text-pig-500/70 pinyin-char">{question.promptPinyin}</p>
      )}
    </div>
  )
}

function renderBody(q: Question, correct: () => void, wrong: (showAnswer?: string) => void) {
  switch (q.type) {
    case 'trace': return <TraceBody q={q} correct={correct} wrong={wrong} />
    case 'imageToSyllable': return <ImageToSyllableBody q={q} correct={correct} wrong={wrong} />
    case 'syllableCompose': return <SyllableComposeBody q={q} correct={correct} wrong={wrong} />
    case 'syllableSplit': return <SyllableSplitBody q={q} correct={correct} wrong={wrong} />
    case 'markTone': return <MarkToneBody q={q} correct={correct} wrong={wrong} />
    case 'circle': return <CircleBody q={q} correct={correct} wrong={wrong} />
    case 'connect': return <ConnectBody q={q} correct={correct} wrong={wrong} />
    case 'pickByChar': return <PickByCharBody q={q} correct={correct} wrong={wrong} />
    case 'pickBySyllable': return <PickBySyllableBody q={q} correct={correct} wrong={wrong} />
    case 'fillBlank': return <FillBlankBody q={q} correct={correct} wrong={wrong} />
    case 'classifyTone': return <ClassifyToneBody q={q} correct={correct} wrong={wrong} />
    case 'writeAlphabet': return <WriteAlphabetBody q={q} correct={correct} wrong={wrong} />
    case 'judge': return <JudgeBody q={q} correct={correct} wrong={wrong} />
    case 'sequencePick': return <SequencePickBody q={q} correct={correct} wrong={wrong} />
    default: return <p>未知题型</p>
  }
}

// ===== A 描红 =====
function TraceBody({ q, correct, wrong }: any) {
  const [doneCount, setDoneCount] = useState(0)
  const totalCells = q.rows * q.colsPerRow - q.rows  // 减去示范格
  if (q.type !== 'trace') return null
  return (
    <div className="space-y-4">
      <div className="text-center text-pig-700 text-sm">
        跟着示范写一写，每行格子点一下算写完（{doneCount}/{totalCells}）
      </div>
      {Array.from({ length: q.rows }).map((_, r) => (
        <FourLineRow
          key={r}
          cells={Array.from({ length: q.colsPerRow }).map((_, c) => {
            if (c === 0) return { char: q.target, showLetter: undefined }  // 示范格
            return { showLetter: q.target, char: undefined }
          })}
          cellWidth={48}
          cellHeight={60}
        />
      ))}
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => wrong('跟老师学一学 ' + q.target + ' 的写法')}
          className="px-6 py-3 bg-white text-pig-700 border-2 border-pig-200 rounded-bubble text-child font-bold"
        >
          看老师怎么写
        </button>
        <button
          onClick={() => {
            if (doneCount >= totalCells * 0.5) correct()
            else wrong('再多写几个')
          }}
          className="px-6 py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
        >
          写完啦 →
        </button>
      </div>
      <input type="hidden" value={doneCount} />
      <p className="text-center text-xs text-slate-400">点"看老师怎么写"可听发音</p>
    </div>
  )
}

// ===== B 看图写拼音 =====
function ImageToSyllableBody({ q, correct, wrong }: any) {
  if (q.type !== 'imageToSyllable') return null

  // 从答案提取可选的声母韵母
  const ans = jqxUmlaut(q.answer)
  const initials: string[] = []
  const finals: string[] = []

  // 提取声母
  for (const i of ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']) {
    if (ans.startsWith(i)) {
      initials.push(i)
      break
    }
  }

  // 提取韵母（去掉声母和声调）
  const final = ans.replace(/^(zh|ch|sh|b|p|m|f|d|t|n|l|g|k|h|j|q|x|r|z|c|s|y|w)/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (final) finals.push(final)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <div className="text-8xl mb-3">{q.imageEmoji}</div>
        <p className="text-sm text-slate-500">{q.imageDesc}</p>
        <div className="mt-4 flex justify-center">
          {/* 听音走 speakHanzi：读 imageDesc 汉字（不走切片，不连读） */}
          <button
            onClick={() => speakHanzi(q.imageDesc || q.answer)}
            className="w-20 h-20 rounded-full bg-pig-500 text-white shadow-lift active:scale-95 flex items-center justify-center"
            aria-label="听发音"
          >
            <Icon name="volume" size={36} />
          </button>
        </div>
      </div>
      <div className="bg-white rounded-bubble p-4">
        <PinyinKeyboard
          target={q.answer}
          targetHanzi={q.imageDesc}
          onSubmit={(userInput) => {
            const ansNormalized = ans.normalize('NFC')
            const usrNormalized = userInput.normalize('NFC')
            if (ansNormalized === usrNormalized) correct()
            else wrong(ans)
          }}
          hintInitials={initials}
          hintFinals={finals}
        />
      </div>
    </div>
  )
}

// ===== C 拼一拼写一写 =====
function SyllableComposeBody({ q, correct, wrong }: any) {
  if (q.type !== 'syllableCompose') return null
  return (
    <div className="space-y-4">
      <div className="flex justify-center items-center gap-4">
        <LetterCard char={q.initial} size="lg" />
        <span className="text-4xl text-pig-500">+</span>
        {q.finals.map((f: string, i: number) => (
          <LetterCard key={i} char={f} size="lg" />
        ))}
        <span className="text-4xl text-pig-500">=</span>
        <div className="w-32 h-40 border-4 border-dashed border-pig-200 rounded-bubble flex items-center justify-center text-4xl text-pig-500">
          ?
        </div>
      </div>
      <p className="text-center text-pig-700 text-sm">想想拼起来是什么？</p>
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => wrong(q.answer)}
          className="flex-1 py-3 bg-white text-pig-700 border-2 border-pig-200 rounded-bubble"
        >
          听发音
        </button>
        <button
          onClick={() => correct()}
          className="flex-1 py-3 bg-pig-500 text-white rounded-bubble"
        >
          我会了
        </button>
      </div>
    </div>
  )
}

// ===== D 音节拆分 =====
function SyllableSplitBody({ q, correct, wrong }: any) {
  const [parts, setParts] = useState({ initial: '', final: '', tone: 0 })
  if (q.type !== 'syllableSplit') return null
  const allInitials = ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w']
  const finals = ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong', 'ia', 'ua', 'uo', 'iao', 'uai']
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-2">把拼音拆成三部分</p>
        <div className="text-7xl font-bold text-pig-700 pinyin-char">{q.syllable}</div>
        <div className="mt-3"><SpeakButton syllable={q.syllable} size="sm" /></div>
      </div>
      <div className="bg-white rounded-bubble p-4">
        <p className="text-xs text-pig-700 mb-2">声母（首字母）</p>
        <div className="flex flex-wrap gap-1">
          {allInitials.map(i => (
            <button
              key={i || '_'}
              onClick={() => setParts(p => ({ ...p, initial: i }))}
              className={`px-3 py-1 rounded-soft text-sm ${parts.initial === i ? 'bg-pig-500 text-white' : 'bg-slate-100'}`}
            >
              {i || '无'}
            </button>
          ))}
        </div>
        <p className="text-xs text-pig-700 mb-2 mt-3">韵母（剩下的）</p>
        <div className="flex flex-wrap gap-1">
          {finals.map(f => (
            <button
              key={f}
              onClick={() => setParts(p => ({ ...p, final: f }))}
              className={`px-3 py-1 rounded-soft text-sm pinyin-char ${parts.final === f ? 'bg-pig-500 text-white' : 'bg-slate-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-pig-700 mb-2 mt-3">声调</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(t => (
            <button
              key={t}
              onClick={() => setParts(p => ({ ...p, tone: t }))}
              className={`w-12 h-12 rounded-soft text-child font-bold ${parts.tone === t ? 'bg-pig-500 text-white' : 'bg-slate-100'}`}
            >
              {['ˉ','ˊ','ˇ','ˋ'][t - 1]}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={() => {
          const a = q.answer
          if (parts.initial === a.initial && parts.final === a.final && parts.tone === a.tone) correct()
          else wrong(`${a.initial}${a.final}${['ˉ','ˊ','ˇ','ˋ'][a.tone - 1]}`)
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== E 标声调 =====
function MarkToneBody({ q, correct, wrong }: any) {
  const [selected, setSelected] = useState<number | null>(null)
  if (q.type !== 'markTone') return null
  const tones = ['ˉ', 'ˊ', 'ˇ', 'ˋ']
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <p className="text-xs text-slate-500 mb-2">给这个字母标上正确的声调</p>
        <div className="text-9xl font-bold text-pig-700 pinyin-char inline-block">
          {q.base}
          {selected && <span className="text-6xl">{tones[selected - 1]}</span>}
        </div>
        <div className="mt-4"><SpeakButton syllable={q.base} size="sm" /></div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(t => (
          <button
            key={t}
            onClick={() => setSelected(t)}
            className={`aspect-square rounded-bubble text-4xl font-bold pinyin-char ${
              selected === t ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
            }`}
          >
            {tones[t - 1]}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (selected === q.answer) correct()
          else wrong(q.base + tones[q.answer - 1])
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== F 圈选 =====
function CircleBody({ q, correct, wrong }: any) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  if (q.type !== 'circle') return null
  const toggle = (i: number) => {
    const s = new Set(selected)
    if (s.has(i)) s.delete(i)
    else s.add(i)
    setSelected(s)
  }
  return (
    <div className="space-y-4">
      <p className="text-center text-pig-700 text-sm">规则：{q.rule}</p>
      <div className="bg-white rounded-bubble p-6 grid grid-cols-3 gap-3">
        {q.items.map((item: string, i: number) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`aspect-square rounded-bubble border-4 text-child-lg font-bold pinyin-char flex items-center justify-center ${
              selected.has(i) ? 'border-pig-500 bg-orange-50' : 'border-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          const ans = new Set(q.answerIndices)
          if (selected.size === ans.size && [...selected].every(i => ans.has(i))) correct()
          else wrong(q.items.filter((_: any, i: number) => ans.has(i)).join(' '))
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== G 连线 =====
function ConnectBody({ q, correct, wrong }: any) {
  const [pairs, setPairs] = useState<Record<string, string>>({})
  const [selectedL, setSelectedL] = useState<string | null>(null)
  if (q.type !== 'connect') return null
  return (
    <div className="space-y-4">
      <p className="text-center text-pig-700 text-sm">左边点一个，右边点一个，自动连起来</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {q.lefts.map((l: any) => (
            <button
              key={l.id}
              onClick={() => setSelectedL(l.id)}
              className={`w-full p-3 rounded-soft text-child font-bold ${
                selectedL === l.id ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {q.rights.map((r: any) => {
            const paired = Object.entries(pairs).find(([_, v]) => v === r.id)
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (!selectedL) return
                  setPairs(p => ({ ...p, [selectedL]: r.id }))
                  setSelectedL(null)
                }}
                className={`w-full p-3 rounded-soft text-child ${
                  paired ? 'bg-sun-50 border-2 border-sun-500' : 'bg-white border-2 border-pig-200'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>
      <button
        onClick={() => {
          const correctPairs = q.answer as [string, string][]
          if (correctPairs.every(([l, r]) => pairs[l] === r) && Object.keys(pairs).length === correctPairs.length) {
            correct()
          } else {
            wrong('请重新连')
          }
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== H 看字选拼音 =====
function PickByCharBody({ q, correct, wrong }: any) {
  const [picked, setPicked] = useState<string | null>(null)
  if (q.type !== 'pickByChar') return null
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <div className="text-9xl font-bold text-sea-900 mb-3">{q.char}</div>
        <p className="text-sm text-slate-500">这个字怎么读？</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => setPicked(opt)}
            className={`p-5 rounded-bubble text-child-lg font-bold pinyin-char ${
              picked === opt ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (picked && comparePinyin(picked, q.answer, true)) correct()
          else wrong(q.answer)
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== I 看拼音选字 =====
function PickBySyllableBody({ q, correct, wrong }: any) {
  const [picked, setPicked] = useState<string | null>(null)
  if (q.type !== 'pickBySyllable') return null
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <div className="text-6xl font-bold text-sea-900 pinyin-char mb-3">{q.syllable}</div>
        <SpeakButton syllable={q.syllable} size="md" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt: any) => (
          <button
            key={opt.char}
            onClick={() => setPicked(opt.char)}
            className={`p-4 rounded-bubble ${
              picked === opt.char ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
            }`}
          >
            {opt.imageEmoji && <div className="text-4xl mb-1">{opt.imageEmoji}</div>}
            <div className="text-3xl font-bold">{opt.char}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (picked === q.answer) correct()
          else wrong(q.answer)
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== J 补全音节 =====
function FillBlankBody({ q, correct, wrong }: any) {
  const [picked, setPicked] = useState<string | null>(null)
  if (q.type !== 'fillBlank') return null
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <div className="text-7xl font-bold text-sea-900 pinyin-char">{q.pattern}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => setPicked(opt)}
            className={`p-5 rounded-bubble text-child-lg font-bold pinyin-char ${
              picked === opt ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (picked && comparePinyin(picked, q.answer, true)) correct()
          else wrong(q.answer)
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== K 按声调分类 =====
function ClassifyToneBody({ q, correct, wrong }: any) {
  const [buckets, setBuckets] = useState<Record<number, string[]>>({ 1: [], 2: [], 3: [], 4: [] })
  const [pickedSyl, setPickedSyl] = useState<string | null>(null)
  if (q.type !== 'classifyTone') return null
  return (
    <div className="space-y-4">
      <p className="text-center text-pig-700 text-sm">点音节，再点声调格放进去</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {q.syllables.map((s: string) => {
          const used = Object.values(buckets).flat().includes(s)
          if (used) return null
          return (
            <button
              key={s}
              onClick={() => setPickedSyl(pickedSyl === s ? null : s)}
              className={`px-4 py-2 rounded-soft text-child pinyin-char ${
                pickedSyl === s ? 'bg-pig-500 text-white' : 'bg-white border-2 border-pig-200'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(t => (
          <button
            key={t}
            onClick={() => {
              if (!pickedSyl) return
              setBuckets(b => ({ ...b, [t]: [...(b[t] || []), pickedSyl] }))
              setPickedSyl(null)
            }}
            className="min-h-[80px] rounded-bubble bg-orange-50 border-2 border-pig-200 p-2"
          >
            <div className="text-2xl font-bold text-pig-700 mb-1">第 {['一','二','三','四'][t - 1]} 声</div>
            <div className="text-xs pinyin-char">{buckets[t]?.join(' ') || '—'}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          // 检查每个音节是否在正确的声调桶里
          let ok = true
          for (const ans of q.answer) {
            for (const syl of ans.items) {
              if (!buckets[ans.tone]?.includes(syl)) { ok = false; break }
            }
            if (!ok) break
          }
          if (ok) correct()
          else wrong('检查每个音节放对了吗？')
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== L 字母表默写 =====
function WriteAlphabetBody({ q, correct, wrong }: any) {
  const [text, setText] = useState('')
  if (q.type !== 'writeAlphabet') return null
  return (
    <div className="space-y-4">
      <p className="text-center text-pig-700 text-sm">按顺序默写{q.scope === 'initial' ? '声母' : '韵母'}表</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        className="w-full p-4 text-child-lg text-center border-2 border-pig-200 rounded-soft pinyin-char"
        placeholder="b p m f ..."
      />
      <button
        onClick={() => {
          const user = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
          if (user.join(' ') === q.answer.join(' ')) correct()
          else wrong(q.answer.join(' '))
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// ===== M 判断对错 =====
function JudgeBody({ q, correct, wrong }: any) {
  if (q.type !== 'judge') return null
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-bubble p-8 text-center">
        <div className="text-6xl font-bold text-sea-900 pinyin-char mb-3">{q.item}</div>
        <SpeakButton syllable={q.item.split(/\s/)[0]} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            if (q.answer) correct()
            else wrong('不对哦')
          }}
          className="py-6 bg-sun-50 border-4 border-sun-500 text-sun-700 text-child-lg font-bold rounded-bubble active:scale-95"
        >
          ✓ 对的
        </button>
        <button
          onClick={() => {
            if (!q.answer) correct()
            else wrong('是对的')
          }}
          className="py-6 bg-pig-100 border-4 border-pig-500 text-sea-900 text-child-lg font-bold rounded-bubble active:scale-95"
        >
          ✗ 错的
        </button>
      </div>
    </div>
  )
}

// ===== N 圈选正确顺序 =====
function SequencePickBody({ q, correct, wrong }: any) {
  const [picked, setPicked] = useState<number | null>(null)
  if (q.type !== 'sequencePick') return null
  return (
    <div className="space-y-3">
      {q.options.map((opt: any, i: number) => (
        <button
          key={i}
          onClick={() => setPicked(i)}
          className={`w-full bg-white rounded-bubble p-4 border-4 ${
            picked === i ? 'border-pig-500 bg-orange-50' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-5xl">{opt.emoji}</span>
            <div className="flex gap-1 flex-1 justify-center">
              {opt.sequence.map((s: string, j: number) => (
                <span key={j} className="w-10 h-12 bg-pig-100 rounded-soft flex items-center justify-center text-xl font-bold pinyin-char">{s}</span>
              ))}
            </div>
            {picked === i && <span className="text-pig-500 text-2xl">✓</span>}
          </div>
        </button>
      ))}
      <button
        onClick={() => {
          if (picked === null) return
          if (q.options[picked].correct) correct()
          else wrong('再听一遍，找顺序对的那条')
        }}
        className="w-full py-3 bg-pig-500 text-white rounded-bubble text-child font-bold"
      >
        提交
      </button>
    </div>
  )
}

// 错题入库
async function saveErrorItem(q: Question, wrongAnswer: string) {
  try {
    const ans = (q as any).answer
    await db.errorItems.add({
      lessonId: q.lessonId,
      questionId: q.id,
      type: q.type,
      prompt: q.prompt,
      answer: typeof ans === 'object' ? JSON.stringify(ans) : String(ans ?? ''),
      wrongAnswer: wrongAnswer || '',
      count: 1,
      lastWrongAt: Date.now(),
      nextReviewAt: nextReviewDate(0),  // 当天
      doneCount: 0,
    })
  } catch (e) {
    console.warn('save error item failed', e)
  }
}
