// 2年级上册 课程结构（2025 最新修订版部编人教版）
// 课文 1-23 连续编号；第二单元为识字单元
import type { Lesson, UnitInfo } from '../types'

export const GRADE2_UNITS: UnitInfo[] = [

  { no: 1, label: '第一单元 · 阅读', kind: 'reading' },
  { no: 2, label: '第二单元 · 识字', kind: 'hanzi' },
  { no: 3, label: '第三单元 · 阅读', kind: 'reading' },
  { no: 4, label: '第四单元 · 阅读', kind: 'reading' },
  { no: 5, label: '第五单元 · 阅读', kind: 'reading' },
  { no: 6, label: '第六单元 · 阅读', kind: 'reading' },
  { no: 7, label: '第七单元 · 阅读', kind: 'reading' },
  { no: 8, label: '第八单元 · 阅读', kind: 'reading' },
]

export const GRADE2_LESSONS: Lesson[] = [
  { id: 'L1', grade: '2', unit: 1, kind: 'reading', code: '课文1', name: '小蝌蚪找妈妈', theme: '小蝌蚪找妈妈 · 朗读与认字', textId: 'L1' },
  { id: 'L2', grade: '2', unit: 1, kind: 'reading', code: '课文2', name: '我是什么', theme: '我是什么 · 朗读与认字', textId: 'L2' },
  { id: 'L3', grade: '2', unit: 1, kind: 'reading', code: '课文3', name: '植物妈妈有办法', theme: '植物妈妈有办法 · 朗读与认字', textId: 'L3' },
  { id: 'Z1', grade: '2', unit: 2, kind: 'hanzi', code: '识字1', name: '场景歌', theme: '场景歌 · 朗读与认字', textId: 'Z1' },
  { id: 'Z2', grade: '2', unit: 2, kind: 'hanzi', code: '识字2', name: '树之歌', theme: '树之歌 · 朗读与认字', textId: 'Z2' },
  { id: 'Z3', grade: '2', unit: 2, kind: 'hanzi', code: '识字3', name: '拍手歌', theme: '拍手歌 · 朗读与认字', textId: 'Z3' },
  { id: 'Z4', grade: '2', unit: 2, kind: 'hanzi', code: '识字4', name: '田家四季歌', theme: '田家四季歌 · 朗读与认字', textId: 'Z4' },
  { id: 'L4', grade: '2', unit: 3, kind: 'reading', code: '课文4', name: '彩虹', theme: '彩虹 · 朗读与认字', textId: 'L4' },
  { id: 'L5', grade: '2', unit: 3, kind: 'reading', code: '课文5', name: '去外婆家', theme: '去外婆家 · 朗读与认字', textId: 'L5' },
  { id: 'L6', grade: '2', unit: 3, kind: 'reading', code: '课文6', name: '数星星的孩子', theme: '数星星的孩子 · 朗读与认字', textId: 'L6' },
  { id: 'L7', grade: '2', unit: 4, kind: 'reading', code: '课文7', name: '古诗二首', theme: '古诗二首 · 朗读与认字', textId: 'L7' },
  { id: 'L8', grade: '2', unit: 4, kind: 'reading', code: '课文8', name: '黄山奇石', theme: '黄山奇石 · 朗读与认字', textId: 'L8' },
  { id: 'L9', grade: '2', unit: 4, kind: 'reading', code: '课文9', name: '日月潭', theme: '日月潭 · 朗读与认字', textId: 'L9' },
  { id: 'L10', grade: '2', unit: 4, kind: 'reading', code: '课文10', name: '葡萄沟', theme: '葡萄沟 · 朗读与认字', textId: 'L10' },
  { id: 'L11', grade: '2', unit: 5, kind: 'reading', code: '课文11', name: '坐井观天', theme: '坐井观天 · 朗读与认字', textId: 'L11' },
  { id: 'L12', grade: '2', unit: 5, kind: 'reading', code: '课文12', name: '寒号鸟', theme: '寒号鸟 · 朗读与认字', textId: 'L12' },
  { id: 'L13', grade: '2', unit: 5, kind: 'reading', code: '课文13', name: '我要的是葫芦', theme: '我要的是葫芦 · 朗读与认字', textId: 'L13' },
  { id: 'L14', grade: '2', unit: 6, kind: 'reading', code: '课文14', name: '八角楼上', theme: '八角楼上 · 朗读与认字', textId: 'L14' },
  { id: 'L15', grade: '2', unit: 6, kind: 'reading', code: '课文15', name: '朱德的扁担', theme: '朱德的扁担 · 朗读与认字', textId: 'L15' },
  { id: 'L16', grade: '2', unit: 6, kind: 'reading', code: '课文16', name: '难忘的泼水节', theme: '难忘的泼水节 · 朗读与认字', textId: 'L16' },
  { id: 'L17', grade: '2', unit: 6, kind: 'reading', code: '课文17', name: '刘胡兰', theme: '刘胡兰 · 朗读与认字', textId: 'L17' },
  { id: 'L18', grade: '2', unit: 7, kind: 'reading', code: '课文18', name: '古诗二首', theme: '古诗二首 · 朗读与认字', textId: 'L18' },
  { id: 'L19', grade: '2', unit: 7, kind: 'reading', code: '课文19', name: '雾在哪里', theme: '雾在哪里 · 朗读与认字', textId: 'L19' },
  { id: 'L20', grade: '2', unit: 7, kind: 'reading', code: '课文20', name: '雪孩子', theme: '雪孩子 · 朗读与认字', textId: 'L20' },
  { id: 'L21', grade: '2', unit: 8, kind: 'reading', code: '课文21', name: '称赞', theme: '称赞 · 朗读与认字', textId: 'L21' },
  { id: 'L22', grade: '2', unit: 8, kind: 'reading', code: '课文22', name: '纸船和风筝', theme: '纸船和风筝 · 朗读与认字', textId: 'L22' },
  { id: 'L23', grade: '2', unit: 8, kind: 'reading', code: '课文23', name: '快乐的小河', theme: '快乐的小河 · 朗读与认字', textId: 'L23' },
]