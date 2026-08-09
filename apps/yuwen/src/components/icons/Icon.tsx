// 统一 SVG 图标库
// 全部用 stroke 描边 + 2 圆角，专业 UI 风格
// stroke=currentColor 跟父元素 text-* 走，父是白字就白图标，父是深字就深图标

interface Props {
  name: IconName
  className?: string
  size?: number
  strokeWidth?: number
}

export type IconName =
  | 'speaker' | 'speaker-mute' | 'mic' | 'play' | 'pause'
  | 'check' | 'close' | 'arrow-left' | 'arrow-right' | 'chevron-right'
  | 'lock' | 'star' | 'book' | 'home' | 'map' | 'pencil' | 'list'
  | 'lightbulb' | 'trophy' | 'shield' | 'fire' | 'crown' | 'gear'
  | 'eye' | 'ear' | 'paw' | 'heart' | 'rocket' | 'flash' | 'sparkle'
  | 'restart' | 'clear' | 'submit' | 'volume'

export function Icon({ name, className = '', size = 24, strokeWidth = 2 }: Props) {
  const paths = ICONS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}

const ICONS: Record<IconName, React.ReactNode> = {
  // 喇叭发声（专业版：喇叭 + 2 道声波）
  speaker: (
    <>
      <path d="M3 10v4a1 1 0 0 0 1 1h3l5 4V5L7 9H4a1 1 0 0 0-1 1z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 5a9 9 0 0 1 0 14" />
    </>
  ),
  // 静音喇叭
  'speaker-mute': (
    <>
      <path d="M3 10v4a1 1 0 0 0 1 1h3l5 4V5L7 9H4a1 1 0 0 0-1 1z" />
      <line x1="16" y1="9" x2="22" y2="15" />
      <line x1="22" y1="9" x2="16" y2="15" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" />
    </>
  ),
  play: (
    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
  ),
  pause: (
    <>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
    </>
  ),
  check: <polyline points="5 12 10 17 19 7" />,
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  'arrow-left': (
    <>
      <line x1="20" y1="12" x2="4" y2="12" />
      <polyline points="10 18 4 12 10 6" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </>
  ),
  'chevron-right': <polyline points="9 6 15 12 9 18" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  star: (
    <polygon
      points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"
      fill="currentColor"
    />
  ),
  book: (
    <>
      <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
      <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
    </>
  ),
  home: (
    <>
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  map: (
    <>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.7.7 1 1.5 1 2.3v1h6v-1c0-.8.3-1.6 1-2.3A7 7 0 0 0 12 2z" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
    </>
  ),
  shield: <path d="M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6z" />,
  fire: (
    <path d="M12 2c0 4-3 6-3 9a3 3 0 0 0 6 0c0 2 2 4 2 7a5 5 0 0 1-10 0c0-3 2-5 2-7 0-2-1-3 0-5s3-2 3-4z" />
  ),
  crown: (
    <>
      <path d="M3 8l4 8h10l4-8-6 4-4-6-4 6z" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ear: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4-3 5-3 7a3 3 0 0 1-6 0" />
      <circle cx="11" cy="9" r="1.5" fill="currentColor" />
    </>
  ),
  paw: (
    <>
      <circle cx="6" cy="11" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="11" r="2" fill="currentColor" stroke="none" />
      <path d="M8 16c0-2 2-3 4-3s4 1 4 3-1 4-4 4-4-2-4-4z" fill="currentColor" stroke="none" />
    </>
  ),
  heart: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="currentColor" />,
  rocket: (
    <>
      <path d="M5 13l-2 2 4 4 2-2M12 2c5 5 5 10 5 15l-5-5-5 5c0-5 0-10 5-15z" />
      <circle cx="13" cy="9" r="1.5" fill="currentColor" />
    </>
  ),
  flash: <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" fill="currentColor" />,
  sparkle: (
    <>
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" fill="currentColor" />
      <circle cx="19" cy="5" r="1" fill="currentColor" />
      <circle cx="5" cy="19" r="1" fill="currentColor" />
    </>
  ),
  restart: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 3 3 8 8 8" />
    </>
  ),
  clear: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    </>
  ),
  submit: (
    <>
      <polyline points="5 12 10 17 19 7" />
      <path d="M19 7H8" />
    </>
  ),
  volume: (
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 5a9 9 0 0 1 0 14" />
    </>
  ),
}
