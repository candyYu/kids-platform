import { BADGES } from '@/types'
import type { Badge } from '@/types'

interface Props {
  badges: Badge[]
}

export default function BadgeDisplay({ badges }: Props) {
  const earnedIds = new Set(badges.map(b => b.id))

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4">
      <p className="text-sm font-bold text-orange-600 mb-3">🏅 成就徽章 ({badges.length}/{BADGES.length})</p>
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const earned = earnedIds.has(badge.id)
          return (
            <div key={badge.id} className="text-center">
              <div className={`text-3xl mb-1 ${earned ? '' : 'grayscale opacity-30'}`}>
                {badge.icon}
              </div>
              <div className={`text-xs ${earned ? 'text-gray-600 font-bold' : 'text-gray-300'}`}>
                {badge.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
