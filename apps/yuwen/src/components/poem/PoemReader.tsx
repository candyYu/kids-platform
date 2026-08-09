// 古诗阅读组件：单首展示 + 听音 + 释义 + 上一首/下一首
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { POEMS, getPoemById, getPoemsByGrade, type Poem } from '@/data/poems'
import { speakPinyin, speakHanzi } from '@/audio/tts'
import { Icon } from '@/components/icons/Icon'

export default function PoemReader() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  // 默认第一首
  const poem = id ? getPoemById(id) : POEMS[0]
  // 释义展开
  const [showTranslation, setShowTranslation] = useState(false)
  // 正在朗读的字索引（"i 正在读"—— line i 的第 j 个字）
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [activeChar, setActiveChar] = useState<number>(-1)
  // 整体播放中
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  const stopRef = useRef(false)

  // 切诗时重置状态
  useEffect(() => {
    setActiveLine(null)
    setActiveChar(-1)
    setIsPlayingAll(false)
    setIsPlayingWhole(false)
    stopRef.current = true
  }, [id])

  if (!poem) {
    return (
      <main className="min-h-screen bg-cream-50 p-6 flex flex-col items-center justify-center">
        <p className="text-child text-sea-900 mb-4">没有找到这首诗</p>
        <Link to="/poem" className="bg-pig-500 text-white px-4 py-2 rounded-bubble">返回</Link>
      </main>
    )
  }

  const idx = POEMS.findIndex(p => p.id === poem.id)
  const prev = idx > 0 ? POEMS[idx - 1] : null
  const next = idx < POEMS.length - 1 ? POEMS[idx + 1] : null

  // 朗读整行：切片逐字播 + 字间 0 停顿 + 整体紧凑（像"一句话"不像"拼读"）
  // 用 Edge TTS 预生成切片（声调准，鹅=2声正确）
  const speakLine = async (line: Poem['lines'][number], lineIdx: number) => {
    setActiveLine(lineIdx)
    setActiveChar(-1)
    const charsOnly = line.chars.split('').filter(c => /[\u4e00-\u9fa5]/.test(c))
    const pinyinTokens = line.pinyin.split(/\s+/).filter(Boolean)
    for (let i = 0; i < charsOnly.length; i++) {
      if (stopRef.current) {
        setActiveLine(null)
        setActiveChar(-1)
        return
      }
      setActiveChar(i)
      try {
        if (pinyinTokens[i]) await speakPinyin(pinyinTokens[i])
        else await speakHanzi(charsOnly[i])
      } catch { /* 忽略 */ }
      // 字间 0 停顿（切片本身 0.4s，气口自然）
    }
    setActiveLine(null)
    setActiveChar(-1)
  }

  // 朗读整首：所有字切片逐个播 + 0 停顿 + 行间 250ms 短停顿（连贯自然 + 声调准）
  const speakAll = async () => {
    if (isPlayingAll) {
      stopRef.current = true
      setIsPlayingAll(false)
      try { window.speechSynthesis?.cancel() } catch {}
      return
    }
    stopRef.current = false
    setIsPlayingAll(true)
    for (let lineIdx = 0; lineIdx < poem.lines.length; lineIdx++) {
      if (stopRef.current) break
      const line = poem.lines[lineIdx]
      setActiveLine(lineIdx)
      const charsOnly = line.chars.split('').filter(c => /[\u4e00-\u9fa5]/.test(c))
      const pinyinTokens = line.pinyin.split(/\s+/).filter(Boolean)
      for (let i = 0; i < charsOnly.length; i++) {
        if (stopRef.current) {
          setActiveLine(null)
          setActiveChar(-1)
          return
        }
        setActiveChar(i)
        try {
          if (pinyinTokens[i]) await speakPinyin(pinyinTokens[i])
          else await speakHanzi(charsOnly[i])
        } catch { /* 忽略 */ }
      }
      // 行间 250ms 短停顿（让"句"感分明）
      if (lineIdx < poem.lines.length - 1) {
        await new Promise(r => setTimeout(r, 250))
      }
    }
    setIsPlayingAll(false)
    setActiveLine(null)
    setActiveChar(-1)
  }

  // 点单字读
  const speakChar = async (char: string, pinyin: string) => {
    try {
      if (pinyin) await speakPinyin(pinyin)
      else await speakHanzi(char)
    } catch {
      /* 忽略 */
    }
  }

  // 整体读：去掉标点，把整首诗拼成一句连贯的话，走 Web Speech 一次播完
  const [isPlayingWhole, setIsPlayingWhole] = useState(false)
  const speakWhole = async () => {
    if (isPlayingWhole) {
      try { window.speechSynthesis?.cancel() } catch {}
      setIsPlayingWhole(false)
      return
    }
    // 停掉听一遍
    stopRef.current = true
    setIsPlayingAll(false)
    setActiveLine(null)
    setActiveChar(-1)
    try { window.speechSynthesis?.cancel() } catch {}
    const wholeText = poem.lines.map(l => l.chars).join('').replace(/[，。！？、；：,.!?;:]/g, '')
    setIsPlayingWhole(true)
    try {
      await speakHanzi(wholeText, { rate: 0.9 })
    } catch {
      /* 忽略 */
    } finally {
      setIsPlayingWhole(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 p-4 flex flex-col">
      {/* 顶部 */}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/poem')}
          className="bg-white p-2 rounded-bubble shadow text-pig-700 active:scale-95"
          aria-label="返回列表"
        >
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center px-2">
          <p className="text-sm text-pig-500">{poem.dynasty} · {poem.author}</p>
        </div>
        <button
          onClick={() => setShowTranslation(s => !s)}
          className="bg-white p-2 rounded-bubble shadow text-sea-900 active:scale-95"
          aria-label="释义"
        >
          <Icon name={showTranslation ? 'eye' : 'book'} className="w-6 h-6" />
        </button>
      </header>

      {/* 标题 */}
      <h1 className="text-child-xl font-bold text-center text-ink-900 mb-1 tracking-widest">
        {poem.title}
      </h1>
      <p className="text-center text-child-sm text-pig-400 mb-6">推荐年级：{poem.grade} 年级</p>

      {/* 释义折叠：白话 + 逐字拼音 */}
      {showTranslation && (
        <div className="bg-white border-2 border-sun-300 rounded-bubble p-4 mb-4 shadow">
          <p className="text-base font-bold text-pig-700 mb-2">📖 白话释义</p>
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {(() => {
              const pinyinTokens = poem.translationPinyin.split(/\s+/).filter(Boolean)
              let pinyinIdx = 0
              return poem.translation.split('').map((char, i) => {
                if (/[\u4e00-\u9fa5]/.test(char)) {
                  const pinyinToken = pinyinTokens[pinyinIdx++] || ''
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-child-sm text-ink-900">{char}</span>
                      <span className="text-xs text-sea-900/60">{pinyinToken}</span>
                    </div>
                  )
                }
                return <span key={i} className="text-child-sm text-ink-700">{char}</span>
              })
            })()}
          </div>
        </div>
      )}

      {/* 诗主体 */}
      <div className="bg-white rounded-bubble shadow p-4 flex-1 mb-4">
        {poem.lines.map((line, lineIdx) => {
          // 把 chars 和 pinyin 拆成字和拼音的数组（一对一）
          const charsOnly = line.chars.split('').filter(c => /[\u4e00-\u9fa5]/.test(c))
          const pinyinTokens = line.pinyin.split(/\s+/).filter(Boolean)
          const isActiveLine = activeLine === lineIdx

          return (
            <div
              key={lineIdx}
              onClick={() => speakLine(line, lineIdx)}
              className={`flex justify-center gap-2 py-3 cursor-pointer rounded-soft transition-colors ${isActiveLine ? 'bg-sun-50' : 'hover:bg-cream-50'}`}
              role="button"
              tabIndex={0}
            >
              {charsOnly.map((char, i) => {
                const isHighlight = poem.highlights.includes(char)
                const isActive = isActiveLine && activeChar === i
                return (
                  <div key={i} className="flex flex-col items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        speakChar(char, pinyinTokens[i] || '')
                      }}
                      className={`text-3xl font-bold leading-none px-1 rounded-soft transition-all ${isHighlight ? 'text-pig-600' : 'text-ink-900'} ${isActive ? 'bg-sun-200 scale-110' : 'hover:bg-sun-50'}`}
                      aria-label={`朗读 ${char}`}
                    >
                      {char}
                    </button>
                    <span className={`text-xs pinyin-char mt-0.5 ${isHighlight ? 'text-pig-500' : 'text-sea-900/50'}`}>
                      {pinyinTokens[i] || ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* 底部控制条 */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <button
          onClick={() => prev && navigate(`/poem/${prev.id}`)}
          disabled={!prev}
          className={`p-3 rounded-bubble shadow text-child font-bold ${prev ? 'bg-white text-sea-900 active:scale-95' : 'bg-gray-100 text-gray-400'}`}
        >
          ← 上一首
        </button>
        <button
          onClick={speakAll}
          className={`p-3 rounded-bubble shadow text-child font-bold text-white active:scale-95 ${isPlayingAll ? 'bg-chili-500' : 'bg-pig-500'}`}
        >
          {isPlayingAll ? '⏸ 停' : '听一遍'}
        </button>
        <button
          onClick={speakWhole}
          className={`p-3 rounded-bubble shadow text-child font-bold text-white active:scale-95 ${isPlayingWhole ? 'bg-chili-500' : 'bg-pig-600'}`}
        >
          {isPlayingWhole ? '⏸ 停' : '整体读'}
        </button>
        <button
          onClick={() => next && navigate(`/poem/${next.id}`)}
          disabled={!next}
          className={`p-3 rounded-bubble shadow text-child font-bold ${next ? 'bg-white text-sea-900 active:scale-95' : 'bg-gray-100 text-gray-400'}`}
        >
          下一首 →
        </button>
      </div>
    </main>
  )
}
