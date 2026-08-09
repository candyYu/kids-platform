import * as Tone from 'tone'
import type { RhythmPattern, NoteName, AudioPattern } from '@/types'

// 单例音频引擎
class AudioEngine {
  private synth: Tone.PolySynth | null = null
  // 专用节奏合成器：极短 release，避免音符糊在一起
  private rhythmSynth: Tone.Synth | null = null
  private drumSynth: Tone.MembraneSynth | null = null
  private metronome: Tone.MembraneSynth | null = null
  private initialized = false

  async init() {
    if (this.initialized) return
    await Tone.start()

    // 旋律合成器（用于视唱、耳训等）
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.15 },
    }).toDestination()
    this.synth.volume.value = -3

    // 节奏专用合成器：短 attack + 极短 release，每个音干净利落
    this.rhythmSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.08 },
    }).toDestination()
    this.rhythmSynth.volume.value = -3

    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination()
    this.drumSynth.volume.value = -10

    this.metronome = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 1,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    }).toDestination()
    this.metronome.volume.value = -15

    this.initialized = true
  }

  /** 音名 -> 频率（支持 'C4', 'F#5', 'Bb3' 等带八度写法，也兼容 'C' 默认八度4） */
  private noteToFreq(note: string, octave = 4): number {
    if (/\d$/.test(note)) {
      return Tone.Frequency(note).toFrequency()
    }
    return Tone.Frequency(`${note}${octave}`).toFrequency()
  }

  /** 唱名 -> MIDI（C大调，do=C4） */
  solfegeToMidi(solfege: string): number {
    const map: Record<string, number> = { do: 60, re: 62, mi: 64, fa: 65, sol: 67, la: 69, si: 71 }
    return map[solfege] ?? 60
  }

  /** 播放单个音 */
  async playNote(note: NoteName, octave = 4, duration = 0.5) {
    await this.init()
    const freq = this.noteToFreq(note, octave)
    this.synth!.triggerAttackRelease(freq, duration)
  }

  /** 播放 MIDI 音符号 */
  async playMidiNote(midi: number, duration = 0.5) {
    await this.init()
    const freq = Tone.Frequency(midi, 'midi').toFrequency()
    this.synth!.triggerAttackRelease(freq, duration)
  }

  /** 播放 MIDI 音符序列（用 Tone.js 精确调度，不用 setTimeout） */
  async playMidiSequence(midis: number[], noteDuration = 0.4, gap = 0.5) {
    await this.init()
    const now = Tone.now() + 0.1
    midis.forEach((midi, i) => {
      const freq = Tone.Frequency(midi, 'midi').toFrequency()
      const time = now + i * gap
      this.synth!.triggerAttackRelease(freq, noteDuration, time)
    })
  }

  /** 计算节奏型序列的总时长（秒） */
  getRhythmTotalDuration(rhythm: RhythmPattern[], tempo = 60): number {
    const beatDuration = 60 / tempo
    let totalBeats = 0
    for (const pat of rhythm) {
      const durs = this.patternToDurations(pat)
      totalBeats += durs.reduce((s, d) => s + d, 0)
    }
    return totalBeats * beatDuration
  }

  /** 节奏型 -> 时值序列（一拍内） */
  patternToDurationsPublic(pattern: RhythmPattern): number[] {
    return this.patternToDurations(pattern)
  }

  private patternToDurations(pattern: RhythmPattern): number[] {
    const beat = 1 // 一拍的时值（秒由 tempo 决定）
    switch (pattern) {
      case 'quarter': return [beat]
      case 'eighth': return [beat / 2]
      case 'two-eighths': return [beat / 2, beat / 2]
      case 'four-sixteenths': return [beat / 4, beat / 4, beat / 4, beat / 4]
      case 'eighth-two-sixteenths': return [beat / 2, beat / 4, beat / 4]
      case 'two-sixteenths-eighth': return [beat / 4, beat / 4, beat / 2]
      case 'dotted-quarter-eighth': return [beat * 1.5, beat / 2]
      case 'syncopation': return [beat / 2, beat, beat / 2]
      case 'quarter-rest': return [beat] // 休止
      case 'half': return [beat * 2]
      case 'whole': return [beat * 4]
      default: return [beat]
    }
  }

  /** 播放节奏型（用节奏合成器，交替音高，带预备拍） */
  async playRhythm(pattern: RhythmPattern, tempo = 60) {
    await this.init()
    const beatDuration = 60 / tempo
    const durations = this.patternToDurations(pattern)
    const startAt = Tone.now() + 0.1
    let elapsed = 0

    for (let i = 0; i < durations.length; i++) {
      const time = startAt + elapsed * beatDuration
      const noteDuration = durations[i] * beatDuration * 0.92
      if (pattern !== 'quarter-rest') {
        // 交替 C4/G4 让每个音都听得清
        const note = i % 2 === 0 ? 'C4' : 'G4'
        this.rhythmSynth!.triggerAttackRelease(note, noteDuration, time)
      }
      elapsed += durations[i]
    }
  }

  /** 播放完整音频模式（节奏合成器，交替音高，带预备拍） */
  async playAudioPattern(pattern: AudioPattern) {
    await this.init()
    const beatDuration = 60 / pattern.tempo
    const startAt = Tone.now() + 0.1
    let elapsed = 0

    for (const rhythm of pattern.rhythm) {
      const durations = this.patternToDurations(rhythm)
      for (let i = 0; i < durations.length; i++) {
        const time = startAt + elapsed * beatDuration
        const noteDuration = durations[i] * beatDuration * 0.9
        if (rhythm !== 'quarter-rest') {
          // 每拍换一个音高，增加辨识度
          const beatIdx = Math.floor(elapsed)
          const notes = ['C4', 'E4', 'G4', 'A4']
          const note = notes[beatIdx % notes.length]
          this.rhythmSynth!.triggerAttackRelease(note, noteDuration, time)
        }
        elapsed += durations[i]
      }
    }
  }

  /** 播放和弦（多个音同时发声） */
  async playChord(notes: string[], duration = 1.5) {
    await this.init()
    const freqs = notes.map(n => this.noteToFreq(n))
    this.synth!.triggerAttackRelease(freqs, duration, Tone.now() + 0.1)
  }

  /** 播放旋律（带音高） */
  async playMelody(notes: string[], rhythm: RhythmPattern[], tempo = 60) {
    await this.init()
    const beatDuration = 60 / tempo
    const startAt = Tone.now() + 0.1
    let elapsed = 0
    let noteIdx = 0

    for (const pat of rhythm) {
      const durations = this.patternToDurations(pat)
      for (let i = 0; i < durations.length; i++) {
        const time = startAt + elapsed * beatDuration
        if (pat !== 'quarter-rest' && notes[noteIdx]) {
          const freq = this.noteToFreq(notes[noteIdx])
          this.synth!.triggerAttackRelease(freq, durations[i] * beatDuration * 0.9, time)
          noteIdx++
        }
        elapsed += durations[i]
      }
    }
  }

  /** 节拍器 */
  private metronomeLoop: Tone.Loop | null = null

  async startMetronome(tempo = 72) {
    await this.init()
    Tone.Transport.bpm.value = tempo
    if (this.metronomeLoop) this.stopMetronome()

    let beat = 0
    this.metronomeLoop = new Tone.Loop((time) => {
      const note = beat % 4 === 0 ? 'C5' : 'G4'
      this.metronome!.triggerAttackRelease(note, 0.05, time)
      beat++
    }, '4n')
    this.metronomeLoop.start(0)
    Tone.Transport.start()
  }

  stopMetronome() {
    if (this.metronomeLoop) {
      this.metronomeLoop.dispose()
      this.metronomeLoop = null
    }
    Tone.Transport.stop()
  }

  /** 播放正确提示音 */
  async playCorrect() {
    await this.init()
    this.synth!.triggerAttackRelease('C5', 0.1, Tone.now())
    this.synth!.triggerAttackRelease('E5', 0.1, Tone.now() + 0.1)
    this.synth!.triggerAttackRelease('G5', 0.2, Tone.now() + 0.2)
  }

  /** 播放错误提示音 */
  async playWrong() {
    await this.init()
    this.synth!.triggerAttackRelease('A3', 0.3, Tone.now())
  }

  /** 录音 */
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private recordingStream: MediaStream | null = null

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.recordingStream = stream
    this.recorder = new MediaRecorder(stream)
    this.chunks = []
    this.recorder.ondataavailable = (e) => this.chunks.push(e.data)
    this.recorder.start()
  }

  /** 获取录音流（供实时波形可视化用） */
  getRecordingStream(): MediaStream | null {
    return this.recordingStream
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) return
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        // 停止所有音轨
        this.recordingStream?.getTracks().forEach(t => t.stop())
        this.recordingStream = null
        resolve(blob)
      }
      this.recorder.stop()
    })
  }

  /** 检测音量档位（Web Audio API RMS 分析） */
  async analyzeVolume(blob: Blob): Promise<'normal' | 'quiet' | 'silent'> {
    try {
      const arrayBuf = await blob.arrayBuffer()
      const audioCtx = new AudioContext()
      const audioBuf = await audioCtx.decodeAudioData(arrayBuf)
      audioCtx.close()

      const channel = audioBuf.getChannelData(0)
      let sumSquares = 0
      for (let i = 0; i < channel.length; i++) {
        sumSquares += channel[i] * channel[i]
      }
      const rms = Math.sqrt(sumSquares / channel.length)

      if (rms < 0.01) return 'silent'
      if (rms < 0.05) return 'quiet'
      return 'normal'
    } catch {
      // 降级：blob 大小估算
      if (blob.size < 1000) return 'silent'
      if (blob.size < 5000) return 'quiet'
      return 'normal'
    }
  }

  /** 录音回放 */
  private playbackAudio: HTMLAudioElement | null = null

  playRecording(url: string, onEnded?: () => void) {
    this.stopPlayback()
    this.playbackAudio = new Audio(url)
    this.playbackAudio.onended = () => {
      if (onEnded) onEnded()
    }
    this.playbackAudio.play()
  }

  stopPlayback() {
    if (this.playbackAudio) {
      this.playbackAudio.pause()
      this.playbackAudio = null
    }
  }
}

export const audioEngine = new AudioEngine()
