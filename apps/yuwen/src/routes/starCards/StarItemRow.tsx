// 摘星卡上的一个条目：只展示，不发音（卡面内容用家长录的整卡真人录音听）。
// 右侧小圈供家长自评：☆ 会读 / 🔴 读错。
import type { StarItem } from '@/data/starCards'
import type { ItemMark } from './progress'

interface Props {
  item: StarItem
  mark?: ItemMark
  onMark: () => void
}

export default function StarItemRow({ item, mark, onMark }: Props) {
  if (item.kind === 'text') {
    return <li className="text-sm text-ink-500/80 px-1">{item.tokens.join(' ')}</li>
  }
  const text = item.tokens.join(item.kind === 'py' ? ' ' : '')
  return (
    <li className="flex items-center gap-2">
      <div
        className={`flex-1 px-4 py-3 rounded-2xl border-2 font-bold text-lg leading-tight
          ${mark === 'wrong' ? 'bg-white border-chili-400 text-chili-600'
            : mark === 'star' ? 'bg-[#F1FBE7] border-grass-300 text-ink-700'
            : 'bg-white border-pig-200 text-ink-700'}`}
      >
        {text}
        {mark === 'star' && <span className="float-right text-grass-500">⭐</span>}
        {mark === 'wrong' && <span className="float-right text-chili-500">🔴</span>}
      </div>
      <button
        type="button"
        onClick={onMark}
        aria-label="妈妈评价：会读/读错"
        className="flex-none w-9 h-9 rounded-full border-2 border-sun-300 bg-sun-50 text-sm active:scale-90"
      >
        {mark === 'star' ? '⭐' : mark === 'wrong' ? '🔴' : '☆'}
      </button>
    </li>
  )
}
