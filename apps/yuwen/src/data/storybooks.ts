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
  // ---- 中国古代寓言（古籍公版；守株待兔/亡羊补牢/揠苗助长为人教二下课文，课内衔接）----
  {
    id: 'stump-farmer',
    title: '守株待兔',
    emoji: '🌱',
    pages: [
      { text: '宋国有个农夫，天天在田里干活。', scene: ['🧑‍🌾', '🌾'], bg: 'from-grass-50 to-sun-50' },
      { text: '一只兔子跑得太快，撞在树桩上死了。', scene: ['🐰', '🌳', '💥'], bg: 'from-cream-50 to-grass-50' },
      { text: '农夫白捡了一只兔子，高兴极了。', scene: ['😊', '🐰', '✨'], bg: 'from-sun-50 to-sun-100' },
      { text: '他想：“天天在这里捡兔子，多好啊！”', scene: ['🧑‍🌾', '💡', '🐰'], bg: 'from-cream-50 to-sun-50' },
      { text: '从此他放下锄头，天天守在树桩旁。', scene: ['😴', '🪵', '🌾'], bg: 'from-cream-50 to-orange-50' },
      { text: '兔子再也没来，田里长满了野草。', scene: ['🌿', '🌾', '😓'], bg: 'from-orange-50 to-cream-100' },
    ],
    quiz: [
      { q: '兔子是怎么死的？', options: ['自己撞在树桩上', '被农夫抓住', '被狼咬了'], answer: 0 },
      { q: '农夫最后得到了什么？', options: ['什么也没得到', '很多兔子', '大丰收'], answer: 0 },
    ],
    moral: '天上不会掉馅饼，勤劳才有收获。',
  },
  {
    id: 'mend-fold',
    title: '亡羊补牢',
    emoji: '🐑',
    pages: [
      { text: '从前有个牧羊人，养了一圈羊。', scene: ['👨‍🌾', '🐑', '🐑'], bg: 'from-grass-50 to-sky-100' },
      { text: '一天早上，羊圈破了个洞，少了一只羊。', scene: ['🕳️', '🐑', '❓'], bg: 'from-cream-50 to-orange-50' },
      { text: '邻居劝他：“快把洞补上吧。”', scene: ['👴', '💬', '🕳️'], bg: 'from-cream-50 to-grass-50' },
      { text: '他说：“羊都丢了，还补什么洞。”', scene: ['🙅', '🕳️', '🐑'], bg: 'from-sun-50 to-cream-100' },
      { text: '第二天早上，又少了一只羊。', scene: ['🐑', '❌', '🕳️'], bg: 'from-orange-50 to-cream-100' },
      { text: '他赶紧补好了洞，再也没有丢过羊。', scene: ['🔨', '✅', '🐑'], bg: 'from-grass-50 to-sky-50' },
    ],
    quiz: [
      { q: '羊是怎么丢的？', options: ['羊圈破了个洞', '羊自己开门跑了', '被邻居牵走了'], answer: 0 },
      { q: '后来他做对了什么？', options: ['把洞补好了', '买了新羊圈', '搬了家'], answer: 0 },
    ],
    moral: '出了问题及时改正，就不算晚。',
  },
  {
    id: 'pull-seedlings',
    title: '揠苗助长',
    emoji: '🌾',
    pages: [
      { text: '有个农夫，嫌田里的禾苗长得太慢。', scene: ['🧑‍🌾', '😟', '🌱'], bg: 'from-grass-50 to-sun-50' },
      { text: '他想啊想，想出一个“好办法”。', scene: ['🤔', '💡', '🌱'], bg: 'from-cream-50 to-sun-50' },
      { text: '他把禾苗一棵一棵往上拔高。', scene: ['🧑‍🌾', '🌱', '⬆️'], bg: 'from-grass-50 to-cream-50' },
      { text: '干了一整天，他累坏了，但是很开心。', scene: ['😅', '😊', '💧'], bg: 'from-sun-50 to-orange-50' },
      { text: '他对儿子说：“今天禾苗长高了一大截！”', scene: ['🧑‍🌾', '💬', '👦'], bg: 'from-cream-50 to-sun-50' },
      { text: '第二天，禾苗全都枯死了。', scene: ['🌱', '🥀', '😢'], bg: 'from-orange-50 to-cream-100' },
    ],
    quiz: [
      { q: '农夫做了什么傻事？', options: ['把禾苗往上拔', '给禾苗浇太多水', '把禾苗剪短'], answer: 0 },
      { q: '禾苗最后怎么了？', options: ['全都枯死了', '长高了', '结出麦穗'], answer: 0 },
    ],
    moral: '做事不能着急，要遵守规律。',
  },
  {
    id: 'cover-ears',
    title: '掩耳盗铃',
    emoji: '🔔',
    pages: [
      { text: '从前有个人，想偷别人家的铃铛。', scene: ['🤫', '🔔', '🏠'], bg: 'from-cream-50 to-orange-50' },
      { text: '可是铃铛一碰就会响，怎么办呢？', scene: ['🔔', '❓', '😰'], bg: 'from-cream-50 to-sun-100' },
      { text: '他想：“捂住自己的耳朵，不就听不见了吗！”', scene: ['💡', '🙉', '🔔'], bg: 'from-sun-50 to-cream-50' },
      { text: '他捂着耳朵，伸手去偷铃铛。', scene: ['🙈', '🔔', '✋'], bg: 'from-cream-50 to-orange-50' },
      { text: '铃铛响个不停，声音传得很远。', scene: ['🔔', '📢', '🔊'], bg: 'from-sun-50 to-orange-100' },
      { text: '主人听见铃声，把他抓住了。', scene: ['😠', '🧑', '✊'], bg: 'from-orange-50 to-red-100' },
    ],
    quiz: [
      { q: '他为什么捂住自己的耳朵？', options: ['以为别人也听不见', '耳朵有点疼', '外面太冷了'], answer: 0 },
      { q: '最后他怎么了？', options: ['被主人抓住了', '偷到了铃铛', '逃跑了'], answer: 0 },
    ],
    moral: '骗得了自己，骗不了别人。',
  },
  {
    id: 'fox-tiger',
    title: '狐假虎威',
    emoji: '🐯',
    pages: [
      { text: '老虎抓住了一只狐狸，要吃掉它。', scene: ['🐯', '🦊', '😱'], bg: 'from-orange-50 to-sun-100' },
      { text: '狐狸说：“你不能吃我！我是天帝派来的！”', scene: ['🦊', '💬', '😤'], bg: 'from-cream-50 to-sun-50' },
      { text: '“不信？你跟在我后面走一走。”', scene: ['🦊', '🐯', '🚶'], bg: 'from-grass-50 to-cream-50' },
      { text: '森林里的动物看见狐狸，吓得全跑了。', scene: ['🐰', '🏃', '💨'], bg: 'from-grass-50 to-sky-100' },
      { text: '老虎心想：“大家果然都怕狐狸！”', scene: ['🐯', '🤔', '🦊'], bg: 'from-cream-50 to-orange-50' },
      { text: '它不知道，动物们怕的其实是自己。', scene: ['🐯', '😨', '💨'], bg: 'from-orange-50 to-red-50' },
    ],
    quiz: [
      { q: '森林里的动物到底怕谁？', options: ['老虎', '狐狸', '天帝'], answer: 0 },
      { q: '狐狸借了谁的威风？', options: ['老虎', '狮子', '大象'], answer: 0 },
    ],
    moral: '仗势欺人的人，威风是借来的。',
  },
  {
    id: 'frog-well',
    title: '坐井观天',
    emoji: '🐸',
    pages: [
      { text: '一只青蛙住在井底。', scene: ['🐸', '🕳️'], bg: 'from-sky-50 to-cream-50' },
      { text: '小鸟飞来，落在井沿上。', scene: ['🐦', '🕳️', '🌱'], bg: 'from-sky-50 to-sky-100' },
      { text: '青蛙说：“天只有井口那么大！”', scene: ['🐸', '💬', '⭕'], bg: 'from-cream-50 to-sky-50' },
      { text: '小鸟说：“天大得很，一眼望不到边呀！”', scene: ['🐦', '💬', '🌈'], bg: 'from-sky-50 to-grass-50' },
      { text: '青蛙不信：“我天天看见天，就是井口那么大！”', scene: ['🐸', '❌', '😤'], bg: 'from-cream-50 to-orange-50' },
      { text: '小鸟说：“你跳出井口看一看就知道了。”', scene: ['🐦', '💡', '🐸'], bg: 'from-sky-50 to-sun-50' },
    ],
    quiz: [
      { q: '青蛙以为天有多大？', options: ['井口那么大', '大海那么大', '无边无际'], answer: 0 },
      { q: '是谁告诉青蛙外面的世界很大？', options: ['小鸟', '海龟', '蝴蝶'], answer: 0 },
    ],
    moral: '世界很大，别把自己看到的当成全部。',
  },
  // ---- 伊索寓言补充 ----
  {
    id: 'wolf-lamb',
    title: '狼和小羊',
    emoji: '🐺',
    pages: [
      { text: '狼看见小羊在河边喝水。', scene: ['🐺', '🐑', '💧'], bg: 'from-sky-50 to-grass-50' },
      { text: '狼想吃小羊，就故意找碴。', scene: ['🐺', '😠', '🐑'], bg: 'from-cream-50 to-orange-50' },
      { text: '“你把我的水弄脏了！”狼大声喊。', scene: ['🐺', '💬', '📢'], bg: 'from-orange-50 to-sun-100' },
      { text: '小羊说：“我在下游，怎么会弄脏您的水呢？”', scene: ['🐑', '💧', '🥺'], bg: 'from-sky-50 to-cream-50' },
      { text: '狼又说：“去年你说过我的坏话！”', scene: ['🐺', '💬', '😤'], bg: 'from-orange-50 to-red-50' },
      { text: '小羊说：“去年我还没出生呢。”狼不听，扑了过去，小羊飞快地逃回了羊群。', scene: ['🐑', '💨', '🏡'], bg: 'from-cream-50 to-grass-50' },
    ],
    quiz: [
      { q: '狼为什么找小羊的麻烦？', options: ['想吃它，故意找碴', '小羊弄脏了水', '小羊骂了它'], answer: 0 },
      { q: '小羊讲道理，狼听了吗？', options: ['不听，还是要吃它', '听了，走了', '给小羊道歉了'], answer: 0 },
    ],
    moral: '对不讲理的坏人，光讲道理是不够的，还要会保护自己。',
  },
  {
    id: 'north-wind-sun',
    title: '北风和太阳',
    emoji: '☀️',
    pages: [
      { text: '北风和太阳吵了起来。', scene: ['🌬️', '☀️', '💢'], bg: 'from-sky-50 to-sun-50' },
      { text: '“我的本领大！”“我的本领大！”', scene: ['🌬️', '💬', '☀️'], bg: 'from-cream-50 to-sky-50' },
      { text: '他们看见一个穿大衣的路人。', scene: ['🚶', '🧥', '👀'], bg: 'from-cream-50 to-grass-50' },
      { text: '谁能让路人脱下大衣，谁的本领就大。', scene: ['🌬️', '🧥', '☀️'], bg: 'from-sky-50 to-sun-50' },
      { text: '北风呼呼地吹，路人把大衣裹得更紧。', scene: ['🌬️', '🥶', '🧥'], bg: 'from-sky-100 to-sky-200' },
      { text: '太阳暖烘烘地照，路人热了，脱下了大衣。', scene: ['☀️', '😊', '🧥'], bg: 'from-sun-50 to-orange-100' },
    ],
    quiz: [
      { q: '谁的本领赢得了比赛？', options: ['太阳', '北风', '路人'], answer: 0 },
      { q: '北风吹的时候，路人怎么了？', options: ['把大衣裹得更紧', '脱下了大衣', '睡了一觉'], answer: 0 },
    ],
    moral: '温和有时比强硬更有力量。',
  },
  {
    id: 'golden-goose',
    title: '下金蛋的鹅',
    emoji: '🥚',
    pages: [
      { text: '农夫家的鹅下了一个金蛋。', scene: ['🦢', '🥚', '✨'], bg: 'from-sun-50 to-sun-100' },
      { text: '第二天，又是一个金蛋！', scene: ['🦢', '🥚', '💰'], bg: 'from-sun-50 to-orange-50' },
      { text: '农夫想：“鹅肚子里一定有好多金蛋！”', scene: ['🧑‍🌾', '💡', '💰'], bg: 'from-cream-50 to-sun-50' },
      { text: '他把鹅杀了，肚子里什么也没有。', scene: ['😢', '❌', '🦢'], bg: 'from-cream-50 to-orange-50' },
      { text: '从此，再也没有金蛋了。', scene: ['🕳️', '🥚', '😔'], bg: 'from-cream-50 to-cream-100' },
      { text: '农夫后悔也来不及了。', scene: ['😭', '🪦', '💰'], bg: 'from-orange-50 to-cream-100' },
    ],
    quiz: [
      { q: '农夫为什么杀了鹅？', options: ['以为肚子里全是金蛋', '鹅生病了', '鹅咬了他'], answer: 0 },
      { q: '最后农夫得到了什么？', options: ['什么也没有了', '更多金蛋', '一大笔钱'], answer: 0 },
    ],
    moral: '贪心的人，最后什么都得不到。',
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
