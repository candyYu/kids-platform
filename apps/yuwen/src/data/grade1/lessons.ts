// 1年级上册 课程结构（2024 秋新版部编人教版）
// 拼音课 ID 保持 L01-L13 与旧版一致（进度/音频零迁移），y w 独立成新 L08Y（课本第9课）
// 拼音课课本编号：L01=第1课 ... L08=第8课, L08Y=第9课, L09=第10课 ... L13=第14课
import type { Lesson, UnitInfo } from '../types'
import { SHIZI } from './words'
import { PINYIN_NO_TO_LESSON } from './words'

// 生字表 (group,no) -> 本课会认字
function charsOf(no: string, group: string): string[] {
  return SHIZI.filter(w => w.no === no && w.group === group).map(w => w.char)
}
// 拼音课 lessonId -> 课号 -> 会认字
function pinyinChars(lessonId: string): string[] {
  const no = Object.entries(PINYIN_NO_TO_LESSON).find(([, id]) => id === lessonId)?.[0]
  return no ? charsOf(no, '拼音') : []
}

export const GRADE1_UNITS: UnitInfo[] = [
  { no: 0, label: '我上学了', kind: 'intro' },
  { no: 1, label: '第一单元 · 识字', kind: 'hanzi' },
  { no: 2, label: '第二单元 · 汉语拼音', kind: 'pinyin' },
  { no: 3, label: '第三单元 · 汉语拼音', kind: 'pinyin' },
  { no: 4, label: '第四单元 · 汉语拼音', kind: 'pinyin' },
  { no: 5, label: '第五单元 · 阅读', kind: 'reading' },
  { no: 6, label: '第六单元 · 识字', kind: 'hanzi' },
  { no: 7, label: '第七单元 · 阅读', kind: 'reading' },
  { no: 8, label: '第八单元 · 阅读', kind: 'reading' },
]

const P = (id: string, code: string, name: string, theme: string, video: string, unit: number): Lesson => ({
  id, grade: '1', unit, kind: 'pinyin', code, name, theme,
  videoFile: `/videos/${video}`, textId: undefined,
  no: Object.entries(PINYIN_NO_TO_LESSON).find(([, v]) => v === id)?.[0],
  group: '拼音',
})

export const GRADE1_LESSONS: Lesson[] = [
  // 我上学了
  { id: 'K01', grade: '1', unit: 0, kind: 'reading', code: '我上学了', name: '我是中国人', theme: '开学第一课', textId: 'K01' },
  { id: 'K02', grade: '1', unit: 0, kind: 'reading', code: '我上学了', name: '我爱我们的祖国', theme: '国旗·天安门·长江黄河', textId: 'K02' },
  { id: 'K03', grade: '1', unit: 0, kind: 'reading', code: '我上学了', name: '我是小学生', theme: '上学歌', textId: 'K03' },
  { id: 'K04', grade: '1', unit: 0, kind: 'reading', code: '我上学了', name: '我爱学语文', theme: '读书 写字 讲故事 听故事', textId: 'K04' },
  // 第一单元 识字
  { id: 'Z11', grade: '1', unit: 1, kind: 'hanzi', code: '识字1', name: '天地人', theme: '天 地 人 你 我 他', textId: 'Z11', no: '1', group: '识一' },
  { id: 'Z12', grade: '1', unit: 1, kind: 'hanzi', code: '识字2', name: '金木水火土', theme: '一二三四五 · 日月照今古', textId: 'Z12', no: '2', group: '识一' },
  { id: 'Z13', grade: '1', unit: 1, kind: 'hanzi', code: '识字3', name: '口耳目手足', theme: '站坐行卧', textId: 'Z13', no: '3', group: '识一' },
  { id: 'Z14', grade: '1', unit: 1, kind: 'hanzi', code: '识字4', name: '日月山川', theme: '水火田禾', textId: 'Z14', no: '4', group: '识一' },
  // 拼音 14 课（unit 2: 1-4课, unit 3: 5-9课, unit 4: 10-14课）
  P('L01', '第1课', 'a o e', '单韵母', 'a-o-e.mp4', 2),
  P('L02', '第2课', 'i u ü', '单韵母', 'i-u-v.mp4', 2),
  P('L03', '第3课', 'b p m f', '声母', 'b-p-m-f.mp4', 2),
  P('L04', '第4课', 'd t n l', '声母', 'd-t-n-l.mp4', 2),
  P('L05', '第5课', 'g k h', '声母', 'g-k-h.mp4', 3),
  P('L06', '第6课', 'j q x', '声母', 'j-q-x.mp4', 3),
  P('L07', '第7课', 'z c s', '声母 平舌音', 'z-c-s.mp4', 3),
  P('L08', '第8课', 'zh ch sh r', '声母 翘舌音', 'zh-ch-sh-r.mp4', 3),
  { id: 'L08Y', grade: '1', unit: 3, kind: 'pinyin', code: '第9课', name: 'y w', theme: '声母 y w · 整体认读 yi wu yu', textId: undefined, no: '9', group: '拼音' },
  P('L09', '第10课', 'ai ei ui', '复韵母', 'ai-ei-ui.mp4', 4),
  P('L10', '第11课', 'ao ou iu', '复韵母', 'ao-ou-iu.mp4', 4),
  P('L11', '第12课', 'ie üe er', '复韵母 特殊韵母', 'ie-ue-er.mp4', 4),
  P('L12', '第13课', 'an en in un ün', '前鼻韵母', 'an-en-in-un-un.mp4', 4),
  P('L13', '第14课', 'ang eng ing ong', '后鼻韵母', 'ang-eng-ing-ong.mp4', 4),
  // 第五单元 阅读（课文1-4）
  { id: 'B01', grade: '1', unit: 5, kind: 'reading', code: '课文1', name: '秋天', theme: '天气凉了 树叶黄了', textId: 'B01', no: '1', group: '阅读' },
  { id: 'B02', grade: '1', unit: 5, kind: 'reading', code: '课文2', name: '江南', theme: '汉乐府 · 采莲', textId: 'B02', no: '2', group: '阅读' },
  { id: 'B03', grade: '1', unit: 5, kind: 'reading', code: '课文3', name: '雪地里的小画家', theme: '小鸡画竹叶 小狗画梅花', textId: 'B03', no: '3', group: '阅读' },
  { id: 'B04', grade: '1', unit: 5, kind: 'reading', code: '课文4', name: '四季', theme: '草芽尖尖 荷叶圆圆', textId: 'B04', no: '4', group: '阅读' },
  // 第六单元 识字（识字5-8）
  { id: 'Z65', grade: '1', unit: 6, kind: 'hanzi', code: '识字5', name: '对韵歌', theme: '云对雨 雪对风', textId: 'Z65', no: '5', group: '识二' },
  { id: 'Z66', grade: '1', unit: 6, kind: 'hanzi', code: '识字6', name: '日月明', theme: '会意字 · 二人从 三人众', textId: 'Z66', no: '6', group: '识二' },
  { id: 'Z67', grade: '1', unit: 6, kind: 'hanzi', code: '识字7', name: '小书包', theme: '橡皮 尺子 作业本', textId: 'Z67', no: '7', group: '识二' },
  { id: 'Z68', grade: '1', unit: 6, kind: 'hanzi', code: '识字8', name: '升国旗', theme: '五星红旗 我爱你', textId: 'Z68', no: '8', group: '识二' },
  // 第七单元 阅读（课文5-7）
  { id: 'B05', grade: '1', unit: 7, kind: 'reading', code: '课文5', name: '小小的船', theme: '叶圣陶 · 弯弯的月儿', textId: 'B05', no: '5', group: '阅读' },
  { id: 'B06', grade: '1', unit: 7, kind: 'reading', code: '课文6', name: '影子', theme: '前后左右 · 小黑狗', textId: 'B06', no: '6', group: '阅读' },
  { id: 'B07', grade: '1', unit: 7, kind: 'reading', code: '课文7', name: '两件宝', theme: '陶行知 · 双手和大脑', textId: 'B07', no: '7', group: '阅读' },
  // 第八单元 阅读（课文8-10）
  { id: 'B08', grade: '1', unit: 8, kind: 'reading', code: '课文8', name: '比尾巴', theme: '谁的长 谁的短', textId: 'B08', no: '8', group: '阅读' },
  { id: 'B09', grade: '1', unit: 8, kind: 'reading', code: '课文9', name: '乌鸦喝水', theme: '小石子 · 渐渐升高', textId: 'B09', no: '9', group: '阅读' },
  { id: 'B10', grade: '1', unit: 8, kind: 'reading', code: '课文10', name: '雨点儿', theme: '大雨点儿 小雨点儿', textId: 'B10', no: '10', group: '阅读' },
]

// 给 hanzi/reading 课注入本课会认字（运行时算，保证与 words.ts 同源）
for (const l of GRADE1_LESSONS) {
  if (l.kind === 'pinyin') continue
  if (l.no && l.group) {
    const chars = charsOf(l.no, l.group)
    ;(l as Lesson & { chars?: string[] }).chars = chars
  }
}

// 拼音课会认字（识字表里挂在拼音段的字：爸妈 大马路土 鱼鸭乌鸦等）
for (const l of GRADE1_LESSONS) {
  if (l.kind === 'pinyin') {
    const chars = pinyinChars(l.id)
    if (chars.length) (l as Lesson & { chars?: string[] }).chars = chars
  }
}
