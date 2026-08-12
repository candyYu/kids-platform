// 小提琴麦克风监听 hook
// - 只在浏览器本地分析音高和音量，不上传任何音频
// - 双层判断"在拉琴"：RMS 音量够大 + 自相关检测到稳定音高
// - 状态平滑：连续 onFrames 帧有音高才算 playing，避免误触发
import { useRef, useState, useEffect, useCallback } from 'react'

export interface ViolinAudioState {
  /** 是否在拉琴（经过平滑后的稳定状态） */
  playing: boolean
  /** 当前检测到的音高 Hz（0 表示没检测到） */
  pitch: number
  /** 当前音量 0~1 */
  volume: number
  /** 麦克风权限/初始化错误信息 */
  error: string | null
}

export interface ViolinAudioControls {
  /** 启动麦克风监听，成功返回 true，失败（权限拒绝等）返回 false */
  start: () => Promise<boolean>
  stop: () => void
}

// 音高检测参数
const SAMPLE_RATE_HINT = 44100
const FFT_SIZE = 2048
// 小提琴有效音域（宽松，儿童练习常用 G3 ~ A5）
const MIN_FREQ = 150
const MAX_FREQ = 2000
// 音量阈值（RMS，0~1）—— 超过这个值才认为有声音
const VOLUME_THRESHOLD = 0.015
// 连续多少帧有/无音高才切换状态（约 0.3 秒@~10fps）
const ON_FRAMES = 3
const OFF_FRAMES = 5

/**
 * 自相关音高检测（ACF2+ 简化版）
 * 返回 0 表示没检测到可信音高。
 */
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length
  // 计算 RMS
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return 0

  // 修剪两端低振幅区域
  let r1 = 0, r2 = SIZE - 1
  const thres = 0.2
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) { r1 = i; break }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break }
  }
  const trimmed = buf.slice(r1, r2)
  const N = trimmed.length
  if (N < 64) return 0

  // 自相关
  const c = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i]
    }
  }

  // 找到第一个下降点
  let d = 0
  while (d < N - 1 && c[d] > c[d + 1]) d++

  // 找到最大峰值
  let maxVal = -1, maxPos = -1
  for (let i = d; i < N; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i }
  }
  if (maxPos <= 0) return 0

  // 抛物线插值提高精度
  let T0 = maxPos
  if (maxPos > 0 && maxPos < N - 1) {
    const x1 = c[maxPos - 1], x2 = c[maxPos], x3 = c[maxPos + 1]
    const a = (x1 + x3 - 2 * x2) / 2
    const b = (x3 - x1) / 2
    if (Math.abs(a) > 1e-6) T0 = maxPos - b / (2 * a)
  }
  const freq = sampleRate / T0
  if (freq < MIN_FREQ || freq > MAX_FREQ) return 0
  return freq
}

export function useViolinAudio(): ViolinAudioState & ViolinAudioControls {
  const [playing, setPlaying] = useState(false)
  const [pitch, setPitch] = useState(0)
  const [volume, setVolume] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const onCountRef = useRef(0)
  const offCountRef = useRef(0)
  const runningRef = useRef(false)

  const cleanup = useCallback(() => {
    runningRef.current = false
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
    onCountRef.current = 0
    offCountRef.current = 0
    setPlaying(false)
    setPitch(0)
    setVolume(0)
  }, [])

  const start = useCallback(async (): Promise<boolean> => {
    if (runningRef.current) return true
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch (e) {
      const err = e as DOMException
      if (err?.name === 'NotAllowedError') {
        setError('麦克风权限被拒绝了，请在浏览器设置里允许后再试')
      } else if (err?.name === 'NotFoundError') {
        setError('没有找到麦克风')
      } else {
        setError('麦克风打不开：' + (err?.message ?? '未知错误'))
      }
      return false
    }

    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      src.connect(analyser)

      audioCtxRef.current = ctx
      streamRef.current = stream
      analyserRef.current = analyser
      runningRef.current = true

      const buf = new Float32Array(analyser.fftSize)

      const tick = () => {
        if (!runningRef.current || !analyserRef.current) return
        analyserRef.current.getFloatTimeDomainData(buf)
        // RMS 音量
        let rms = 0
        for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
        rms = Math.sqrt(rms / buf.length)
        setVolume(rms)

        if (rms < VOLUME_THRESHOLD) {
          onCountRef.current = 0
          offCountRef.current++
          if (offCountRef.current >= OFF_FRAMES) {
            setPlaying(false)
            setPitch(0)
          }
        } else {
          const f = autoCorrelate(buf, ctx.sampleRate || SAMPLE_RATE_HINT)
          if (f > 0) {
            setPitch(f)
            offCountRef.current = 0
            onCountRef.current++
            if (onCountRef.current >= ON_FRAMES && !playing) setPlaying(true)
          } else {
            onCountRef.current = 0
            offCountRef.current++
            if (offCountRef.current >= OFF_FRAMES) {
              setPlaying(false)
              setPitch(0)
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (e) {
      cleanup()
      setError('音频初始化失败：' + (e as Error).message)
      return false
    }
    return true
  }, [cleanup, playing])

  const stop = useCallback(() => {
    cleanup()
  }, [cleanup])

  useEffect(() => cleanup, [cleanup])

  return { playing, pitch, volume, error, start, stop }
}
