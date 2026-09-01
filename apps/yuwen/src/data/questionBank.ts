// 13 课题库（基于 PDF 44 页识别结果 + L09-L13 按人教版大纲自出）
// 题型定义见 questions.ts，13 种核心题型全覆盖

import type { Question } from './questions'

// ==================== L01 单韵母 a o e ====================
// PDF: p01-p03 + p07-p08 综合
export const L01_QUESTIONS: Question[] = [
  // ---- 描红 ----
  {
    id: 'L01-q01', lessonId: 'L01', type: 'trace',
    prompt: '读一读，写一写', promptPinyin: 'dú yī dú, xiě yī xiě',
    target: 'a', rows: 3, colsPerRow: 7,
  },
  {
    id: 'L01-q02', lessonId: 'L01', type: 'trace',
    prompt: '描一描，写一写', promptPinyin: 'miáo yī miáo, xiě yī xiě',
    target: 'o', rows: 3, colsPerRow: 7,
  },
  {
    id: 'L01-q03', lessonId: 'L01', type: 'trace',
    prompt: '描一描，写一写', promptPinyin: 'miáo yī miáo, xiě yī xiě',
    target: 'e', rows: 3, colsPerRow: 7,
  },
  // ---- 听一听，读出单韵母的四个声调（一年级声调教学重点） ----
  // 不再用"小汽车"拟人化，改为"老师"或"跟我读"专业表述
  {
    id: 'L01-q04', lessonId: 'L01', type: 'imageToSyllable',
    prompt: '听一听，读出 a 的四个声调',
    promptPinyin: 'tīng yī tīng, dú chū a de sì gè shēng diào',
    imageEmoji: '🔔', imageDesc: 'a 的四个声调',
    answer: 'ā á ǎ à',
  },
  {
    id: 'L01-q05', lessonId: 'L01', type: 'imageToSyllable',
    prompt: '听一听，读出 o 的四个声调',
    promptPinyin: 'tīng yī tīng, dú chū o de sì gè shēng diào',
    imageEmoji: '🔔', imageDesc: 'o 的四个声调',
    answer: 'ō ó ǒ ò',
  },
  {
    id: 'L01-q06', lessonId: 'L01', type: 'imageToSyllable',
    prompt: '听一听，读出 e 的四个声调',
    promptPinyin: 'tīng yī tīng, dú chū e de sì gè shēng diào',
    imageEmoji: '🔔', imageDesc: 'e 的四个声调',
    answer: 'ē é ě è',
  },
  // 单韵母 a 的四声（4 道单音节题，孩子听完音按对应声调键）
  // imageDesc 改成"听音"——避免 Web Speech 念出"a 的一声"等不自然词组
  { id: 'L01-q07a', lessonId: 'L01', type: 'imageToSyllable', prompt: '听一听，按出 a 的一声', imageEmoji: '🎵', imageDesc: '听音', answer: 'ā' },
  { id: 'L01-q07b', lessonId: 'L01', type: 'imageToSyllable', prompt: '听一听，按出 a 的二声', imageEmoji: '🎶', imageDesc: '听音', answer: 'á' },
  { id: 'L01-q07c', lessonId: 'L01', type: 'imageToSyllable', prompt: '听一听，按出 a 的三声', imageEmoji: '🎵', imageDesc: '听音', answer: 'ǎ' },
  { id: 'L01-q07d', lessonId: 'L01', type: 'imageToSyllable', prompt: '听一听，按出 a 的四声', imageEmoji: '🎶', imageDesc: '听音', answer: 'à' },
  // ---- 圈选正确顺序 ----
  {
    id: 'L01-q07', lessonId: 'L01', type: 'sequencePick',
    prompt: '沿正确声调顺序的小动物能吃到食物，圈出来',
    promptPinyin: 'yán zhèng què shēng diào shùn xù de xiǎo dòng wù néng chī dào shí wù',
    options: [
      { emoji: '🐵', sequence: ['ā', 'á', 'à', 'á'], correct: false },
      { emoji: '🐱', sequence: ['ā', 'á', 'ǎ', 'à'], correct: true },
      { emoji: '🦒', sequence: ['á', 'ā', 'ǎ', 'à'], correct: false },
    ],
  },
  {
    id: 'L01-q08', lessonId: 'L01', type: 'sequencePick',
    prompt: '沿 o 的正确四声顺序走的小动物是？',
    promptPinyin: 'yán o de zhèng què sì shēng shùn xù zǒu de xiǎo dòng wù',
    options: [
      { emoji: '🐰', sequence: ['ó', 'ō', 'ǒ', 'ò'], correct: false },
      { emoji: '🐶', sequence: ['ō', 'ó', 'ǒ', 'ò'], correct: true },
      { emoji: '🐭', sequence: ['ō', 'ò', 'ǒ', 'ó'], correct: false },
    ],
  },
  // ---- 标声调 ----
  {
    id: 'L01-q09', lessonId: 'L01', type: 'markTone',
    prompt: '给 a 标上二声', promptPinyin: 'gěi a biāo shàng èr shēng',
    base: 'a', options: [1, 2, 3, 4], answer: 2,
  },
  {
    id: 'L01-q10', lessonId: 'L01', type: 'markTone',
    prompt: '给 e 标上四声', promptPinyin: 'gěi e biāo shàng sì shēng',
    base: 'e', options: [1, 2, 3, 4], answer: 4,
  },
  // ---- 看字选拼音 ----
  {
    id: 'L01-q11', lessonId: 'L01', type: 'pickByChar',
    prompt: '"啊"的正确拼音是？', promptPinyin: '"a" de zhèng què pīn yīn',
    char: '啊', options: ['ā', 'á', 'ǎ', 'à'], answer: 'ā',
  },
  {
    id: 'L01-q12', lessonId: 'L01', type: 'pickByChar',
    prompt: '"鹅"的正确拼音是？', promptPinyin: '"é" de zhèng què pīn yīn',
    char: '鹅', options: ['ē', 'é', 'ě', 'è'], answer: 'é',
  },
  // ---- 判断对错 ----
  {
    id: 'L01-q13', lessonId: 'L01', type: 'judge',
    prompt: '判断拼音是否正确：mā（妈）', promptPinyin: 'pàn duàn pīn yīn shì fǒu zhèng què',
    item: 'mā (妈)', answer: true,
  },
  {
    id: 'L01-q14', lessonId: 'L01', type: 'judge',
    prompt: '判断拼音是否正确：bō（波）', promptPinyin: 'pàn duàn pīn yīn shì fǒu zhèng què',
    item: 'bō (波)', answer: true,
  },
  {
    id: 'L01-q15', lessonId: 'L01', type: 'judge',
    prompt: '判断拼音是否正确：má（妈，应为 mā）',
    item: 'má (妈)', answer: false,
  },
  // ---- 按声调分类 ----
  {
    id: 'L01-q16', lessonId: 'L01', type: 'classifyTone',
    prompt: '把下面的拼音按声调分一分',
    syllables: ['mā', 'má', 'mǎ', 'bā', 'bó'],
    answer: [
      { tone: 1, items: ['mā', 'bā'] },
      { tone: 2, items: ['má', 'bó'] },
      { tone: 3, items: ['mǎ'] },
      { tone: 4, items: [] },
    ],
  },
]

// ==================== L02 i u ü y w + 整体认读 yi wu yu ====================
// PDF: p04-p08 单韵母部分, p40-p41 y w
export const L02_QUESTIONS: Question[] = [
  // 描红
  { id: 'L02-q01', lessonId: 'L02', type: 'trace', prompt: '描一描，写一写', target: 'i', rows: 3, colsPerRow: 7 },
  { id: 'L02-q02', lessonId: 'L02', type: 'trace', prompt: '描一描，写一写', target: 'u', rows: 3, colsPerRow: 7 },
  { id: 'L02-q03', lessonId: 'L02', type: 'trace', prompt: '描一描，写一写', target: 'ü', rows: 3, colsPerRow: 7 },
  // 看图写拼音
  { id: 'L02-q06', lessonId: 'L02', type: 'imageToSyllable', prompt: '看图拼一拼：衣服（yī）', imageEmoji: '👕', imageDesc: '衣服', answer: 'yī' },
  { id: 'L02-q07', lessonId: 'L02', type: 'imageToSyllable', prompt: '看图拼一拼：鱼（yú）', imageEmoji: '🐟', imageDesc: '鱼', answer: 'yú' },
  // i u ü 的单声调听写
  { id: 'L02-q08a', lessonId: 'L02', type: 'imageToSyllable', prompt: '听一听，按出 i 的二声', imageEmoji: '🎵', imageDesc: 'i 的二声', answer: 'í' },
  { id: 'L02-q08b', lessonId: 'L02', type: 'imageToSyllable', prompt: '听一听，按出 u 的二声', imageEmoji: '🎶', imageDesc: 'u 的二声', answer: 'ú' },
  { id: 'L02-q08c', lessonId: 'L02', type: 'imageToSyllable', prompt: '听一听，按出 ü 的四声', imageEmoji: '🎵', imageDesc: 'ü 的四声', answer: 'ǜ' },
  // 拼一拼写一写（中心 i 拼 a o e）
  { id: 'L02-q09', lessonId: 'L02', type: 'syllableCompose', prompt: '把 i 和 a 拼起来', initial: 'i', finals: ['a'], answer: 'iā' },
  { id: 'L02-q10', lessonId: 'L02', type: 'syllableCompose', prompt: '把 i 和 u 拼起来', initial: 'i', finals: ['u'], answer: 'iū' },
  // 整体认读
  { id: 'L02-q11', lessonId: 'L02', type: 'pickByChar', prompt: '"一"的正确拼音是？', char: '一', options: ['yī', 'wū', 'yú', 'wǒ'], answer: 'yī' },
  { id: 'L02-q12', lessonId: 'L02', type: 'pickByChar', prompt: '"五"的正确拼音是？', char: '五', options: ['yī', 'wǔ', 'yǔ', 'wū'], answer: 'wǔ' },
  { id: 'L02-q13', lessonId: 'L02', type: 'pickByChar', prompt: '"鱼"的正确拼音是？', char: '鱼', options: ['yī', 'wū', 'yú', 'yǔ'], answer: 'yú' },
  // 标调
  { id: 'L02-q14', lessonId: 'L02', type: 'markTone', prompt: '给 ü 标上三声', base: 'ü', options: [1, 2, 3, 4], answer: 3 },
  // 判断对错（ü 标调时去两点）
  { id: 'L02-q15', lessonId: 'L02', type: 'judge', prompt: '判断：ǖ 的标调对吗？', item: 'ǖ (鱼，应为 yú)', answer: false },
  { id: 'L02-q16', lessonId: 'L02', type: 'judge', prompt: '判断拼音：yǔ（雨）', item: 'yǔ (雨)', answer: true },
  // 圈选（u ü 区分）
  { id: 'L02-q17', lessonId: 'L02', type: 'circle', prompt: '圈出带 ü 的音节', items: ['lù', 'lǜ', 'nǔ', 'jǜ'], rule: '含 ü', answerIndices: [1, 3] },
  // 按声调分类
  { id: 'L02-q18', lessonId: 'L02', type: 'classifyTone', prompt: '把整体认读音节按声调分类', syllables: ['yī', 'yí', 'yǐ', 'wū', 'wǔ'], answer: [
    { tone: 1, items: ['yī', 'wū'] },
    { tone: 2, items: ['yí'] },
    { tone: 3, items: ['yǐ'] },
    { tone: 4, items: ['wǔ'] },
  ] },
]

// ==================== L08Y y w（2024 新版第9课，从 L02 拆出） ====================
export const L08Y_QUESTIONS: Question[] = [
  { id: 'L08Y-q01', lessonId: 'L08Y', type: 'trace', prompt: '描一描，写一写', target: 'y', rows: 3, colsPerRow: 7 },
  { id: 'L08Y-q02', lessonId: 'L08Y', type: 'trace', prompt: '描一描，写一写', target: 'w', rows: 3, colsPerRow: 7 },
  { id: 'L08Y-q03', lessonId: 'L08Y', type: 'imageToSyllable', prompt: '看图拼一拼：乌云（wū yún）', imageEmoji: '☁️', imageDesc: '乌云', answer: 'wū yún' },
  { id: 'L08Y-q04', lessonId: 'L08Y', type: 'imageToSyllable', prompt: '看图拼一拼：鸭子（yā zi）', imageEmoji: '🦆', imageDesc: '鸭子', answer: 'yā zi' },
  { id: 'L08Y-q05', lessonId: 'L08Y', type: 'pickByChar', prompt: '"鱼"的正确拼音是？', char: '鱼', options: ['yí', 'yǔ', 'yù', 'wǔ'], answer: 'yǔ' },
  { id: 'L08Y-q06', lessonId: 'L08Y', type: 'pickByChar', prompt: '"五"的正确拼音是？', char: '五', options: ['wū', 'wǔ', 'yǔ', 'wù'], answer: 'wǔ' },
]

// ==================== L03 声母 b p m f ====================
// PDF: p09-p14
export const L03_QUESTIONS: Question[] = [
  { id: 'L03-q01', lessonId: 'L03', type: 'trace', prompt: '描一描，写一写', target: 'b', rows: 3, colsPerRow: 7 },
  { id: 'L03-q02', lessonId: 'L03', type: 'trace', prompt: '描一描，写一写', target: 'p', rows: 3, colsPerRow: 7 },
  { id: 'L03-q03', lessonId: 'L03', type: 'trace', prompt: '描一描，写一写', target: 'm', rows: 3, colsPerRow: 7 },
  { id: 'L03-q04', lessonId: 'L03', type: 'trace', prompt: '描一描，写一写', target: 'f', rows: 3, colsPerRow: 7 },
  // 看图写拼音（典型：b 爸爸 p 爬山 m 妈妈 f 发）
  { id: 'L03-q05', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：爸爸（bà ba）', imageEmoji: '👨', imageDesc: '爸爸', answer: 'bà ba' },
  { id: 'L03-q06', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：妈妈（mā ma）', imageEmoji: '👩', imageDesc: '妈妈', answer: 'mā ma' },
  { id: 'L03-q07', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：爬坡（pá pō）', imageEmoji: '⛰️', imageDesc: '爬坡', answer: 'pá pō' },
  { id: 'L03-q08', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：发字（fā）', imageEmoji: '✉️', imageDesc: '发', answer: 'fā' },
  // 拆多音节整词为单音节题（5 道单音节，孩子可单独练）
  { id: 'L03-q08a', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：八（bā）', imageEmoji: '8️⃣', imageDesc: '八', answer: 'bā' },
  { id: 'L03-q08b', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：兔（bù）', imageEmoji: '🐇', imageDesc: '兔', answer: 'bù' },
  { id: 'L03-q08c', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：马（mǎ）', imageEmoji: '🐴', imageDesc: '马', answer: 'mǎ' },
  { id: 'L03-q08d', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：山（shān）', imageEmoji: '⛰️', imageDesc: '山', answer: 'shān' },
  { id: 'L03-q08e', lessonId: 'L03', type: 'imageToSyllable', prompt: '看图拼一拼：花（huā）', imageEmoji: '🌸', imageDesc: '花', answer: 'huā' },
  // 拼一拼
  { id: 'L03-q09', lessonId: 'L03', type: 'syllableCompose', prompt: 'b + a = ?', initial: 'b', finals: ['a'], answer: 'ba' },
  { id: 'L03-q10', lessonId: 'L03', type: 'syllableCompose', prompt: 'p + o = ?', initial: 'p', finals: ['o'], answer: 'po' },
  { id: 'L03-q11', lessonId: 'L03', type: 'syllableCompose', prompt: 'm + a = ?', initial: 'm', finals: ['a'], answer: 'ma' },
  { id: 'L03-q12', lessonId: 'L03', type: 'syllableCompose', prompt: 'f + u = ?', initial: 'f', finals: ['u'], answer: 'fu' },
  // 看字选拼音
  { id: 'L03-q13', lessonId: 'L03', type: 'pickByChar', prompt: '"八"的正确拼音是？', char: '八', options: ['bā', 'pā', 'dā', 'fā'], answer: 'bā' },
  { id: 'L03-q14', lessonId: 'L03', type: 'pickByChar', prompt: '"泼水"的"泼"？', char: '泼', options: ['bō', 'pō', 'mō', 'fō'], answer: 'pō' },
  { id: 'L03-q15', lessonId: 'L03', type: 'pickByChar', prompt: '"马"的正确拼音是？', char: '马', options: ['nā', 'lā', 'mǎ', 'fǎ'], answer: 'mǎ' },
  { id: 'L03-q16', lessonId: 'L03', type: 'pickByChar', prompt: '"佛"的正确拼音是？', char: '佛', options: ['bó', 'pó', 'mó', 'fó'], answer: 'fó' },
  // 音节拆分
  { id: 'L03-q17', lessonId: 'L03', type: 'syllableSplit', prompt: '拆分 bà', syllable: 'bà', answer: { initial: 'b', final: 'a', tone: 4 } },
  { id: 'L03-q18', lessonId: 'L03', type: 'syllableSplit', prompt: '拆分 má', syllable: 'má', answer: { initial: 'm', final: 'a', tone: 2 } },
  // 判断对错（b d 区分常见错）
  { id: 'L03-q19', lessonId: 'L03', type: 'judge', prompt: '"八" 拼音是 dā 对吗？', item: 'dā (八)', answer: false },
  // 圈选（双拼 vs 三拼）
  { id: 'L03-q20', lessonId: 'L03', type: 'circle', prompt: '圈出三拼音节', items: ['bā', 'mā', 'bō', 'bǎo'], rule: '三拼', answerIndices: [3] },
]

// ==================== L04 声母 d t n l ====================
// PDF: p15-p20
export const L04_QUESTIONS: Question[] = [
  { id: 'L04-q01', lessonId: 'L04', type: 'trace', prompt: '描一描，写一写', target: 'd', rows: 3, colsPerRow: 7 },
  { id: 'L04-q02', lessonId: 'L04', type: 'trace', prompt: '描一描，写一写', target: 't', rows: 3, colsPerRow: 7 },
  { id: 'L04-q03', lessonId: 'L04', type: 'trace', prompt: '描一描，写一写', target: 'n', rows: 3, colsPerRow: 7 },
  { id: 'L04-q04', lessonId: 'L04', type: 'trace', prompt: '描一描，写一写', target: 'l', rows: 3, colsPerRow: 7 },
  // 看图写拼音
  { id: 'L04-q05', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：大马（dà mǎ）', imageEmoji: '🐎', imageDesc: '大马', answer: 'dà mǎ' },
  { id: 'L04-q06', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：泥土（ní tǔ）', imageEmoji: '🟫', imageDesc: '泥土', answer: 'ní tǔ' },
  { id: 'L04-q07', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：马路（mǎ lù）', imageEmoji: '🛣️', imageDesc: '马路', answer: 'mǎ lù' },
  { id: 'L04-q08', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：太阳（tài yáng）', imageEmoji: '☀️', imageDesc: '太阳', answer: 'tài yáng' },
  // 拆 4 道多音节整词为单音节
  { id: 'L04-q08a', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：弟（dì）', imageEmoji: '👦', imageDesc: '弟', answer: 'dì' },
  { id: 'L04-q08b', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：奶（nǎi）', imageEmoji: '🥛', imageDesc: '奶', answer: 'nǎi' },
  { id: 'L04-q08c', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：路（lù）', imageEmoji: '🛣️', imageDesc: '路', answer: 'lù' },
  { id: 'L04-q08d', lessonId: 'L04', type: 'imageToSyllable', prompt: '看图拼一拼：年（nián）', imageEmoji: '🗓️', imageDesc: '年', answer: 'nián' },
  // 拼一拼
  { id: 'L04-q09', lessonId: 'L04', type: 'syllableCompose', prompt: 'd + a = ?', initial: 'd', finals: ['a'], answer: 'da' },
  { id: 'L04-q10', lessonId: 'L04', type: 'syllableCompose', prompt: 't + i = ?', initial: 't', finals: ['i'], answer: 'ti' },
  { id: 'L04-q11', lessonId: 'L04', type: 'syllableCompose', prompt: 'n + u = ?', initial: 'n', finals: ['u'], answer: 'nu' },
  { id: 'L04-q12', lessonId: 'L04', type: 'syllableCompose', prompt: 'l + i = ?', initial: 'l', finals: ['i'], answer: 'li' },
  // 看字选拼音
  { id: 'L04-q13', lessonId: 'L04', type: 'pickByChar', prompt: '"大"的正确拼音是？', char: '大', options: ['tā', 'dā', 'nā', 'lā'], answer: 'dà' },
  { id: 'L04-q14', lessonId: 'L04', type: 'pickByChar', prompt: '"土"的正确拼音是？', char: '土', options: ['dǔ', 'tǔ', 'nǔ', 'lǔ'], answer: 'tǔ' },
  { id: 'L04-q15', lessonId: 'L04', type: 'pickByChar', prompt: '"路"的正确拼音是？', char: '路', options: ['nù', 'lù', 'dù', 'tù'], answer: 'lù' },
  // 音节拆分
  { id: 'L04-q16', lessonId: 'L04', type: 'syllableSplit', prompt: '拆分 dà', syllable: 'dà', answer: { initial: 'd', final: 'a', tone: 4 } },
  { id: 'L04-q17', lessonId: 'L04', type: 'syllableSplit', prompt: '拆分 lù', syllable: 'lù', answer: { initial: 'l', final: 'u', tone: 4 } },
  // 圈选（n l 区分）
  { id: 'L04-q18', lessonId: 'L04', type: 'circle', prompt: '圈出声母是 n 的音节', items: ['nà', 'là', 'ná', 'lá', 'nǔ'], rule: '声母 n', answerIndices: [0, 2, 4] },
  // 判断对错
  { id: 'L04-q19', lessonId: 'L04', type: 'judge', prompt: '"路" 拼音 lù 对吗？', item: 'lù (路)', answer: true },
  { id: 'L04-q20', lessonId: 'L04', type: 'judge', prompt: '"男" 拼音 lán 对吗？', item: 'lán (男，应为 nán)', answer: false },
]

// ==================== L05 声母 g k h ====================
// PDF: p21-p25
export const L05_QUESTIONS: Question[] = [
  { id: 'L05-q01', lessonId: 'L05', type: 'trace', prompt: '描一描，写一写', target: 'g', rows: 3, colsPerRow: 7 },
  { id: 'L05-q02', lessonId: 'L05', type: 'trace', prompt: '描一描，写一写', target: 'k', rows: 3, colsPerRow: 7 },
  { id: 'L05-q03', lessonId: 'L05', type: 'trace', prompt: '描一描，写一写', target: 'h', rows: 3, colsPerRow: 7 },
  { id: 'L05-q04', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：哥哥（gē ge）', imageEmoji: '🧑', imageDesc: '哥哥', answer: 'gē ge' },
  { id: 'L05-q05', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：画画（huà huà）', imageEmoji: '🎨', imageDesc: '画画', answer: 'huà huà' },
  { id: 'L05-q06', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：打鼓（dǎ gǔ）', imageEmoji: '🥁', imageDesc: '打鼓', answer: 'dǎ gǔ' },
  { id: 'L05-q07', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：荷花（hé huā）', imageEmoji: '🪷', imageDesc: '荷花', answer: 'hé huā' },
  // 单音节补充
  { id: 'L05-q07a', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：瓜（guā）', imageEmoji: '🍈', imageDesc: '瓜', answer: 'guā' },
  { id: 'L05-q07b', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：壳（ké）', imageEmoji: '🥚', imageDesc: '壳', answer: 'ké' },
  { id: 'L05-q07c', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：火（huǒ）', imageEmoji: '🔥', imageDesc: '火', answer: 'huǒ' },
  { id: 'L05-q07d', lessonId: 'L05', type: 'imageToSyllable', prompt: '看图拼一拼：口（kǒu）', imageEmoji: '👄', imageDesc: '口', answer: 'kǒu' },
  { id: 'L05-q08', lessonId: 'L05', type: 'syllableCompose', prompt: 'g + u + o = ?', initial: 'g', finals: ['uo'], answer: 'guo' },
  { id: 'L05-q09', lessonId: 'L05', type: 'syllableCompose', prompt: 'k + ǔ = ?', initial: 'k', finals: ['u'], answer: 'ku' },
  { id: 'L05-q10', lessonId: 'L05', type: 'syllableCompose', prompt: 'h + u + a = ?', initial: 'h', finals: ['ua'], answer: 'hua' },
  { id: 'L05-q11', lessonId: 'L05', type: 'pickByChar', prompt: '"哥"的正确拼音是？', char: '哥', options: ['kē', 'gē', 'hē', 'dē'], answer: 'gē' },
  { id: 'L05-q12', lessonId: 'L05', type: 'pickByChar', prompt: '"花"的正确拼音是？', char: '花', options: ['fā', 'huā', 'guā', 'kuā'], answer: 'huā' },
  { id: 'L05-q13', lessonId: 'L05', type: 'pickByChar', prompt: '"口"的正确拼音是？', char: '口', options: ['gǒu', 'kǒu', 'hǒu', 'dǒu'], answer: 'kǒu' },
  { id: 'L05-q14', lessonId: 'L05', type: 'syllableSplit', prompt: '拆分 guā', syllable: 'guā', answer: { initial: 'g', final: 'ua', tone: 1 } },
  { id: 'L05-q15', lessonId: 'L05', type: 'syllableSplit', prompt: '拆分 huǒ', syllable: 'huǒ', answer: { initial: 'h', final: 'uo', tone: 3 } },
  { id: 'L05-q16', lessonId: 'L05', type: 'circle', prompt: '圈出声母是 g 的音节', items: ['gē', 'kē', 'hē', 'guā'], rule: '声母 g', answerIndices: [0, 3] },
  { id: 'L05-q17', lessonId: 'L05', type: 'judge', prompt: '"河" 拼音 hé 对吗？', item: 'hé (河)', answer: true },
  { id: 'L05-q18', lessonId: 'L05', type: 'classifyTone', prompt: '按声调分类', syllables: ['gē', 'guā', 'huǒ', 'kā', 'kè'], answer: [
    { tone: 1, items: ['gē', 'guā', 'kā'] },
    { tone: 2, items: [] },
    { tone: 3, items: ['huǒ'] },
    { tone: 4, items: ['kè'] },
  ] },
]

// ==================== L06 声母 j q x + ü 省略规则 ====================
// PDF: p26-p30
export const L06_QUESTIONS: Question[] = [
  { id: 'L06-q01', lessonId: 'L06', type: 'trace', prompt: '描一描，写一写', target: 'j', rows: 3, colsPerRow: 7 },
  { id: 'L06-q02', lessonId: 'L06', type: 'trace', prompt: '描一描，写一写', target: 'q', rows: 3, colsPerRow: 7 },
  { id: 'L06-q03', lessonId: 'L06', type: 'trace', prompt: '描一描，写一写', target: 'x', rows: 3, colsPerRow: 7 },
  { id: 'L06-q04', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：公鸡（gōng jī）', imageEmoji: '🐓', imageDesc: '公鸡', answer: 'jī' },
  { id: 'L06-q05', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：气球（qì qiú）', imageEmoji: '🎈', imageDesc: '气球', answer: 'qiú' },
  { id: 'L06-q06', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：西瓜（xī guā）', imageEmoji: '🍉', imageDesc: '西瓜', answer: 'xī guā' },
  { id: 'L06-q07', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：下棋（xià qí）', imageEmoji: '♟️', imageDesc: '下棋', answer: 'xià qí' },
  // 单音节补充
  { id: 'L06-q07a', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：家（jiā）', imageEmoji: '🏠', imageDesc: '家', answer: 'jiā' },
  { id: 'L06-q07b', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：去（qù）', imageEmoji: '👣', imageDesc: '去', answer: 'qù' },
  { id: 'L06-q07c', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：小（xiǎo）', imageEmoji: '🐭', imageDesc: '小', answer: 'xiǎo' },
  { id: 'L06-q07d', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：下（xià）', imageEmoji: '⬇️', imageDesc: '下', answer: 'xià' },
  // 重点：j q x + ü 省略规则
  { id: 'L06-q08', lessonId: 'L06', type: 'judge', prompt: '判断：ju 标两点（应为 jū）', item: 'jǖ', answer: false },
  { id: 'L06-q09', lessonId: 'L06', type: 'judge', prompt: '判断：qu 正确写法？', item: 'qū', answer: true },
  { id: 'L06-q10', lessonId: 'L06', type: 'judge', prompt: '判断：xu 正确写法？', item: 'xū', answer: true },
  { id: 'L06-q11', lessonId: 'L06', type: 'pickBySyllable', prompt: '"鸡" 的正确拼音？', syllable: 'jī', options: [
    { char: '鸡', imageEmoji: '🐔' },
    { char: '七', imageEmoji: '7️⃣' },
    { char: '西', imageEmoji: '🌅' },
    { char: '飞', imageEmoji: '🦋' },
  ], answer: '鸡' },
  { id: 'L06-q12', lessonId: 'L06', type: 'pickBySyllable', prompt: '"下" 的正确拼音？', syllable: 'xià', options: [
    { char: '夏', imageEmoji: '🌞' },
    { char: '下', imageEmoji: '⬇️' },
    { char: '大', imageEmoji: '🐘' },
    { char: '打', imageEmoji: '🥊' },
  ], answer: '下' },
  // 圈选：ü 出现的位置
  { id: 'L06-q13', lessonId: 'L06', type: 'circle', prompt: '圈出 j q x 拼 ü 时省两点的音节', items: ['jū', 'jǖ', 'qū', 'qǖ', 'xū', 'xǖ'], rule: '省两点', answerIndices: [0, 2, 4] },
  // 拼一拼
  { id: 'L06-q14', lessonId: 'L06', type: 'syllableCompose', prompt: 'j + ü = ?', initial: 'j', finals: ['ü'], answer: 'ju' },
  { id: 'L06-q15', lessonId: 'L06', type: 'syllableCompose', prompt: 'x + i + a = ?', initial: 'x', finals: ['ia'], answer: 'xia' },
  // 音节拆分
  { id: 'L06-q16', lessonId: 'L06', type: 'syllableSplit', prompt: '拆分 jiā', syllable: 'jiā', answer: { initial: 'j', final: 'ia', tone: 1 } },
  { id: 'L06-q17', lessonId: 'L06', type: 'syllableSplit', prompt: '拆分 xū', syllable: 'xū', answer: { initial: 'x', final: 'ü', tone: 1 } },
]

// ==================== L07 平舌音 z c s + 整体认读 zi ci si ====================
// PDF: p31-p33, p38
export const L07_QUESTIONS: Question[] = [
  { id: 'L07-q01', lessonId: 'L07', type: 'trace', prompt: '描一描，写一写', target: 'z', rows: 3, colsPerRow: 7 },
  { id: 'L07-q02', lessonId: 'L07', type: 'trace', prompt: '描一描，写一写', target: 'c', rows: 3, colsPerRow: 7 },
  { id: 'L07-q03', lessonId: 'L07', type: 'trace', prompt: '描一描，写一写', target: 's', rows: 3, colsPerRow: 7 },
  { id: 'L07-q04', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：紫色（zǐ sè）', imageEmoji: '🟣', imageDesc: '紫色', answer: 'zǐ sè' },
  { id: 'L07-q05', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：擦（cā）', imageEmoji: '🧽', imageDesc: '擦', answer: 'cā' },
  { id: 'L07-q06', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：四个（sì gè）', imageEmoji: '4️⃣', imageDesc: '四个', answer: 'sì gè' },
  // 单音节补充
  { id: 'L07-q06a', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：字（zì）', imageEmoji: '✍️', imageDesc: '字', answer: 'zì' },
  { id: 'L07-q06b', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：刺（cì）', imageEmoji: '🌵', imageDesc: '刺', answer: 'cì' },
  { id: 'L07-q06c', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：四（sì）', imageEmoji: '4️⃣', imageDesc: '四', answer: 'sì' },
  { id: 'L07-q06d', lessonId: 'L07', type: 'imageToSyllable', prompt: '看图拼一拼：花（huā）', imageEmoji: '🌸', imageDesc: '花', answer: 'huā' },
  // 整体认读
  { id: 'L07-q07', lessonId: 'L07', type: 'pickByChar', prompt: '"字" 的正确拼音是？', char: '字', options: ['zì', 'zhì', 'jì', 'qì'], answer: 'zì' },
  { id: 'L07-q08', lessonId: 'L07', type: 'pickByChar', prompt: '"次" 的正确拼音是？', char: '次', options: ['cì', 'chì', 'qì', 'sì'], answer: 'cì' },
  { id: 'L07-q09', lessonId: 'L07', type: 'pickByChar', prompt: '"四" 的正确拼音是？', char: '四', options: ['xì', 'shì', 'sì', 'cì'], answer: 'sì' },
  // 平翘舌区分（高频易错点）
  { id: 'L07-q10', lessonId: 'L07', type: 'circle', prompt: '圈出平舌音', items: ['zì', 'zhì', 'cì', 'chì', 'sì', 'shì'], rule: '平舌', answerIndices: [0, 2, 4] },
  { id: 'L07-q11', lessonId: 'L07', type: 'judge', prompt: '"是" 拼音 shì 对吗？', item: 'shì (是)', answer: true },
  { id: 'L07-q12', lessonId: 'L07', type: 'judge', prompt: '"四" 拼音 sì 对吗？', item: 'sì (四)', answer: true },
  // 拼一拼
  { id: 'L07-q13', lessonId: 'L07', type: 'syllableCompose', prompt: 'z + a + 1 声 = ?', initial: 'z', finals: ['a'], answer: 'zā' },
  { id: 'L07-q14', lessonId: 'L07', type: 'syllableCompose', prompt: 'c + uo + 1 声 = ?', initial: 'c', finals: ['uo'], answer: 'cuō' },
  { id: 'L07-q15', lessonId: 'L07', type: 'syllableSplit', prompt: '拆分 zài', syllable: 'zài', answer: { initial: 'z', final: 'ai', tone: 4 } },
  { id: 'L07-q16', lessonId: 'L07', type: 'syllableSplit', prompt: '拆分 sān', syllable: 'sān', answer: { initial: 's', final: 'an', tone: 1 } },
]

// ==================== L08 翘舌音 zh ch sh r + 整体认读 ====================
// PDF: p34-p37, p38
export const L08_QUESTIONS: Question[] = [
  { id: 'L08-q01', lessonId: 'L08', type: 'trace', prompt: '描一描，写一写', target: 'zh', rows: 3, colsPerRow: 7 },
  { id: 'L08-q02', lessonId: 'L08', type: 'trace', prompt: '描一描，写一写', target: 'ch', rows: 3, colsPerRow: 7 },
  { id: 'L08-q03', lessonId: 'L08', type: 'trace', prompt: '描一描，写一写', target: 'sh', rows: 3, colsPerRow: 7 },
  { id: 'L08-q04', lessonId: 'L08', type: 'trace', prompt: '描一描，写一写', target: 'r', rows: 3, colsPerRow: 7 },
  { id: 'L08-q05', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：折纸（zhé zhǐ）', imageEmoji: '📜', imageDesc: '折纸', answer: 'zhé' },
  { id: 'L08-q06', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：吃饭（chī fàn）', imageEmoji: '🍚', imageDesc: '吃饭', answer: 'chī' },
  { id: 'L08-q07', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：狮子（shī zi）', imageEmoji: '🦁', imageDesc: '狮子', answer: 'shī' },
  // 单音节补充
  { id: 'L08-q07a', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：竹（zhú）', imageEmoji: '🎋', imageDesc: '竹', answer: 'zhú' },
  { id: 'L08-q07b', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：吃（chī）', imageEmoji: '🍴', imageDesc: '吃', answer: 'chī' },
  { id: 'L08-q07c', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：手（shǒu）', imageEmoji: '✋', imageDesc: '手', answer: 'shǒu' },
  { id: 'L08-q07d', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：日（rì）', imageEmoji: '☀️', imageDesc: '日', answer: 'rì' },
  { id: 'L08-q08', lessonId: 'L08', type: 'imageToSyllable', prompt: '看图拼一拼：日出（rì chū）', imageEmoji: '🌅', imageDesc: '日出', answer: 'rì' },
  // 整体认读
  { id: 'L08-q09', lessonId: 'L08', type: 'pickByChar', prompt: '"知" 的正确拼音是？', char: '知', options: ['zī', 'zhī', 'jī', 'qī'], answer: 'zhī' },
  { id: 'L08-q10', lessonId: 'L08', type: 'pickByChar', prompt: '"吃" 的正确拼音是？', char: '吃', options: ['cī', 'chī', 'qī', 'shī'], answer: 'chī' },
  { id: 'L08-q11', lessonId: 'L08', type: 'pickByChar', prompt: '"十" 的正确拼音是？', char: '十', options: ['sí', 'shí', 'sì', 'chí'], answer: 'shí' },
  { id: 'L08-q12', lessonId: 'L08', type: 'pickByChar', prompt: '"日" 的正确拼音是？', char: '日', options: ['rì', 'lì', 'nì', 'yì'], answer: 'rì' },
  // 平翘舌对比（重点）
  { id: 'L08-q13', lessonId: 'L08', type: 'circle', prompt: '圈出翘舌音', items: ['zì', 'zhì', 'cì', 'chì', 'sì', 'shì', 'rì', 'lì'], rule: '翘舌', answerIndices: [1, 3, 5, 6] },
  { id: 'L08-q14', lessonId: 'L08', type: 'judge', prompt: '"字" 拼音 zhì 对吗？', item: 'zhì (字，应为 zì)', answer: false },
  { id: 'L08-q15', lessonId: 'L08', type: 'judge', prompt: '"吃" 拼音 chī 对吗？', item: 'chī (吃)', answer: true },
  // 拼一拼
  { id: 'L08-q16', lessonId: 'L08', type: 'syllableCompose', prompt: 'zh + a + 1 声 = ?', initial: 'zh', finals: ['a'], answer: 'zhā' },
  { id: 'L08-q17', lessonId: 'L08', type: 'syllableCompose', prompt: 'sh + uo + 1 声 = ?', initial: 'sh', finals: ['uo'], answer: 'shuō' },
  { id: 'L08-q18', lessonId: 'L08', type: 'syllableSplit', prompt: '拆分 chū', syllable: 'chū', answer: { initial: 'ch', final: 'u', tone: 1 } },
  // 连线题：象形图 + 声母卡片（用 connect 类型简化表达）
  { id: 'L08-q19', lessonId: 'L08', type: 'connect', prompt: '把象形图和对应的声母卡片连起来', lefts: [
    { id: 'zh', label: 'zh' }, { id: 'ch', label: 'ch' }, { id: 'sh', label: 'sh' }, { id: 'r', label: 'r' },
  ], rights: [
    { id: 'zh', label: '🤐(闭嘴)' }, { id: 'ch', label: '🍴(餐)' }, { id: 'sh', label: '🦁(狮)' }, { id: 'r', label: '🌅(日)' },
  ], answer: [['zh','zh'],['ch','ch'],['sh','sh'],['r','r']] },
]

// ==================== L09 复韵母 ai ei ui ====================
// 无 PDF，按人教版大纲出
export const L09_QUESTIONS: Question[] = [
  { id: 'L09-q01', lessonId: 'L09', type: 'trace', prompt: '描一描，写一写', target: 'ai', rows: 3, colsPerRow: 7 },
  { id: 'L09-q02', lessonId: 'L09', type: 'trace', prompt: '描一描，写一写', target: 'ei', rows: 3, colsPerRow: 7 },
  { id: 'L09-q03', lessonId: 'L09', type: 'trace', prompt: '描一描，写一写', target: 'ui', rows: 3, colsPerRow: 7 },
  { id: 'L09-q04', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：高山（gāo shān）', imageEmoji: '⛰️', imageDesc: '高山', answer: 'gāo shān' },
  { id: 'L09-q05', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：妹妹（mèi mei）', imageEmoji: '👧', imageDesc: '妹妹', answer: 'mèi' },
  { id: 'L09-q06', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：水杯（shuǐ bēi）', imageEmoji: '🥤', imageDesc: '水杯', answer: 'bēi' },
  // 单音节补充
  { id: 'L09-q06a', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：白（bái）', imageEmoji: '⚪', imageDesc: '白', answer: 'bái' },
  { id: 'L09-q06b', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：飞（fēi）', imageEmoji: '🦋', imageDesc: '飞', answer: 'fēi' },
  { id: 'L09-q06c', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：来（lái）', imageEmoji: '👋', imageDesc: '来', answer: 'lái' },
  { id: 'L09-q06d', lessonId: 'L09', type: 'imageToSyllable', prompt: '看图拼一拼：开（kāi）', imageEmoji: '🔓', imageDesc: '开', answer: 'kāi' },
  // 标调规则：i u 并列标后
  { id: 'L09-q07', lessonId: 'L09', type: 'markTone', prompt: '给 ui 标四声', base: 'ui', options: [1, 2, 3, 4], answer: 4 },
  { id: 'L09-q08', lessonId: 'L09', type: 'markTone', prompt: '给 ei 标二声', base: 'ei', options: [1, 2, 3, 4], answer: 2 },
  { id: 'L09-q09', lessonId: 'L09', type: 'judge', prompt: 'uí 标调对吗？', item: 'uí', answer: false },
  { id: 'L09-q10', lessonId: 'L09', type: 'judge', prompt: 'uì 标调对吗？', item: 'uì', answer: false },
  { id: 'L09-q11', lessonId: 'L09', type: 'pickByChar', prompt: '"杯" 的正确拼音是？', char: '杯', options: ['bāi', 'bēi', 'bái', 'běi'], answer: 'bēi' },
  { id: 'L09-q12', lessonId: 'L09', type: 'pickByChar', prompt: '"飞" 的正确拼音是？', char: '飞', options: ['fāi', 'fēi', 'fái', 'fěi'], answer: 'fēi' },
  { id: 'L09-q13', lessonId: 'L09', type: 'pickByChar', prompt: '"水" 的正确拼音是？', char: '水', options: ['suí', 'shuǐ', 'suǐ', 'shuí'], answer: 'shuǐ' },
  { id: 'L09-q14', lessonId: 'L09', type: 'syllableCompose', prompt: 'b + ai = ?', initial: 'b', finals: ['ai'], answer: 'bai' },
  { id: 'L09-q15', lessonId: 'L09', type: 'syllableCompose', prompt: 'm + ei = ?', initial: 'm', finals: ['ei'], answer: 'mei' },
  { id: 'L09-q16', lessonId: 'L09', type: 'circle', prompt: '圈出复韵母音节', items: ['bā', 'bāi', 'bē', 'bēi', 'duì', 'du'], rule: '复韵母', answerIndices: [1, 3, 4] },
  { id: 'L09-q17', lessonId: 'L09', type: 'syllableSplit', prompt: '拆分 bái', syllable: 'bái', answer: { initial: 'b', final: 'ai', tone: 2 } },
]

// ==================== L10 复韵母 ao ou iu ====================
// 无 PDF
export const L10_QUESTIONS: Question[] = [
  { id: 'L10-q01', lessonId: 'L10', type: 'trace', prompt: '描一描，写一写', target: 'ao', rows: 3, colsPerRow: 7 },
  { id: 'L10-q02', lessonId: 'L10', type: 'trace', prompt: '描一描，写一写', target: 'ou', rows: 3, colsPerRow: 7 },
  { id: 'L10-q03', lessonId: 'L10', type: 'trace', prompt: '描一描，写一写', target: 'iu', rows: 3, colsPerRow: 7 },
  { id: 'L10-q04', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：包子（bāo zi）', imageEmoji: '🥟', imageDesc: '包子', answer: 'bāo' },
  { id: 'L10-q05', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：走（zǒu）', imageEmoji: '🚶', imageDesc: '走', answer: 'zǒu' },
  { id: 'L10-q06', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：牛（niú）', imageEmoji: '🐄', imageDesc: '牛', answer: 'niú' },
  // 单音节补充
  { id: 'L10-q06a', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：猫（māo）', imageEmoji: '🐱', imageDesc: '猫', answer: 'māo' },
  { id: 'L10-q06b', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：狗（gǒu）', imageEmoji: '🐶', imageDesc: '狗', answer: 'gǒu' },
  { id: 'L10-q06c', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：六（liù）', imageEmoji: '6️⃣', imageDesc: '六', answer: 'liù' },
  { id: 'L10-q06d', lessonId: 'L10', type: 'imageToSyllable', prompt: '看图拼一拼：九（jiǔ）', imageEmoji: '9️⃣', imageDesc: '九', answer: 'jiǔ' },
  // 标调：iu 标在 u
  { id: 'L10-q07', lessonId: 'L10', type: 'markTone', prompt: '给 iu 标二声', base: 'iu', options: [1, 2, 3, 4], answer: 2 },
  { id: 'L10-q08', lessonId: 'L10', type: 'markTone', prompt: '给 ou 标四声', base: 'ou', options: [1, 2, 3, 4], answer: 4 },
  { id: 'L10-q09', lessonId: 'L10', type: 'judge', prompt: 'iú 标调对吗？', item: 'iú', answer: false },
  { id: 'L10-q10', lessonId: 'L10', type: 'judge', prompt: 'iù 标调对吗？', item: 'iù', answer: false },
  { id: 'L10-q11', lessonId: 'L10', type: 'pickByChar', prompt: '"草" 的正确拼音是？', char: '草', options: ['cǎo', 'cáo', 'cāo', 'cào'], answer: 'cǎo' },
  { id: 'L10-q12', lessonId: 'L10', type: 'pickByChar', prompt: '"九" 的正确拼音是？', char: '九', options: ['jiǔ', 'jiū', 'jiú', 'jiù'], answer: 'jiǔ' },
  { id: 'L10-q13', lessonId: 'L10', type: 'pickByChar', prompt: '"走" 的正确拼音是？', char: '走', options: ['zǒu', 'zōu', 'zóu', 'zòu'], answer: 'zǒu' },
  { id: 'L10-q14', lessonId: 'L10', type: 'syllableCompose', prompt: 'd + ao = ?', initial: 'd', finals: ['ao'], answer: 'dao' },
  { id: 'L10-q15', lessonId: 'L10', type: 'syllableCompose', prompt: 'h + ou = ?', initial: 'h', finals: ['ou'], answer: 'hou' },
  { id: 'L10-q16', lessonId: 'L10', type: 'syllableSplit', prompt: '拆分 niú', syllable: 'niú', answer: { initial: 'n', final: 'iu', tone: 2 } },
  { id: 'L10-q17', lessonId: 'L10', type: 'syllableSplit', prompt: '拆分 cǎo', syllable: 'cǎo', answer: { initial: 'c', final: 'ao', tone: 3 } },
]

// ==================== L11 复韵母 ie üe + 特殊韵母 er + 整体认读 ye yue ====================
// 无 PDF
export const L11_QUESTIONS: Question[] = [
  { id: 'L11-q01', lessonId: 'L11', type: 'trace', prompt: '描一描，写一写', target: 'ie', rows: 3, colsPerRow: 7 },
  { id: 'L11-q02', lessonId: 'L11', type: 'trace', prompt: '描一描，写一写', target: 'üe', rows: 3, colsPerRow: 7 },
  { id: 'L11-q03', lessonId: 'L11', type: 'trace', prompt: '描一描，写一写', target: 'er', rows: 3, colsPerRow: 7 },
  { id: 'L11-q04', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：蝴蝶（hú dié）', imageEmoji: '🦋', imageDesc: '蝴蝶', answer: 'dié' },
  { id: 'L11-q05', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：雪花（xuě huā）', imageEmoji: '❄️', imageDesc: '雪花', answer: 'xuě' },
  { id: 'L11-q06', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：耳朵（ěr duo）', imageEmoji: '👂', imageDesc: '耳朵', answer: 'ěr' },
  { id: 'L11-q07', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：月亮（yuè liang）', imageEmoji: '🌙', imageDesc: '月亮', answer: 'yuè' },
  // 单音节补充
  { id: 'L11-q07a', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：学（xué）', imageEmoji: '📚', imageDesc: '学', answer: 'xué' },
  { id: 'L11-q07b', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：鱼（yú）', imageEmoji: '🐟', imageDesc: '鱼', answer: 'yú' },
  { id: 'L11-q07c', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：园（yuán）', imageEmoji: '🏞️', imageDesc: '园', answer: 'yuán' },
  { id: 'L11-q07d', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：云（yún）', imageEmoji: '☁️', imageDesc: '云', answer: 'yún' },
  { id: 'L11-q08', lessonId: 'L11', type: 'imageToSyllable', prompt: '看图拼一拼：叶子（yè zi）', imageEmoji: '🍃', imageDesc: '叶子', answer: 'yè' },
  // 整体认读
  { id: 'L11-q09', lessonId: 'L11', type: 'pickByChar', prompt: '"写" 的正确拼音是？', char: '写', options: ['xiě', 'xié', 'xiē', 'xiè'], answer: 'xiě' },
  { id: 'L11-q10', lessonId: 'L11', type: 'pickByChar', prompt: '"月" 的正确拼音是？', char: '月', options: ['yuē', 'yué', 'yuě', 'yuè'], answer: 'yuè' },
  { id: 'L11-q11', lessonId: 'L11', type: 'pickByChar', prompt: '"儿" 的正确拼音是？', char: '儿', options: ['ēr', 'ér', 'ěr', 'èr'], answer: 'ér' },
  // 标调
  { id: 'L11-q12', lessonId: 'L11', type: 'markTone', prompt: '给 üe 标三声', base: 'üe', options: [1, 2, 3, 4], answer: 3 },
  { id: 'L11-q13', lessonId: 'L11', type: 'markTone', prompt: '给 ie 标一声', base: 'ie', options: [1, 2, 3, 4], answer: 1 },
  // 判断对错
  { id: 'L11-q14', lessonId: 'L11', type: 'judge', prompt: 'üe 标调要省两点，对吗？', item: 'üe 标调规则', answer: true },
  { id: 'L11-q15', lessonId: 'L11', type: 'judge', prompt: '"叶" 拼音 yiè 对吗？', item: 'yiè (叶，应为 yè)', answer: false },
  // 拼一拼
  { id: 'L11-q16', lessonId: 'L11', type: 'syllableCompose', prompt: 'j + ie = ?', initial: 'j', finals: ['ie'], answer: 'jie' },
  { id: 'L11-q17', lessonId: 'L11', type: 'syllableCompose', prompt: 'y + üe = ?', initial: 'y', finals: ['üe'], answer: 'yue' },
  // 音节拆分
  { id: 'L11-q18', lessonId: 'L11', type: 'syllableSplit', prompt: '拆分 xuě', syllable: 'xuě', answer: { initial: 'x', final: 'üe', tone: 3 } },
  { id: 'L11-q19', lessonId: 'L11', type: 'syllableSplit', prompt: '拆分 ér', syllable: 'ér', answer: { initial: '', final: 'er', tone: 2 } },
]

// ==================== L12 前鼻韵母 an en in un ün ====================
// 无 PDF
export const L12_QUESTIONS: Question[] = [
  { id: 'L12-q01', lessonId: 'L12', type: 'trace', prompt: '描一描，写一写', target: 'an', rows: 3, colsPerRow: 7 },
  { id: 'L12-q02', lessonId: 'L12', type: 'trace', prompt: '描一描，写一写', target: 'en', rows: 3, colsPerRow: 7 },
  { id: 'L12-q03', lessonId: 'L12', type: 'trace', prompt: '描一描，写一写', target: 'in', rows: 3, colsPerRow: 7 },
  { id: 'L12-q04', lessonId: 'L12', type: 'trace', prompt: '描一描，写一写', target: 'un', rows: 3, colsPerRow: 7 },
  { id: 'L12-q05', lessonId: 'L12', type: 'trace', prompt: '描一描，写一写', target: 'ün', rows: 3, colsPerRow: 7 },
  // 看图写拼音
  { id: 'L12-q06', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：山（shān）', imageEmoji: '⛰️', imageDesc: '山', answer: 'shān' },
  { id: 'L12-q07', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：门（mén）', imageEmoji: '🚪', imageDesc: '门', answer: 'mén' },
  // 单音节补充
  { id: 'L12-q07a', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：本（běn）', imageEmoji: '📒', imageDesc: '本', answer: 'běn' },
  { id: 'L12-q07b', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：灯（dēng）', imageEmoji: '💡', imageDesc: '灯', answer: 'dēng' },
  { id: 'L12-q07c', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：风（fēng）', imageEmoji: '🌬️', imageDesc: '风', answer: 'fēng' },
  { id: 'L12-q07d', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：行（xíng）', imageEmoji: '🚶', imageDesc: '行', answer: 'xíng' },
  { id: 'L12-q08', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：林（lín）', imageEmoji: '🌲', imageDesc: '林', answer: 'lín' },
  { id: 'L12-q09', lessonId: 'L12', type: 'imageToSyllable', prompt: '看图拼一拼：云（yún）', imageEmoji: '☁️', imageDesc: '云', answer: 'yún' },
  // 整体认读
  { id: 'L12-q10', lessonId: 'L12', type: 'pickByChar', prompt: '"园" 的正确拼音是？', char: '园', options: ['yuán', 'yán', 'yuàn', 'yǔn'], answer: 'yuán' },
  { id: 'L12-q11', lessonId: 'L12', type: 'pickByChar', prompt: '"云" 的正确拼音是？', char: '云', options: ['yūn', 'yún', 'yǔn', 'yùn'], answer: 'yún' },
  { id: 'L12-q12', lessonId: 'L12', type: 'pickByChar', prompt: '"音" 的正确拼音是？', char: '音', options: ['yīn', 'yīng', 'yǐn', 'yìn'], answer: 'yīn' },
  // 圈选：前鼻音
  { id: 'L12-q13', lessonId: 'L12', type: 'circle', prompt: '圈出前鼻音', items: ['shān', 'shāng', 'mín', 'míng', 'yún', 'yóng'], rule: '前鼻', answerIndices: [0, 2, 4] },
  // 标调
  { id: 'L12-q14', lessonId: 'L12', type: 'markTone', prompt: '给 in 标四声', base: 'in', options: [1, 2, 3, 4], answer: 4 },
  { id: 'L12-q15', lessonId: 'L12', type: 'markTone', prompt: '给 ün 标二声', base: 'ün', options: [1, 2, 3, 4], answer: 2 },
  // 拼一拼
  { id: 'L12-q16', lessonId: 'L12', type: 'syllableCompose', prompt: 'b + an = ?', initial: 'b', finals: ['an'], answer: 'ban' },
  { id: 'L12-q17', lessonId: 'L12', type: 'syllableCompose', prompt: 'y + in = ?', initial: 'y', finals: ['in'], answer: 'yin' },
  // 判断对错
  { id: 'L12-q18', lessonId: 'L12', type: 'judge', prompt: '"山" 拼音 shān 对吗？', item: 'shān (山)', answer: true },
  // 音节拆分
  { id: 'L12-q19', lessonId: 'L12', type: 'syllableSplit', prompt: '拆分 yún', syllable: 'yún', answer: { initial: 'y', final: 'ün', tone: 2 } },
  { id: 'L12-q20', lessonId: 'L12', type: 'syllableSplit', prompt: '拆分 lín', syllable: 'lín', answer: { initial: 'l', final: 'in', tone: 2 } },
]

// ==================== L13 后鼻韵母 ang eng ing ong ====================
// 无 PDF
export const L13_QUESTIONS: Question[] = [
  { id: 'L13-q01', lessonId: 'L13', type: 'trace', prompt: '描一描，写一写', target: 'ang', rows: 3, colsPerRow: 7 },
  { id: 'L13-q02', lessonId: 'L13', type: 'trace', prompt: '描一描，写一写', target: 'eng', rows: 3, colsPerRow: 7 },
  { id: 'L13-q03', lessonId: 'L13', type: 'trace', prompt: '描一描，写一写', target: 'ing', rows: 3, colsPerRow: 7 },
  { id: 'L13-q04', lessonId: 'L13', type: 'trace', prompt: '描一描，写一写', target: 'ong', rows: 3, colsPerRow: 7 },
  // 看图写拼音
  { id: 'L13-q05', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：床（chuáng）', imageEmoji: '🛏️', imageDesc: '床', answer: 'chuáng' },
  { id: 'L13-q06', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：灯（dēng）', imageEmoji: '💡', imageDesc: '灯', answer: 'dēng' },
  { id: 'L13-q07', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：老鹰（lǎo yīng）', imageEmoji: '🦅', imageDesc: '老鹰', answer: 'yīng' },
  // 单音节补充
  { id: 'L13-q07a', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：中（zhōng）', imageEmoji: '🇨🇳', imageDesc: '中', answer: 'zhōng' },
  { id: 'L13-q07b', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：虫（chóng）', imageEmoji: '🐛', imageDesc: '虫', answer: 'chóng' },
  { id: 'L13-q07c', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：公（gōng）', imageEmoji: '🧑‍💼', imageDesc: '公', answer: 'gōng' },
  { id: 'L13-q07d', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：用（yòng）', imageEmoji: '🔧', imageDesc: '用', answer: 'yòng' },
  { id: 'L13-q08', lessonId: 'L13', type: 'imageToSyllable', prompt: '看图拼一拼：红（hóng）', imageEmoji: '🔴', imageDesc: '红', answer: 'hóng' },
  // 看字选拼音
  { id: 'L13-q09', lessonId: 'L13', type: 'pickByChar', prompt: '"风" 的正确拼音是？', char: '风', options: ['fēn', 'fēng', 'fèn', 'fěng'], answer: 'fēng' },
  { id: 'L13-q10', lessonId: 'L13', type: 'pickByChar', prompt: '"虫" 的正确拼音是？', char: '虫', options: ['chōng', 'chóng', 'chǒng', 'chòng'], answer: 'chóng' },
  { id: 'L13-q11', lessonId: 'L13', type: 'pickByChar', prompt: '"熊" 的正确拼音是？', char: '熊', options: ['xióng', 'xún', 'xōng', 'xiōng'], answer: 'xióng' },
  // 前后鼻音对比（重点易错）
  { id: 'L13-q12', lessonId: 'L13', type: 'circle', prompt: '圈出后鼻音', items: ['shān', 'shāng', 'mín', 'míng', 'yún', 'yóng', 'xīn', 'xīng'], rule: '后鼻', answerIndices: [1, 3, 5, 7] },
  { id: 'L13-q13', lessonId: 'L13', type: 'judge', prompt: '"风" 拼音 fēn 对吗？', item: 'fēn (风，应为 fēng)', answer: false },
  { id: 'L13-q14', lessonId: 'L13', type: 'judge', prompt: '"熊" 拼音 xióng 对吗？', item: 'xióng (熊)', answer: true },
  // 拼一拼
  { id: 'L13-q15', lessonId: 'L13', type: 'syllableCompose', prompt: 'd + ang = ?', initial: 'd', finals: ['ang'], answer: 'dang' },
  { id: 'L13-q16', lessonId: 'L13', type: 'syllableCompose', prompt: 'y + ing = ?', initial: 'y', finals: ['ing'], answer: 'ying' },
  // 标调
  { id: 'L13-q17', lessonId: 'L13', type: 'markTone', prompt: '给 eng 标二声', base: 'eng', options: [1, 2, 3, 4], answer: 2 },
  // 音节拆分
  { id: 'L13-q18', lessonId: 'L13', type: 'syllableSplit', prompt: '拆分 hóng', syllable: 'hóng', answer: { initial: 'h', final: 'ong', tone: 2 } },
  { id: 'L13-q19', lessonId: 'L13', type: 'syllableSplit', prompt: '拆分 yīng', syllable: 'yīng', answer: { initial: 'y', final: 'ing', tone: 1 } },
  // 综合
  { id: 'L13-q20', lessonId: 'L13', type: 'classifyTone', prompt: '按声调分类后鼻韵母', syllables: ['chuáng', 'dēng', 'yīng', 'hóng'], answer: [
    { tone: 1, items: ['dēng', 'yīng'] },
    { tone: 2, items: ['chuáng', 'hóng'] },
    { tone: 3, items: [] },
    { tone: 4, items: [] },
  ] },
]

// ==================== 跨课专项对比题（拼音学习 5 大易错点）====================
// 这些题按"易错点维度"组织，每个易错点一组题，每组 4-6 道
// 听写阶段按"易错点"维度混进题库

// ---- 专项1：i u 标调规则（iu/ ui 标后） ----
export const I_U_TONE_RULES: Question[] = [
  { id: 'rule-iu-1', lessonId: 'L09', type: 'judge', prompt: '"iù" 标调对吗？（应在 u）', item: 'iù', answer: false },
  { id: 'rule-iu-2', lessonId: 'L09', type: 'judge', prompt: '"iú" 标调对吗？', item: 'iú', answer: false },
  { id: 'rule-iu-3', lessonId: 'L09', type: 'judge', prompt: '"ui" 标二声应是 "uí" 对吗？', item: 'uí', answer: false },
  { id: 'rule-iu-4', lessonId: 'L10', type: 'judge', prompt: '"iu" 标三声应在 u（iǔ 错，iù 对）？', item: 'iǔ', answer: false },
  { id: 'rule-iu-5', lessonId: 'L10', type: 'markTone', prompt: '给 iu 标二声（标 u 上）', base: 'iu', options: [1, 2, 3, 4], answer: 2 },
  { id: 'rule-iu-6', lessonId: 'L10', type: 'markTone', prompt: '给 ui 标四声（标 i 上）', base: 'ui', options: [1, 2, 3, 4], answer: 4 },
]

// ---- 专项2：j q x + ü 省略两点规则 ----
export const JQX_UMLAUT_RULES: Question[] = [
  { id: 'rule-jqx-1', lessonId: 'L06', type: 'judge', prompt: '"jǖ" 标调对吗？（j q x 拼 ü 要省两点）', item: 'jǖ', answer: false },
  { id: 'rule-jqx-2', lessonId: 'L06', type: 'judge', prompt: '"jū" 对吗？', item: 'jū', answer: true },
  { id: 'rule-jqx-3', lessonId: 'L06', type: 'judge', prompt: '"qǖ" 对吗？', item: 'qǖ', answer: false },
  { id: 'rule-jqx-4', lessonId: 'L06', type: 'judge', prompt: '"xǖ" 对吗？', item: 'xǖ', answer: false },
  { id: 'rule-jqx-5', lessonId: 'L06', type: 'pickByChar', prompt: '"句" 的正确拼音是？', char: '句', options: ['jǜ', 'jù', 'jǚ', 'jū'], answer: 'jù' },
  { id: 'rule-jqx-6', lessonId: 'L06', type: 'pickByChar', prompt: '"去" 的正确拼音是？', char: '去', options: ['qǜ', 'qù', 'qǚ', 'qū'], answer: 'qù' },
  { id: 'rule-jqx-7', lessonId: 'L06', type: 'pickByChar', prompt: '"许" 的正确拼音是？', char: '许', options: ['xǔ', 'xǚ', 'xǖ', 'xǜ'], answer: 'xǔ' },
  { id: 'rule-jqx-8', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：桔子（jú）', imageEmoji: '🍊', imageDesc: '桔子', answer: 'jú' },
  { id: 'rule-jqx-9', lessonId: 'L06', type: 'imageToSyllable', prompt: '看图拼一拼：裙子（qún）', imageEmoji: '👗', imageDesc: '裙子', answer: 'qún' },
]

// ---- 专项3：平翘舌区分（z-zh c-ch s-sh） ----
export const FLAT_REtroflex: Question[] = [
  { id: 'flat-z-1', lessonId: 'L07', type: 'pickByChar', prompt: '"字" 是平舌音？', char: '字', options: ['zì', 'zhì', 'zí', 'zhí'], answer: 'zì' },
  { id: 'flat-z-2', lessonId: 'L08', type: 'pickByChar', prompt: '"知" 是翘舌音？', char: '知', options: ['zī', 'zhī', 'jī', 'qī'], answer: 'zhī' },
  { id: 'flat-z-3', lessonId: 'L07', type: 'pickByChar', prompt: '"次" 的正确拼音？', char: '次', options: ['cì', 'chì', 'qì', 'sì'], answer: 'cì' },
  { id: 'flat-z-4', lessonId: 'L08', type: 'pickByChar', prompt: '"吃" 的正确拼音？', char: '吃', options: ['cī', 'chī', 'qī', 'shī'], answer: 'chī' },
  { id: 'flat-z-5', lessonId: 'L07', type: 'pickByChar', prompt: '"四" 的正确拼音？', char: '四', options: ['sí', 'shí', 'sì', 'chì'], answer: 'sì' },
  { id: 'flat-z-6', lessonId: 'L08', type: 'pickByChar', prompt: '"十" 的正确拼音？', char: '十', options: ['sí', 'shí', 'sì', 'chí'], answer: 'shí' },
  { id: 'flat-z-7', lessonId: 'L07', type: 'judge', prompt: '"坐" 拼音 zuò 对吗？', item: 'zuò (坐)', answer: true },
  { id: 'flat-z-8', lessonId: 'L08', type: 'judge', prompt: '"桌" 拼音 zhuō 对吗？', item: 'zhuō (桌)', answer: true },
  { id: 'flat-z-9', lessonId: 'L07', type: 'circle', prompt: '圈出平舌音（z c s）', items: ['zì', 'zhì', 'cì', 'chì', 'sì', 'shì', 'zā', 'zhā'], rule: '平舌', answerIndices: [0, 2, 4, 6] },
  { id: 'flat-z-10', lessonId: 'L08', type: 'circle', prompt: '圈出翘舌音（zh ch sh r）', items: ['zì', 'zhì', 'cì', 'chì', 'sì', 'shì', 'rì', 'lì'], rule: '翘舌', answerIndices: [1, 3, 5, 6] },
]

// ---- 专项4：前鼻音 vs 后鼻音（an/ang, en/eng, in/ing, un/ong） ----
export const NASAL: Question[] = [
  { id: 'nasal-1', lessonId: 'L12', type: 'pickByChar', prompt: '"山" 前鼻音（shān）？', char: '山', options: ['shān', 'shāng', 'shēn', 'shēng'], answer: 'shān' },
  { id: 'nasal-2', lessonId: 'L13', type: 'pickByChar', prompt: '"商" 后鼻音（shāng）？', char: '商', options: ['shān', 'shāng', 'shēn', 'shēng'], answer: 'shāng' },
  { id: 'nasal-3', lessonId: 'L12', type: 'pickByChar', prompt: '"林" 前鼻音（lín）？', char: '林', options: ['líng', 'lín', 'lǐn', 'lìng'], answer: 'lín' },
  { id: 'nasal-4', lessonId: 'L13', type: 'pickByChar', prompt: '"零" 后鼻音（líng）？', char: '零', options: ['lín', 'líng', 'lǐn', 'lìng'], answer: 'líng' },
  { id: 'nasal-5', lessonId: 'L12', type: 'pickByChar', prompt: '"云" 前鼻音（yún）？', char: '云', options: ['yōng', 'yóng', 'yún', 'yǒng'], answer: 'yún' },
  { id: 'nasal-6', lessonId: 'L13', type: 'pickByChar', prompt: '"熊" 后鼻音（xióng）？', char: '熊', options: ['xún', 'xióng', 'xīng', 'xūng'], answer: 'xióng' },
  { id: 'nasal-7', lessonId: 'L12', type: 'judge', prompt: '"人" 拼音 rén 对吗？', item: 'rén (人)', answer: true },
  { id: 'nasal-8', lessonId: 'L13', type: 'judge', prompt: '"风" 拼音 fēng 对吗？', item: 'fēng (风)', answer: true },
  { id: 'nasal-9', lessonId: 'L12', type: 'circle', prompt: '圈出前鼻音', items: ['shān', 'shāng', 'mín', 'míng', 'yún', 'yóng', 'lín', 'líng'], rule: '前鼻', answerIndices: [0, 2, 4, 6] },
  { id: 'nasal-10', lessonId: 'L13', type: 'circle', prompt: '圈出后鼻音', items: ['shān', 'shāng', 'mín', 'míng', 'yún', 'yóng', 'lín', 'líng'], rule: '后鼻', answerIndices: [1, 3, 5, 7] },
  { id: 'nasal-11', lessonId: 'L13', type: 'judge', prompt: '"星" 拼音 xīng 对吗？', item: 'xīng (星)', answer: true },
  { id: 'nasal-12', lessonId: 'L12', type: 'judge', prompt: '"听" 拼音 tīng 对吗？', item: 'tīng (听)', answer: true },
]

// ---- 专项5：整体认读音节（不拼读，直接认） ----
export const WHOLE_READ: Question[] = [
  { id: 'whole-1', lessonId: 'L02', type: 'pickByChar', prompt: '"一" 整体认读 yī', char: '一', options: ['yī', 'wū', 'yú', 'wǒ'], answer: 'yī' },
  { id: 'whole-2', lessonId: 'L02', type: 'pickByChar', prompt: '"五" 整体认读 wǔ', char: '五', options: ['yī', 'wǔ', 'yǔ', 'wū'], answer: 'wǔ' },
  { id: 'whole-3', lessonId: 'L02', type: 'pickByChar', prompt: '"鱼" 整体认读 yú', char: '鱼', options: ['yī', 'wū', 'yú', 'yǔ'], answer: 'yú' },
  { id: 'whole-4', lessonId: 'L07', type: 'pickByChar', prompt: '"字" 整体认读 zi', char: '字', options: ['zì', 'zhì', 'jì', 'qì'], answer: 'zì' },
  { id: 'whole-5', lessonId: 'L07', type: 'pickByChar', prompt: '"次" 整体认读 ci', char: '次', options: ['cì', 'chì', 'qì', 'sì'], answer: 'cì' },
  { id: 'whole-6', lessonId: 'L07', type: 'pickByChar', prompt: '"四" 整体认读 si', char: '四', options: ['xì', 'shì', 'sì', 'cì'], answer: 'sì' },
  { id: 'whole-7', lessonId: 'L08', type: 'pickByChar', prompt: '"知" 整体认读 zhi', char: '知', options: ['zī', 'zhī', 'jī', 'qī'], answer: 'zhī' },
  { id: 'whole-8', lessonId: 'L08', type: 'pickByChar', prompt: '"吃" 整体认读 chi', char: '吃', options: ['cī', 'chī', 'qī', 'shī'], answer: 'chī' },
  { id: 'whole-9', lessonId: 'L08', type: 'pickByChar', prompt: '"日" 整体认读 ri', char: '日', options: ['rì', 'lì', 'nì', 'yì'], answer: 'rì' },
  { id: 'whole-10', lessonId: 'L12', type: 'pickByChar', prompt: '"园" 整体认读 yuan', char: '园', options: ['yuán', 'yán', 'yuǎn', 'yǔn'], answer: 'yuán' },
  { id: 'whole-11', lessonId: 'L12', type: 'pickByChar', prompt: '"音" 整体认读 yin', char: '音', options: ['yīn', 'yīng', 'yǐn', 'yìn'], answer: 'yīn' },
  { id: 'whole-12', lessonId: 'L12', type: 'pickByChar', prompt: '"云" 整体认读 yun', char: '云', options: ['yūn', 'yún', 'yǔn', 'yùn'], answer: 'yún' },
  { id: 'whole-13', lessonId: 'L13', type: 'pickByChar', prompt: '"英" 整体认读 ying', char: '英', options: ['yīn', 'yīng', 'yǐn', 'yìn'], answer: 'yīng' },
  { id: 'whole-14', lessonId: 'L11', type: 'pickByChar', prompt: '"月" 整体认读 yue', char: '月', options: ['yuē', 'yué', 'yuě', 'yuè'], answer: 'yuè' },
  { id: 'whole-15', lessonId: 'L11', type: 'pickByChar', prompt: '"叶" 整体认读 ye', char: '叶', options: ['yē', 'yé', 'yě', 'yè'], answer: 'yè' },
]

// ---- 专项6：un ün 区分（ü 见 j q x 省略两点） ----
export const UN_UN_RULE: Question[] = [
  { id: 'un-1', lessonId: 'L12', type: 'pickByChar', prompt: '"军" 正确拼音（j + ün 省略 → jūn）', char: '军', options: ['jūn', 'jǖn', 'jū', 'jun'], answer: 'jūn' },
  { id: 'un-2', lessonId: 'L12', type: 'pickByChar', prompt: '"群" 正确拼音（q + ün → qún）', char: '群', options: ['qún', 'qǘn', 'qūn', 'qun'], answer: 'qún' },
  { id: 'un-3', lessonId: 'L12', type: 'pickByChar', prompt: '"运" 整体认读 yun（yun 不是 yün）', char: '运', options: ['yùn', 'yǜn', 'yun', 'yün'], answer: 'yùn' },
  { id: 'un-4', lessonId: 'L12', type: 'judge', prompt: '"群" 拼音写成 qǘn 对吗？', item: 'qǘn', answer: false },
  { id: 'un-5', lessonId: 'L12', type: 'circle', prompt: '圈出带 "ün" 的音节', items: ['jūn', 'jīn', 'qún', 'qín', 'yún', 'yín', 'jun'], rule: 'ün', answerIndices: [0, 2, 4] },
]

// ---- 专项7：二声三声拼读容易搞错 ----
export const TONE2_TONE3: Question[] = [
  { id: 't23-1', lessonId: 'L01', type: 'pickByChar', prompt: '"麻" 二声 má？', char: '麻', options: ['mā', 'má', 'mǎ', 'mà'], answer: 'má' },
  { id: 't23-2', lessonId: 'L01', type: 'pickByChar', prompt: '"马" 三声 mǎ？', char: '马', options: ['mā', 'má', 'mǎ', 'mà'], answer: 'mǎ' },
  { id: 't23-3', lessonId: 'L01', type: 'pickByChar', prompt: '"爬" 二声 pá？', char: '爬', options: ['pā', 'pá', 'pǎ', 'pà'], answer: 'pá' },
  { id: 't23-4', lessonId: 'L01', type: 'pickByChar', prompt: '"大" 四声 dà？', char: '大', options: ['dā', 'dá', 'dǎ', 'dà'], answer: 'dà' },
  { id: 't23-5', lessonId: 'L01', type: 'judge', prompt: '"火" 拼音 huǒ 对吗？（huǒ 三声）', item: 'huǒ (火)', answer: true },
  { id: 't23-6', lessonId: 'L01', type: 'judge', prompt: '"我" 拼音 wǒ 对吗？', item: 'wǒ (我)', answer: true },
]

// ---- 专项8：韵母 i 的轻声（"的" de） ----
export const DE_GE: Question[] = [
  { id: 'de-1', lessonId: 'L03', type: 'pickByChar', prompt: '"的" 轻声 de', char: '的', options: ['dē', 'dé', 'dě', 'de'], answer: 'de' },
  { id: 'de-2', lessonId: 'L03', type: 'pickByChar', prompt: '"得" 轻声 de', char: '得', options: ['dē', 'dé', 'dě', 'de'], answer: 'de' },
  { id: 'de-3', lessonId: 'L03', type: 'pickByChar', prompt: '"地" 轻声 de', char: '地', options: ['dē', 'dé', 'dě', 'de'], answer: 'de' },
]

// ---- 把专项题混进 13 课题库 ----
// 标调规则题加入 L09 + L10
// JQX 加入 L06
// 平翘舌加入 L07 + L08
// 鼻音加入 L12 + L13
// 整体认读加入对应课
L09_QUESTIONS.push(...I_U_TONE_RULES)
L10_QUESTIONS.push(...I_U_TONE_RULES.slice(0, 4))
L06_QUESTIONS.push(...JQX_UMLAUT_RULES)
L07_QUESTIONS.push(...FLAT_REtroflex.slice(0, 6), ...WHOLE_READ.slice(3, 6))
L08_QUESTIONS.push(...FLAT_REtroflex.slice(6, 10), ...WHOLE_READ.slice(6, 9))
L12_QUESTIONS.push(...NASAL.slice(0, 6), ...NASAL.slice(8, 10), ...UN_UN_RULE, ...WHOLE_READ.slice(9, 13))
L13_QUESTIONS.push(...NASAL.slice(5, 12), ...WHOLE_READ.slice(12, 15))
L11_QUESTIONS.push(...WHOLE_READ.slice(13, 15))
L02_QUESTIONS.push(...WHOLE_READ.slice(0, 3))
L03_QUESTIONS.push(...DE_GE, ...TONE2_TONE3.slice(4, 6))
L01_QUESTIONS.push(...TONE2_TONE3.slice(0, 4))

// ==================== 全部题库索引 ====================
import type { LessonId } from './lessons'

export const QUESTION_BANK: Record<LessonId, Question[]> = {
  L01: L01_QUESTIONS,
  L02: L02_QUESTIONS,
  L03: L03_QUESTIONS,
  L04: L04_QUESTIONS,
  L05: L05_QUESTIONS,
  L06: L06_QUESTIONS,
  L07: L07_QUESTIONS,
  L08: L08_QUESTIONS,
  L09: L09_QUESTIONS,
  L10: L10_QUESTIONS,
  L11: L11_QUESTIONS,
  L12: L12_QUESTIONS,
  L13: L13_QUESTIONS,
  L08Y: L08Y_QUESTIONS,
}

export function getQuestions(lessonId: string): Question[] {
  return (QUESTION_BANK as any)[lessonId] || []
}
