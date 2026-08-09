import type { RhythmPattern } from '@/types'
import { RHYTHM_KODALY } from '@/types'
import { audioEngine } from '@/audio/engine'

interface Props {
  pattern: RhythmPattern
  label?: string
}

/** 节奏型 -> 每个音的时值（拍）+ Kodály 音节 */
function patternToNotes(pattern: RhythmPattern): { dur: number; syllable: string }[] {
  const map: Record<string, [number, string][]> = {
    'quarter': [[1, 'ta']],
    'two-eighths': [[0.5, 'ti'], [0.5, 'ti']],
    'four-sixteenths': [[0.25, 'ti'], [0.25, 'ri'], [0.25, 'ti'], [0.25, 'ri']],
    'eighth-two-sixteenths': [[0.5, 'ti'], [0.25, 'ti'], [0.25, 'ri']],
    'two-sixteenths-eighth': [[0.25, 'ti'], [0.25, 'ri'], [0.5, 'ti']],
    'dotted-quarter-eighth': [[1.5, 'ta-i'], [0.5, 'ti']],
    'syncopation': [[0.5, 'ti'], [1, 'ta'], [0.5, 'ti']],
    'quarter-rest': [[1, '休']],
    'half': [[2, 'ta-a']],
    'whole': [[4, 'ta-a-a-a']],
  }
  const arr = map[pattern] || [[1, 'ta']]
  return arr.map(([dur, s]) => ({ dur, syllable: s }))
}

const COLORS: Record<string, string> = {
  long: 'bg-purple-400',
  short: 'bg-yellow-400',
  rest: 'bg-gray-300',
}

export default function RhythmCard({ pattern, label }: Props) {
  const notes = patternToNotes(pattern)
  const totalBeats = notes.reduce((s, n) => s + n.dur, 0)
  const kodaly = RHYTHM_KODALY[pattern]

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 shadow-sm">
      {/* Kodály 读法 */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-purple-600">{kodaly}</div>
        {label && <div className="text-sm text-gray-400 mt-1">{label}</div>}
      </div>

      {/* 节奏方块：按时值比例显示宽度 */}
      <div className="flex items-end gap-1 mb-2 h-16">
        {notes.map((n, i) => {
          const widthPct = (n.dur / totalBeats) * 100
          const isRest = n.syllable === '休'
          const colorClass = isRest
            ? COLORS.rest
            : n.dur >= 1
              ? COLORS.long
              : COLORS.short
          const heightClass = isRest ? 'h-8' : n.dur >= 1 ? 'h-16' : n.dur >= 0.5 ? 'h-12' : 'h-8'
          return (
            <div
              key={i}
              className={`${colorClass} ${heightClass} rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all`}
              style={{ width: `${widthPct}%`, minWidth: '24px' }}
            >
              {n.syllable}
            </div>
          )
        })}
      </div>

      {/* 拍数标尺 */}
      <div className="flex gap-1 text-xs text-gray-400 mb-3">
        {Array.from({ length: totalBeats }, (_, i) => (
          <div key={i} className="flex-1 text-center border-l border-gray-200 pl-1">
            {i + 1}
          </div>
        ))}
      </div>

      {/* 播放按钮 */}
      <button
        onClick={() => audioEngine.playRhythm(pattern, 60)}
        className="w-full py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 text-sm font-bold transition-all active:scale-95"
      >
        🔊 听节奏
      </button>
    </div>
  )
}
