// 字母卡片：用于阶段1"认识"和题目中展示字母
// 大字号 + 真人发音（TTS）+ 标调演示
import { speakPinyin } from '@/audio/tts'

interface Props {
  char: string                       // 'a' / 'b' / 'm' / 'ai' 等
  tones?: { tone: 1 | 2 | 3 | 4; char: string }[]   // 带调版本（可选）
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTone?: boolean
  autoPlay?: boolean
  onTap?: () => void
  highlight?: boolean
}

// 连续播放四个声调
async function playTones(tones: { tone: 1 | 2 | 3 | 4; char: string }[]) {
  for (const t of tones) {
    await speakPinyin(t.char)
    await new Promise(r => setTimeout(r, 300))  // 间隔 0.3 秒
  }
}

export function LetterCard({ char, tones, size = 'lg', showTone, onTap, highlight }: Props) {
  const sizeConfig = {
    sm: { w: 'w-16', h: 'h-20', text: 'text-3xl', gridTop: 'top-5' },
    md: { w: 'w-24', h: 'h-32', text: 'text-5xl', gridTop: 'top-8' },
    lg: { w: 'w-32', h: 'h-40', text: 'text-6xl', gridTop: 'top-10' },
    xl: { w: 'w-40', h: 'h-48', text: 'text-7xl', gridTop: 'top-12' },
  }[size]

  const handleTap = () => {
    if (tones && tones.length > 0) {
      // 有四个声调 → 连续播放
      void playTones(tones)
    } else {
      // 没有声调 → 只播当前字母
      speakPinyin(char)
    }
    onTap?.()
  }

  return (
    <button
      onClick={handleTap}
      className={`${sizeConfig.w} ${sizeConfig.h} bg-white border-4 rounded-bubble shadow-card active:scale-95 transition-transform flex flex-col items-center justify-center pinyin-char relative overflow-hidden ${
        highlight ? 'border-pig-500 bg-orange-50' : 'border-pig-200'
      }`}
    >
      {/* 四线三格 - 四条红色虚线 */}
      <div className={`absolute inset-x-2 ${sizeConfig.gridTop} space-y-[6px] pointer-events-none opacity-30`}>
        <div className="border-t border-pig-500"></div>
        <div className="border-t border-pig-500"></div>
        <div className="border-t border-pig-500"></div>
        <div className="border-t border-pig-500"></div>
      </div>
      
      {/* 拼音字母 - 居中在中间两格 */}
      <span className={`font-bold text-sea-900 relative z-10 ${sizeConfig.text}`}>{char}</span>
      
      {showTone && tones && (
        <div className="flex gap-1 mt-2 relative z-10">
          {tones.map(t => (
            <span key={t.tone} className="text-base text-pig-500">{t.char}</span>
          ))}
        </div>
      )}
    </button>
  )
}
