// 古诗数据：人教版 1-3 年级课本必背
// 拼音采用 NFC 预组合形式（á 而不是 a + ́）

export interface PoemLine {
  /** 诗句原文（带标点） */
  chars: string
  /** 逐字注音（带标点）, 与 chars 一一对应 */
  pinyin: string
}

export interface Poem {
  id: string
  title: string
  author: string
  dynasty: string
  /** 推荐年级（1/2/3） */
  grade: 1 | 2 | 3
  /** 主题 */
  theme: string
  /** 诗句（每行一字面 + 逐字拼音） */
  lines: PoemLine[]
  /** 白话释义（一年级友好简短版） */
  translation: string
  /** 释义逐字拼音（与 translation 字符一一对应） */
  translationPinyin: string
  /** 重点字（用于颜色高亮 / 跟读） */
  highlights: string[]
}

export const POEMS: Poem[] = [
  // === 一年级 ===
  {
    id: 'yong-e',
    title: '咏鹅',
    author: '骆宾王',
    dynasty: '唐',
    grade: 1,
    theme: '动物',
    lines: [
      { chars: '鹅，鹅，鹅，', pinyin: 'é é é' },
      { chars: '曲项向天歌。', pinyin: 'qū xiàng xiàng tiān gē.' },
      { chars: '白毛浮绿水，', pinyin: 'bái máo fú lǜ shuǐ,' },
      { chars: '红掌拨清波。', pinyin: 'hóng zhǎng bō qīng bō.' },
    ],
    translation: '大白鹅呀大白鹅，弯着脖子对着天唱歌。雪白的羽毛浮在绿水上，红色的脚掌划着清清的水波。',
    translationPinyin: 'dà bái é ya dà bái é, wān zhe bó zi duì zhe tiān chàng gē. xuě bái de yǔ máo fú zài lǜ shuǐ shàng, hóng sè de jiǎo zhǎng huá zhe qīng qīng de shuǐ bō.',
    highlights: ['鹅', '曲', '歌', '毛', '绿', '红', '掌', '波'],
  },
  {
    id: 'jing-ye-si',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    grade: 1,
    theme: '思乡',
    lines: [
      { chars: '床前明月光，', pinyin: 'chuáng qián míng yuè guāng,' },
      { chars: '疑是地上霜。', pinyin: 'yí shì dì shàng shuāng.' },
      { chars: '举头望明月，', pinyin: 'jǔ tóu wàng míng yuè,' },
      { chars: '低头思故乡。', pinyin: 'dī tóu sī gù xiāng.' },
    ],
    translation: '床前一片明亮的月光，好像地上铺了一层白霜。抬头看着天上的明月，低头想起远方的家乡。',
    translationPinyin: 'chuáng qián yī piàn míng liàng de yuè guāng, hǎo xiàng dì shàng pù le yī céng bái shuāng. tái tóu kàn zhe tiān shàng de míng yuè, dī tóu xiǎng qǐ yuǎn fāng de jiā xiāng.',
    highlights: ['床', '光', '霜', '举', '望', '低', '思', '乡'],
  },
  {
    id: 'chun-xiao',
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    grade: 1,
    theme: '四季',
    lines: [
      { chars: '春眠不觉晓，', pinyin: 'chūn mián bù jué xiǎo,' },
      { chars: '处处闻啼鸟。', pinyin: 'chù chù wén tí niǎo.' },
      { chars: '夜来风雨声，', pinyin: 'yè lái fēng yǔ shēng,' },
      { chars: '花落知多少。', pinyin: 'huā luò zhī duō shǎo.' },
    ],
    translation: '春天的夜里睡得真香甜，不知不觉天就亮了。到处都能听到鸟儿的叫声。夜里想起了风雨声，不知道花儿被吹落了多少。',
    translationPinyin: 'chūn tiān de yè lǐ shuì de zhēn xiāng tián, bù zhī bù jué tiān jiù liàng le. dào chù dōu néng tīng dào niǎo ér de jiào shēng. yè lǐ xiǎng qǐ le fēng yǔ shēng, bù zhī dào huā ér bèi chuī luò le duō shǎo.',
    highlights: ['春', '眠', '晓', '啼', '鸟', '雨', '落', '多'],
  },
  {
    id: 'deng-guan-qiao-lou',
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    grade: 2,
    theme: '励志',
    lines: [
      { chars: '白日依山尽，', pinyin: 'bái rì yī shān jìn,' },
      { chars: '黄河入海流。', pinyin: 'huáng hé rù hǎi liú.' },
      { chars: '欲穷千里目，', pinyin: 'yù qióng qiān lǐ mù,' },
      { chars: '更上一层楼。', pinyin: 'gèng shàng yì céng lóu.' },
    ],
    translation: '太阳挨着山慢慢落下去，黄河向着大海滚滚流去。想要看到更远的风景，就要再上一层楼。',
    translationPinyin: 'tài yáng āi zhe shān màn màn luò xià qù, huáng hé xiàng zhe dà hǎi gǔn gǔn liú qù. xiǎng yào kàn dào gèng yuǎn de fēng jǐng, jiù yào zài shàng yī céng lóu.',
    highlights: ['白', '山', '黄', '河', '海', '千', '楼'],
  },
  {
    id: 'min-nong',
    title: '悯农',
    author: '李绅',
    dynasty: '唐',
    grade: 2,
    theme: '惜物',
    lines: [
      { chars: '锄禾日当午，', pinyin: 'chú hé rì dāng wǔ,' },
      { chars: '汗滴禾下土。', pinyin: 'hàn dī hé xià tǔ.' },
      { chars: '谁知盘中餐，', pinyin: 'shéi zhī pán zhōng cān,' },
      { chars: '粒粒皆辛苦。', pinyin: 'lì lì jiē xīn kǔ.' },
    ],
    translation: '农民中午在田里锄草，汗水一滴一滴落在禾苗下的土里。碗里的饭，每一粒都来之不易。',
    translationPinyin: 'nóng mín zhōng wǔ zài tián lǐ chú cǎo, hàn shuǐ yī dī yī dī luò zài hé miáo xià de tǔ lǐ. wǎn lǐ de fàn, měi yī lì dōu lái zhī bù yì.',
    highlights: ['锄', '禾', '汗', '滴', '盘', '粒', '辛', '苦'],
  },
  {
    id: 'yong-liu',
    title: '咏柳',
    author: '贺知章',
    dynasty: '唐',
    grade: 2,
    theme: '四季',
    lines: [
      { chars: '碧玉妆成一树高，', pinyin: 'bì yù zhuāng chéng yī shù gāo,' },
      { chars: '万条垂下绿丝绦。', pinyin: 'wàn tiáo chuí xià lǜ sī tāo.' },
      { chars: '不知细叶谁裁出，', pinyin: 'bù zhī xì yè shéi cái chū,' },
      { chars: '二月春风似剪刀。', pinyin: 'èr yuè chūn fēng sì jiǎn dāo.' },
    ],
    translation: '高高的柳树像是用碧绿的玉石装扮成的，无数枝条垂下来像绿色的丝带。不知道这细细的叶子是谁剪出来的？原来是二月的春风像剪刀一样裁出来的。',
    translationPinyin: 'gāo gāo de liǔ shù xiàng shì yòng bì lǜ de yù shí zhuāng bàn chéng de, wú shù zhī tiáo chuí xià lái xiàng lǜ sè de sī dài. bù zhī dào zhè xì xì de yè zi shì shéi jiǎn chū lái de? yuán lái shì èr yuè de chūn fēng xiàng jiǎn dāo yī yàng cái chū lái de.',
    highlights: ['碧', '玉', '妆', '万', '垂', '裁', '春', '剪'],
  },
  // === 三年级 ===
  {
    id: 'fu-rong-luo-song-xin-jian',
    title: '芙蓉楼送辛渐',
    author: '王昌龄',
    dynasty: '唐',
    grade: 3,
    theme: '友情',
    lines: [
      { chars: '寒雨连江夜入吴，', pinyin: 'hán yǔ lián jiāng yè rù wú,' },
      { chars: '平明送客楚山孤。', pinyin: 'píng míng sòng kè chǔ shān gū.' },
      { chars: '洛阳亲友如相问，', pinyin: 'luò yáng qīn yǒu rú xiāng wèn,' },
      { chars: '一片冰心在玉壶。', pinyin: 'yī piàn bīng xīn zài yù hú.' },
    ],
    translation: '冷雨洒满江天的夜晚我来到吴地，天亮送走朋友只留下楚山的孤影。到了洛阳如果有亲友问起我的情况，就说我心像玉壶里的冰一样纯洁。',
    translationPinyin: 'lěng yǔ sǎ mǎn jiāng tiān de yè wǎn wǒ lái dào wú dì, tiān liàng sòng zǒu péng yǒu zhǐ liú xià chǔ shān de gū yǐng. dào le luò yáng rú guǒ yǒu qīn yǒu wèn qǐ wǒ de qíng kuàng, jiù shuō wǒ xīn xiàng yù hú lǐ de bīng yī yàng chún jié.',
    highlights: ['寒', '雨', '江', '孤', '洛', '亲', '冰', '心', '玉'],
  },
  {
    id: 'chun-ye-xi-yu',
    title: '春夜喜雨',
    author: '杜甫',
    dynasty: '唐',
    grade: 3,
    theme: '四季',
    lines: [
      { chars: '好雨知时节，', pinyin: 'hǎo yǔ zhī shí jié,' },
      { chars: '当春乃发生。', pinyin: 'dāng chūn nǎi fā shēng.' },
      { chars: '随风潜入夜，', pinyin: 'suí fēng qián rù yè,' },
      { chars: '润物细无声。', pinyin: 'rùn wù xì wú shēng.' },
    ],
    translation: '好雨知道下雨的时节，正当春天植物萌发生长的时候，它随着春风在夜里悄悄落下，无声地滋润着大地万物。',
    translationPinyin: 'hǎo yǔ zhī dào xià yǔ de shí jié, zhèng dāng chūn tiān zhí wù méng fā shēng zhǎng de shí hou, tā suí zhe chūn fēng zài yè lǐ qiāo qiāo luò xià, wú shēng de zī rùn zhe dà dì wàn wù.',
    highlights: ['雨', '时', '节', '春', '发', '风', '潜', '润', '细'],
  },
]

export function getPoemById(id: string): Poem | undefined {
  return POEMS.find(p => p.id === id)
}

export function getPoemsByGrade(grade: 1 | 2 | 3): Poem[] {
  return POEMS.filter(p => p.grade === grade)
}
