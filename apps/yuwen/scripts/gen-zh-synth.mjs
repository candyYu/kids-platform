// 用 macOS say (Tingting voice) 重新生成 zh-synth 整字 mp3
// 替换之前用 Mei-Jia 生成的"声调混淆"版本
// Tingting 区分所有 5 个声调（轻声 + 4 声）
//
// 用法：node scripts/gen-zh-synth.mjs
// 输出：apps/yuwen/public/audio/slices/zh-synth/{拼音}.mp3
//       + 更新 synth-index.json

import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = join(ROOT, 'public/audio/slices/zh-synth')
const INDEX_PATH = join(ROOT, 'public/audio/synth-index.json')

mkdirSync(OUT_DIR, { recursive: true })

// macOS Tingting 中文 voice (区分 4 声 + 轻声)
const VOICE = 'Tingting'
// 语速：教学场景用 0.9 倍速（120 wpm），更清晰
const RATE = 120

// === 拼音库 ===

// 23 声母（b p m f + d t n l + g k h + j q x + zh ch sh r + z c s + y w）
const SHENGMU = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l',
  'g', 'k', 'h', 'j', 'q', 'x',
  'zh', 'ch', 'sh', 'r',
  'z', 'c', 's',
  'y', 'w'
]

// 24 韵母（基本 + 复韵母 + 前鼻 + 后鼻 + 特殊）
const YUNMU = [
  'a', 'o', 'e', 'i', 'u', 'ü',
  'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe',
  'er',
  'an', 'en', 'in', 'un', 'ün',
  'ang', 'eng', 'ing', 'ong'
]

// 整体认读音节
const ZHENG_TI = ['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si', 'yi', 'wu', 'yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying']

// 声调字符表
const TONE_VOWELS = {
  a: ['ā', 'á', 'ǎ', 'à'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

// 给音节加指定声调（按汉语拼音标准规则确定调号位置）
// 规则：
//   1. a/o/e 出现时，调号标在 a/o/e 上（按出现顺序）
//   2. 只有 i/u/ü 时，标在最后一个上
//   3. iu 连写时，标在 u 上
//   4. ui 连写时，标在 i 上
//   5. un 标在 u 上
//   6. üe 标在 e 上
//   7. 整体认读音节直接标在主元音
function withTone(base, tone) {
  if (tone === 0) return base // 轻声
  const TONE_VOWELS = {
    a: ['ā', 'á', 'ǎ', 'à'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  }

  // 优先找 a/o/e
  const aoeIdx = base.search(/[aoe]/)
  if (aoeIdx >= 0) {
    const v = base[aoeIdx]
    return base.slice(0, aoeIdx) + TONE_VOWELS[v][tone - 1] + base.slice(aoeIdx + 1)
  }

  // 没有 a/o/e，处理 iu/ui/un 等特殊组合
  if (base.includes('ui')) {
    // ui 标在 i 上
    const idx = base.indexOf('ui') + 1
    return base.slice(0, idx) + TONE_VOWELS.i[tone - 1] + base.slice(idx + 1)
  }
  if (base.includes('iu')) {
    // iu 标在 u 上
    const idx = base.indexOf('iu') + 1
    return base.slice(0, idx) + TONE_VOWELS.u[tone - 1] + base.slice(idx + 1)
  }
  if (base.includes('un')) {
    // un 标在 u 上
    const idx = base.indexOf('un')
    return base.slice(0, idx) + TONE_VOWELS.u[tone - 1] + base.slice(idx + 1)
  }
  if (base.includes('üe')) {
    // üe 标在 e 上
    const idx = base.indexOf('üe') + 1
    return base.slice(0, idx) + TONE_VOWELS.e[tone - 1] + base.slice(idx + 1)
  }

  // 其他（只有 i/u/ü 的），标在最后一个
  const match = [...base].map((c, i) => /[iuü]/.test(c) ? i : -1).filter(i => i >= 0)
  if (match.length === 0) return base
  const idx = match[match.length - 1]
  const v = base[idx]
  return base.slice(0, idx) + TONE_VOWELS[v][tone - 1] + base.slice(idx + 1)
}

// 判断声母韵母组合是否合法
function isValidCombo(sm, ym) {
  // b/p/m/f 不能跟 i/ia/iao/ian/iang/ie 等（i 实际是 /ɨ/ 但拼音写作 i）
  // 简化为：bpmf + ia/ie/iou(iu) 拼写时 i 改写为 ia 但实际 bpmf 不跟 ia
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'i') return false
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'ia') return false
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'ie') return false
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'iu') return false
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'in') return false
  if (['b', 'p', 'm', 'f'].includes(sm) && ym === 'ing') return false
  // j q x 不能跟 a o e 开头（要改为 ia ue üe）
  if (['j', 'q', 'x'].includes(sm) && /^[aoe]/.test(ym)) return false
  if (['j', 'q', 'x'].includes(sm) && ym === 'u') return false  // ju 实际写为 jü
  if (['j', 'q', 'x'].includes(sm) && ym === 'un') return false
  if (['j', 'q', 'x'].includes(sm) && ym === 'ong') return false  // jiong 不存在
  if (['j', 'q', 'x'].includes(sm) && ym === 'ong') return false
  // j q x + ü → ju/qu/xu（ü 上的点省略）
  if (['j', 'q', 'x'].includes(sm) && ym === 'ü') return false  // 实际拼为 ju
  // y w 只能做零声母
  if (sm === 'y' && /^[aoe]/.test(ym)) return false
  if (sm === 'w' && /^[oe]/.test(ym)) return false
  // zh ch sh r + ü 不存在
  if (['zh', 'ch', 'sh', 'r'].includes(sm) && ym.startsWith('ü')) return false
  // z c s + i → zi/ci/si（整体认读）
  if (['z', 'c', 's'].includes(sm) && ym === 'i') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'ia') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'ie') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'in') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'ing') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'iu') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'ui') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'un') return false
  if (['z', 'c', 's'].includes(sm) && ym === 'ong') return false
  return true
}

// 构造所有拼音
function generateAllPinyin() {
  const set = new Set()

  // 1. 零声母（直接韵母）：a o e ê + 所有韵母
  for (const ym of YUNMU) {
    for (let tone = 0; tone <= 4; tone++) {
      set.add(withTone(ym, tone))
    }
  }
  // 特殊：ê (诶)
  for (let tone = 0; tone <= 4; tone++) {
    set.add(withTone('ê', tone))
  }

  // 2. 声母 + 韵母组合
  for (const sm of SHENGMU) {
    for (const ym of YUNMU) {
      if (!isValidCombo(sm, ym)) continue
      // y + i/... → 整体认读
      // w + u → 整体认读
      if (sm === 'y' && ['i', 'in', 'ing', 'ie', 'iang', 'iong', 'iu'].includes(ym)) continue
      if (sm === 'w' && ['u'].includes(ym)) continue
      const base = sm + ym
      for (let tone = 0; tone <= 4; tone++) {
        set.add(withTone(base, tone))
      }
    }
  }

  // 3. 整体认读
  for (const z of ZHENG_TI) {
    set.add(z)
    if (['zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si'].includes(z)) {
      for (let tone = 0; tone <= 4; tone++) {
        set.add(withTone(z, tone))
      }
    }
  }

  return [...set].sort()
}

const ALL_PINYIN = generateAllPinyin()
console.log(`总拼音数: ${ALL_PINYIN.length}`)

function generateOne(pinyin) {
  const outFile = join(OUT_DIR, `${pinyin}.mp3`)
  if (existsSync(outFile) && statSync(outFile).size > 500) {
    return { pinyin, status: 'skipped' }
  }
  const aiff = `/tmp/zh-synth-${Date.now()}-${Math.random().toString(36).slice(2)}.aiff`
  try {
    // macOS say 生成 aiff（用 Tingting voice）
    execSync(`say -v ${VOICE} --rate=${RATE} -o ${aiff} ${JSON.stringify(pinyin)}`, { stdio: 'pipe' })
    // ffmpeg 转 mp3
    execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe' })
    // 清理 aiff
    try { unlinkSync(aiff) } catch {}
    const size = statSync(outFile).size
    if (size < 500) {
      return { pinyin, status: 'failed', error: `too small: ${size} bytes` }
    }
    return { pinyin, status: 'ok', size }
  } catch (e) {
    try { unlinkSync(aiff) } catch {}
    return { pinyin, status: 'failed', error: e.message }
  }
}

async function run() {
  let success = 0, skipped = 0, failed = 0
  const failedList = []

  // 过滤掉已存在的
  const toGenerate = ALL_PINYIN.filter(p => {
    const f = join(OUT_DIR, `${p}.mp3`)
    return !(existsSync(f) && statSync(f).size > 500)
  })
  console.log(`\n开始生成 ${toGenerate.length} 个 mp3（用 Tingting voice，8 并发）...`)

  // 8 并发池
  const CONCURRENCY = 8
  let idx = 0
  async function worker() {
    while (idx < toGenerate.length) {
      const i = idx++
      const p = toGenerate[i]
      const r = generateOne(p)
      if (r.status === 'ok') success++
      else if (r.status === 'skipped') skipped++
      else { failed++; failedList.push(p) }
    }
  }
  const workers = Array(CONCURRENCY).fill(0).map(() => worker())
  await Promise.all(workers)

  // 进度报告
  for (let i = 50; i <= toGenerate.length; i += 50) {
    console.log(`  进度: ${Math.min(i, toGenerate.length)}/${toGenerate.length}`)
  }
  console.log(`  进度: ${toGenerate.length}/${toGenerate.length}`)

  console.log(`\n完成: 成功 ${success} 跳过 ${skipped} 失败 ${failed}`)
  if (failedList.length > 0) {
    console.log(`失败列表 (${failedList.length}): ${failedList.slice(0, 20).join(', ')}${failedList.length > 20 ? '...' : ''}`)
  }

  // 更新 synth-index.json（只列实际存在的）
  const { readdirSync } = await import('node:fs')
  const allFiles = readdirSync(OUT_DIR).filter(f => f.endsWith('.mp3'))
  writeFileSync(INDEX_PATH, JSON.stringify(allFiles))
  console.log(`\n已更新 ${INDEX_PATH}（${allFiles.length} 个文件）`)
}

run().catch(e => {
  console.error('致命错误:', e)
  process.exit(1)
})
