// 关卡详情：5 阶段流水线
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getLesson } from '@/data/lessons'
import { db, ensureDefaults, ensureLessons, LessonRecord } from '@/db/schema'
import { IntroStage } from '@/components/stages/IntroStage'
import { RuleStage } from '@/components/stages/RuleStage'
import { DemoStage } from '@/components/stages/DemoStage'
import { DictationStage } from '@/components/stages/DictationStage'
import { QuizStage } from '@/components/stages/QuizStage'
import { ChallengeStage } from '@/components/stages/ChallengeStage'
import { updateStreak } from '@/utils/badges'
import { useLiveQuery } from 'dexie-react-hooks'

type Stage = 'intro' | 'rule' | 'demo' | 'dictation' | 'quiz' | 'challenge' | 'done'

const STAGES: { key: Stage; label: string; emoji: string }[] = [
  { key: 'intro', label: '认识', emoji: '👀' },
  { key: 'rule', label: '规则', emoji: '📐' },
  { key: 'demo', label: '看视频', emoji: '🎬' },
  { key: 'dictation', label: '听写', emoji: '✏️' },
  { key: 'quiz', label: '拼读', emoji: '🎯' },
  { key: 'challenge', label: '闯关', emoji: '🏆' },
]

export default function LessonPage() {
  const { lessonId } = useParams()
  const lesson = getLesson(lessonId || '')
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('intro')
  const [stats, setStats] = useState({ dictationCorrect: 0, dictationTotal: 0, quizCorrect: 0, quizTotal: 0 })

  const lessonRec = useLiveQuery(() => lesson ? db.lessons.get(lesson.id) : undefined, [lesson?.id])

  useEffect(() => {
    void (async () => {
      await ensureDefaults()
      await ensureLessons()
      await updateStreak()
    })()
  }, [])

  if (!lesson) {
    return (
      <main className="p-6">
        <p>关卡不存在：{lessonId}</p>
        <Link to="/map" className="text-pig-700 underline">返回地图</Link>
      </main>
    )
  }

  const stageIdx = STAGES.findIndex(s => s.key === stage)
  const progress = ((stageIdx + 1) / STAGES.length) * 100

  return (
    <main className="min-h-screen bg-cream-50 pb-24">
      {/* 顶部 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-pig-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/map" className="text-pig-700 text-2xl">←</Link>
          <div className="flex-1">
            <h1 className="text-child font-bold text-sea-900">{lesson.code} · {lesson.name}</h1>
            {lessonRec && lessonRec.stars > 0 && (
              <p className="text-xs text-sun-700">
                {'⭐'.repeat(lessonRec.stars)} 最高 {lessonRec.bestScore}/10
              </p>
            )}
          </div>
        </div>
        {/* 阶段 tab 栏 - 可点击切换 */}
        {stage !== 'done' && (
          <div className="flex gap-1">
            {STAGES.map((s, i) => {
              const passed = i < stageIdx
              const current = i === stageIdx
              return (
                <button
                  key={s.key}
                  onClick={() => setStage(s.key)}
                  className={`flex-1 h-11 rounded-soft text-sm font-bold flex items-center justify-center gap-1 transition ${
                    current
                      ? 'bg-pig-500 text-white shadow-bubble'
                      : passed
                      ? 'bg-pig-100 text-pig-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  title={s.label}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* 阶段内容 */}
      <div className="p-6 max-w-2xl mx-auto">
        {stage === 'intro' && <IntroStage lesson={lesson} onComplete={() => setStage('rule')} />}
        {stage === 'rule' && <RuleStage lessonId={lesson.id} onComplete={() => setStage('demo')} />}
        {stage === 'demo' && <DemoStage lesson={lesson} onComplete={() => setStage('dictation')} />}
        {stage === 'dictation' && (
          <DictationStage
            lesson={lesson}
            onComplete={(c, t) => {
              setStats(s => ({ ...s, dictationCorrect: c, dictationTotal: t }))
              setStage('quiz')
            }}
          />
        )}
        {stage === 'quiz' && (
          <QuizStage
            lesson={lesson}
            onComplete={(c, t) => {
              setStats(s => ({ ...s, quizCorrect: c, quizTotal: t }))
              setStage('challenge')
            }}
          />
        )}
        {stage === 'challenge' && (
          <ChallengeStage
            lesson={lesson}
            onComplete={() => setStage('done')}
          />
        )}
        {stage === 'done' && <DonePanel lessonName={lesson.name} onBack={() => navigate('/map')} />}
      </div>
    </main>
  )
}

function DonePanel({ lessonName, onBack }: { lessonName: string; onBack: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-9xl mb-4">🎊</div>
      <h2 className="text-child-xl font-bold text-sea-900 mb-3">通关啦！</h2>
      <p className="text-child text-pig-700 mb-8">{lessonName} 全部完成</p>
      <button
        onClick={onBack}
        className="px-10 py-5 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble active:scale-95"
      >
        返回地图 →
      </button>
    </div>
  )
}
