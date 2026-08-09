// 大发音按钮：阶段3听写用
import { speakPinyin } from '@/audio/tts'
import { Icon } from '@/components/icons/Icon'

interface Props {
  syllable: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export function SpeakButton({ syllable, label, size = 'md', variant = 'primary' }: Props) {
  const sizeMap = {
    sm: { box: 'w-14 h-14', icon: 24 },
    md: { box: 'w-20 h-20', icon: 32 },
    lg: { box: 'w-28 h-28', icon: 48 },
  }[size]
  const variantMap = {
    primary: 'bg-pig-500 text-white',
    secondary: 'bg-white text-pig-700 border-4 border-pig-100',
    outline: 'bg-white text-pig-500 border-2 border-pig-100',
  }[variant]

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        // 强制转 NFC 确保音频能匹配
        speakPinyin(syllable.normalize('NFC'))
      }}
      className={`${sizeMap.box} ${variantMap} rounded-full active:scale-95 transition-transform flex items-center justify-center shadow-card`}
    >
      <Icon name="volume" size={sizeMap.icon} />
      {label && <span className="ml-2 text-base font-bold">{label}</span>}
    </button>
  )
}
