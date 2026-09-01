// 13 课元数据（基于人教版部编版一年级上册汉语拼音 1-13 课）
// 视频路径 /videos/v1.mp4 ... /videos/v13.mp4

export type LessonId =
  | 'L01' | 'L02' | 'L03' | 'L04' | 'L05' | 'L06' | 'L07'
  | 'L08' | 'L08Y' | 'L09' | 'L10' | 'L11' | 'L12' | 'L13'

export interface Lesson {
  id: LessonId
  code: string        // 显示用 "第1课"
  name: string        // 主题简称
  theme: string       // 主题描述
  videoFile: string   // /videos/v1.mp4
  pdfPages: number[]  // 配套 PDF 页码（用于题库参考）
  unlocks: LessonId[] // 解锁条件：通过这关的下一关列表
}

export const LESSONS: Lesson[] = [
  {
    id: 'L01', code: '第1课', name: '单韵母 a o e',
    theme: '认识 3 个单韵母 + 四声',
    videoFile: '/videos/v1.mp4',
    pdfPages: [1, 2, 3, 7, 8],
    unlocks: ['L02'],
  },
  {
    id: 'L02', code: '第2课', name: 'i u ü y w',
    theme: '单韵母 i u ü + 声母 y w + 整体认读 yi wu yu',
    videoFile: '/videos/v2.mp4',
    pdfPages: [4, 5, 6, 7, 8, 40, 41],
    unlocks: ['L03'],
  },
  {
    id: 'L03', code: '第3课', name: 'b p m f',
    theme: '声母 b p m f + 拼读',
    videoFile: '/videos/v3.mp4',
    pdfPages: [9, 10, 11, 12, 13, 14],
    unlocks: ['L04'],
  },
  {
    id: 'L04', code: '第4课', name: 'd t n l',
    theme: '声母 d t n l + 拼读',
    videoFile: '/videos/v4.mp4',
    pdfPages: [15, 16, 17, 18, 19, 20],
    unlocks: ['L05'],
  },
  {
    id: 'L05', code: '第5课', name: 'g k h',
    theme: '声母 g k h + 拼读',
    videoFile: '/videos/v5.mp4',
    pdfPages: [21, 22, 23, 24, 25],
    unlocks: ['L06'],
  },
  {
    id: 'L06', code: '第6课', name: 'j q x',
    theme: '声母 j q x + ü 省略两点规则',
    videoFile: '/videos/v6.mp4',
    pdfPages: [26, 27, 28, 29, 30],
    unlocks: ['L07'],
  },
  {
    id: 'L07', code: '第7课', name: 'z c s',
    theme: '平舌音声母 z c s + 整体认读 zi ci si',
    videoFile: '/videos/v7.mp4',
    pdfPages: [31, 32, 33, 38],
    unlocks: ['L08'],
  },
  {
    id: 'L08', code: '第8课', name: 'zh ch sh r',
    theme: '翘舌音声母 zh ch sh r + 整体认读',
    videoFile: '/videos/v8.mp4',
    pdfPages: [34, 35, 36, 37, 38],
    unlocks: ['L09'],
  },
  {
    id: 'L09', code: '第9课', name: 'ai ei ui',
    theme: '复韵母 ai ei ui + 标调规则',
    videoFile: '/videos/v10.mp4',
    pdfPages: [],   // PDF 集中在 L1-L8
    unlocks: ['L10'],
  },
  {
    id: 'L10', code: '第10课', name: 'ao ou iu',
    theme: '复韵母 ao ou iu',
    videoFile: '/videos/v9.mp4',
    pdfPages: [],
    unlocks: ['L11'],
  },
  {
    id: 'L11', code: '第11课', name: 'ie üe er',
    theme: '复韵母 ie üe + 特殊韵母 er + 整体认读 ye yue',
    videoFile: '/videos/v11.mp4',
    pdfPages: [],
    unlocks: ['L12'],
  },
  {
    id: 'L12', code: '第12课', name: 'an en in un ün',
    theme: '前鼻韵母 5 个 + 整体认读 yuan yin yun',
    videoFile: '/videos/v12.mp4',
    pdfPages: [],
    unlocks: ['L13'],
  },
  {
    id: 'L13', code: '第13课', name: 'ang eng ing ong',
    theme: '后鼻韵母 4 个 + 整体认读 ying',
    videoFile: '/videos/v13.mp4',
    pdfPages: [],
    unlocks: [],
  },
]

// 占位解锁状态（实际用 Dexie 持久化）
// v1 第一版只解锁 L01-L03 给用户试，其他锁
;(function applyDefaultUnlock() {
  // URL 参数 ?unlock=all 解锁全部
  const all = new URLSearchParams(window.location.search).get('unlock') === 'all'
  LESSONS.forEach((l, i) => {
    ;(l as any).unlocked = all || i < 3
  })
})()

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find(l => l.id === id)
}
