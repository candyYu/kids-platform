// 规则学习卡：根据 lessonId 显示对应拼音规则
// L01-L04: 标调基础
// L06: j q x ü 省略
// L07-L08: 平翘舌
// L09-L10: iu ui 标后
// L11: er 特殊韵母
// L12-L13: 前/后鼻音

import type { LessonId } from '@/data/lessons'
import { Icon } from '@/components/icons/Icon'

interface RuleCard {
  emoji: string
  title: string
  points: { label: string; example: string }[]
  samples?: { text: string; pinyin: string }[]  // TTS 按钮用的拼音
}

const RULES: Record<LessonId, RuleCard | null> = {
  L01: {
    emoji: '🎵',
    title: '标调规则 + o 发音区分',
    points: [
      { label: '有 a 找 a', example: 'āi ái ǎi ài' },
      { label: '没 a 找 o e', example: 'ōu óu ǒu òu' },
      { label: 'i u 并列标后', example: 'iù 标在 u 上' },
      { label: '⚠️ o 的三种发音', example: '' },
      { label: '  单读 o → 哦 [o]', example: 'ō 不是喔或欧' },
      { label: '  bo/po/mo/fo → 喔 [wo]', example: 'bō pō mō fō' },
      { label: '  ou → 欧 [ou]', example: '不是 o + u 连起来' },
    ],
    samples: [
      { text: 'ā á ǎ à', pinyin: 'a' },
      { text: 'ō ó ǒ ò', pinyin: 'o' },
      { text: 'ē é ě è', pinyin: 'e' },
    ],
  },
  L02: {
    emoji: '🎵',
    title: 'i u ü y w 四声练习',
    points: [
      { label: 'i 的四声', example: 'ī í ǐ ì' },
      { label: 'u 的四声', example: 'ū ú ǔ ù' },
      { label: 'ü 的四声', example: 'ǖ ǘ ǚ ǜ' },
    ],
    samples: [
      { text: 'ī í ǐ ì', pinyin: 'i' },
      { text: 'ū ú ǔ ù', pinyin: 'u' },
      { text: 'ǖ ǘ ǚ ǜ', pinyin: 'ü' },
    ],
  },
  L03: null,
  L04: null,
  L05: null,
  L06: {
    emoji: '🪄',
    title: 'j q x + ü 省略规则',
    points: [
      { label: '小 ü 见到 j q x', example: '脱帽敬礼：jū qū xū' },
      { label: '去掉两点再标调', example: 'jǔ 不是 jǚ' },
    ],
    samples: [
      { text: 'jū', pinyin: 'ju' },
      { text: 'qū', pinyin: 'qu' },
      { text: 'xū', pinyin: 'xu' },
    ],
  },
  L07: {
    emoji: '👅',
    title: '平舌音（z c s）',
    points: [
      { label: '平舌：z c s', example: '字 zì / 次 cì / 四 sì' },
      { label: '舌尖顶住上齿背', example: '不要翘起来' },
    ],
    samples: [
      { text: 'zì', pinyin: 'zi' },
      { text: 'cì', pinyin: 'ci' },
      { text: 'sì', pinyin: 'si' },
    ],
  },
  L08: {
    emoji: '👅',
    title: '翘舌音（zh ch sh r）',
    points: [
      { label: '翘舌：zh ch sh r', example: '知 zhī / 吃 chī / 十 shí / 日 rì' },
      { label: '舌尖翘起，顶住硬腭', example: '舌头往后卷' },
    ],
    samples: [
      { text: 'zhī', pinyin: 'zhi' },
      { text: 'chī', pinyin: 'chi' },
      { text: 'shí', pinyin: 'shi' },
      { text: 'rì', pinyin: 'ri' },
    ],
  },
  L09: {
    emoji: '✍️',
    title: 'i u 标调（ai ei ui）',
    points: [
      { label: 'i u 并列标后面', example: '谁在后面给谁戴帽子' },
      { label: 'ui 标 i 上', example: 'uì 不对' },
    ],
  },
  L10: {
    emoji: '✍️',
    title: 'i u 标调（ao ou iu）',
    points: [
      { label: 'iu 标 u 上', example: 'iù 正确' },
      { label: '小口诀：标后不标前', example: 'iú 错，标后' },
    ],
  },
  L11: {
    emoji: '🎯',
    title: 'er / ye yue（整体认读）',
    points: [
      { label: 'er 是特殊韵母', example: '直接读成 er' },
      { label: '整体认读不拼读', example: 'ye yue 直接认' },
    ],
  },
  L12: {
    emoji: '👃',
    title: '前鼻音（-n）',
    points: [
      { label: 'an en in un ün', example: '舌尖顶住上牙龈' },
      { label: '前鼻音小口诀', example: 'an en 舌尖抵牙龈' },
    ],
  },
  L13: {
    emoji: '👃',
    title: '后鼻音（-ng）',
    points: [
      { label: 'ang eng ing ong', example: '舌根抵软腭' },
      { label: '后鼻音小口诀', example: 'ang eng 舌根抵软腭' },
    ],
  },
}

interface Props {
  lessonId: string
  onComplete: () => void
}

export function RuleStage({ lessonId, onComplete }: Props) {
  const rule = RULES[lessonId as LessonId]
  if (!rule) {
    // 本课无特殊规则，直接跳过
    onComplete()
    return null
  }

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-sm text-pig-500">学习一个规则</p>
        <div className="text-6xl mt-2">{rule.emoji}</div>
        <h2 className="text-child-lg font-bold text-sea-900 mt-2">{rule.title}</h2>
      </div>

      <div className="space-y-3 mb-6">
        {rule.points.map((p, i) => (
          <div key={i} className="bg-white rounded-bubble p-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-pig-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-child font-bold text-sea-900">{p.label}</p>
              <p className="text-sm text-slate-500 pinyin-char">{p.example}</p>
            </div>
          </div>
        ))}
      </div>

      {rule.samples && rule.samples.length > 0 && (
        <div className="bg-white rounded-bubble p-4 mb-6">
          <p className="text-sm text-pig-700 mb-2">点一点，听四声发音：</p>
          <div className="flex flex-wrap gap-2">
            {rule.samples.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  // 播放该韵母的四声连读
                  void import('@/audio/tts').then(({ speakPinyin }) => {
                    (async () => {
                      const base = s.pinyin.toLowerCase()
                      for (const tone of [1, 2, 3, 4]) {
                        let marked = base
                        if (tone === 1) marked = base + '\u0304'
                        if (tone === 2) marked = base + '\u0301'
                        if (tone === 3) marked = base + '\u030C'
                        if (tone === 4) marked = base + '\u0300'
                        await speakPinyin(marked.normalize('NFC'))
                        await new Promise(r => setTimeout(r, 300))
                      }
                    })()
                  })
                }}
                className="px-4 py-2 bg-pig-100 text-sea-900 rounded-soft text-child font-bold pinyin-char flex items-center gap-1"
              >
                <Icon name="volume" size={22} />
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-4 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble active:scale-95"
      >
        记住了，去看视频 →
      </button>
    </div>
  )
}
