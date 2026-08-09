import type { Solfege } from '@/types'
import { SOLFEGE_COLORS } from '@/types'

interface Props {
  note: Solfege
  size?: number
  label?: boolean
  active?: boolean
}

/**
 * Curwen 手势 SVG 组件
 * 每个唱名对应一个简化但可辨识的手势形状
 * 颜色取自 SOLFEGE_COLORS
 */
export default function CurwenHandSign({ note, size = 80, label = true, active = false }: Props) {
  const color = SOLFEGE_COLORS[note]

  return (
    <div
      className="flex flex-col items-center transition-all duration-300"
      style={{
        transform: active ? 'scale(1.35)' : 'scale(1)',
        filter: active ? `drop-shadow(0 4px 12px ${color}99)` : 'none',
        opacity: active ? 1 : 0.45,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        {renderHand(note, color)}
      </svg>
      {label && (
        <span className="text-sm font-bold mt-1" style={{ color }}>
          {note}
        </span>
      )}
    </div>
  )
}

function renderHand(note: Solfege, color: string) {
  switch (note) {
    case 'do':
      // 拳头，掌心朝下
      return (
        <g>
          <rect x="38" y="55" width="24" height="40" rx="6" fill={color} opacity="0.8" />
          <ellipse cx="50" cy="45" rx="22" ry="18" fill={color} />
          <path d="M32 42 Q35 38 40 40 M42 38 Q45 34 50 36 M52 36 Q55 34 60 38 M62 40 Q67 38 68 42"
            stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
        </g>
      )
    case 're':
      // 平掌，微微上翘
      return (
        <g>
          <rect x="35" y="60" width="20" height="35" rx="5" fill={color} opacity="0.8" transform="rotate(-15 45 75)" />
          <ellipse cx="52" cy="40" rx="20" ry="12" fill={color} transform="rotate(-20 52 40)" />
          <line x1="40" y1="35" x2="65" y2="30" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="42" y1="40" x2="67" y2="35" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </g>
      )
    case 'mi':
      // 平掌，掌心朝下，水平
      return (
        <g>
          <rect x="38" y="55" width="24" height="40" rx="5" fill={color} opacity="0.8" />
          <ellipse cx="50" cy="42" rx="24" ry="12" fill={color} />
          <line x1="30" y1="38" x2="70" y2="38" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="32" y1="44" x2="68" y2="44" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="30" y1="48" x2="70" y2="48" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </g>
      )
    case 'fa':
      // 拳头 + 大拇指向下
      return (
        <g>
          <rect x="38" y="55" width="24" height="35" rx="5" fill={color} opacity="0.8" />
          <ellipse cx="50" cy="42" rx="20" ry="16" fill={color} />
          {/* 大拇指向下 */}
          <rect x="46" y="50" width="8" height="25" rx="4" fill={color} opacity="0.9" />
        </g>
      )
    case 'sol':
      // 平掌，掌心朝上
      return (
        <g>
          <rect x="38" y="55" width="24" height="40" rx="5" fill={color} opacity="0.8" />
          <path d="M28 45 Q28 55 38 52 L62 52 Q72 55 72 45 Z" fill={color} />
          <line x1="32" y1="48" x2="68" y2="48" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        </g>
      )
    case 'la':
      // 手掌微微弯曲，像握小球
      return (
        <g>
          <rect x="38" y="58" width="24" height="37" rx="5" fill={color} opacity="0.8" />
          <path d="M32 50 Q35 35 50 35 Q65 35 68 50 Q65 55 50 53 Q35 55 32 50 Z" fill={color} />
          <circle cx="50" cy="44" r="6" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </g>
      )
    case 'si':
      // 食指向上指
      return (
        <g>
          <rect x="38" y="55" width="24" height="40" rx="5" fill={color} opacity="0.8" />
          <ellipse cx="50" cy="50" rx="18" ry="14" fill={color} />
          {/* 食指向上 */}
          <rect x="45" y="20" width="10" height="30" rx="5" fill={color} />
          <circle cx="50" cy="18" r="6" fill={color} />
        </g>
      )
    default:
      return null
  }
}

/** 一排展示所有七个手势，activeIndex 高亮当前播放的音 */
export function CurwenHandSignRow({ notes, size = 60, activeIndex = null }: { notes: Solfege[]; size?: number; activeIndex?: number | null }) {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {notes.map((n, i) => (
        <CurwenHandSign key={n} note={n} size={size} active={activeIndex === i} />
      ))}
    </div>
  )
}
