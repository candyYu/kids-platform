// 我的奖励：星星余额 / 今日进度 / 连续天数 / 兑换商店 / 兑换记录 / 家长管理
// 星星由各学科 app 学习行为赚得（同域 localStorage 共享，@kids/core）
// 路由：hash 路由 #/rewards（web 无 react-router，GitHub Pages 无需 404 配置）
import { useState } from 'react'
import {
  getStars, getStreak, getDailyProgress, getShop, setShop, resetShop,
  redeem, getRedeemed, type ShopItem,
} from '@kids/core'

// ---------- 子组件：奖励卡片 ----------
function RewardCard({ item, stars, onRedeem }: { item: ShopItem; stars: number; onRedeem: (it: ShopItem) => void }) {
  const enough = stars >= item.cost
  return (
    <div className="bg-white rounded-bubble shadow-card p-4 flex items-center gap-3 border-2 border-sun-200">
      <div className="text-4xl shrink-0">{item.emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 truncate">{item.name}</p>
        <p className="text-sm text-sun-700 font-bold">⭐ {item.cost}</p>
      </div>
      <button
        onClick={() => enough && onRedeem(item)}
        className={`shrink-0 px-4 py-2.5 rounded-full font-bold text-sm active:scale-95 transition ${
          enough
            ? 'bg-gradient-to-r from-sun-400 to-sun-500 text-white shadow-sun'
            : 'bg-cream-100 text-ink-400 cursor-default'
        }`}
      >
        {enough ? '兑换' : `还差 ${item.cost - stars}`}
      </button>
    </div>
  )
}

// ---------- 主页面 ----------
export default function RewardsPage() {
  const [tick, setTick] = useState(0) // localStorage 非响应式：变更后 bump 强制重渲染
  const [celebrate, setCelebrate] = useState('')
  const [manage, setManage] = useState(false) // 家长管理模式
  const [draft, setDraft] = useState<ShopItem[]>(getShop())
  const bump = () => setTick((t) => t + 1)

  const stars = getStars()
  const streak = getStreak()
  const daily = getDailyProgress()
  const shop = getShop()
  const redeemed = getRedeemed()
  void tick // 依赖触发重渲染

  const goBack = () => { window.location.hash = '' ; window.location.pathname = '/' }

  const onRedeem = (it: ShopItem) => {
    if (redeem(it)) {
      setCelebrate(`${it.emoji} 兑换成功！`)
      setTimeout(() => setCelebrate(''), 1800)
      bump()
    }
  }

  // ------- 家长管理模式：编辑奖励项 -------
  if (manage) {
    const update = (i: number, patch: Partial<ShopItem>) => {
      const next = draft.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
      setDraft(next)
    }
    const save = () => { setShop(draft.filter(d => d.name.trim())); setManage(false); bump() }
    const add = () => setDraft([...draft, { id: `c${Date.now()}`, name: '', emoji: '🎁', cost: 10 }])
    const del = (i: number) => setDraft(draft.filter((_, idx) => idx !== i))
    const restore = () => { resetShop(); setDraft(getShop()); bump() }

    return (
      <main className="min-h-screen bg-gradient-to-b from-cream-50 to-sun-50 p-4 sm:p-6 pb-24">
        <header className="flex items-center gap-3 mb-4 max-w-md mx-auto">
          <button onClick={() => setManage(false)} className="w-11 h-11 flex items-center justify-center text-2xl bg-white border-2 border-sun-200 rounded-full active:scale-95">←</button>
          <h1 className="text-xl font-bold text-pig-700">🎁 管理奖励（家长）</h1>
        </header>
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {draft.map((d, i) => (
            <div key={d.id} className="bg-white rounded-bubble shadow-card p-3 flex items-center gap-2">
              <input
                value={d.emoji}
                onChange={(e) => update(i, { emoji: e.target.value.slice(0, 2) })}
                className="w-12 text-center text-2xl bg-cream-50 rounded-xl py-1 border-2 border-cream-200"
                aria-label="图标"
              />
              <input
                value={d.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="奖励名称"
                className="flex-1 min-w-0 bg-cream-50 rounded-xl px-3 py-2 text-sm border-2 border-cream-200 text-ink-900"
              />
              <input
                value={d.cost}
                onChange={(e) => update(i, { cost: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })}
                inputMode="numeric"
                className="w-16 text-center bg-cream-50 rounded-xl px-2 py-2 text-sm border-2 border-cream-200 text-sun-700 font-bold"
                aria-label="星星数"
              />
              <button onClick={() => del(i)} className="w-9 h-9 shrink-0 text-chili-500 text-xl active:scale-95">✕</button>
            </div>
          ))}
          <button onClick={add} className="py-3 rounded-full bg-white border-2 border-dashed border-sun-300 text-sun-600 font-bold active:scale-95">＋ 添加奖励</button>
          <div className="flex gap-3 mt-2">
            <button onClick={save} className="flex-1 py-3 rounded-full bg-pig-500 text-white font-bold shadow-bubble active:scale-95">保存</button>
            <button onClick={restore} className="px-5 py-3 rounded-full bg-white border-2 border-cream-300 text-ink-500 text-sm font-bold active:scale-95">恢复默认</button>
          </div>
          <p className="text-xs text-ink-400 text-center mt-2">奖励存在本设备浏览器里，只在这台 pad 生效</p>
        </div>
      </main>
    )
  }

  // ------- 孩子视角 -------
  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-sun-50 p-4 sm:p-6 pb-10">
      <header className="flex items-center gap-3 mb-5 max-w-md mx-auto">
        <button onClick={goBack} className="w-11 h-11 flex items-center justify-center text-2xl bg-white border-2 border-sun-200 rounded-full active:scale-95" aria-label="返回">←</button>
        <h1 className="text-xl font-bold text-pig-700">🎁 我的奖励</h1>
      </header>

      {/* 星星余额 + 火焰 */}
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-bubble shadow-card p-4 text-center border-2 border-sun-200">
          <div className="text-4xl">⭐</div>
          <div className="text-3xl font-bold text-sun-700 mt-1">{stars}</div>
          <div className="text-xs text-ink-500 font-bold mt-0.5">我的星星</div>
        </div>
        <div className="bg-white rounded-bubble shadow-card p-4 text-center border-2 border-chili-500/30">
          <div className="text-4xl">🔥</div>
          <div className="text-3xl font-bold text-chili-600 mt-1">{streak.current}</div>
          <div className="text-xs text-ink-500 font-bold mt-0.5">连续学习天数</div>
        </div>
      </div>

      {/* 今日赚星进度（每日上限，防沉迷式刷星） */}
      <div className="max-w-md mx-auto bg-white rounded-bubble shadow-card p-4 mb-5 border-2 border-cream-200">
        <div className="flex justify-between text-xs font-bold text-ink-600 mb-2">
          <span>今天已赚 ⭐{daily.earned}</span>
          <span className="text-ink-400">每天最多 {daily.cap} 颗</span>
        </div>
        <div className="h-3.5 bg-cream-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sun-300 to-sun-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (daily.earned / daily.cap) * 100)}%` }}
          />
        </div>
      </div>

      {/* 兑换商店 */}
      <h2 className="max-w-md mx-auto text-lg font-bold text-ink-800 mb-2">🏅 星星可以换</h2>
      <div className="max-w-md mx-auto flex flex-col gap-3 mb-6">
        {shop.map((it) => (
          <RewardCard key={it.id} item={it} stars={stars} onRedeem={onRedeem} />
        ))}
      </div>

      {/* 兑换记录 */}
      {redeemed.length > 0 && (
        <>
          <h2 className="max-w-md mx-auto text-lg font-bold text-ink-800 mb-2">📜 换过的奖励</h2>
          <div className="max-w-md mx-auto flex flex-col gap-2 mb-6">
            {redeemed.slice().reverse().map((r, i) => (
              <div key={i} className="bg-white/80 rounded-2xl px-4 py-2.5 text-sm text-ink-700 flex justify-between">
                <span className="font-bold">{r.name}</span>
                <span className="text-sun-700">⭐{r.cost} · {new Date(r.at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-center">
        <button onClick={() => { setDraft(getShop()); setManage(true) }} className="text-xs text-ink-400 underline underline-offset-2">
          家长管理奖励
        </button>
      </div>

      {/* 兑换成功庆祝 */}
      {celebrate && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white/95 rounded-bubble shadow-card px-8 py-6 text-center pop-in">
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-lg font-bold text-pig-600">{celebrate}</p>
          </div>
        </div>
      )}
    </main>
  )
}
