// 拼音知识闪卡
// 6 个常考点：标调规则 / jqx ü 省略 / 平翘舌 / 前后鼻音 / 整体认读 / iu ui 标调
import { Link } from 'react-router-dom'
import { speakPinyin } from '@/audio/tts'
import { Icon } from '@/components/icons/Icon'

interface CardDef {
  id: string
  title: string
  emoji: string
  points: { label: string; example: string; color: string }[]
}

const CARDS: CardDef[] = [
  {
    id: 'tone-rule',
    title: '标调规则',
    emoji: '🎵',
    points: [
      { label: '有 a 找 a', example: 'āi ái ǎi ài  → ā á ǎ à', color: 'primary' },
      { label: '没 a 找 o e', example: 'ōu óu ǒu òu  → ó ǒ ò', color: 'primary' },
      { label: 'i u 并列标后', example: 'iù 标 u 上，不标 i 上', color: 'primary' },
      { label: '单个韵母不用管', example: 'ā é ǐ ò 直接标', color: 'primary' },
    ],
  },
  {
    id: 'jqx-umlaut',
    title: 'j q x + ü',
    emoji: '🪄',
    points: [
      { label: '小 ü 见到 j q x', example: '脱帽敬礼：jū qū xū', color: 'leaf' },
      { label: '去掉两点再标调', example: 'jǔ → jǔ（不是 jǚ）', color: 'leaf' },
      { label: 'n l 仍保留两点', example: 'nǚ lǜ 保持原样', color: 'leaf' },
    ],
  },
  {
    id: 'flat-retro',
    title: '平翘舌音',
    emoji: '👅',
    points: [
      { label: '平舌：z c s', example: '字 zì / 次 cì / 四 sì', color: 'primary' },
      { label: '翘舌：zh ch sh r', example: '知 zhī / 吃 chī / 十 shí / 日 rì', color: 'primary' },
      { label: '小口诀：zh ch sh r 舌头翘起来', example: '舌尖顶到上颚', color: 'primary' },
    ],
  },
  {
    id: 'nasal',
    title: '前鼻音 vs 后鼻音',
    emoji: '👃',
    points: [
      { label: '前鼻：-n 结尾', example: 'an en in un ün  → 舌尖顶上牙龈', color: 'leaf' },
      { label: '后鼻：-ng 结尾', example: 'ang eng ing ong  → 舌根抵软腭', color: 'leaf' },
      { label: '前后鼻对比', example: '山 shān vs 商 shāng / 林 lín vs 零 líng', color: 'leaf' },
    ],
  },
  {
    id: 'whole-read',
    title: '整体认读音节',
    emoji: '🎯',
    points: [
      { label: '直接认，不拼读', example: 'yi wu yu / zi ci si / zhi chi shi ri / ye yue / yuan yin yun ying', color: 'primary' },
      { label: '16 个整体认读音节', example: '要背得滚瓜烂熟', color: 'primary' },
    ],
  },
  {
    id: 'iu-ui',
    title: 'iu / ui 标调',
    emoji: '✍️',
    points: [
      { label: 'i u 并列，标后面', example: 'iu → iù（标 u）/ ui → uì（标 i）', color: 'leaf' },
      { label: '记忆口诀', example: '谁在后面给谁戴帽子', color: 'leaf' },
    ],
  },
]

export default function CheatSheetPage() {
  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <header className="flex items-center mb-6 max-w-2xl mx-auto">
        <Link to="/" className="text-pig-700 text-2xl mr-3">←</Link>
        <h1 className="text-child-lg font-bold text-pig-700">📒 知识闪卡</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {CARDS.map(card => (
          <section key={card.id} className="bg-white rounded-bubble p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{card.emoji}</span>
              <h2 className="text-child font-bold text-sea-900">{card.title}</h2>
            </div>
            <ul className="space-y-2">
              {card.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${p.color === 'primary' ? 'bg-pig-500' : 'bg-sun-500'}`} />
                  <div className="flex-1">
                    <p className="text-base text-gray-700 font-bold">{p.label}</p>
                    <p className="text-sm text-gray-500 pinyin-char">{p.example}</p>
                  </div>
                  <button
                    onClick={() => {
                      // 从 example 提取拼音
                      const m = p.example.match(/[a-zA-Zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]+/g)
                      if (m) speakPinyin(m[0], { rate: 0.9 })
                    }}
                    className="w-10 h-10 rounded-full bg-pig-50 text-pig-600 active:scale-95 flex items-center justify-center"
                  >
                    <Icon name="volume" size={20} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
