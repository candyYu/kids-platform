import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '@/store'
import { reviewChallenges } from '@/data/lessons'
import { lessonL05 } from '@/data/lessons'
import { S2_LESSONS } from '@/data/s2-lessons'
import { S3_LESSONS } from '@/data/s3-lessons'
import { S4_LESSONS } from '@/data/s4-lessons'
import BadgeDisplay from '@/components/BadgeDisplay'
import DailyTasks from '@/components/DailyTasks'

export default function Home() {
  const { lessonProgress, earProgress, badges, streak } = useStore()
  const [searchParams] = useSearchParams()
  const [titleTaps, setTitleTaps] = useState(0)
  const [freePractice, setFreePractice] = useState(false)
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({ S2: true, S3: false, S4: false })
  const urlUnlock = searchParams.get('unlock') === 'all'
  const devUnlock = urlUnlock || titleTaps >= 5 || freePractice

  const s2Lessons = [lessonL05, ...S2_LESSONS].sort((a, b) =>
    a.lessonId.localeCompare(b.lessonId)
  )
  const s3Lessons = [...S3_LESSONS].sort((a, b) =>
    a.lessonId.localeCompare(b.lessonId)
  )
  const s4Lessons = [...S4_LESSONS].sort((a, b) =>
    a.lessonId.localeCompare(b.lessonId)
  )
  const allLessons = [...s2Lessons, ...s3Lessons, ...s4Lessons]
  const r1Done = lessonProgress['R1']?.status === 'completed'
  const r2Done = lessonProgress['R2']?.status === 'completed'
  const r3Done = lessonProgress['R3']?.status === 'completed'
  const allReviewDone = r1Done && r2Done && r3Done
  const earDone = earProgress['E1']?.todayCount > 0

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 标题 */}
      <div className="text-center mb-6 mt-4">
        <h1
          className="text-4xl font-bold text-purple-600 select-none cursor-pointer"
          onClick={() => setTitleTaps(t => t + 1)}
        >
          🎵 小小音乐家
        </h1>
        <p className="text-gray-500 mt-2">视唱练耳 · 快乐闯关</p>
        {devUnlock && (
          <span className="inline-block mt-1 text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
            🔓 全部解锁
          </span>
        )}
      </div>

      {/* 徽章 + 打卡 */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <BadgeDisplay badges={badges} />
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center min-w-[80px]">
          <div className="text-3xl font-bold text-orange-500">{streak}</div>
          <div className="text-xs text-gray-400">连续天🔥</div>
        </div>
      </div>

      {/* 今日小任务 */}
      <DailyTasks />

      {/* 自由练习 + 家长报告 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFreePractice(v => !v)}
          className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${
            freePractice ? 'bg-green-100 text-green-600 border-2 border-green-300'
            : 'bg-gray-50 text-gray-400 border-2 border-gray-200'
          }`}
        >
          {freePractice ? '✅ 自由练习已开启' : '🔓 开启自由练习'}
        </button>
        <Link to="/report" className="flex-1 p-3 rounded-xl text-sm font-bold bg-purple-50 text-purple-500 border-2 border-purple-200 text-center">
          📋 家长报告
        </Link>
      </div>

      {/* 整体进度面板 */}
      {(() => {
        const totalLessons = allLessons.length
        const doneLessons = allLessons.filter(l => lessonProgress[l.lessonId]?.status === 'completed').length
        const reviewDone = [r1Done, r2Done, r3Done].filter(Boolean).length
        const earPoints = earProgress['E1']?.earPoints || 0
        const overallPct = Math.round(((doneLessons + reviewDone) / (totalLessons + 3)) * 100)
        return (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-500">📊 学习进度</h2>
              <span className="text-2xl font-bold text-purple-600">{overallPct}%</span>
            </div>
            {/* 进度条 */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all"
                style={{ width: `${overallPct}%` }} />
            </div>
            {/* 数据格 */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-orange-50 rounded-xl p-2">
                <div className="text-lg font-bold text-orange-500">{doneLessons}/{totalLessons}</div>
                <div className="text-xs text-gray-400">课时</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-2">
                <div className="text-lg font-bold text-purple-500">{reviewDone}/3</div>
                <div className="text-xs text-gray-400">闯关</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-2">
                <div className="text-lg font-bold text-blue-500">{earPoints}</div>
                <div className="text-xs text-gray-400">耳朵值</div>
              </div>
              <div className="bg-green-50 rounded-xl p-2">
                <div className="text-lg font-bold text-green-500">{streak}🔥</div>
                <div className="text-xs text-gray-400">连续天</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* S1 复习闯关 */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          🏆 入学闯关 {allReviewDone && '✅'}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          先测一测，看看从哪里开始
        </p>
        <div className="grid grid-cols-3 gap-3">
          {reviewChallenges.map((c, idx) => {
            const done = lessonProgress[c.challengeId]?.status === 'completed'
            // R1 始终解锁，R2 需要 R1 通关，R3 需要 R2 通关
            const prevId = idx > 0 ? reviewChallenges[idx - 1].challengeId : null
            const locked = devUnlock ? false : (prevId ? lessonProgress[prevId]?.status !== 'completed' : false)
            return (
              <Link
                key={c.challengeId}
                to={locked ? '#' : `/review/${c.challengeId}`}
                className={`text-center p-4 rounded-2xl transition-all active:scale-95 ${
                  done
                    ? 'bg-green-100 border-2 border-green-300'
                    : locked
                      ? 'bg-gray-50 border-2 border-gray-200 opacity-60'
                      : 'bg-purple-100 border-2 border-purple-200 hover:bg-purple-200'
                }`}
              >
                <div className="text-3xl mb-1">{done ? '⭐' : locked ? '🔒' : '▶️'}</div>
                <div className="text-sm font-bold text-gray-700">{c.challengeId}</div>
                <div className="text-xs text-gray-500">{c.name}</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 课程地图 - 按阶段分组（可折叠 + 跨阶段解锁） */}
      <div id="lessons">
      {([
        { title: '📚 S2 节奏进阶课程', stage: 'S2', lessons: s2Lessons, color: 'orange', prereq: null as string | null },
        { title: '🎼 S3 中级课程', stage: 'S3', lessons: s3Lessons, color: 'blue', prereq: 'S2-L24' },
        { title: '🎓 S4 高级课程', stage: 'S4', lessons: s4Lessons, color: 'purple', prereq: 'S3-L24' },
      ] as const).map(({ title, stage, lessons, color, prereq }) => {
        const expanded = expandedStages[stage] || devUnlock
        const stageUnlocked = devUnlock || !prereq || lessonProgress[prereq]?.status === 'completed'
        const completedCount = lessons.filter(l => lessonProgress[l.lessonId]?.status === 'completed').length
        const colorMap: Record<string, (done: boolean) => string> = {
          orange: d => d ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200 hover:bg-orange-100',
          blue: d => d ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
          purple: d => d ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        }
        return (
          <div className="card mb-6" key={title}>
            <button
              onClick={() => setExpandedStages(s => ({ ...s, [stage]: !s[stage] }))}
              className="w-full flex items-center justify-between mb-2"
            >
              <h2 className="text-xl font-bold text-gray-700">{title}</h2>
              <span className="text-sm text-gray-400">
                {completedCount}/{lessons.length} {expanded ? '▼' : '▶'}
              </span>
            </button>
            {!stageUnlocked && !devUnlock && (
              <p className="text-sm text-gray-400 mb-3">
                🔒 完成上一阶段最后一课即可解锁
              </p>
            )}
            {expanded && (
              <div className="grid gap-2">
                {lessons.map((l, idx) => {
                  const prog = lessonProgress[l.lessonId]
                  const done = prog?.status === 'completed'
                  const prevId = idx > 0 ? lessons[idx - 1].lessonId : null
                  // 第一课：检查跨阶段前置条件
                  const stagePrereqMet = idx === 0 ? stageUnlocked : true
                  const prevMet = prevId ? lessonProgress[prevId]?.status === 'completed' : true
                  const locked = devUnlock ? false : (!stagePrereqMet || !prevMet)
                  const accuracy = prog?.dictationAccuracy
                  return (
                    <Link
                      key={l.lessonId}
                      to={locked ? '#' : `/lesson/${l.lessonId}`}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all active:scale-95 ${
                        done ? 'bg-green-50 border-green-200'
                        : locked ? 'bg-gray-50 border-gray-200 opacity-60'
                        : colorMap[color](false)
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold text-gray-700">{l.lessonId}</span>
                        <span className="ml-2 text-sm text-gray-600">{l.lessonName}</span>
                        {l.kodalyReading && <span className="ml-2 text-xs text-purple-400">{l.kodalyReading}</span>}
                        {done && accuracy !== undefined && (
                          <span className="ml-2 text-xs text-green-500">
                            {'⭐'.repeat(Math.round(accuracy * 3))} {Math.round(accuracy * 100)}%
                          </span>
                        )}
                      </div>
                      <span className="text-lg">{done ? '✅' : locked ? '🔒' : '▶️'}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      </div>{/* /#lessons */}

      {/* 耳朵专项 */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          👂 耳朵训练 {earDone && '✅'}
        </h2>
        <Link
          to="/ear-training"
          className="block p-5 rounded-2xl bg-blue-100 border-2 border-blue-200 hover:bg-blue-200 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-700">每日 5 分钟耳训</div>
              <div className="text-sm text-gray-500 mt-1">
                单音听辨 + 旋律听辨
              </div>
            </div>
            <div className="text-2xl">{'👂'}</div>
          </div>
        </Link>
      </div>

      {/* 钢琴小游戏 */}
      <div className="card mb-6">
        <Link
          to="/piano"
          className="block p-5 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-pink-200 hover:from-pink-200 hover:to-purple-200 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-700">🎹 钢琴小游戏</div>
              <div className="text-sm text-gray-500 mt-1">
                跟着高亮键弹儿歌 · 自由弹奏
              </div>
            </div>
            <div className="text-3xl">🐯</div>
          </div>
        </Link>
      </div>

      {/* 外部练耳工具 */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          🚀 更多练耳工具
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          离开小小音乐家，去其他网站练习
        </p>
        <div className="grid gap-2">
          <a
            href="https://chord-ear-trainer.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 transition-all active:scale-95"
          >
            <div>
              <div className="text-base font-bold text-gray-700">🎹 和弦听辨</div>
              <div className="text-xs text-gray-500 mt-1">
                七和弦听辨训练 · 学习/练习/统计
              </div>
            </div>
            <span className="text-lg text-indigo-400">↗</span>
          </a>
          <a
            href="https://www.shengyitongmusic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-pink-50 border-2 border-pink-200 hover:bg-pink-100 transition-all active:scale-95"
          >
            <div>
              <div className="text-base font-bold text-gray-700">🎵 声艺通视唱练耳</div>
              <div className="text-xs text-gray-500 mt-1">
                音准 · 听辨 · 视唱综合训练（游客可体验）
              </div>
            </div>
            <span className="text-lg text-pink-400">↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}
