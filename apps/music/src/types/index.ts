// ===== 核心数据模型 =====
// 对应教研文档 docs/curriculum/ 中的设计

// ---------- 音高与唱名 ----------

/** 唱名（首调 solfège） */
export type Solfege = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'si'

/** 唱名球颜色映射 */
export const SOLFEGE_COLORS: Record<Solfege, string> = {
  do: '#EF4444',
  re: '#F97316',
  mi: '#EAB308',
  fa: '#22C55E',
  sol: '#3B82F6',
  la: '#6366F1',
  si: '#A855F7',
}

/** 音名（固定调） */
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

/** 简谱数字 */
export type JianpuNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** 音名 <-> 唱名 <-> 简谱 映射（C 大调下） */
export const NOTE_MAP: Record<NoteName, { solfege: Solfege; jianpu: JianpuNumber }> = {
  C: { solfege: 'do', jianpu: 1 },
  D: { solfege: 're', jianpu: 2 },
  E: { solfege: 'mi', jianpu: 3 },
  F: { solfege: 'fa', jianpu: 4 },
  G: { solfege: 'sol', jianpu: 5 },
  A: { solfege: 'la', jianpu: 6 },
  B: { solfege: 'si', jianpu: 7 },
}

/** 从带八度的音名中提取音名基础 (e.g., 'C4' -> 'C', 'F#5' -> 'F#', 'Bb3' -> 'Bb') */
export function noteBase(note: string): string {
  return note.replace(/\d+$/, '')
}

/** 从带八度的音名中提取八度数字 (e.g., 'C4' -> 4, 'F#' -> 4) */
export function noteOctave(note: string): number {
  const m = note.match(/(\d+)$/)
  return m ? parseInt(m[1]) : 4
}

// ---------- 节奏 ----------

/** 音符时值类型 */
export type NoteDuration =
  | 'whole'      // 全音符 4拍
  | 'half'       // 二分音符 2拍
  | 'dotted-half' // 附点二分 3拍
  | 'quarter'    // 四分音符 1拍
  | 'eighth'     // 八分音符 0.5拍
  | 'sixteenth'  // 十六分音符 0.25拍
  | 'quarter-rest' // 四分休止
  | 'eighth-rest'  // 八分休止
  | 'half-rest'    // 二分休止
  | 'whole-rest'   // 全休止

/** 拍数映射（以四分音符为1） */
export const DURATION_BEATS: Record<NoteDuration, number> = {
  'whole': 4,
  'half': 2,
  'dotted-half': 3,
  'quarter': 1,
  'eighth': 0.5,
  'sixteenth': 0.25,
  'quarter-rest': 1,
  'eighth-rest': 0.5,
  'half-rest': 2,
  'whole-rest': 4,
}

/** Kodály 节奏读法映射 */
export const KODALY_READING: Partial<Record<NoteDuration, string>> = {
  'whole': 'ta-a-a-a',
  'half': 'ta-a',
  'dotted-half': 'ta-a-a',
  'quarter': 'ta',
  'eighth': 'ti',
  'sixteenth': 'ti-ri',
}

/** 节奏型模式（一拍内的组合） */
export type RhythmPattern =
  | 'quarter'           // ta (四分)
  | 'eighth'            // 单个八分（半拍）
  | 'two-eighths'       // ti-ti (两个八分)
  | 'four-sixteenths'   // ti-ri-ti-ri (四个十六分)
  | 'eighth-two-sixteenths' // ti · ti-ri (前八后十六)
  | 'two-sixteenths-eighth' // ti-ri · ti (前十六后八)
  | 'dotted-quarter-eighth' // ta-i · ti (附点四分+八分)
  | 'syncopation'       // ti · ta · ti (切分)
  | 'quarter-rest'      // 休止
  | 'half'              // ta-a (二分)
  | 'whole'             // ta-a-a-a (全音符)

/** 节奏型 -> Kodály 读法 */
export const RHYTHM_KODALY: Record<RhythmPattern, string> = {
  'quarter': 'ta',
  'eighth': 'ti',
  'two-eighths': 'ti-ti',
  'four-sixteenths': 'ti-ri-ti-ri',
  'eighth-two-sixteenths': 'ti · ti-ri',
  'two-sixteenths-eighth': 'ti-ri · ti',
  'dotted-quarter-eighth': 'ta-i · ti',
  'syncopation': 'ti · ta · ti',
  'quarter-rest': '（休止）',
  'half': 'ta-a',
  'whole': 'ta-a-a-a',
}

// ---------- 课程结构 ----------

/** 阶段 */
export type Stage = 'S1' | 'S2' | 'S3' | 'S4'

/** 课程段落类型（6段式） */
export type SegmentType =
  | 'warmup'       // 暖场
  | 'lecture'      // 知识讲解
  | 'dictation'    // 听辨
  | 'sightReading' // 视奏视唱
  | 'singing'      // 模唱录音
  | 'summary'      // 家长小结

/** 听辨题型 */
export type QuestionType = 'binary' | 'ternary' | 'judgment'

/** 听辨题 */
export interface DictationQuestion {
  id: string
  type: QuestionType
  /** 播放的音频描述（用于 Tone.js 合成） */
  audio: AudioPattern
  /** 选项 */
  options: QuestionOption[]
  /** 正确答案索引 */
  correctIndex: number
  /** 设计意图 */
  intent?: string
}

export interface QuestionOption {
  /** 选项显示内容（节奏型描述） */
  label: string
  /** 选项对应的节奏型 */
  rhythmPattern?: RhythmPattern
}

/** 音频模式描述（告诉音频引擎播放什么） */
export interface AudioPattern {
  /** 节奏型序列 */
  rhythm: RhythmPattern[]
  /** 音高序列（可选，支持变化音如 'F#','Bb'） */
  notes?: string[]
  /** 是否以和弦方式同时播放（默认 false，按旋律逐音播放） */
  chord?: boolean
  /** 拍号 */
  timeSignature: [number, number]
  /** 速度 BPM */
  tempo: number
  /** 小节数 */
  bars: number
}

// ---------- 课程定义 ----------

export interface Lesson {
  lessonId: string
  lessonName: string
  stage: Stage
  /** 训练点描述 */
  trainingPoint: string
  /** Kodály 读法 */
  kodalyReading?: string
  /** 拍号 */
  timeSignature: [number, number]
  /** 速度 */
  tempo: number
  /** 包含的段落 */
  segments: SegmentType[]
  /** 听辨题（如果有 dictation 段） */
  dictationQuestions?: DictationQuestion[]
  /** 通关阈值 */
  passThreshold: number
  /** 下一课 */
  nextLesson?: string
  /** 复习课 */
  reviewLesson?: string
  /** 是否已解锁 */
  unlocked: boolean
}

// ---------- 学习记录 ----------

export interface LessonProgress {
  lessonId: string
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered'
  /** 听辨正确率 */
  dictationAccuracy?: number
  /** 总用时（秒） */
  duration?: number
  /** 完成日期 */
  completedAt?: string
  /** 模唱录音 ID（IndexedDB） */
  recordingId?: string
}

// ---------- 耳朵专项 ----------

export type EarTrainingType = 'E1' | 'E2' | 'E3' | 'E4' | 'E5'

export interface EarTrainingQuestion {
  id: string
  type: EarTrainingType
  /** 播放的音高（首调唱名） */
  answer: Solfege | Solfege[]
  /** 选项 */
  options: Solfege[]
  /** 音高（MIDI 音符号） */
  midiNotes: number[]
}

export interface EarTrainingProgress {
  type: EarTrainingType
  /** 今日完成题数 */
  todayCount: number
  /** 连续天数 */
  streak: number
  /** 耳朵值 */
  earPoints: number
  /** 最后完成日期 */
  lastDate: string
}

// ---------- 复习闯关 ----------

export interface ReviewChallenge {
  challengeId: 'R1' | 'R2' | 'R3'
  name: string
  description: string
  passThreshold: number
  questions: DictationQuestion[]
}

// ---------- 录音 ----------

export interface Recording {
  id: string
  lessonId: string
  blob: Blob
  createdAt: string
  /** 音量档位 */
  volumeLevel: 'normal' | 'quiet' | 'silent'
}

// ---------- 徽章系统 ----------

export interface Badge {
  id: string
  earnedAt: string
}

export interface BadgeDef {
  id: string
  icon: string
  name: string
  desc: string
}

export const BADGES: BadgeDef[] = [
  { id: 'first-lesson', icon: '🎵', name: '初次发声', desc: '完成第一节课' },
  { id: 'first-sing', icon: '🎤', name: '勇敢开唱', desc: '完成第一次录音' },
  { id: 'streak-3', icon: '🔥', name: '连续3天', desc: '连续练习3天' },
  { id: 'streak-7', icon: '🔥🔥', name: '连续7天', desc: '连续练习7天' },
  { id: 'perfect-review', icon: '⭐', name: '满分闯关', desc: '闯关全对通过' },
  { id: 'rhythm-master', icon: '🥁', name: '节奏达人', desc: '完成节奏模块 L01-L08' },
  { id: 'scale-master', icon: '🎼', name: '音阶大师', desc: '完成音阶模块 L09-L14' },
  { id: 'graduate', icon: '🏆', name: '结业证书', desc: '完成全部24课' },
]

// ---------- 练习记录 ----------

export interface PracticeSession {
  date: string    // YYYY-MM-DD
  lessonId: string
  accuracy: number
  duration: number
}
