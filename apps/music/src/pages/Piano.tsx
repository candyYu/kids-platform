import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { audioEngine } from '@/audio/engine'
import { FIVE_KEYS, PIANO_SONGS, type PianoSong } from '@/data/piano-songs'
import { recordSongComplete, addFreePlayTime } from '@/data/piano-stats'

type Phase = 'tip' | 'listen' | 'play' | 'done'
type Mode = 'learn' | 'free'

// 录音事件：按下 / 抬起（重放时用钢琴引擎）
interface RecEvent {
  type: 'on' | 'off'
  midi: number
  t: number   // 相对录音开始的毫秒
}

export default function Piano() {
  const [songId, setSongId] = useState(PIANO_SONGS[0].id)
  const song: PianoSong = PIANO_SONGS.find(s => s.id === songId)!
  const [mode, setMode] = useState<Mode>('learn')
  const [phase, setPhase] = useState<Phase>('tip')
  const [noteIdx, setNoteIdx] = useState(0)
  const [wrongMidi, setWrongMidi] = useState<number | null>(null)
  const [pressedMidi, setPressedMidi] = useState<number | null>(null)
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [sampleStatus, setSampleStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  // 录音：录制的是"琴键事件"，重放时用同样的钢琴引擎，不录音频
  const [recording, setRecording] = useState<RecEvent[] | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const recStartRef = useRef<number>(0)
  const recEventsRef = useRef<RecEvent[]>([])
  const activeRecNote = useRef<Map<number, number>>(new Map()) // midi -> startMs
  const playbackTimers = useRef<number[]>([])
  const recMaxTimer = useRef<number | null>(null)
  const curTargetMidi = useRef<number | null>(null)
  const wrongTimer = useRef<number | null>(null)
  const holdRaf = useRef<number | null>(null)
  const demoStop = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('piano-tip-seen')) setShowTip(true)
    // 进入页面就异步加载真钢琴采样；加载期间先用 FM 音色兜底，加载完无缝升级
    let cancelled = false
    audioEngine.ensurePianoSampler().then(() => {
      if (cancelled) return
      setSampleStatus(audioEngine.isSamplerReady() ? 'ready' : 'fallback')
    })
    // 2.5 秒后若仍未加载完，先用 FM 音色进入可玩状态（后续加载完自动升级）
    const tm = window.setTimeout(() => {
      if (!cancelled) setSampleStatus(s => s === 'loading' ? 'fallback' : s)
    }, 2500)
    return () => {
      cancelled = true
      window.clearTimeout(tm)
      // 离开页面：停掉回放，别让钢琴音继续响
      stopPlayback()
      if (recMaxTimer.current) window.clearTimeout(recMaxTimer.current)
    }
  }, [])

  const closeTip = () => {
    localStorage.setItem('piano-tip-seen', '1')
    setShowTip(false)
  }

  const resetSong = useCallback(() => {
    setNoteIdx(0)
    setPhase('listen')
    setHolding(false)
    setHoldProgress(0)
    setWrongMidi(null)
    if (demoStop.current) { demoStop.current(); demoStop.current = null }
    // 重置录音
    stopPlayback()
    if (isRecording) setIsRecording(false)
    if (recMaxTimer.current) { window.clearTimeout(recMaxTimer.current); recMaxTimer.current = null }
    recEventsRef.current = []
    activeRecNote.current.clear()
    setRecording(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { resetSong() }, [songId, mode, resetSong])

  const playDemo = useCallback(async () => {
    if (phase === 'listen' && demoStop.current) return
    setNoteIdx(0)
    setPhase('listen')
    const { totalDuration, stop } = await audioEngine.playPianoSequence(
      song.notes.map(n => ({ midi: n.midi, duration: n.duration })),
      song.tempo,
    )
    demoStop.current = stop
    const beatMs = 60 / song.tempo * 1000
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const elapsed = performance.now() - start - 150
      let t = 0
      for (let i = 0; i < song.notes.length; i++) {
        if (elapsed < t + song.notes[i].duration * beatMs) { setNoteIdx(i); break }
        t += song.notes[i].duration * beatMs
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.setTimeout(() => {
      cancelAnimationFrame(raf)
      setNoteIdx(0)
      setPhase('play')
      demoStop.current = null
    }, totalDuration * 1000 + 200)
  }, [song, phase])

  const skipDemo = () => {
    if (demoStop.current) { demoStop.current(); demoStop.current = null }
    setNoteIdx(0)
    setPhase('play')
  }

  // 进入"听示范"阶段自动播放一次
  const autoPlayed = useRef(false)
  useEffect(() => {
    if (mode === 'learn' && phase === 'listen' && !autoPlayed.current) {
      autoPlayed.current = true
      playDemo()
    }
    if (phase !== 'listen') autoPlayed.current = false
  }, [mode, phase, playDemo])

  // 进入"轮到你弹"时自动开始录音（不限时，弹完自动停）
  const autoRecStarted = useRef(false)
  useEffect(() => {
    if (mode === 'learn' && phase === 'play' && !autoRecStarted.current) {
      autoRecStarted.current = true
      beginRecord(0)
    }
    if (phase !== 'play') autoRecStarted.current = false
    // 弹完（done）时停止录音，刚才那一遍已存入 recording
    if (mode === 'learn' && phase === 'done' && isRecording) {
      stopRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, isRecording])

  const flashWrong = (midi: number) => {
    audioEngine.playBoop()
    setWrongMidi(midi)
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current)
    wrongTimer.current = window.setTimeout(() => setWrongMidi(null), 350)
  }

  const noteHit = useCallback(() => {
    const next = noteIdx + 1
    if (next >= song.notes.length) {
      // 等最后一个音自然衰减再庆祝
      window.setTimeout(() => {
        setPhase('done')
        audioEngine.playCorrect()
        recordSongComplete(song.id)
      }, 500)
    } else {
      setNoteIdx(next)
    }
  }, [noteIdx, song])

  // 自由弹时长统计：从进入 free 模式第一次按键开始，每 10 秒 flush 一次
  const freeStartRef = useRef<number | null>(null)
  const freeTotalRef = useRef<number>(0)
  const flushFreeTimer = useRef<number | null>(null)
  const flushFreeTime = useCallback((commit = true) => {
    if (freeStartRef.current != null) {
      freeTotalRef.current += (performance.now() - freeStartRef.current) / 1000
      freeStartRef.current = null
    }
    if (commit && freeTotalRef.current >= 1) {
      addFreePlayTime(freeTotalRef.current)
      freeTotalRef.current = 0
    }
  }, [])

  // 进入/离开 free 模式时开始/结束计时
  useEffect(() => {
    if (mode === 'free') {
      freeStartRef.current = null
      freeTotalRef.current = 0
      flushFreeTimer.current = window.setInterval(() => flushFreeTime(true), 10000)
    } else {
      if (flushFreeTimer.current) window.clearInterval(flushFreeTimer.current)
      flushFreeTime(true)
    }
    return () => {
      if (flushFreeTimer.current) window.clearInterval(flushFreeTimer.current)
    }
  }, [mode, flushFreeTime])

  // 页面隐藏 / 离开时把剩余时长存下来
  useEffect(() => {
    const onHide = () => { if (mode === 'free') flushFreeTime(true) }
    window.addEventListener('pagehide', onHide)
    window.addEventListener('blur', onHide)
    return () => {
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('blur', onHide)
      flushFreeTime(true)
    }
  }, [mode, flushFreeTime])

  const startHold = (duration: number) => {
    setHolding(true)
    setHoldProgress(0)
    curTargetMidi.current = song.notes[noteIdx].midi
    const beatMs = 60 / song.tempo * 1000
    const need = duration * beatMs * 0.92
    const t0 = performance.now()
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / need)
      setHoldProgress(p)
      if (p >= 1) {
        setHolding(false)
        setHoldProgress(0)
        audioEngine.stopPianoNote()
        if (curTargetMidi.current != null) recNoteOff(curTargetMidi.current)
        noteHit()
        return
      }
      holdRaf.current = requestAnimationFrame(step)
    }
    holdRaf.current = requestAnimationFrame(step)
  }

  const cancelHold = () => {
    if (holdRaf.current) cancelAnimationFrame(holdRaf.current)
    audioEngine.stopPianoNote()
    setHolding(false)
    setHoldProgress(0)
  }

  // ===== 录音 / 回放 =====
  const recNoteOn = (midi: number) => {
    if (!isRecording) return
    if (activeRecNote.current.has(midi)) return
    const t = performance.now() - recStartRef.current
    activeRecNote.current.set(midi, t)
    recEventsRef.current.push({ type: 'on', midi, t })
  }
  const recNoteOff = (midi: number) => {
    if (!isRecording) return
    const startT = activeRecNote.current.get(midi)
    if (startT == null) return
    activeRecNote.current.delete(midi)
    const t = performance.now() - recStartRef.current
    recEventsRef.current.push({ type: 'off', midi, t })
  }
  /** 内部：开始录音；maxMs<=0 表示不限时（跟弹模式用） */
  const beginRecord = (maxMs: number) => {
    if (recMaxTimer.current) window.clearTimeout(recMaxTimer.current)
    recEventsRef.current = []
    activeRecNote.current.clear()
    recStartRef.current = performance.now()
    setRecording(null)
    setIsRecording(true)
    if (maxMs > 0) {
      recMaxTimer.current = window.setTimeout(() => stopRecording(), maxMs)
    }
  }
  const startRecording = () => beginRecord(30000)
  const stopRecording = () => {
    setIsRecording(was => {
      if (!was) return was
      if (recMaxTimer.current) { window.clearTimeout(recMaxTimer.current); recMaxTimer.current = null }
      // 把还按着的音补一个 off
      const now = performance.now() - recStartRef.current
      activeRecNote.current.forEach((_startT, midi) => {
        recEventsRef.current.push({ type: 'off', midi, t: now })
      })
      activeRecNote.current.clear()
      if (recEventsRef.current.length > 0) setRecording([...recEventsRef.current])
      return false
    })
  }
  const clearRecording = () => {
    setRecording(null)
    recEventsRef.current = []
  }
  const playRecording = async () => {
    if (!recording || recording.length === 0 || isPlaying) return
    setIsPlaying(true)
    // 找出每个 on 的配对 off，整理成 (midi, startMs, durMs)
    const held = new Map<number, number>()
    const notes: { midi: number; startMs: number; durMs: number }[] = []
    for (const ev of recording) {
      if (ev.type === 'on') held.set(ev.midi, ev.t)
      else {
        const s = held.get(ev.midi)
        if (s != null) {
          notes.push({ midi: ev.midi, startMs: s, durMs: Math.max(120, ev.t - s) })
          held.delete(ev.midi)
        }
      }
    }
    // 未配对的 on（理论上 stopRecording 已补 off，兜底）
    held.forEach((s, midi) => notes.push({ midi, startMs: s, durMs: 800 }))
    notes.sort((a, b) => a.startMs - b.startMs)
    const totalDur = notes.reduce((m, n) => Math.max(m, n.startMs + n.durMs), 0)
    for (const n of notes) {
      const id = window.setTimeout(() => audioEngine.startPianoNote(n.midi), n.startMs)
      playbackTimers.current.push(id)
      const offId = window.setTimeout(() => audioEngine.stopPianoNote(), n.startMs + n.durMs)
      playbackTimers.current.push(offId)
    }
    const endId = window.setTimeout(() => setIsPlaying(false), totalDur + 200)
    playbackTimers.current.push(endId)
  }
  const stopPlayback = () => {
    playbackTimers.current.forEach(id => window.clearTimeout(id))
    playbackTimers.current = []
    audioEngine.stopPianoNote()
    setIsPlaying(false)
  }

  const pressKey = (midi: number) => {
    if (mode === 'free') {
      // 第一次按键才开始计时（切到 free 模式但没弹不计入）
      if (freeStartRef.current == null) freeStartRef.current = performance.now()
      // 按住延音，抬手才停（这样录音能记下长短）
      audioEngine.startPianoNote(midi)
      recNoteOn(midi)
      return
    }
    if (phase !== 'play' || holding) return
    const target = song.notes[noteIdx]
    if (midi !== target.midi) { flashWrong(midi); return }
    // 对了
    audioEngine.startPianoNote(midi)
    recNoteOn(midi)
    if (target.duration >= 1.5) {
      startHold(target.duration)
    } else {
      // 短音：点一下就过
      window.setTimeout(() => audioEngine.stopPianoNote(), target.duration * 60 / song.tempo * 1000 * 0.9)
      recNoteOff(midi)
      noteHit()
    }
  }

  const releaseKey = (midi: number) => {
    if (mode === 'free') {
      audioEngine.stopPianoNote()
      recNoteOff(midi)
      return
    }
    if (phase !== 'play') return
    const target = song.notes[noteIdx]
    if (midi === target?.midi && holding) {
      recNoteOff(midi)
      cancelHold()
    }
  }

  // 键盘
  useEffect(() => {
    const map: Record<string, number> = { a: 60, s: 62, d: 64, f: 65, g: 67 }
    let downMidi: number | null = null
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      const m = map[e.key.toLowerCase()]
      if (!m || downMidi === m) return
      downMidi = m
      setPressedMidi(m)
      pressKey(m)
    }
    const up = (e: KeyboardEvent) => {
      const m = map[e.key.toLowerCase()]
      if (m && downMidi === m) { downMidi = null; setPressedMidi(null); releaseKey(m) }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  })

  const cur = mode === 'learn' ? song.notes[noteIdx] : null
  const progress = mode === 'learn' ? (noteIdx / song.notes.length) * 100 : 0
  const nextSong = PIANO_SONGS.find(s => s.level === song.level + 1)

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 select-none">
      <Link to="/" className="text-purple-500 text-sm mb-3 inline-block">← 返回</Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-purple-600">🎹 钢琴小游戏</h1>
        <button onClick={() => setShowTip(true)} className="text-2xl" aria-label="手型提示">🤲</button>
      </div>
      <p className="text-gray-400 text-sm mb-5 flex items-center gap-2 flex-wrap">
        <span>右手五指把位 · 慢慢弹不着急</span>
        {sampleStatus === 'loading' && (
          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            加载真钢琴音色…
          </span>
        )}
        {sampleStatus === 'ready' && (
          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            🎹 三角钢琴音色
          </span>
        )}
        {sampleStatus === 'fallback' && (
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" title="采样加载慢，先用电子音；加载完自动切换">
            🔊 电子音色
          </span>
        )}
      </p>

      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        <button onClick={() => setMode('learn')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${mode === 'learn' ? 'bg-white text-purple-600 shadow' : 'text-gray-400'}`}>🎯 跟我弹</button>
        <button onClick={() => setMode('free')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${mode === 'free' ? 'bg-white text-purple-600 shadow' : 'text-gray-400'}`}>🌈 自由弹</button>
      </div>

      {mode === 'learn' && (
        <>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {PIANO_SONGS.map(s => (
              <button key={s.id} onClick={() => setSongId(s.id)}
                className={`p-2 rounded-xl border-2 transition-all ${s.id === songId ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}>
                <div className="text-xl">{s.emoji}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.title}</div>
              </button>
            ))}
          </div>

          {phase === 'listen' && (
            <div className="card mb-5 text-center py-6">
              <div className="text-5xl mb-2 animate-bounce">🎵</div>
              <h2 className="text-lg font-bold text-purple-600 mb-1">先听老师弹一遍</h2>
              <p className="text-sm text-gray-400 mb-4">认真听，等会儿轮到你</p>
              <div className="flex gap-2 justify-center">
                <button onClick={playDemo} className="btn-primary">▶ 再听一遍</button>
                <button onClick={skipDemo} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold">我会了，直接弹</button>
              </div>
            </div>
          )}

          {phase === 'play' && cur && (
            <div className="card mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">第 {noteIdx + 1} / {song.notes.length} 个音</span>
                <button onClick={playDemo} className="text-sm font-bold bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full">🔁 听示范</button>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-center min-h-[64px]">
                <div className="text-center">
                  <div className="text-lg text-gray-600 flex items-center justify-center gap-2">
                    <span>弹：</span>
                    <span className="px-4 py-1 bg-purple-100 text-purple-600 rounded-full font-bold text-2xl">
                      {FIVE_KEYS.find(k => k.midi === cur.midi)?.solfege}
                    </span>
                    <span className="text-purple-400 text-xl font-bold">{cur.finger}指</span>
                  </div>
                  {holding && (
                    <div className="mt-2">
                      <div className="text-xs text-orange-500 font-bold mb-1">✋ 按住别放～</div>
                      <div className="w-40 h-2 bg-orange-100 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-orange-400 transition-all" style={{ width: `${holdProgress * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {!holding && cur.duration >= 1.5 && <div className="text-xs text-orange-400 mt-1">这是长音，按住键等它唱完</div>}
                  {cur.lyric && <div className="text-sm text-gray-400 mt-1">歌词：<span className="text-gray-600">{cur.lyric}</span></div>}
                </div>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="card mb-5 text-center py-6">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-purple-600 mb-1">弹得真棒！</h2>
              <p className="text-gray-500 text-sm mb-4">你完整弹完了《{song.title}》</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button onClick={resetSong} className="btn-primary">🔁 再弹一次</button>
                <button onClick={playDemo} className="px-4 py-2 rounded-xl bg-purple-100 text-purple-600 text-sm font-bold">🎵 听老师</button>
                {recording && recording.length > 0 && (
                  <button
                    onClick={() => isPlaying ? stopPlayback() : playRecording()}
                    className="px-4 py-2 rounded-xl bg-pink-100 text-pink-600 text-sm font-bold"
                  >
                    {isPlaying ? '⏸ 停' : '🎧 听我弹的'}
                  </button>
                )}
                {nextSong && <button onClick={() => setSongId(nextSong.id)} className="px-4 py-2 rounded-xl bg-pink-100 text-pink-600 text-sm font-bold">下一首：{nextSong.title} →</button>}
              </div>
            </div>
          )}
        </>
      )}
      {mode === 'free' && (
        <div className="card mb-5 py-4">
          <p className="text-gray-500 text-sm text-center mb-3">
            🌈 随便弹！触屏点键盘，或电脑键盘 <span className="font-mono bg-gray-100 px-1 rounded">A S D F G</span>
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {!isRecording && (
              <button onClick={startRecording} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold shadow active:scale-95">
                🔴 录一段
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording} className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-bold shadow animate-pulse active:scale-95">
                ⏹ 停止录音
              </button>
            )}
            {recording && recording.length > 0 && !isRecording && (
              <>
                <button
                  onClick={() => isPlaying ? stopPlayback() : playRecording()}
                  className="px-4 py-2 rounded-xl bg-pink-100 text-pink-600 text-sm font-bold active:scale-95"
                >
                  {isPlaying ? '⏸ 停' : '🎧 听刚才弹的'}
                </button>
                <button onClick={clearRecording} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold active:scale-95" aria-label="清除录音">
                  🗑
                </button>
              </>
            )}
          </div>
          {isRecording && (
            <p className="text-center text-xs text-red-500 mt-2 font-bold animate-pulse">● 录音中…（最多 30 秒）</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-4 shadow-lg">
        <div className="flex gap-1.5 justify-center">
          {FIVE_KEYS.map(key => {
            const isTarget = mode === 'learn' && phase === 'play' && cur?.midi === key.midi
            const isDemoHl = phase === 'listen' && song.notes[noteIdx]?.midi === key.midi
            const isWrong = wrongMidi === key.midi
            const isPressed = pressedMidi === key.midi
            return (
              <button
                key={key.midi}
                onPointerDown={(e) => { e.preventDefault(); setPressedMidi(key.midi); pressKey(key.midi) }}
                onPointerUp={() => { setPressedMidi(null); releaseKey(key.midi) }}
                onPointerLeave={() => { setPressedMidi(null); releaseKey(key.midi) }}
                onPointerCancel={() => { setPressedMidi(null); releaseKey(key.midi) }}
                className={`relative flex-1 h-44 sm:h-52 rounded-b-2xl border-2 flex flex-col items-center justify-end pb-3 transition-all duration-75 touch-none
                  ${isTarget ? 'bg-yellow-200 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.7)] scale-[1.03] animate-pulse' : ''}
                  ${isDemoHl ? 'bg-pink-200 border-pink-400' : ''}
                  ${isWrong ? 'bg-orange-100 border-orange-300' : ''}
                  ${isPressed && !isTarget && !isDemoHl && !isWrong ? 'bg-purple-50 border-purple-300 scale-[0.97]' : ''}
                  ${!isTarget && !isDemoHl && !isWrong && !isPressed ? 'bg-gradient-to-b from-white to-gray-50 border-gray-300' : ''}
                  ${isWrong ? '[animation:wobble_0.35s_ease-in-out]' : ''}
                `}
              >
                <div className={`text-3xl font-bold mb-1 ${isTarget ? 'text-yellow-700' : isDemoHl ? 'text-pink-600' : 'text-purple-500'}`}>
                  {key.finger}
                </div>
                <div className={`text-sm font-bold ${isTarget ? 'text-yellow-700' : isDemoHl ? 'text-pink-600' : 'text-gray-500'}`}>
                  {key.solfege}
                </div>
              </button>
            )
          })}
        </div>
        <div className="flex gap-1.5 justify-center mt-2 text-[10px] text-gray-400">
          {['拇', '食', '中', '无', '小'].map((n, i) => <div key={i} className="flex-1 text-center">{n}指</div>)}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">💡 iPad/手机横屏体验更好，手指弯弯像握着一个小球</p>

      {showTip && <TipOverlay onClose={closeTip} />}
      <style>{`@keyframes wobble{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}`}</style>
    </div>
  )
}

function TipOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-6 max-w-sm text-center">
        <div className="text-6xl mb-3">🤲</div>
        <h2 className="text-xl font-bold text-purple-600 mb-2">准备好小手手</h2>
        <ul className="text-left text-sm text-gray-600 space-y-2 mb-5">
          <li>👆 右手五个手指放在五个键上</li>
          <li>⭕ 手指弯弯像握着一个小球</li>
          <li>1️⃣ 数字 1 是大拇指，5 是小指</li>
          <li>🐢 不着急，慢慢弹，弹错也没关系</li>
          <li>✋ 长音符要按住键不放，等它唱完</li>
        </ul>
        <button onClick={onClose} className="btn-primary w-full">我知道啦，开始！</button>
      </div>
    </div>
  )
}
