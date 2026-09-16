// node --test 原生测试（Node >=22，无需 vitest）。
// 运行：node --experimental-strip-types --test apps/web/tests/parser.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHomework } from '../src/homework/parser.ts'

test('学科独占一行 + 多条编号内容归属该学科', () => {
  const text = `语文
1.复习生字
2.读摘星卡第5课三遍
数学
1.口算第12页`
  const r = parseHomework(text)
  assert.equal(r.entries.length, 2)
  assert.deepEqual(r.entries[0].subject, '语文')
  assert.deepEqual(r.entries[0].lines, ['1.复习生字', '2.读摘星卡第5课三遍'])
  assert.equal(r.entries[0].starCardLesson, 5)
  assert.equal(r.entries[1].subject, '数学')
  assert.equal(r.entries[1].starCardLesson, null)
  assert.deepEqual(r.orphans, [])
})

test('学科同行带内容（单行式）', () => {
  const r = parseHomework('英语 读pad上英语5分钟\n小提琴 持弓练习20分钟')
  assert.equal(r.entries.length, 2)
  assert.equal(r.entries[0].lines[0], '读pad上英语5分钟')
  assert.equal(r.entries[1].subject, '小提琴')
})

test('注释与空行忽略；空学科块跳过', () => {
  const text = `# 这是注释

语文
1.读书

数学

英语 听5分钟`
  const r = parseHomework(text)
  assert.deepEqual(r.entries.map((e) => e.subject), ['语文', '英语'])
})

test('学科之外的游离行进 orphans 而不是崩溃', () => {
  const r = parseHomework('乱跑的一行\n语文\n1.a')
  assert.equal(r.orphans.length, 1)
  assert.equal(r.orphans[0].lineNo, 1)
  assert.equal(r.entries.length, 1)
})

test('摘星卡课次容忍空格；摘星本页码不误判', () => {
  assert.equal(parseHomework('语文 读摘星卡 7 课').entries[0].starCardLesson, 7)
  assert.equal(parseHomework('语文 摘星本P1上的内容').entries[0].starCardLesson, null)
})

test('全空/纯注释 → 没有作业条目', () => {
  assert.equal(parseHomework('# only comment\n\n').entries.length, 0)
})

test('CRLF 与 BOM 容忍', () => {
  const r = parseHomework('\uFEFF语文\r\n1.读书\r\n')
  assert.equal(r.entries.length, 1)
  assert.equal(r.entries[0].lines[0], '1.读书')
})
