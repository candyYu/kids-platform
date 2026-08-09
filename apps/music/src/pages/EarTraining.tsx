import { useState } from 'react'
import { Link } from 'react-router-dom'
import { audioEngine } from '@/audio/engine'
import { useStore } from '@/store'
import { SOLFEGE_COLORS, RHYTHM_KODALY, type Solfege, type RhythmPattern } from '@/types'

const PENTATONIC: Solfege[] = ['do', 're', 'mi', 'sol', 'la']
const MELODY_POOLS: Solfege[][] = [
  ['do', 'mi', 'sol', 'mi'],
  ['sol', 'mi', 'do', 'mi'],
  ['do', 're', 'mi', 'do'],
  ['mi', 'sol', 'la', 'sol'],
  ['la', 'sol', 'mi', 'do'],
]
const RHYTHM_OPTIONS: RhythmPattern[] = ['quarter', 'two-eighths', 'four-sixteenths', 'half']

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// 耳训题目类型
type EarQuestion =
  | { type: 'E1'; answer: Solfege; options: Solfege[][] }
  | { type: 'E2'; answer: 'same' | 'different'; midiNotes: [number, number] }
  | { type: 'E3'; answer: 'high' | 'low'; midi: number }
  | { type: 'E4'; answer: Solfege[]; options: Solfege[][] }
  | { type: 'E5'; answer: number; rhythm: RhythmPattern; options: { label: string; pattern: RhythmPattern }[] }

export default function EarTraining() {
  const updateEarProgress = useStore((s) => s.updateEarProgress)
  const earProgress = useStore((s) => s.earProgress)
  const [phase, setPhase] = useState<'tuning' | 'quiz' | 'done'>('tuning')
  const [questions, setQuestions] = useState<EarQuestion[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [points, setPoints] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const startQuiz = () => {
    const qs: EarQuestion[] = []
    // E1: 2 道单音听辨
    for (let i = 0; i < 2; i++) {
      const answer = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
      qs.push({ type: 'E1', answer, options: [PENTATONIC] })
    }
    // E2: 1 道音程对比（相同/不同）
    {
      const same = Math.random() > 0.5
      const note = audioEngine.solfegeToMidi(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)])
      const note2 = same ? note : audioEngine.solfegeToMidi(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)])
      qs.push({ type: 'E2', answer: same ? 'same' : 'different', midiNotes: [note, note2] })
    }
    // E3: 1 道高低辨识
    {
      const isHigh = Math.random() > 0.5
      const midi = isHigh ? 64 + Math.floor(Math.random() * 5) : 55 + Math.floor(Math.random() * 4)
      qs.push({ type: 'E3', answer: isHigh ? 'high' : 'low', midi })
    }
    // E4: 2 道旋律听辨
    for (let i = 0; i < 2; i++) {
      const answer = MELODY_POOLS[Math.floor(Math.random() * MELODY_POOLS.length)]
      const wrong1 = shuffle(MELODY_POOLS.filter(m => m !== answer))[0]
      const wrong2 = shuffle(MELODY_POOLS.filter(m => m !== answer && m !== wrong1))[0]
      qs.push({ type: 'E4', answer, options: shuffle([answer, wrong1, wrong2]) })
    }
    // E5: 1 道节奏辨认
    {
      const rhythm = RHYTHM_OPTIONS[Math.floor(Math.random() * RHYTHM_OPTIONS.length)]
      const opts = shuffle(RHYTHM_OPTIONS).slice(0, 3)
      if (!opts.includes(rhythm)) opts[0] = rhythm
      const shuffled = shuffle(opts)
      qs.push({
        type: 'E5',
        answer: shuffled.indexOf(rhythm),
        rhythm,
        options: shuffled.map(p => ({ label: RHYTHM_KODALY[p], pattern: p })),
      })
    }
    setQuestions(qs)
    setPhase('quiz')
  }

  const playQuestion = async () => {
    if (playing) return
    setPlaying(true)
    await audioEngine.init()
    const q = questions[qIdx]
    if (q.type === 'E1') {
      await audioEngine.playMidiNote(audioEngine.solfegeToMidi(q.answer), 0.8)
    } else if (q.type === 'E2') {
      await audioEngine.playMidiSequence(q.midiNotes, 0.5, 0.8)
    } else if (q.type === 'E3') {
      // 先播 do，再播目标音
      await audioEngine.playMidiSequence([60, q.midi], 0.5, 0.8)
    } else if (q.type === 'E4') {
      const midis = q.answer.map(n => audioEngine.solfegeToMidi(n))
      await audioEngine.playMidiSequence(midis, 0.4, 0.5)
    } else if (q.type === 'E5') {
      await audioEngine.playRhythm(q.rhythm, 60)
      const dur = audioEngine.getRhythmTotalDuration([q.rhythm], 60) * 1000 + 200
      setTimeout(() => setPlaying(false), dur)
      return
    }
    // E1/E2/E3/E4 估算播放时间
    const estMs = q.type === 'E4' ? 2500 : q.type === 'E2' || q.type === 'E3' ? 2000 : 1200
    setTimeout(() => setPlaying(false), estMs)
  }

  const isCorrect = (q: EarQuestion, idx: number): boolean => {
    switch (q.type) {
      case 'E1': return (q.options[0] as Solfege[])[idx] === q.answer
      case 'E2': return (idx === 0 && q.answer === 'same') || (idx === 1 && q.answer === 'different')
      case 'E3': return (idx === 0 && q.answer === 'high') || (idx === 1 && q.answer === 'low')
      case 'E4': return JSON.stringify(q.options[idx]) === JSON.stringify(q.answer)
      case 'E5': return idx === q.answer
    }
  }

  const handleSelect = async (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (isCorrect(questions[qIdx], idx)) {
      setPoints(p => p + 1)
      await audioEngine.playCorrect()
    } else {
      await audioEngine.playWrong()
    }
  }

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1)
      setAnswered(false)
      setSelected(null)
      setPlaying(false)
    } else {
      setPhase('done')
      const today = new Date().toDateString()
      const prev = earProgress['E1']
      const streak = prev?.lastDate === today ? prev.streak
        : (prev && new Date(prev.lastDate).toDateString() === new Date(Date.now()-86400000).toDateString()) ? prev.streak + 1 : 1
      updateEarProgress({
        type: 'E1', todayCount: questions.length, streak, earPoints: (prev?.earPoints || 0) + points, lastDate: today,
      })
    }
  }

  // 定调阶段
  if (phase === 'tuning') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Link to="/" className="text-sm text-gray-400">← 首页</Link>
        <div className="card text-center mt-4">
          <div className="text-5xl mb-4">👂</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">耳朵训练时间</h2>
          <p className="text-gray-500 mb-6">先听一下 do，在心里记住它的位置</p>
          <button onClick={async () => { await audioEngine.init(); audioEngine.playMidiNote(60, 1.5) }}
            className="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-4xl shadow-lg active:scale-95">
            🔊
          </button>
          <p className="text-sm text-gray-400 mt-3 mb-6">这是 do</p>
          <div className="text-sm text-gray-400 mb-4 space-y-1">
            <p>本轮训练包含 5 种练习：</p>
            <p>🎵 单音听辨 · 🔀 音程对比 · 📏 高低辨识 · 🎼 旋律听辨 · 🥁 节奏辨认</p>
          </div>
          <button onClick={startQuiz} className="btn-primary">开始训练 -&gt;</button>
        </div>
      </div>
    )
  }

  // 完成阶段
  if (phase === 'done') {
    const total = questions.length
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">今天的耳朵值 +{points}</h2>
          <p className="text-gray-500 mb-1">答对 {points} / {total} 题</p>
          <p className="text-sm text-gray-400 mb-6">每天练一练，耳朵会越来越灵！</p>
          <Link to="/" className="btn-primary inline-block">返回首页</Link>
        </div>
      </div>
    )
  }

  // 答题阶段
  const q = questions[qIdx]
  const typeLabel = { E1: '单音听辨', E2: '音程对比', E3: '高低辨识', E4: '旋律听辨', E5: '节奏辨认' }[q.type]
  const promptText = {
    E1: '听一听，是哪个音？',
    E2: '两个音一样吗？',
    E3: '第二个音比 do 高还是低？',
    E4: '听一听，选正确的旋律',
    E5: '听一听，是哪个节奏？',
  }[q.type]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-sm text-gray-400">← 首页</Link>
        <span className="text-sm text-gray-400">{typeLabel} · {qIdx+1}/{questions.length}</span>
      </div>
      <div className="flex gap-1 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i < qIdx ? 'bg-green-400' : i === qIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="text-center mb-6">
        <button onClick={playQuestion} disabled={playing}
          className={`w-24 h-24 rounded-full text-white text-4xl shadow-lg active:scale-95 transition-all ${playing ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}>
          {playing ? '🎵' : '🔊'}
        </button>
        <p className="text-sm text-gray-400 mt-3">{playing ? '播放中...' : promptText}</p>
      </div>

      {/* E1: 唱名球 */}
      {q.type === 'E1' && (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {(q.options[0] as Solfege[]).map((s, idx) => {
            const correct = answered && isCorrect(q, idx)
            const wrong = answered && idx === selected && !isCorrect(q, idx)
            return (
              <button key={s} onClick={() => handleSelect(idx)} disabled={answered}
                className={`w-20 h-20 rounded-full text-white text-lg font-bold shadow-lg transition-all active:scale-95 ${correct ? 'ring-4 ring-green-300 scale-110' : wrong ? 'opacity-40' : 'hover:scale-105'}`}
                style={{ backgroundColor: SOLFEGE_COLORS[s] }}>
                {correct && '✅ '}{s}
              </button>
            )
          })}
        </div>
      )}

      {/* E2/E3: 二选一按钮 */}
      {(q.type === 'E2' || q.type === 'E3') && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(q.type === 'E2' ? ['一样', '不一样'] : ['比 do 高', '比 do 低']).map((label, idx) => {
            const correct = answered && isCorrect(q, idx)
            const wrong = answered && idx === selected && !isCorrect(q, idx)
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                className={`p-6 rounded-2xl text-lg font-bold border-2 transition-all active:scale-95
                  ${correct ? 'bg-green-100 border-green-400 text-green-700'
                    : wrong ? 'bg-red-50 border-red-300 text-red-400 opacity-50'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                {correct && '✅ '}{label}
              </button>
            )
          })}
        </div>
      )}

      {/* E4: 旋律选项 */}
      {q.type === 'E4' && (
        <div className="grid gap-3 mb-6">
          {q.options.map((seq, idx) => {
            const correct = answered && isCorrect(q, idx)
            const wrong = answered && idx === selected && !isCorrect(q, idx)
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                className={`flex justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${correct ? 'bg-green-100 border-green-400' : wrong ? 'bg-red-50 border-red-300 opacity-50' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                {seq.map(s => (
                  <div key={s} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: SOLFEGE_COLORS[s] }}>{s}</div>
                ))}
              </button>
            )
          })}
        </div>
      )}

      {/* E5: 节奏选项 */}
      {q.type === 'E5' && (
        <div className="grid gap-3 mb-6">
          {q.options.map((opt, idx) => {
            const correct = answered && isCorrect(q, idx)
            const wrong = answered && idx === selected && !isCorrect(q, idx)
            return (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                className={`p-4 rounded-2xl text-lg font-bold border-2 transition-all active:scale-95
                  ${correct ? 'bg-green-100 border-green-400 text-green-700'
                    : wrong ? 'bg-red-50 border-red-300 text-red-400 opacity-50'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'}`}>
                {correct && '✅ '}{opt.label}
              </button>
            )
          })}
        </div>
      )}

      {answered && (
        <div className="text-center">
          <button onClick={handleNext} className="btn-primary">
            {qIdx < questions.length - 1 ? '下一题 -&gt;' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  )
}
