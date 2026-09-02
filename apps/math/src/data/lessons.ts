// 课本同步课程：内容全部来自人教版（2024 新版）课本的例题、做一做、练一练
// 手工录入，保证与课本一致（2上/1上 PDF 已核对）
import type { Grade } from '@/db/schema'

// ---------- 题型 ----------
// teach   讲解卡：课本情境 + 概念
// choice  选择题（4选1，可选 optVisuals 图示选项）
// fill    数字填空（键盘输入）
// match   连线配对（左右各4，点选配对）
// count   数一数（emoji 阵列 + 填数，一年级）
// compare 比大小（填 > < =）
// picexpr 看图列式（emoji 分组阵列 → 列式计算，可 crossOut 表示去掉）

export interface VisualGroups {
  emoji: string
  groups: number[]
}

export type LessonCard =
  | { type: 'teach'; title: string; body: string; emoji?: string }
  | { type: 'choice'; q: string; options: string[]; answer: number; hint?: string; optVisuals?: VisualGroups[] }
  | { type: 'fill'; expr: string; answer: number; hint?: string }
  | { type: 'match'; pairs: [string, string][] }
  | { type: 'count'; emoji: string; n: number; q?: string }
  | { type: 'compare'; a: number; b: number }
  | { type: 'picexpr'; emoji: string; groups: number[]; crossOut?: number; expr: string; answer: number; hint?: string }

export interface Lesson {
  id: string
  title: string
  cards: LessonCard[]
}

export interface Unit {
  id: string
  name: string
  book: string        // '2上' / '1上'
  lessons: Lesson[]
}

// ============================================================
// 二年级上册（2024 新版人教）
// ============================================================

const G2_MUL: Unit = {
  id: 'g2-u2', name: '1~6 的表内乘法', book: '2上',
  lessons: [
    {
      id: 'g2-mul-1',
      title: '乘法的初步认识',
      cards: [
        { type: 'teach', title: '几个几相加，可以用乘法', emoji: '🎡',
          body: '游乐园里，小飞机上坐了 5 组小朋友，每组 3 人。\n求 5 个 3 相加是多少：\n3 + 3 + 3 + 3 + 3 = 15\n还可以写成乘法：\n3 × 5 = 15\n3 和 5 是乘数，15 是积。\n读作：3 乘 5 等于 15。' },
        { type: 'choice', q: '3 + 3 + 3 + 3 + 3 = 15 可以写成哪个乘法算式？',
          options: ['3 × 5 = 15', '5 × 5 = 25', '3 × 3 = 9', '5 + 3 = 8'], answer: 0,
          hint: '相同的数是 3，有 5 个' },
        { type: 'choice', q: '4 + 4 + 4 + 4 + 4 + 4 = 24 可以写成哪个乘法算式？',
          options: ['4 × 6 = 24', '4 × 4 = 16', '6 × 6 = 36', '4 + 6 = 10'], answer: 0,
          hint: '相同的数是 4，有 6 个' },
        { type: 'choice', q: '6 + 6 + 6 + 6 = 24 可以写成哪个乘法算式？',
          options: ['6 × 4 = 24', '4 × 4 = 16', '6 × 3 = 18', '6 + 4 = 10'], answer: 0,
          hint: '相同的数是 6，有 4 个' },
        { type: 'picexpr', emoji: '🎡', groups: [3, 3, 3, 3, 3], expr: '3 × 5 = ?', answer: 15,
          hint: '每组 3 人，有 5 组' },
        { type: 'match', pairs: [['2个3相加', '2 × 3'], ['4个5相加', '4 × 5'], ['3个6相加', '3 × 6'], ['5个2相加', '5 × 2']] },
        { type: 'choice', q: '3 × 5 = 15 读作什么？',
          options: ['三乘五等于十五', '五乘三等于十五', '三五十五', '三加五等于八'], answer: 0,
          hint: '从左往右读，× 读作乘' },
        { type: 'fill', expr: '5 × 3 = ?', answer: 15, hint: '5 个 3 相加' },
      ],
    },
    {
      id: 'g2-mul-2',
      title: '5 的乘法口诀',
      cards: [
        { type: 'teach', title: '5 的乘法口诀', emoji: '⭐',
          body: '1 个 5：一五得五，5 × 1 = 5\n2 个 5：二五一十，5 × 2 = 10\n3 个 5：三五十五，5 × 3 = 15\n4 个 5：四五二十，5 × 4 = 20\n5 个 5：五五二十五，5 × 5 = 25' },
        { type: 'choice', q: '三五（　）', options: ['十五', '一十', '二十', '二十五'], answer: 0 },
        { type: 'choice', q: '四五（　）', options: ['二十', '十五', '二十五', '得五'], answer: 0 },
        { type: 'choice', q: '五五（　）', options: ['二十五', '二十', '十五', '一十'], answer: 0 },
        { type: 'choice', q: '一五得五，二五一十，三五十五，下一句是？',
          options: ['四五二十', '四四十六', '五五二十五', '二五得十'], answer: 0,
          hint: '5 的口诀，每次多 5' },
        { type: 'picexpr', emoji: '🖐', groups: [5, 5, 5], expr: '5 × 3 = ?', answer: 15,
          hint: '想口诀：三五十五' },
        { type: 'fill', expr: '5 × 2 = ?', answer: 10, hint: '二五一十' },
        { type: 'fill', expr: '5 × 4 = ?', answer: 20, hint: '四五二十' },
        { type: 'fill', expr: '5 × 5 = ?', answer: 25, hint: '五五二十五' },
        { type: 'match', pairs: [['二五一十', '2 × 5 = 10'], ['三五十五', '3 × 5 = 15'], ['四五二十', '4 × 5 = 20'], ['五五二十五', '5 × 5 = 25']] },
      ],
    },
    {
      id: 'g2-mul-3',
      title: '2、3、4 的乘法口诀',
      cards: [
        { type: 'teach', title: '2、3、4 的乘法口诀', emoji: '🍒',
          body: '一二得二　二二得四\n一三得三　二三得六　三三得九\n一四得四　二四得八　三四十二　四四十六' },
        { type: 'choice', q: '三四（　）', options: ['十二', '十六', '八', '得九'], answer: 0 },
        { type: 'choice', q: '二三（　）', options: ['得六', '得八', '得九', '十二'], answer: 0 },
        { type: 'choice', q: '四四（　）', options: ['十六', '十二', '八', '得六'], answer: 0 },
        { type: 'choice', q: '一三得三，二三得六，下一句是？',
          options: ['三三得九', '三四十二', '二四得八', '三三得六'], answer: 0,
          hint: '3 的口诀，每次多 3' },
        { type: 'fill', expr: '3 × 3 = ?', answer: 9, hint: '三三得九' },
        { type: 'fill', expr: '4 × 4 = ?', answer: 16, hint: '四四十六' },
        { type: 'fill', expr: '2 × 4 = ?', answer: 8, hint: '二四得八' },
        { type: 'match', pairs: [['二四得八', '2 × 4 = 8'], ['三三得九', '3 × 3 = 9'], ['三四十二', '3 × 4 = 12'], ['四四十六', '4 × 4 = 16']] },
      ],
    },
    {
      id: 'g2-mul-4',
      title: '乘加、乘减',
      cards: [
        { type: 'teach', title: '先算乘法，再算加减', emoji: '🎠',
          body: '旋转木马上，3 组各坐 3 人，还有 1 组坐 2 人。\n一共多少人？\n3 × 3 + 2 = 11（人）\n也可以想成：4 组全坐满再减\n3 × 4 − 1 = 11（人）\n在这样的算式里，要先算乘法。' },
        { type: 'choice', q: '4 × 3 + 5 要先算哪一步？',
          options: ['4 × 3', '3 + 5', '4 + 3', '5 − 3'], answer: 0,
          hint: '有乘有加，先算乘法' },
        { type: 'picexpr', emoji: '🧒', groups: [3, 3, 3, 2], expr: '3 × 3 + 2 = ?', answer: 11,
          hint: '3 组坐满 3 人，还多 2 人' },
        { type: 'picexpr', emoji: '🧒', groups: [3, 3, 3, 3], crossOut: 1, expr: '3 × 4 − 1 = ?', answer: 11,
          hint: '假设 4 组全坐满，再去掉 1 人' },
        { type: 'fill', expr: '4 × 5 + 4 = ?', answer: 24 },
        { type: 'fill', expr: '5 × 5 − 2 = ?', answer: 23 },
      ],
    },
    {
      id: 'g2-mul-5',
      title: '6 的乘法口诀',
      cards: [
        { type: 'teach', title: '6 的乘法口诀', emoji: '🍡',
          body: '一串糖葫芦有 6 颗山楂。\n一六得六　6 × 1 = 6\n二六十二　6 × 2 = 12\n三六十八　6 × 3 = 18\n四六二十四　6 × 4 = 24\n五六三十　6 × 5 = 30\n六六三十六　6 × 6 = 36' },
        { type: 'choice', q: '三六（　）', options: ['十八', '十二', '二十四', '得六'], answer: 0 },
        { type: 'choice', q: '四六（　）', options: ['二十四', '十八', '三十', '十二'], answer: 0 },
        { type: 'choice', q: '五六（　）', options: ['三十', '二十四', '三十六', '十八'], answer: 0 },
        { type: 'choice', q: '三六十八，四六二十四，下一句是？',
          options: ['五六三十', '六六三十六', '四六三十', '五七三十五'], answer: 0,
          hint: '6 的口诀，每次多 6' },
        { type: 'picexpr', emoji: '🍡', groups: [6, 6, 6], expr: '6 × 3 = ?', answer: 18,
          hint: '想口诀：三六十八' },
        { type: 'fill', expr: '6 × 2 = ?', answer: 12, hint: '二六十二' },
        { type: 'fill', expr: '6 × 5 = ?', answer: 30, hint: '五六三十' },
        { type: 'fill', expr: '6 × 6 = ?', answer: 36, hint: '六六三十六' },
        { type: 'match', pairs: [['二六十二', '2 × 6 = 12'], ['三六十八', '3 × 6 = 18'], ['四六二十四', '4 × 6 = 24'], ['五六三十', '5 × 6 = 30']] },
      ],
    },
  ],
}

const G2_DIV: Unit = {
  id: 'g2-u3', name: '1~6 的表内除法', book: '2上',
  lessons: [
    {
      id: 'g2-div-1',
      title: '平均分',
      cards: [
        { type: 'teach', title: '每份同样多，叫平均分', emoji: '🍬',
          body: '把 6 块糖分成 3 份，每份都是 2 块。\n每份分得同样多，叫平均分。\n8 袋饼干，每 2 袋一份，能分成 4 份，\n正好分完，这也是平均分。' },
        { type: 'choice', q: '哪种分法是平均分？',
          options: ['2、2、2', '1、2、3', '2、1、3'], answer: 0,
          optVisuals: [
            { emoji: '🍬', groups: [2, 2, 2] },
            { emoji: '🍬', groups: [1, 2, 3] },
            { emoji: '🍬', groups: [2, 1, 3] },
          ],
          hint: '每份同样多，才是平均分' },
        { type: 'fill', expr: '10 根小棒，每 2 根一份，能分成（　）份', answer: 5 },
        { type: 'fill', expr: '12 袋饼干，每 3 袋一份，能分成（　）份', answer: 4 },
        { type: 'fill', expr: '16 个杯子，每 2 个装一盒，可以装（　）盒', answer: 8 },
        { type: 'fill', expr: '10 盒酸奶平均分成 2 份，每份（　）盒', answer: 5 },
      ],
    },
    {
      id: 'g2-div-2',
      title: '除法的认识',
      cards: [
        { type: 'teach', title: '认识除号 ÷', emoji: '🎋',
          body: '12 个竹笋，平均放在 4 个盘里，每盘放 3 个。\n写成除法算式：\n12 ÷ 4 = 3\n÷ 是除号。\n读作：12 除以 4 等于 3。' },
        { type: 'choice', q: '12 ÷ 4 = 3 读作什么？',
          options: ['十二除以四等于三', '十二除四等于三', '四除以十二等于三', '十二乘四等于三'], answer: 0,
          hint: '“除”和“除以”不一样，÷ 读作除以' },
        { type: 'choice', q: '把 15 个橘子平均分成 5 份，每份几个？算式是？',
          options: ['15 ÷ 5 = 3', '15 − 5 = 10', '5 × 3 = 15', '15 + 5 = 20'], answer: 0,
          hint: '平均分，用除法' },
        { type: 'picexpr', emoji: '🎋', groups: [3, 3, 3, 3], expr: '12 ÷ 4 = ?', answer: 3,
          hint: '12 个放 4 盘，每盘几个' },
        { type: 'fill', expr: '8 ÷ 4 = ?', answer: 2 },
        { type: 'fill', expr: '15 ÷ 5 = ?', answer: 3 },
        { type: 'fill', expr: '18 ÷ 3 = ?', answer: 6 },
      ],
    },
    {
      id: 'g2-div-3',
      title: '用乘法口诀求商',
      cards: [
        { type: 'teach', title: '想口诀，算除法', emoji: '💡',
          body: '12 ÷ 3 = ？\n想：三（　）十二\n三四十二\n所以 12 ÷ 3 = 4\n用乘法口诀就能求出商！' },
        { type: 'fill', expr: '12 ÷ 3 = ?', answer: 4, hint: '想：三四十二' },
        { type: 'fill', expr: '10 ÷ 5 = ?', answer: 2, hint: '想：二五一十' },
        { type: 'fill', expr: '24 ÷ 6 = ?', answer: 4, hint: '想：四六二十四' },
        { type: 'fill', expr: '20 ÷ 4 = ?', answer: 5, hint: '想：四五二十' },
        { type: 'match', pairs: [['12 ÷ 3', '三四十二'], ['20 ÷ 5', '四五二十'], ['18 ÷ 6', '三六十八'], ['8 ÷ 2', '二四得八']] },
        { type: 'choice', q: '一句“三四十二”，不能帮我们算哪道题？',
          options: ['3 + 4 = 7', '3 × 4 = 12', '12 ÷ 3 = 4', '12 ÷ 4 = 3'], answer: 0,
          hint: '乘法和除法都能用这句口诀' },
        { type: 'match', pairs: [['三四十二', '12 ÷ 4 = 3'], ['四五二十', '20 ÷ 4 = 5'], ['三六十八', '18 ÷ 6 = 3'], ['二四得八', '8 ÷ 4 = 2']] },
      ],
    },
  ],
}

// ============================================================
// 一年级上册（2024 新版人教）
// ============================================================

const G1_NUM5: Unit = {
  id: 'g1-u1', name: '5 以内数的认识和加、减法', book: '1上',
  lessons: [
    {
      id: 'g1-n5-1',
      title: '数一数',
      cards: [
        { type: 'teach', title: '认识 1~5', emoji: '🍎',
          body: '数一数，说一说：\n1、2、3、4、5\n看到几个，就说几。' },
        { type: 'count', emoji: '🍎', n: 3, q: '有几个苹果？' },
        { type: 'count', emoji: '🐟', n: 5, q: '有几条小鱼？' },
        { type: 'count', emoji: '🌸', n: 2, q: '有几朵花？' },
        { type: 'count', emoji: '⭐', n: 4, q: '有几颗星星？' },
      ],
    },
    {
      id: 'g1-n5-2',
      title: '比大小',
      cards: [
        { type: 'teach', title: '大于号和小于号', emoji: '⚖️',
          body: '3 和 3 同样多：3 = 3\n3 比 2 多：3 > 2\n3 比 4 少：3 < 4\n记住：开口朝着大数！' },
        { type: 'compare', a: 3, b: 5 },
        { type: 'compare', a: 4, b: 2 },
        { type: 'compare', a: 5, b: 5 },
        { type: 'compare', a: 2, b: 4 },
        { type: 'compare', a: 4, b: 1 },
      ],
    },
    {
      id: 'g1-n5-3',
      title: '分与合',
      cards: [
        { type: 'teach', title: '5 的分与合', emoji: '🖐',
          body: '5 可以分成：\n1 和 4　2 和 3\n3 和 2　4 和 1\n1 和 4 合起来是 5，\n2 和 3 合起来也是 5。' },
        { type: 'choice', q: '5 分成 2 和（　）', options: ['3', '2', '4', '1'], answer: 0,
          hint: '2 和 3 合起来是 5' },
        { type: 'choice', q: '5 分成 4 和（　）', options: ['1', '2', '3', '4'], answer: 0,
          hint: '4 和 1 合起来是 5' },
        { type: 'choice', q: '4 分成 1 和（　）', options: ['3', '2', '4', '5'], answer: 0,
          hint: '1 和 3 合起来是 4' },
        { type: 'choice', q: '3 和 2 合起来是（　）', options: ['5', '4', '6', '3'], answer: 0 },
        { type: 'choice', q: '2 和 2 合起来是（　）', options: ['4', '3', '5', '2'], answer: 0 },
      ],
    },
    {
      id: 'g1-n5-4',
      title: '5 以内的加法',
      cards: [
        { type: 'teach', title: '合起来，用加法', emoji: '🐿',
          body: '树上有 3 只松鼠，又跑来 2 只。\n一共有几只？\n3 + 2 = 5\n读作：3 加 2 等于 5。' },
        { type: 'picexpr', emoji: '🐿', groups: [3, 2], expr: '3 + 2 = ?', answer: 5,
          hint: '数一数，合起来是几只' },
        { type: 'picexpr', emoji: '🌸', groups: [1, 4], expr: '1 + 4 = ?', answer: 5,
          hint: '数一数，合起来是几朵' },
        { type: 'fill', expr: '3 + 2 = ?', answer: 5 },
        { type: 'fill', expr: '2 + 2 = ?', answer: 4 },
        { type: 'fill', expr: '2 + 3 = ?', answer: 5 },
      ],
    },
    {
      id: 'g1-n5-5',
      title: '5 以内的减法',
      cards: [
        { type: 'teach', title: '去掉一些，用减法', emoji: '🍏',
          body: '5 个苹果，吃掉 2 个，还剩几个？\n5 − 2 = 3\n读作：5 减 2 等于 3。' },
        { type: 'picexpr', emoji: '🍏', groups: [5], crossOut: 2, expr: '5 − 2 = ?', answer: 3,
          hint: '划掉的去掉，还剩几个' },
        { type: 'picexpr', emoji: '🎈', groups: [4], crossOut: 1, expr: '4 − 1 = ?', answer: 3,
          hint: '划掉的去掉，还剩几个' },
        { type: 'fill', expr: '5 − 2 = ?', answer: 3 },
        { type: 'fill', expr: '4 − 1 = ?', answer: 3 },
        { type: 'fill', expr: '5 − 3 = ?', answer: 2 },
        { type: 'fill', expr: '3 − 1 = ?', answer: 2 },
      ],
    },
  ],
}

const G1_NUM10: Unit = {
  id: 'g1-u2', name: '6~10 的认识和加、减法', book: '1上',
  lessons: [
    {
      id: 'g1-n10-1',
      title: '数一数 6~10',
      cards: [
        { type: 'teach', title: '认识 6~10', emoji: '🍊',
          body: '6、7、8、9、10\n比 5 大的数，接着数：\n5 后面是 6，6 后面是 7……' },
        { type: 'count', emoji: '🍊', n: 6, q: '有几个橘子？' },
        { type: 'count', emoji: '🐤', n: 7, q: '有几只小鸡？' },
        { type: 'count', emoji: '🎈', n: 8, q: '有几个气球？' },
        { type: 'count', emoji: '🍓', n: 9, q: '有几颗草莓？' },
        { type: 'count', emoji: '✏️', n: 10, q: '有几支铅笔？' },
      ],
    },
    {
      id: 'g1-n10-2',
      title: '比大小 6~10',
      cards: [
        { type: 'teach', title: '复习：开口朝大数', emoji: '⚖️',
          body: '8 比 7 多：8 > 7\n7 比 8 少：7 < 8\n一样多就用等号：10 = 10' },
        { type: 'compare', a: 6, b: 9 },
        { type: 'compare', a: 8, b: 7 },
        { type: 'compare', a: 10, b: 10 },
        { type: 'compare', a: 7, b: 8 },
        { type: 'compare', a: 9, b: 6 },
      ],
    },
  ],
}

export const UNITS: Record<Grade, Unit[]> = {
  '1': [G1_NUM5, G1_NUM10],
  '2': [G2_MUL, G2_DIV],
}

export function lessonById(id: string): Lesson | undefined {
  for (const g of ['1', '2'] as Grade[]) {
    for (const u of UNITS[g]) {
      const l = u.lessons.find(l => l.id === id)
      if (l) return l
    }
  }
  return undefined
}

export function unitById(id: string): Unit | undefined {
  for (const g of ['1', '2'] as Grade[]) {
    const u = UNITS[g].find(u => u.id === id)
    if (u) return u
  }
  return undefined
}
