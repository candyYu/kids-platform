// 亲子共读绘本：公版故事（伊索寓言，无版权风险）
// 文本按一年级识字量写：短句、常用字、口语化；每本 6 页 + 读后 2 问 + 一个道理
// 插图：emoji 场景图（数据驱动，与全平台风格统一；后续可升级 AI 插图到 public/storybook/{id}/p{n}.png）
// 朗读：public/audio/storybook/{id}/p{n}.mp3（Tingting 生成，scripts/gen-storybook-audio.mjs）

export interface StoryPage {
  text: string
  scene: string[] // 场景 emoji：第 1 个是主角（超大），其余配角（中号）
  bg: string      // 场景背景（tailwind 渐变 class）
}

export interface StoryQuiz {
  q: string
  options: string[]
  answer: number // 正确项下标
}

export interface Storybook {
  id: string
  title: string
  emoji: string
  pages: StoryPage[]
  quiz: StoryQuiz[]
  moral: string
}

export const STORYBOOKS: Storybook[] = [
  {
    id: 'tortoise-hare',
    title: '龟兔赛跑',
    emoji: '🐰',
    pages: [
      { text: '兔子和乌龟要赛跑。', scene: ['🐰', '🐢'], bg: 'from-sky-100 to-grass-100' },
      { text: '“我跑得快，你跑得慢！”兔子哈哈笑。', scene: ['🐰', '🐢', '💬'], bg: 'from-sun-50 to-sun-100' },
      { text: '比赛开始啦！兔子一溜烟跑远了。', scene: ['🐰', '💨', '🏁'], bg: 'from-sky-100 to-grass-50' },
      { text: '兔子想：“乌龟那么慢，我先睡一觉吧。”', scene: ['🐰', '💤', '🌳'], bg: 'from-cream-50 to-grass-100' },
      { text: '乌龟一步一步，不停地爬呀爬。', scene: ['🐢', '🐾', '🐾'], bg: 'from-grass-50 to-grass-100' },
      { text: '乌龟先到了终点！兔子输了，脸好红。', scene: ['🐢', '🏁', '🎉'], bg: 'from-sun-50 to-pig-100' },
    ],
    quiz: [
      { q: '谁赢了比赛？', options: ['乌龟', '兔子', '小鸟'], answer: 0 },
      { q: '兔子为什么输了？', options: ['它睡觉了', '它肚子疼', '它迷路了'], answer: 0 },
    ],
    moral: '不停下的人，才能赢到最后。',
  },
  {
    id: 'crow-pitcher',
    title: '乌鸦喝水',
    emoji: '🐦',
    pages: [
      { text: '一只乌鸦口渴了，到处找水喝。', scene: ['🐦', '☀️'], bg: 'from-sun-50 to-orange-100' },
      { text: '它看见一个瓶子，瓶子里有水！', scene: ['🐦', '🫙', '💧'], bg: 'from-sky-50 to-sun-50' },
      { text: '可是瓶口太小，水又太少，喝不着。', scene: ['🐦', '🫙', '❓'], bg: 'from-cream-50 to-sun-100' },
      { text: '乌鸦看见地上有许多小石子。', scene: ['🪨', '🪨', '🪨'], bg: 'from-cream-50 to-orange-50' },
      { text: '它把小石子一颗一颗放进瓶子里。', scene: ['🐦', '🪨', '🫙'], bg: 'from-sky-50 to-cream-50' },
      { text: '水升高了！乌鸦喝到水啦。', scene: ['💧', '🫙', '😊'], bg: 'from-sky-50 to-sky-100' },
    ],
    quiz: [
      { q: '乌鸦把什么放进瓶子里？', options: ['小石子', '树叶', '沙子'], answer: 0 },
      { q: '瓶子里的水为什么会升高？', options: ['石子占了地方', '太阳晒的', '下雨了'], answer: 0 },
    ],
    moral: '动动小脑筋，办法比困难多。',
  },
  {
    id: 'wolf-cried',
    title: '狼来了',
    emoji: '🐑',
    pages: [
      { text: '放羊的孩子在山上喊：“狼来了！狼来了！”', scene: ['🧒', '📢', '🐑'], bg: 'from-grass-50 to-sky-100' },
      { text: '村里的人跑来帮忙，可是狼没有来。', scene: ['👨‍🌾', '👩‍🌾', '🏃'], bg: 'from-cream-50 to-grass-50' },
      { text: '孩子哈哈大笑：“你们上当啦！”', scene: ['🧒', '😂', '👉'], bg: 'from-sun-50 to-sun-100' },
      { text: '第二天，孩子又喊：“狼来了！狼来了！”', scene: ['🧒', '📢', '⛰️'], bg: 'from-sky-100 to-grass-50' },
      { text: '大家又跑来，又被骗了，很生气。', scene: ['👥', '😤', '🚶'], bg: 'from-cream-50 to-orange-50' },
      { text: '后来狼真的来了！可再也没有人来帮他。', scene: ['🐺', '🐑', '😱'], bg: 'from-slate-200 to-indigo-200' },
    ],
    quiz: [
      { q: '孩子喊了几次假的“狼来了”？', options: ['两次', '一次', '五次'], answer: 0 },
      { q: '狼真的来了，为什么没人来帮他？', options: ['大家不相信他了', '大家在睡觉', '路太远了'], answer: 0 },
    ],
    moral: '说谎的孩子，会失去别人的信任。',
  },
]

export function storyById(id: string): Storybook | undefined {
  return STORYBOOKS.find((b) => b.id === id)
}

// 朗读 mp3 路径（public 下，playFile 自动拼 BASE_URL）
export function storyAudio(id: string, page: number): string {
  return `audio/storybook/${id}/p${page}.mp3`
}

// 读过记录（localStorage，轻量不进 dexie）
const READ_KEY = 'yuwen_storybooks_read_v1'

export function getReadBooks(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '{}')
  } catch {
    return {}
  }
}
export function markRead(id: string) {
  const all = getReadBooks()
  all[id] = Date.now()
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}
