import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { S2_LESSONS } from '@/data/s2-lessons'
import { lessonL05 } from '@/data/lessons'
import { BADGES } from '@/types'
import BadgeDisplay from '@/components/BadgeDisplay'
import { PIANO_SONGS, FIVE_KEYS } from '@/data/piano-songs'
import { loadPianoStats, calcPianoStreak, type PianoStats } from '@/data/piano-stats'
import { loadViolinStats, setViolinRewards, type ViolinStats } from '@/data/violin-stats'

export default function ParentReport() {
  const { lessonProgress, badges, streak, practiceDates } = useStore()
  const [pianoStats, setPianoStats] = useState<PianoStats | null>(null)
  useEffect(() => { setPianoStats(loadPianoStats()) }, [])
  const [violinStats, setViolinStats] = useState<ViolinStats | null>(null)
  useEffect(() => { setViolinStats(loadViolinStats()) }, [])
  const [rewardsText, setRewardsText] = useState('')
  useEffect(() => {
    if (violinStats) setRewardsText(violinStats.rewards.join('\n'))
  }, [violinStats])
  const saveRewards = () => {
    const list = rewardsText.split('\n').map(s => s.trim()).filter(Boolean)
    setViolinRewards(list)
    setViolinStats(loadViolinStats())
  }
  const allLessons = [lessonL05, ...S2_LESSONS].sort((a, b) => a.lessonId.localeCompare(b.lessonId))

  const completed = allLessons.filter(l => lessonProgress[l.lessonId]?.status === 'completed')
  const inProgress = allLessons.filter(l => lessonProgress[l.lessonId]?.status === 'in-progress')
  const totalDuration = completed.reduce((s, l) => s + (lessonProgress[l.lessonId]?.duration || 0), 0)
  const avgAccuracy = completed.length > 0
    ? completed.reduce((s, l) => s + (lessonProgress[l.lessonId]?.dictationAccuracy || 0), 0) / completed.length
    : 0

  // 薄弱环节：正确率 < 80% 的已完成课程
  const weakLessons = completed
    .filter(l => (lessonProgress[l.lessonId]?.dictationAccuracy ?? 1) < 0.8)
    .sort((a, b) => (lessonProgress[a.lessonId]?.dictationAccuracy ?? 1) - (lessonProgress[b.lessonId]?.dictationAccuracy ?? 1))

  // 近7天练习天数
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return d.toISOString().slice(0, 10)
  })
  const practiceThisWeek = last7Days.filter(d => practiceDates.includes(d)).length

  // 钢琴小游戏统计
  const pianoSongList = pianoStats
    ? PIANO_SONGS.map(s => ({
        ...s,
        completions: pianoStats.songs[s.id]?.completions ?? 0,
        lastAt: pianoStats.songs[s.id]?.lastCompletedAt ?? null,
      })).sort((a, b) => b.completions - a.completions)
    : []
  const pianoTotalCompletions = pianoSongList.reduce((s, x) => s + x.completions, 0)
  const pianoFreeMin = pianoStats ? Math.round(pianoStats.freePlaySeconds / 60) : 0
  const pianoStreak = pianoStats ? calcPianoStreak(pianoStats.practiceDates) : 0
  const pianoThisWeek = pianoStats
    ? last7Days.filter(d => pianoStats.practiceDates.includes(d)).length
    : 0
  // 弹错最多的音：取 top 3，带唱名/指法
  const topWrongNotes = pianoStats
    ? Object.entries(pianoStats.wrongNotes)
        .map(([midiStr, count]) => {
          const midi = Number(midiStr)
          const key = FIVE_KEYS.find(k => k.midi === midi)
          return { midi, count, solfege: key?.solfege ?? '?', finger: key?.finger ?? 0 }
        })
        .filter(x => x.count >= 2) // 至少按错 2 次才显示，避免一次性误触
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
    : []
  const totalWrong = topWrongNotes.reduce((s, x) => s + x.count, 0)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-sm text-gray-400">← 首页</Link>
        <span className="text-sm text-gray-400">家长报告</span>
      </div>

      {/* 概览 */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">📊 学习概览</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-purple-500">{completed.length}</div>
            <div className="text-xs text-gray-400">已完成课时</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-blue-500">{Math.round(avgAccuracy * 100)}%</div>
            <div className="text-xs text-gray-400">平均正确率</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-green-500">{Math.round(totalDuration / 60)}分</div>
            <div className="text-xs text-gray-400">总练习时长</div>
          </div>
        </div>
        <div className="mt-3 flex gap-3 text-center">
          <div className="flex-1 bg-orange-50 rounded-xl p-3">
            <div className="text-xl font-bold text-orange-500">{streak} 🔥</div>
            <div className="text-xs text-gray-400">连续天数</div>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-xl p-3">
            <div className="text-xl font-bold text-yellow-500">{practiceThisWeek}/7</div>
            <div className="text-xs text-gray-400">本周练习</div>
          </div>
          <div className="flex-1 bg-pink-50 rounded-xl p-3">
            <div className="text-xl font-bold text-pink-500">{badges.length}/{BADGES.length}</div>
            <div className="text-xs text-gray-400">徽章</div>
          </div>
        </div>
      </div>

      {/* 本周打卡 */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">📅 本周打卡</h2>
        <div className="flex justify-around">
          {last7Days.map((d) => {
            const practiced = practiceDates.includes(d)
            const dayName = ['日','一','二','三','四','五','六'][new Date(d).getDay()]
            const isToday = d === new Date().toISOString().slice(0, 10)
            return (
              <div key={d} className="text-center">
                <div className={`text-xs mb-1 ${isToday ? 'text-purple-500 font-bold' : 'text-gray-400'}`}>{dayName}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  practiced ? 'bg-green-100 text-green-500' : 'bg-gray-50 text-gray-300'
                }`}>
                  {practiced ? '✅' : '○'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 钢琴小游戏 */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-700">🎹 钢琴小游戏</h2>
          <Link to="/piano" className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">去弹 →</Link>
        </div>
        {!pianoStats || (pianoTotalCompletions === 0 && pianoFreeMin === 0) ? (
          <p className="text-sm text-gray-400 text-center py-4">
            还没弹过钢琴～ 等孩子玩一会儿这里就有数据啦
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-pink-50 rounded-xl p-2.5">
                <div className="text-xl font-bold text-pink-500">{pianoTotalCompletions}</div>
                <div className="text-[11px] text-gray-400">完整弹完</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-2.5">
                <div className="text-xl font-bold text-purple-500">{pianoFreeMin}分</div>
                <div className="text-[11px] text-gray-400">自由探索</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-2.5">
                <div className="text-xl font-bold text-orange-500">{pianoStreak}🔥 / {pianoThisWeek}天</div>
                <div className="text-[11px] text-gray-400">连续 / 本周</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {pianoSongList.filter(s => s.completions > 0).map(s => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-700 truncate">{s.title}</div>
                    <div className="text-[11px] text-gray-400">
                      {s.lastAt ? `上次：${new Date(s.lastAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}` : '—'}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-pink-500">×{s.completions}</span>
                </div>
              ))}
            </div>
            {topWrongNotes.length > 0 && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-xs font-bold text-amber-700 mb-1.5">🎯 可以多练这几个音（按错次数）</div>
                <div className="flex flex-wrap gap-1.5">
                  {topWrongNotes.map(n => (
                    <span key={n.midi} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-full text-xs text-amber-700 border border-amber-200">
                      <span className="font-bold">{n.solfege}</span>
                      <span className="text-amber-400">{n.finger}指</span>
                      <span className="text-amber-500 font-bold">×{n.count}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-amber-500/80 mt-1.5">
                  共按错 {totalWrong} 次 · 练熟这几个音，其它的就都简单了
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 徽章 */}
      <div className="mb-6">
        <BadgeDisplay badges={badges} />
      </div>

      {/* 小提琴练习 */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-700">🎻 小提琴练习</h2>
          <Link to="/violin" className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">去练习 →</Link>
        </div>
        {!violinStats || violinStats.totalSeconds === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            还没练过小提琴～ 点"去练习"开始吧
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-amber-50 rounded-xl p-2.5">
              <div className="text-xl font-bold text-amber-500">{Math.floor(violinStats.totalSeconds / 60)}</div>
              <div className="text-[11px] text-gray-400">累计分钟</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-2.5">
              <div className="text-xl font-bold text-yellow-500">⭐{violinStats.stars}</div>
              <div className="text-[11px] text-gray-400">可用星星</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5">
              <div className="text-xl font-bold text-green-500">{violinStats.redeemed}</div>
              <div className="text-[11px] text-gray-400">已兑换</div>
            </div>
          </div>
        )}
        {violinStats && violinStats.redemptions.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-bold text-gray-500 mb-1.5">最近兑换</div>
            <div className="space-y-1">
              {violinStats.redemptions.slice(0, 5).map((r, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 rounded-lg px-2 py-1">
                  <span className="text-gray-600 truncate">{r.reward}</span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {new Date(r.at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 奖励配置 */}
        <div className="mt-3 p-3 bg-orange-50 rounded-xl">
          <label className="block text-xs font-bold text-orange-700 mb-1.5">
            🎁 奖励池（每行一个，孩子满 10 颗星可兑换第一个）
          </label>
          <textarea
            value={rewardsText}
            onChange={e => setRewardsText(e.target.value)}
            rows={3}
            className="w-full p-2 rounded-lg border border-orange-200 text-sm resize-y focus:outline-none focus:border-orange-400 bg-white"
            placeholder={'一次公园游玩\n一本新绘本'}
          />
          <button
            onClick={saveRewards}
            className="mt-2 px-4 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold active:scale-95"
          >
            保存奖励
          </button>
        </div>
      </div>

      {/* 薄弱环节 */}
      {weakLessons.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">⚠️ 建议复习</h2>
          <p className="text-xs text-gray-400 mb-3">以下课程正确率较低，建议再练一次</p>
          <div className="space-y-2">
            {weakLessons.map(l => {
              const acc = lessonProgress[l.lessonId]?.dictationAccuracy ?? 0
              return (
                <Link key={l.lessonId} to={`/lesson/${l.lessonId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200 active:scale-95 transition-all">
                  <div>
                    <span className="text-sm font-bold text-gray-700">{l.lessonId}</span>
                    <span className="ml-2 text-sm text-gray-600">{l.lessonName}</span>
                  </div>
                  <span className="text-sm text-orange-500">{Math.round(acc * 100)}%</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 进行中 */}
      {inProgress.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">📝 进行中</h2>
          <div className="space-y-2">
            {inProgress.map(l => (
              <Link key={l.lessonId} to={`/lesson/${l.lessonId}`}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 active:scale-95 transition-all">
                <div>
                  <span className="text-sm font-bold text-gray-700">{l.lessonId}</span>
                  <span className="ml-2 text-sm text-gray-600">{l.lessonName}</span>
                </div>
                <span className="text-sm text-blue-400">继续 →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link to="/" className="btn-primary w-full text-center block">返回首页</Link>
    </div>
  )
}
