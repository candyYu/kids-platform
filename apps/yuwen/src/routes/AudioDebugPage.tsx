// 临时音频诊断页：测 mp3 能否播放 + Web Speech 中文 voice
// 用完就删（见 HomePage 那个按钮）
import { useState } from 'react'
import { Link } from 'react-router-dom'

type CheckResult = {
  name: string
  ok: boolean | null
  detail: string
}

export default function AudioDebugPage() {
  const [results, setResults] = useState<CheckResult[]>([])
  const [running, setRunning] = useState(false)

  const append = (r: CheckResult) => setResults(prev => [...prev, r])

  const run = async () => {
    setResults([])
    setRunning(true)

    // 1. fetch + 文件头
    try {
      const r = await fetch('/yuwen/audio/slices/l01/slice_12.mp3', { method: 'HEAD' })
      append({
        name: '1. fetch HEAD /yuwen/audio/slices/l01/slice_12.mp3',
        ok: r.ok,
        detail: `status=${r.status} type=${r.headers.get('content-type')} len=${r.headers.get('content-length')}`,
      })
    } catch (e: any) {
      append({ name: '1. fetch HEAD', ok: false, detail: String(e) })
    }

    // 2. new Audio() 加载 + readyState + error
    await new Promise<void>((resolve) => {
      const a = new Audio('/yuwen/audio/slices/l01/slice_12.mp3')
      let done = false
      const finish = () => {
        if (done) return
        done = true
        append({
          name: '2. new Audio() slice_12.mp3',
          ok: a.error === null,
          detail: `readyState=${a.readyState} networkState=${a.networkState} ` +
                  `error=${a.error ? `code=${a.error.code} msg="${a.error.message}"` : 'null'}`,
        })
        resolve()
      }
      a.addEventListener('canplaythrough', finish, { once: true })
      a.addEventListener('error', finish, { once: true })
      a.addEventListener('loadedmetadata', () => {
        // 拿到 metadata 后再等 1.5s，看会不会变 error
        setTimeout(finish, 1500)
      }, { once: true })
      a.load()
      // 保底 5s
      setTimeout(finish, 5000)
    })

    // 3. Audio.play() 实际播放
    await new Promise<void>((resolve) => {
      const a = new Audio('/yuwen/audio/slices/l01/slice_12.mp3')
      let done = false
      const finish = (extra: string) => {
        if (done) return
        done = true
        append({
          name: '3. audio.play() 实际播放测试',
          ok: !extra.startsWith('fail'),
          detail: extra,
        })
        resolve()
      }
      a.addEventListener('playing', () => finish('playing event fired → 正在播 ā'), { once: true })
      a.addEventListener('error', () => finish(`fail error.code=${a.error?.code}`), { once: true })
      a.play().then(
        () => {},
        (err) => finish(`fail play() rejected: ${err.name} ${err.message}`)
      )
      setTimeout(() => finish(a.error ? `fail error.code=${a.error.code}` : 'timeout 无 playing 事件（也无声）'), 4000)
    })

    // 4. Web Speech API + 中文 voice
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      const zhVoices = voices.filter(v => v.lang.toLowerCase().startsWith('zh'))
      append({
        name: '4. Web Speech API',
        ok: voices.length > 0,
        detail: `total voices=${voices.length} zh voices=${zhVoices.length} ` +
                `zh=[${zhVoices.map(v => v.name + ' (' + v.lang + ')').join(', ')}]`,
      })
    } else {
      append({ name: '4. Web Speech API', ok: false, detail: 'speechSynthesis 不可用' })
    }

    // 5. Web Speech 实际朗读 "你好"
    await new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return }
      const u = new SpeechSynthesisUtterance('你好')
      u.lang = 'zh-CN'
      u.rate = 1.0
      let done = false
      const finish = (extra: string) => {
        if (done) return
        done = true
        append({
          name: '5. speechSynthesis.speak("你好")',
          ok: !extra.startsWith('fail'),
          detail: extra,
        })
        resolve()
      }
      u.onstart = () => finish('onstart 触发 → 正在念 "你好"')
      u.onerror = (e) => finish(`fail error=${e.error}`)
      try {
        window.speechSynthesis.speak(u)
      } catch (e: any) {
        finish(`fail throw: ${e}`)
      }
      setTimeout(() => finish('timeout 3s 无 onstart → 没声'), 3000)
    })

    // 6. 用户代理（看是什么 WebView）
    append({
      name: '6. 浏览器 / WebView 信息',
      ok: null,
      detail: 'UA = ' + navigator.userAgent,
    })

    setRunning(false)
  }

  return (
    <main className="min-h-screen bg-cream-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-pig-700 text-2xl">←</Link>
          <h1 className="text-child-lg font-bold text-sea-900">🔧 音频诊断（临时）</h1>
        </div>

        <button
          onClick={run}
          disabled={running}
          className="w-full py-5 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble active:scale-95 disabled:opacity-50 mb-6"
        >
          {running ? '诊断中…' : '▶ 开始诊断'}
        </button>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r, i) => (
              <div
                key={i}
                className={`paper-card p-4 ${
                  r.ok === true ? 'border-l-8 border-green-500' :
                  r.ok === false ? 'border-l-8 border-red-500' :
                  'border-l-8 border-gray-300'
                }`}
              >
                <p className="font-bold text-sea-900 mb-1">
                  {r.ok === true ? '✅' : r.ok === false ? '❌' : 'ℹ️'} {r.name}
                </p>
                <p className="text-sm text-sea-900/80 break-all whitespace-pre-wrap font-mono">
                  {r.detail}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-sea-900/50 mt-6 text-center">
          测完把每项结果截图发我，我看到具体错就能修
        </p>
      </div>
    </main>
  )
}
