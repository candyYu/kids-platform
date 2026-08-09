import { useEffect, useRef } from 'react'

interface WaveformProps {
  mode: 'live' | 'static'
  stream?: MediaStream | null
  blob?: Blob | null
  height?: number
  bars?: number
}

/**
 * 录音波形可视化
 * - live 模式: 从 MediaStream 实时分析，显示动态波形条
 * - static 模式: 从已录音 Blob 解码，显示完整波形轮廓
 */
export default function Waveform({ mode, stream, blob, height = 80, bars = 48 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let audioCtx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    canvas.width = W * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const H = height
    const slot = W / bars
    const barW = slot * 0.6
    const barGap = slot * 0.4

    const drawBars = (amps: number[]) => {
      ctx.clearRect(0, 0, W, H)
      amps.forEach((amp, i) => {
        const barH = Math.max(3, amp * H * 0.42)
        const x = i * slot + barGap / 2
        const y = (H - barH) / 2

        const grad = ctx.createLinearGradient(0, y, 0, y + barH)
        if (mode === 'live') {
          grad.addColorStop(0, '#c084fc')
          grad.addColorStop(0.5, '#a855f7')
          grad.addColorStop(1, '#ec4899')
        } else {
          grad.addColorStop(0, '#60a5fa')
          grad.addColorStop(0.5, '#3b82f6')
          grad.addColorStop(1, '#2563eb')
        }
        ctx.fillStyle = grad
        ctx.fillRect(x, y, barW, barH)
      })
    }

    if (mode === 'live' && stream) {
      audioCtx = new AudioContext()
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      const bufLen = analyser.frequencyBinCount
      const data = new Uint8Array(bufLen)
      const step = Math.max(1, Math.floor(bufLen / bars))

      const draw = () => {
        analyser!.getByteTimeDomainData(data)
        const amps: number[] = []
        for (let i = 0; i < bars; i++) {
          let max = 0
          const base = i * step
          for (let j = 0; j < step; j++) {
            const v = Math.abs(data[base + j] - 128) / 128
            if (v > max) max = v
          }
          amps.push(max)
        }
        drawBars(amps)
        raf = requestAnimationFrame(draw)
      }
      draw()
    } else if (mode === 'static' && blob) {
      (async () => {
        try {
          const arrayBuf = await blob.arrayBuffer()
          audioCtx = new AudioContext()
          const audioBuf = await audioCtx.decodeAudioData(arrayBuf)
          const ch = audioBuf.getChannelData(0)
          const perBar = Math.max(1, Math.floor(ch.length / bars))
          const amps: number[] = []
          for (let i = 0; i < bars; i++) {
            let max = 0
            const start = i * perBar
            const end = Math.min(start + perBar, ch.length)
            for (let j = start; j < end; j++) {
              const v = Math.abs(ch[j])
              if (v > max) max = v
            }
            amps.push(max)
          }
          drawBars(amps)
        } catch {
          drawBars(new Array(bars).fill(0.08))
        } finally {
          audioCtx?.close()
        }
      })()
    }

    return () => {
      cancelAnimationFrame(raf)
      source?.disconnect()
      audioCtx?.close()
    }
  }, [mode, stream, blob, height, bars])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height }}
      className="rounded-xl bg-gray-50"
    />
  )
}
