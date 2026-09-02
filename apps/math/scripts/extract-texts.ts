// 提取所有会被朗读的静态文本 → scripts/texts.json（供 gen-audio.mjs 生成整句 mp3）
// 运行：npx tsx scripts/extract-texts.ts
// 文本清单必须与 LessonPage.tsx 的实际朗读调用一一对应：
//   teach → [title, ...body 按行]   choice → q + 每个 option
//   fill → expr                     picexpr → '看图算一算，' + expr
//   count → q ?? '数一数，有几个？'  compare → 'X 和 Y，谁大谁小？'
//   match → '连一连，找朋友' + 左右项  夸奖 → '太厉害了' '真棒'
import { writeFileSync } from 'node:fs'
import { UNITS } from '../src/data/lessons'
import { readAloud } from '../src/tts'
import { numToCn } from '../src/data/topics'

const texts = new Set<string>()
const add = (s: string) => { const t = readAloud(s).trim(); if (t) texts.add(t) }

for (const units of Object.values(UNITS)) {
  for (const u of units) {
    for (const l of u.lessons) {
      for (const c of l.cards) {
        switch (c.type) {
          case 'teach':
            add(c.title)
            for (const ln of c.body.split('\n')) add(ln)
            break
          case 'choice':
            add(c.q)
            for (const o of c.options) add(o)
            break
          case 'fill':
            add(c.expr)
            break
          case 'picexpr':
            add(`看图算一算，${c.expr}`)
            add(c.expr)
            break
          case 'count':
            add(c.q ?? '数一数，有几个？')
            break
          case 'compare':
            add(`${numToCn(c.a)} 和 ${numToCn(c.b)}，谁大谁小？`)
            break
          case 'match':
            add('连一连，找朋友')
            for (const [l, r] of c.pairs) { add(l); add(r) }
            break
        }
      }
    }
  }
}
add('太厉害了')
add('真棒')

writeFileSync(new URL('./texts.json', import.meta.url), JSON.stringify([...texts], null, 0), 'utf8')
console.log(`提取 ${texts.size} 条静态朗读文本`)
