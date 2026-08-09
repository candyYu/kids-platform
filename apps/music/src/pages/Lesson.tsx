import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { lessonL05 } from '@/data/lessons'
import { S2_LESSONS } from '@/data/s2-lessons'
import { S3_LESSONS } from '@/data/s3-lessons'
import { S4_LESSONS } from '@/data/s4-lessons'
import { useStore } from '@/store'
import { db } from '@/db'
import { audioEngine } from '@/audio/engine'
import DictationQuiz from '@/components/DictationQuiz'
import RhythmCard from '@/components/RhythmCard'
import { CurwenHandSignRow } from '@/components/CurwenHandSign'
import DualNotation from '@/components/DualNotation'
import Waveform from '@/components/Waveform'
import type { SegmentType, RhythmPattern, Solfege, NoteName } from '@/types'
import { NOTE_MAP, noteBase } from '@/types'

/** 节奏型 -> Dalcroze 体态律动指令 */
const DALCROZE: Record<string, string[]> = {
  'quarter': ['站起来，稳稳走 4 步（ta-ta-ta-ta）', '每步像小大象，踩得稳稳的', '坐下拍手 4 次，再拍腿 4 次', '换成 ta-ta ta-ta，手腿交替'],
  'two-eighths': ['站起来，走 4 步（ta-ta-ta-ta）', '每步变成小碎步（ti-ti ti-ti）', '一步走 + 两步碎步 = ti-ti！', '坐下，拍腿（长）+ 拍手拍手（快快）'],
  'dotted-quarter-eighth': ['站起来，慢慢走一步（长--），快走半步（短！）', '长-短 = ta-i · ti！像滑冰一样摇摆', '重复：长-短、长-短、长-短、长-短', '坐下，拍腿（长）+ 拍手（短），感受附点摇摆'],
  'four-sixteenths': ['站起来，原地快速踏步 4 下（ti-ri-ti-ri）', '像小兔子快快快快！', '走 1 步（ta）+ 快踏 4 下（ti-ri-ti-ri）', '坐下，手指轻敲桌面 4 下，再拍手 1 下'],
  'syncopation': ['站起来，快走半步--长走一步--快走半步', '短-长-短 = ti · ta · ti！像跛脚小鸭子', '重复：短长短、短长短', '坐下，拍手（轻）- 拍腿（重）- 拍手（轻）'],
  'half': ['站起来，走一步停两拍（ta-a--）', '像大恐龙慢慢走，每步很久', '两拍走 + 两拍停 = ta-a ta-a', '坐下，双手举高停住（长），再放下'],
  'whole': ['站起来，走一步停四拍（ta-a-a-a）', '像大树一样站着不动，数 4 拍', '一步走 4 拍 = ta-a-a-a！', '坐下，双手画一个大大的圆'],
  'eighth-two-sixteenths': ['站起来，走 1 步（ti）+ 快踏 2 下（ti-ri）', '长-短短 = ti · ti-ri！', '重复 4 次：长-短短', '坐下，拍腿 1 下 + 拍手 2 下'],
  'two-sixteenths-eighth': ['站起来，快踏 2 下（ti-ri）+ 走 1 步（ti）', '短短-长 = ti-ri · ti！', '重复 4 次：短短-长', '坐下，拍手 2 下 + 拍腿 1 下'],
  'quarter-rest': ['站起来，走 1 步--停 1 拍（不出声）', '走-停-走-停，像红灯绿灯游戏', '停的时候身体不动，嘴巴闭紧', '坐下，拍手--停--拍手--停'],
}

const SEGMENT_NAMES: Record<SegmentType, string> = {
  warmup: '热身', lecture: '讲解', dictation: '听辨',
  sightReading: '视唱', singing: '录音', summary: '总结',
}

/** 检测课程类型 */
type LessonType = 'rhythm' | 'scale' | 'interval' | 'chord' | 'practice'
function getLessonType(lesson: { lessonName: string; trainingPoint: string }): LessonType {
  const t = lesson.trainingPoint + lesson.lessonName
  if (/和弦|和声|进行|七和弦|转位/.test(t)) return 'chord'
  if (/音程|度|三全音|转位/.test(t)) return 'interval'
  if (/大调|小调|调式|调性|音阶|五声|Dorian|Mixolydian/.test(t)) return 'scale'
  if (/视唱|听写|曲式|即兴|转调|声部/.test(t)) return 'practice'
  return 'rhythm'
}

/** 课型 -> 暖场 emoji */
const TYPE_EMOJI: Record<LessonType, string> = {
  rhythm: '🥁', scale: '🎼', interval: '🎵', chord: '🎹', practice: '🎤',
}

/** 课型 -> 儿童化引导语 */
const TYPE_GREETING: Record<LessonType, string> = {
  rhythm: '小朋友好！今天来玩节奏游戏，像小火车一样走走停停！',
  scale: '小朋友好！今天来爬音阶楼梯，从 do 一直往上走！',
  interval: '小朋友好！今天来听两个音之间的距离，像量身高一样！',
  chord: '小朋友好！今天来听几个音一起唱歌，像合唱团一样！',
  practice: '小朋友好！今天来挑战综合练习，展示你的本领！',
}

/** 课型 -> 教学小贴士 */
const TYPE_TIP: Record<LessonType, string> = {
  rhythm: '',
  scale: '音阶就像楼梯，do 是第一级，一个一个往上走，mi-fa 和 si-do 是半步（最近），其他都是整步。',
  interval: '两个音之间的距离叫"音程"。距离越大，声音越开阔。度数 = 往上数几个音（含自己）。',
  chord: '三个或更多音同时发响就是和弦。大三和弦听起来明亮开心，小三和弦听起来温柔暗淡，属七和弦有紧张感想要解决。',
  practice: '把前面学过的节奏和音高结合起来，就像把积木拼在一起搭房子！',
}

/** Curwen 手势教法 */
const CURWEN_TIPS: Record<string, string> = {
  do: '握拳，手心朝下，放在腰间',
  re: '手平放，指尖斜向上',
  mi: '手平放，与肩同高',
  fa: '大拇指朝下，食指向上',
  sol: '手掌自然张开，微微向上',
  la: '手掌朝下，指尖斜下',
  si: '食指指向斜下方',
}

/** P2-9: 童谣素材库 -- 按课程 ID 关联 */
interface NurseryRhyme {
  title: string
  notes: string[]
  rhythm: string[]
  desc: string
}
const NURSERY_RHYMES: Record<string, NurseryRhyme> = {
  'S2-L09': {
    title: '小星星',
    notes: ['C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4'],
    rhythm: ['quarter','quarter','quarter','quarter','quarter','quarter','half','quarter','quarter','quarter','quarter','quarter','quarter','half'],
    desc: '用刚学的 C 大调音阶唱《小星星》开头～',
  },
  'S2-L10': {
    title: '两只老虎',
    notes: ['C4','D4','E4','C4','C4','D4','E4','C4','E4','F4','G4','E4','F4','G4'],
    rhythm: ['quarter','quarter','quarter','quarter','quarter','quarter','quarter','quarter','quarter','quarter','half','quarter','quarter','half'],
    desc: '用 do-re-mi 唱《两只老虎》，两只老虎跑得快～',
  },
  'S2-L13': {
    title: '生日快乐',
    notes: ['G4','G4','A4','G4','C5','B4','G4','G4','A4','G4','D5','C5'],
    rhythm: ['eighth','eighth','quarter','quarter','quarter','half','eighth','eighth','quarter','quarter','quarter','half'],
    desc: '祝你生日快乐！用 sol-la-si-do 唱出来～',
  },
}

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const ALL_LESSONS = [lessonL05, ...S2_LESSONS, ...S3_LESSONS, ...S4_LESSONS]
  const lesson = ALL_LESSONS.find(l => l.lessonId === lessonId) || lessonL05
  const updateProgress = useStore((s) => s.updateLessonProgress)
  const [segIdx, setSegIdx] = useState(0)
  const [dictResult, setDictResult] = useState({ correct: 0, total: 0, results: [] as boolean[] })
  const [singVolume, setSingVolume] = useState<'normal'|'quiet'|'silent'|null>(null)
  const [recording, setRecording] = useState(false)
  const [startTime] = useState(Date.now())
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [demoPlaying, setDemoPlaying] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [playingBack, setPlayingBack] = useState(false)
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)
  const segments = lesson.segments
  const seg = segments[segIdx]
  const lessonType = getLessonType(lesson)

  // 切换课程时重置所有状态，从第一段开始
  useEffect(() => {
    setSegIdx(0)
    setDictResult({ correct: 0, total: 0, results: [] })
    setSingVolume(null)
    setRecording(false)
    setRecordingUrl(null)
    setRecordingBlob(null)
    setPlayingBack(false)
    setDemoPlaying(false)
    setActiveNoteIdx(null)
    setMetronomeOn(false)
    setCountdown(null)
    audioEngine.stopMetronome()
    audioEngine.stopPlayback()
  }, [lessonId])

  /** 播放课程预览音频（第一题的音频） */
  const playPreview = async () => {
    const q = lesson.dictationQuestions?.[0]
    if (!q?.audio) { await audioEngine.playRhythm('quarter', 60); return }
    const { notes, rhythm, tempo, chord } = q.audio
    if (chord && notes && notes.length > 0) {
      await audioEngine.playChord(notes, 1.5)
    } else if (notes && notes.length > 0) {
      await audioEngine.playMelody(notes, rhythm, tempo)
    } else if (q.audio) {
      await audioEngine.playAudioPattern(q.audio)
    }
  }

  const goNext = () => {
    if (segIdx < segments.length - 1) setSegIdx(segIdx + 1)
  }

  /** P2-9: 播放童谣 */
  const [rhymePlaying, setRhymePlaying] = useState(false)
  const playNurseryRhyme = async (rhyme: NurseryRhyme) => {
    if (rhymePlaying) return
    setRhymePlaying(true)
    await audioEngine.playMelody(rhyme.notes, rhyme.rhythm as any[], 60)
    const dur = audioEngine.getRhythmTotalDuration(rhyme.rhythm as any[], 60) * 1000 + 300
    setTimeout(() => setRhymePlaying(false), dur)
  }

  const handleDictComplete = (correct: number, total: number, results: boolean[]) => {
    setDictResult({ correct, total, results })
    goNext()
  }

  // 老师示范：播放本课第一题完整旋律
  const playDemo = async () => {
    if (demoPlaying) return
    setDemoPlaying(true)
    const q = lesson.dictationQuestions?.[0]
    if (!q?.audio) { setDemoPlaying(false); return }
    const { notes, rhythm, tempo, chord } = q.audio
    if (notes && notes.length > 0) {
      if (chord) {
        await audioEngine.playChord(notes)
        setTimeout(() => setDemoPlaying(false), 2000)
      } else {
        await audioEngine.playMelody(notes, rhythm, tempo)
        const duration = audioEngine.getRhythmTotalDuration(rhythm, tempo) * 1000 + 300
        // Curwen 手势动画：按旋律节奏逐个高亮
        const solfegeList = [...new Set(notes.map(n => NOTE_MAP[noteBase(n) as NoteName]?.solfege).filter(Boolean))] as Solfege[]
        const beatSec = 60 / tempo
        let cumTime = 0
        notes.forEach((note, i) => {
          const r = rhythm[i] || 'quarter'
          const beats = r === 'quarter' ? 1 : r === 'eighth' ? 0.5 : r === 'half' ? 2 : 4
          const sol = NOTE_MAP[noteBase(note) as NoteName]?.solfege
          const idx = solfegeList.indexOf(sol as Solfege)
          setTimeout(() => setActiveNoteIdx(idx >= 0 ? idx : null), cumTime * 1000)
          cumTime += beats * beatSec
        })
        setTimeout(() => setActiveNoteIdx(null), duration)
        setTimeout(() => setDemoPlaying(false), duration)
      }
    } else {
      await audioEngine.playAudioPattern(q.audio)
      const duration = audioEngine.getRhythmTotalDuration(rhythm, tempo) * 1000 + 300
      setTimeout(() => setDemoPlaying(false), duration)
    }
  }

  // 节拍器开关
  const toggleMetronome = async () => {
    if (metronomeOn) {
      audioEngine.stopMetronome()
      setMetronomeOn(false)
    } else {
      await audioEngine.startMetronome(60)
      setMetronomeOn(true)
    }
  }

  const startSing = async () => {
    // 3-2-1 倒计时
    for (let n = 3; n > 0; n--) {
      setCountdown(n)
      await new Promise(r => setTimeout(r, 800))
    }
    setCountdown(null)

    // 开始录音 + 节拍器伴奏
    await audioEngine.startRecording()
    if (!metronomeOn) {
      await audioEngine.startMetronome(60)
      setMetronomeOn(true)
    }
    setRecording(true)

    // 播放老师示范旋律作为伴奏
    const q = lesson.dictationQuestions?.[0]
    if (q?.audio?.notes && q.audio.notes.length > 0) {
      audioEngine.playMelody(q.audio.notes, q.audio.rhythm, q.audio.tempo)
    } else if (q?.audio) {
      audioEngine.playAudioPattern(q.audio)
    }
  }

  const stopSing = async () => {
    const blob = await audioEngine.stopRecording()
    audioEngine.stopMetronome()
    setMetronomeOn(false)
    const vol = await audioEngine.analyzeVolume(blob)
    setSingVolume(vol)
    setRecording(false)
    setRecordingBlob(blob)
    // 保存录音到 IndexedDB 并创建回放 URL
    const recId = `${lesson.lessonId}-${Date.now()}`
    await db.recordings.put({
      id: recId, lessonId: lesson.lessonId, blob,
      createdAt: new Date().toISOString(), volumeLevel: vol,
    })
    setRecordingUrl(URL.createObjectURL(blob))
  }

  // 播放/停止录音回放
  const togglePlayback = () => {
    if (!recordingUrl) return
    if (playingBack) {
      audioEngine.stopPlayback()
      setPlayingBack(false)
    } else {
      audioEngine.playRecording(recordingUrl, () => setPlayingBack(false))
      setPlayingBack(true)
    }
  }

  // 重置录音状态（再唱一次）
  const resetSing = () => {
    setSingVolume(null)
    setRecordingUrl(null)
    setRecordingBlob(null)
    setPlayingBack(false)
  }

  const recordPractice = useStore((s) => s.recordPractice)
  const checkBadges = useStore((s) => s.checkBadges)

  useEffect(() => {
    if (seg === 'summary') {
      const accuracy = dictResult.total > 0 ? dictResult.correct / dictResult.total : 0
      const passed = accuracy >= lesson.passThreshold
      updateProgress({
        lessonId: lesson.lessonId,
        status: passed ? 'completed' : 'in-progress',
        dictationAccuracy: accuracy,
        duration: Math.round((Date.now() - startTime) / 1000),
        completedAt: new Date().toISOString(),
      })
      // 记录练习 + 检查徽章
      recordPractice(lesson.lessonId, accuracy, Math.round((Date.now() - startTime) / 1000))
      checkBadges({
        lessonCompleted: passed,
        sang: singVolume === 'normal' || singVolume === 'quiet',
      })
    }
  }, [seg])

  // 组件卸载时清理：停止节拍器和录音回放
  useEffect(() => {
    return () => {
      audioEngine.stopMetronome()
      audioEngine.stopPlayback()
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-sm text-gray-400">← 首页</Link>
        <span className="text-sm text-gray-400">{lesson.lessonName}</span>
      </div>
      {/* 进度条 */}
      <div className="flex gap-1 mb-6">
        {segments.map((s, i) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${i <= segIdx ? 'bg-purple-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-center text-sm text-gray-400 mb-6">
        第 {segIdx+1}/{segments.length} 段 · {SEGMENT_NAMES[seg]}
      </p>

      {/* 第1段 暖场 */}
      {seg === 'warmup' && (
        <div className="card text-center">
          <div className="text-5xl mb-4">{TYPE_EMOJI[lessonType]}</div>
          <p className="text-orange-400 text-sm mb-3">{TYPE_GREETING[lessonType]}</p>
          <h2 className="text-xl font-bold text-gray-700 mb-3">今天学：{lesson.lessonName}</h2>
          <p className="text-gray-500 mb-4">Kodály 读法：{lesson.kodalyReading}</p>
          <p className="text-sm text-gray-400 mb-4">{lesson.trainingPoint}</p>
          <button onClick={playPreview} className="btn-secondary mb-3">🔊 听一听</button>
          <button onClick={goNext} className="btn-primary">开始学习 -&gt;</button>
        </div>
      )}

      {/* 第2段 讲解 */}
      {seg === 'lecture' && (() => {
        const q = lesson.dictationQuestions?.[0]
        const mainRhythm = q?.audio?.rhythm?.[0] || 'quarter'
        const notes = q?.audio?.notes
        const isChord = q?.audio?.chord

        // 节奏课：节奏卡 + Dalcroze 体态律动
        if (lessonType === 'rhythm') {
          return (
            <div className="card text-center">
              <h2 className="text-xl font-bold text-gray-700 mb-4">{lesson.lessonName} 怎么读？</h2>
              <div className="mb-4">
                <RhythmCard pattern={mainRhythm as RhythmPattern} label={lesson.lessonName} />
              </div>
              <div className="bg-orange-50 rounded-2xl p-3 mb-4 text-left">
                <p className="text-sm font-bold text-orange-600 mb-2">🚶 跟着老师做：</p>
                {(DALCROZE[mainRhythm] || DALCROZE['quarter']).map((step, i) => (
                  <p key={i} className={`text-sm text-gray-500 ${i < 3 ? 'mb-1' : ''}`}>{i + 1}. {step}</p>
                ))}
              </div>
              <button onClick={goNext} className="btn-primary">听辨练习 -&gt;</button>
            </div>
          )
        }

        // 非节奏课：五线谱 + 教学说明
        return (
          <div className="card text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-4">{lesson.lessonName}</h2>
            {/* 五线谱+简谱 */}
            {notes && notes.length > 0 && (
              <div className="mb-4">
                <DualNotation
                  notes={notes}
                  rhythm={q?.audio?.rhythm}
                  label={isChord ? '和弦音符' : '旋律'}
                />
              </div>
            )}
            {/* 教学说明 */}
            <div className="bg-blue-50 rounded-2xl p-3 mb-4 text-left">
              <p className="text-sm font-bold text-blue-600 mb-2">📖 知识点：</p>
              <p className="text-sm text-gray-600 mb-1">{lesson.trainingPoint}</p>
              <p className="text-sm text-gray-500">Kodály 读法：{lesson.kodalyReading}</p>
              {TYPE_TIP[lessonType] && (
                <p className="text-sm text-blue-500 mt-2">{TYPE_TIP[lessonType]}</p>
              )}
              {isChord && <p className="text-sm text-purple-500 mt-1">🔊 这是和弦，多个音同时发声</p>}
            </div>
            {/* P2-9: 童谣素材 */}
            {NURSERY_RHYMES[lesson.lessonId] && (() => {
              const rhyme = NURSERY_RHYMES[lesson.lessonId]
              return (
                <div className="bg-green-50 rounded-2xl p-3 mb-4 text-left">
                  <p className="text-sm font-bold text-green-600 mb-1">🎵 童谣实践：《{rhyme.title}》</p>
                  <p className="text-sm text-gray-500 mb-2">{rhyme.desc}</p>
                  <DualNotation notes={rhyme.notes} rhythm={rhyme.rhythm as any} label={rhyme.title} />
                  <button
                    onClick={() => playNurseryRhyme(rhyme)}
                    disabled={rhymePlaying}
                    className={`btn-secondary mt-2 ${rhymePlaying ? 'opacity-50' : ''}`}
                  >
                    {rhymePlaying ? '🎵 播放中...' : `🔊 听《${rhyme.title}》`}
                  </button>
                </div>
              )
            })()}
            <button onClick={playPreview} className="btn-secondary mb-3">🔊 听一听</button>
            <button onClick={goNext} className="btn-primary">听辨练习 -&gt;</button>
          </div>
        )
      })()}

      {/* 第3段 听辨 */}
      {seg === 'dictation' && (
        <DictationQuiz
          questions={lesson.dictationQuestions || []}
          onComplete={handleDictComplete}
          title="听一听，选一选"
        />
      )}

      {/* 第4段 视唱 */}
      {seg === 'sightReading' && (() => {
        const rhythm = lesson.dictationQuestions?.[0]?.audio?.rhythm?.[0] || 'quarter'
        const notes = lesson.dictationQuestions?.[0]?.audio?.notes
        // 将音名转成唱名，去重，用于展示手势
        const solfegeNotes: Solfege[] = notes && notes.length > 0
          ? [...new Set(notes.map(n => NOTE_MAP[noteBase(n) as NoteName]?.solfege).filter(Boolean))] as Solfege[]
          : ['do', 're', 'mi']
        return (
          <div className="card text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-4">跟着老师唱</h2>
            <div className="mb-4">
              <RhythmCard pattern={rhythm as RhythmPattern} label="视唱节奏" />
            </div>
            {/* 五线谱+简谱双谱 */}
            {notes && notes.length > 0 && (
              <div className="mb-4">
                <DualNotation
                  notes={notes}
                  rhythm={lesson.dictationQuestions?.[0]?.audio?.rhythm}
                  label="五线谱 + 简谱"
                />
              </div>
            )}
            {/* Curwen 手势提示 */}
            <div className="bg-purple-50 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">🙌 手势提示（跟着做）</p>
              <CurwenHandSignRow notes={solfegeNotes} size={56} activeIndex={activeNoteIdx} />
              <div className="mt-3 space-y-1">
                {solfegeNotes.map(s => CURWEN_TIPS[s] && (
                  <p key={s} className="text-xs text-purple-500">{s}：{CURWEN_TIPS[s]}</p>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-center mb-4">
              <button onClick={playDemo} disabled={demoPlaying}
                className={`btn-secondary ${demoPlaying ? 'opacity-50' : ''}`}>
                {demoPlaying ? '🎵 播放中...' : '🎤 老师示范'}
              </button>
              <button onClick={toggleMetronome}
                className={`btn-secondary ${metronomeOn ? 'bg-orange-200' : ''}`}>
                {metronomeOn ? '⏸️ 关节拍器' : '▶️ 开节拍器'}
              </button>
            </div>
            <button onClick={goNext} className="btn-primary">我来录音 -&gt;</button>
          </div>
        )
      })()}

      {/* 第5段 录音 */}
      {seg === 'singing' && (
        <div className="card text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            {lessonType === 'chord' ? '🎤 听和弦，唱分解' : '🎤 模唱录音'}
          </h2>
          <p className="text-sm text-orange-400 mb-4">
            {lessonType === 'chord' ? '先听和弦，再一个一个音轻轻唱出来～' : '用轻轻的声音唱，像说话一样～'}
          </p>

          {/* 倒计时显示 */}
          {countdown !== null && (
            <div className="text-8xl font-bold text-purple-500 animate-pulse mb-4">
              {countdown}
            </div>
          )}

          {/* 录音前 */}
          {singVolume === null && !recording && countdown === null && (
            <div>
              <div className="flex gap-2 justify-center mb-4">
                <button onClick={playDemo} disabled={demoPlaying}
                  className={`btn-secondary ${demoPlaying ? 'opacity-50' : ''}`}>
                  {demoPlaying ? '🎵 示范中...' : '🎤 老师示范'}
                </button>
                <button onClick={toggleMetronome}
                  className={`btn-secondary ${metronomeOn ? 'bg-orange-200' : ''}`}>
                  {metronomeOn ? '⏸️ 关节拍器' : '▶️ 开节拍器'}
                </button>
              </div>
              <button onClick={startSing}
                className="w-24 h-24 rounded-full text-4xl text-white shadow-lg bg-purple-500 hover:bg-purple-600 transition-all">
                🎤
              </button>
              <p className="text-sm text-gray-400 mt-3">点击开始录音</p>
              <p className="text-xs text-gray-300 mt-2">💡 倒计时 3 秒后开始，会自动开节拍器，唱完点击停止</p>
            </div>
          )}

          {/* 录音中 */}
          {recording && (
            <div>
              <Waveform mode="live" stream={audioEngine.getRecordingStream()} height={90} />
              <div className="w-20 h-20 rounded-full text-3xl text-white shadow-lg bg-red-500 animate-pulse mx-auto flex items-center justify-center mt-3">
                🔴
              </div>
              <p className="text-lg text-red-500 font-bold mt-2">唱！跟着节拍器～</p>
              {metronomeOn && <p className="text-sm text-orange-400 mt-1">🥁 节拍器播放中</p>}
              <button onClick={stopSing}
                className="btn-primary mt-4 bg-red-500 hover:bg-red-600">
                ⏹️ 停止录音
              </button>
            </div>
          )}

          {/* 录音后反馈 */}
          {singVolume !== null && (
            <div>
              {/* 静态波形展示 */}
              {recordingBlob && (
                <div className="mb-4">
                  <Waveform mode="static" blob={recordingBlob} height={70} />
                </div>
              )}
              <div className="text-5xl mb-3">{singVolume === 'normal' ? '🎵' : singVolume === 'quiet' ? '🔈' : '😶'}</div>
              <p className="text-lg text-gray-600 mb-4">
                {singVolume === 'normal' ? '唱得很好听！' : singVolume === 'quiet' ? '声音再大一点点' : '好像没听到声音'}
              </p>
              {/* 录音回放 */}
              {recordingUrl && (
                <button onClick={togglePlayback}
                  className={`btn-secondary mb-3 ${playingBack ? 'bg-blue-200' : ''}`}>
                  {playingBack ? '⏹️ 停止回放' : '▶️ 听听自己唱的'}
                </button>
              )}
              <div>
                <button onClick={resetSing} className="btn-secondary mr-2">再唱一次</button>
                <button onClick={goNext} className="btn-primary">查看结果 -&gt;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 第6段 总结 */}
      {seg === 'summary' && (() => {
        const acc = dictResult.total > 0 ? dictResult.correct / dictResult.total : 0
        const stars = acc >= 0.8 ? 3 : acc >= 0.6 ? 2 : 1
        const passed = acc >= lesson.passThreshold
        const duration = Math.round((Date.now() - startTime) / 1000)
        const singStatus = singVolume === 'normal' ? '成功' : singVolume === 'quiet' ? '声音偏小' : singVolume === 'silent' ? '未录到' : '未录音'

        // 家长建议
        const tips: string[] = []
        if (acc >= 0.8) tips.push(`孩子掌握得很好，可以进入下一课 ${lesson.nextLesson || ''}`)
        else if (acc >= 0.6) tips.push(`基本掌握，建议明天再练一次 ${lesson.lessonId} 巩固`)
        else tips.push(`建议复习 ${lesson.reviewLesson || lesson.lessonId} 后再挑战`)
        if (singVolume === 'quiet') tips.push('录音声音偏小，鼓励孩子用自然说话的音量唱')
        if (singVolume === 'silent') tips.push('未录到声音，可能是麦克风权限问题，请检查设置')
        if (duration > 600) tips.push('练习时间较长，注意让孩子喝水休息')

        return (
          <div className="card text-center">
            <div className="text-5xl mb-2">{passed ? '🎉' : '💪'}</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">今天的成绩</h2>
            {/* 失败鼓励语 */}
            {!passed && dictResult.total > 0 && (
              <p className="text-orange-400 text-sm mb-3">没关系，多听几遍就会啦！再试一次吧！</p>
            )}
            {/* 星级评价 */}
            <div className="text-3xl mb-4">
              {[1, 2, 3].map(s => (
                <span key={s} className={s <= stars ? '' : 'opacity-20'}>⭐</span>
              ))}
            </div>
            {/* 成绩明细 */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-left mb-4">
              <p className="text-gray-600">📚 学了：{lesson.lessonName} {lesson.kodalyReading}</p>
              <p className="text-gray-600">👂 听辨：{dictResult.correct}/{dictResult.total} 题正确（{Math.round(acc * 100)}%）</p>
              {dictResult.results.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {dictResult.results.map((r, i) => (
                    <span key={i} className={`text-sm px-2 py-0.5 rounded ${r ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      第{i+1}题 {r ? '✅' : '❌'}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-600">🎤 录音：{singStatus}</p>
              <p className="text-gray-600">⏱️ 用时：{duration}秒</p>
            </div>
            {/* 家长小提示 */}
            <div className="bg-yellow-50 rounded-2xl p-4 text-left mb-4">
              <p className="text-sm font-bold text-yellow-700 mb-2">📋 家长小提示</p>
              {tips.map((t, i) => (
                <p key={i} className="text-sm text-yellow-600 mb-1">• {t}</p>
              ))}
            </div>
            {/* P2-8: L08 节奏到音高过渡提示 */}
            {lesson.lessonId === 'S2-L08' && passed && (
              <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-purple-600 mb-1">🎓 节奏学习毕业啦！</p>
                <p className="text-sm text-purple-500">接下来进入音高学习，开始学 do-re-mi-fa-sol-la-si-do 音阶～</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Link to="/" className="btn-primary">返回首页</Link>
              {passed && lesson.nextLesson && (
                <Link to={`/lesson/${lesson.nextLesson}`} className="btn-secondary">下一课 -&gt;</Link>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
