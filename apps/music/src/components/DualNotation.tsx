import type { RhythmPattern } from '@/types'
import { RHYTHM_KODALY, SOLFEGE_COLORS, noteBase, noteOctave } from '@/types'

interface Props {
  notes: string[]
  rhythm?: RhythmPattern[]
  label?: string
}

// 音名 -> 五线谱 Y 坐标（octave 4 基准）
const BASE_Y_4: Record<string, number> = {
  C: 72, D: 67, E: 62, F: 57, G: 52, A: 47, B: 42,
}

// 根据 音名+八度 计算五线谱 Y 坐标
function noteY(note: string): number {
  const base = noteBase(note)
  const oct = noteOctave(note)
  const y4 = BASE_Y_4[base] ?? 62
  return y4 - (oct - 4) * 35
}

// 音名 -> 简谱数字
const NOTE_JIANPU: Record<string, string> = {
  C: '1', D: '2', E: '3', F: '4', G: '5', A: '6', B: '7',
  'F#': '#4', 'Bb': '♭7',
}

// 音名 -> 唱名（用于颜色）
const NOTE_SOL: Record<string, string> = {
  C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si',
  'F#': 'fa', 'Bb': 'si',
}

const STAFF_LINES = [22, 32, 42, 52, 62] // F5, D5, B4, G4, E4
const CLEF_X = 18
const NOTE_START_X = 55
const NOTE_SPACING = 48

export default function DualNotation({ notes, rhythm, label }: Props) {
  if (!notes || notes.length === 0) return null
  const width = NOTE_START_X + notes.length * NOTE_SPACING + 20
  const height = 120

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200">
      {label && <p className="text-xs text-gray-400 mb-2 text-center">{label}</p>}

      {/* 五线谱 */}
      <svg width={width} height={height} className="mx-auto block">
        {/* 谱表线 */}
        {STAFF_LINES.map((y, i) => (
          <line key={i} x1={CLEF_X + 8} y1={y} x2={width - 10} y2={y}
            stroke="#999" strokeWidth="1" />
        ))}
        {/* 高音谱号 */}
        <text x={CLEF_X} y={58} fontSize="42" fill="#555">𝄞</text>

        {/* 音符 */}
        {notes.map((note, i) => {
          const base = noteBase(note)
          const y = noteY(note)
          const x = NOTE_START_X + i * NOTE_SPACING
          const color = SOLFEGE_COLORS[NOTE_SOL[base] as keyof typeof SOLFEGE_COLORS] || '#888'
          const needsLedger = y >= 72 // C4 or below needs ledger line
          return (
            <g key={i}>
              {needsLedger && (
                <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke="#999" strokeWidth="1" />
              )}
              <ellipse cx={x} cy={y} rx="7" ry="5.5" fill={color}
                transform={`rotate(-15 ${x} ${y})`} />
              {/* 升降记号 */}
              {(base.includes('#') || base.includes('b')) && (
                <text x={x - 14} y={y + 4} fontSize="14" fill="#555">
                  {base.includes('#') ? '♯' : '♭'}
                </text>
              )}
              {/* 节奏名 */}
              {rhythm && rhythm[i] && (
                <text x={x} y={height - 18} fontSize="10" fill="#aaa"
                  textAnchor="middle">{RHYTHM_KODALY[rhythm[i]]}</text>
              )}
            </g>
          )
        })}
      </svg>

      {/* 简谱 */}
      <div className="flex justify-center gap-3 mt-1">
        {notes.map((note, i) => {
          const base = noteBase(note)
          const jp = NOTE_JIANPU[base] || '?'
          const color = SOLFEGE_COLORS[NOTE_SOL[base] as keyof typeof SOLFEGE_COLORS] || '#888'
          return (
            <div key={i} className="text-center" style={{ width: NOTE_SPACING - 8 }}>
              <div className="text-lg font-bold" style={{ color }}>{jp}</div>
              <div className="text-xs text-gray-400">
                {NOTE_SOL[base] || ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
