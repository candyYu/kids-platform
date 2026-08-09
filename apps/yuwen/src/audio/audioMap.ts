// 拼音 → 音频文件 映射表
// 打开 /match-slices.html 匹配拼音，然后把结果复制到这里

export interface AudioSlice {
  pinyin: string
  file: string
  note: string
}

// L01: a o e
// 全部 12 个拼音已匹配完成 ✅
export const L01_AUDIO: AudioSlice[] = [
  // a 的四个声调
  { pinyin: 'ā', file: '/audio/slices/l01/slice_12.mp3', note: 'a 第一声' },
  { pinyin: 'á', file: '/audio/slices/l01/slice_14.mp3', note: 'a 第二声' },
  { pinyin: 'ǎ', file: '/audio/slices/l01/slice_16.mp3', note: 'a 第三声' },
  { pinyin: 'à', file: '/audio/slices/l01/slice_18.mp3', note: 'a 第四声' },
  
  // o 的四个声调（单读"哦"）
  { pinyin: 'ō', file: '/audio/slices/l01/slice_19.mp3', note: 'o 第一声 - 哦' },
  { pinyin: 'ó', file: '/audio/slices/l01/slice_21.mp3', note: 'o 第二声' },
  { pinyin: 'ǒ', file: '/audio/slices/l01/slice_23.mp3', note: 'o 第三声' },
  { pinyin: 'ò', file: '/audio/slices/l01/slice_25.mp3', note: 'o 第四声' },
  
  // e 的四个声调（用 zh-synth/，Edge TTS 准确声调）
  { pinyin: 'ē', file: '/audio/slices/l01/slice_27.mp3', note: 'e 第一声' },
  { pinyin: 'é', file: '/audio/slices/l01/slice_29.mp3', note: 'e 第二声' },
  { pinyin: 'ě', file: '/audio/slices/l01/slice_31.mp3', note: 'e 第三声' },
  { pinyin: 'è', file: '/audio/slices/l01/slice_33.mp3', note: 'e 第四声' },
]

// L02: i u ü y w
// 全部 17 个拼音已匹配完成 ✅
export const L02_AUDIO: AudioSlice[] = [
  // i 的四个声调
  { pinyin: 'ī', file: '/audio/slices/l02/slice_05.mp3', note: 'i 第一声' },
  { pinyin: 'í', file: '/audio/slices/l02/slice_14.mp3', note: 'i 第二声' },
  { pinyin: 'ǐ', file: '/audio/slices/l02/slice_16.mp3', note: 'i 第三声' },
  { pinyin: 'ì', file: '/audio/slices/l02/slice_18.mp3', note: 'i 第四声' },
  
  // u 的四个声调
  { pinyin: 'ū', file: '/audio/slices/l02/slice_20.mp3', note: 'u 第一声' },
  { pinyin: 'ú', file: '/audio/slices/l02/slice_22.mp3', note: 'u 第二声' },
  { pinyin: 'ǔ', file: '/audio/slices/l02/slice_24.mp3', note: 'u 第三声' },
  { pinyin: 'ù', file: '/audio/slices/l02/slice_26.mp3', note: 'u 第四声' },
  
  // ü 的四个声调
  { pinyin: 'ǖ', file: '/audio/slices/l02/slice_28.mp3', note: 'ü 第一声' },
  { pinyin: 'ǘ', file: '/audio/slices/l02/slice_30.mp3', note: 'ü 第二声' },
  { pinyin: 'ǚ', file: '/audio/slices/l02/slice_32.mp3', note: 'ü 第三声' },
  { pinyin: 'ǜ', file: '/audio/slices/l02/slice_34.mp3', note: 'ü 第四声' },
  
  // 声母 y, w
  { pinyin: 'y', file: '/audio/slices/l02/slice_37.mp3', note: '声母 y' },
  { pinyin: 'w', file: '/audio/slices/l02/slice_39.mp3', note: '声母 w' },
  
  // 整体认读音节
  { pinyin: 'yi', file: '/audio/slices/l02/slice_38.mp3', note: '整体认读 yi' },
  { pinyin: 'wu', file: '/audio/slices/l02/slice_40.mp3', note: '整体认读 wu' },
  { pinyin: 'yu', file: '/audio/slices/l02/slice_41.mp3', note: '整体认读 yu' },
]

// L03: b p m f
// 全部 4 个拼音已匹配完成 ✅
export const L03_AUDIO: AudioSlice[] = [
  { pinyin: 'b', file: '/audio/slices/l03/slice_05.mp3', note: '声母 b' },
  { pinyin: 'p', file: '/audio/slices/l03/slice_13.mp3', note: '声母 p' },
  { pinyin: 'm', file: '/audio/slices/l03/slice_15.mp3', note: '声母 m' },
  { pinyin: 'f', file: '/audio/slices/l03/slice_17.mp3', note: '声母 f' },
]

// L04: d t n l
// 全部 4 个拼音已匹配完成 ✅
export const L04_AUDIO: AudioSlice[] = [
  { pinyin: 'd', file: '/audio/slices/l04/slice_05.mp3', note: '声母 d' },
  { pinyin: 't', file: '/audio/slices/l04/slice_06.mp3', note: '声母 t' },
  { pinyin: 'n', file: '/audio/slices/l04/slice_08.mp3', note: '声母 n' },
  { pinyin: 'l', file: '/audio/slices/l04/slice_18.mp3', note: '声母 l' },  // ⚠️ 修正：原 slice_10
]

// L05: g k h
// 全部 3 个拼音已匹配完成 ✅
export const L05_AUDIO: AudioSlice[] = [
  { pinyin: 'g', file: '/audio/slices/l05/slice_11.mp3', note: '声母 g' },  // ⚠️ 修正：原 slice_04
  { pinyin: 'k', file: '/audio/slices/l05/slice_12.mp3', note: '声母 k' },  // ⚠️ 修正：原 slice_06
  { pinyin: 'h', file: '/audio/slices/l05/slice_13.mp3', note: '声母 h' },  // ⚠️ 修正：原 slice_08
]

// L06: j q x
// 全部 3 个拼音已匹配完成 ✅
export const L06_AUDIO: AudioSlice[] = [
  { pinyin: 'j', file: '/audio/slices/l06/slice_05.mp3', note: '声母 j' },
  { pinyin: 'q', file: '/audio/slices/l06/slice_06.mp3', note: '声母 q' },
  { pinyin: 'x', file: '/audio/slices/l06/slice_07.mp3', note: '声母 x' },
]

// L07: z c s
// 全部 6 个拼音已匹配完成 ✅
export const L07_AUDIO: AudioSlice[] = [
  { pinyin: 'z', file: '/audio/slices/l07/slice_05.mp3', note: '声母 z' },
  { pinyin: 'c', file: '/audio/slices/l07/slice_06.mp3', note: '声母 c' },
  { pinyin: 's', file: '/audio/slices/l07/slice_07.mp3', note: '声母 s' },
  { pinyin: 'zi', file: '/audio/slices/l07/slice_18.mp3', note: '整体认读 zi' },
  { pinyin: 'ci', file: '/audio/slices/l07/slice_19.mp3', note: '整体认读 ci' },
  { pinyin: 'si', file: '/audio/slices/l07/slice_21.mp3', note: '整体认读 si' },
]

// L08: zh ch sh r
// 全部 8 个拼音已匹配完成 ✅
export const L08_AUDIO: AudioSlice[] = [
  { pinyin: 'zh', file: '/audio/slices/l08/slice_05.mp3', note: '声母 zh' },
  { pinyin: 'ch', file: '/audio/slices/l08/slice_06.mp3', note: '声母 ch' },
  { pinyin: 'sh', file: '/audio/slices/l08/slice_07.mp3', note: '声母 sh' },
  { pinyin: 'r', file: '/audio/slices/l08/slice_20.mp3', note: '声母 r' },
  { pinyin: 'zhi', file: '/audio/slices/l08/slice_21.mp3', note: '整体认读 zhi' },
  { pinyin: 'chi', file: '/audio/slices/l08/slice_22.mp3', note: '整体认读 chi' },
  { pinyin: 'shi', file: '/audio/slices/l08/slice_24.mp3', note: '整体认读 shi' },
  { pinyin: 'ri', file: '/audio/slices/l08/slice_26.mp3', note: '整体认读 ri' },
]
// L09: ai ei ui
// 全部 3 个拼音已匹配完成 ✅
export const L09_AUDIO: AudioSlice[] = [
  { pinyin: 'ai', file: '/audio/slices/l09/slice_05.mp3', note: '复韵母 ai' },
  { pinyin: 'ei', file: '/audio/slices/l09/slice_06.mp3', note: '复韵母 ei' },
  { pinyin: 'ui', file: '/audio/slices/l09/slice_07.mp3', note: '复韵母 ui' },
]

// L10: ao ou iu
// 全部 3 个拼音已匹配完成 ✅
export const L10_AUDIO: AudioSlice[] = [
  { pinyin: 'ao', file: '/audio/slices/l10/slice_05.mp3', note: '复韵母 ao' },  // ⚠️ 修正：原 slice_06
  { pinyin: 'ou', file: '/audio/slices/l10/slice_06.mp3', note: '复韵母 ou' },  // ⚠️ 修正：原 slice_07
  { pinyin: 'iu', file: '/audio/slices/l10/slice_07.mp3', note: '复韵母 iu' },  // ⚠️ 修正：原 slice_08
]

// L11: ie üe er
// 全部 3 个拼音已匹配完成 ✅
export const L11_AUDIO: AudioSlice[] = [
  { pinyin: 'ie', file: '/audio/slices/l11/slice_05.mp3', note: '复韵母 ie' },    // ⚠️ 修正：原 slice_04
  { pinyin: 'üe', file: '/audio/slices/l11/slice_06.mp3', note: '复韵母 üe' },  // ⚠️ 修正：原 slice_05
  { pinyin: 'er', file: '/audio/slices/l11/slice_07.mp3', note: '特殊韵母 er' }, // ⚠️ 修正：原 slice_06
]

// L12: an en in un ün
// 全部 5 个拼音已匹配完成 ✅
export const L12_AUDIO: AudioSlice[] = [
  { pinyin: 'an', file: '/audio/slices/l12/slice_05.mp3', note: '前鼻韵母 an' },  // ⚠️ 修正：原 slice_03
  { pinyin: 'en', file: '/audio/slices/l12/slice_06.mp3', note: '前鼻韵母 en' },  // ⚠️ 修正：原 slice_04
  { pinyin: 'in', file: '/audio/slices/l12/slice_07.mp3', note: '前鼻韵母 in' },  // ⚠️ 修正：原 slice_05
  { pinyin: 'un', file: '/audio/slices/l12/slice_08.mp3', note: '前鼻韵母 un' },  // ⚠️ 修正：原 slice_06
  { pinyin: 'ün', file: '/audio/slices/l12/slice_09.mp3', note: '前鼻韵母 ün' }, // ⚠️ 修正：原 slice_07
]

// L13: ang eng ing ong
// 全部 4 个拼音已匹配完成 ✅
export const L13_AUDIO: AudioSlice[] = [
  { pinyin: 'ang', file: '/audio/slices/l13/slice_05.mp3', note: '后鼻韵母 ang' },  // ⚠️ 修正：原 slice_04
  { pinyin: 'eng', file: '/audio/slices/l13/slice_06.mp3', note: '后鼻韵母 eng' },  // ⚠️ 修正：原 slice_05
  { pinyin: 'ing', file: '/audio/slices/l13/slice_07.mp3', note: '后鼻韵母 ing' },  // ⚠️ 修正：原 slice_06
  { pinyin: 'ong', file: '/audio/slices/l13/slice_08.mp3', note: '后鼻韵母 ong' },  // ⚠️ 修正：原 slice_07
]

// 快速查找映射
const audioIndex = new Map<string, AudioSlice>()

// 构建索引（全部课程已验证完成 ✅）
for (const slice of [...L01_AUDIO, ...L02_AUDIO, ...L03_AUDIO, ...L04_AUDIO, ...L05_AUDIO, ...L06_AUDIO, ...L07_AUDIO, ...L08_AUDIO, ...L09_AUDIO, ...L10_AUDIO, ...L11_AUDIO, ...L12_AUDIO, ...L13_AUDIO]) {
  // 支持带声调和不带声调的查找
  const key = slice.pinyin.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/g, (m) => {
    const map: Record<string, string> = {
      'ā':'a','á':'a','ǎ':'a','à':'a',
      'ō':'o','ó':'o','ǒ':'o','ò':'o',
      'ē':'e','é':'e','ě':'e','è':'e',
      'ī':'i','í':'i','ǐ':'i','ì':'i',
      'ū':'u','ú':'u','ǔ':'u','ù':'u',
      'ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü',
    }
    return map[m] || m
  })
  audioIndex.set(key, slice)
  // 带声调的也建索引
  audioIndex.set(slice.pinyin, slice)
}

// ============== 自动扫描 zh-synth/ 目录，构建合成音节索引 ==============
// 用 macOS `say` 命令生成的 mp3（Meijia 中文 voice）
// 覆盖 23 声母 × 24 韵母 × 4 声调 + 1 轻声 + 整体认读
// 听写题命中后直接播 mp3，不依赖 Web Speech
const ZH_SYNTH_DIR = '/audio/slices/zh-synth/'

// 启动时扫描 public/audio/slices/zh-synth/ 目录（HTTP 拉取）
async function loadSynthIndex(): Promise<void> {
  // 改用 fetcher：列出文件名（用 Vite import.meta.glob 不行，因为路径不能含中文）
  // 干脆：硬编码扫描所有拼音文件名（启动时一次性读）
  try {
    const res = await fetch('/audio/synth-index.json')
    if (res.ok) {
      const list: string[] = await res.json()
      let count = 0
      for (const filename of list) {
        const m = filename.match(/^(.+)\.mp3$/)
        if (m) {
          const pinyin = decodeURIComponent(m[1])
          if (!audioIndex.has(pinyin) && !audioIndex.has(pinyin.normalize('NFD'))) {
            audioIndex.set(pinyin, {
              pinyin,
              file: `/audio/slices/zh-synth/${filename}`,
              note: 'synth (say Meijia)'
            })
            count++
          }
        }
      }
      console.log('[TTS] zh-synth 索引已加载，新增', count, '个，audioIndex 总数:', audioIndex.size)
    } else {
      console.warn('[TTS] /audio/synth-index.json 拉取失败:', res.status)
    }
  } catch (e) {
    console.warn('[TTS] 加载合成索引失败:', e)
  }
}

// 模块加载时同步构建（synth 是异步，但 audioIndex 会被补全）
loadSynthIndex().catch(e => console.warn('[TTS] 加载合成索引失败:', e))

// 根据拼音找音频切片
export function findAudioSlice(pinyin: string): AudioSlice | undefined {
  // 先精确查找
  let found = audioIndex.get(pinyin)
  if (found) return found

  // 去掉声调后查找
  const noTone = pinyin.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]/g, (m) => {
    const map: Record<string, string> = {
      'ā':'a','á':'a','ǎ':'a','à':'a',
      'ō':'o','ó':'o','ǒ':'o','ò':'o',
      'ē':'e','é':'e','ě':'e','è':'e',
      'ī':'i','í':'i','ǐ':'i','ì':'i',
      'ū':'u','ú':'u','ǔ':'u','ù':'u',
      'ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü',
    }
    return map[m] || m
  })
  found = audioIndex.get(noTone)
  if (found) return found

  console.warn('[Audio] 未找到音频切片：', pinyin)
  return undefined
}
