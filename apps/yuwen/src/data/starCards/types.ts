// 拼音摘星卡数据类型。
// 数据来源：教师原件 2026摘星卡.docx，经 scripts/extract-star-cards.py 机械提取，
// 必须教师逐课眼审（拼音/声调/☆数）后才能视为定稿。

export type StarItemKind = 'py' | 'hz' | 'text'

/** 一个可点读单元：py=拼音词（tokens 为音节，连读）；hz=汉字词；text=不发音文本 */
export interface StarItem {
  kind: StarItemKind
  tokens: string[]
  /** 对比组（比一比）：true 时 UI 用「A—B」并排样式 */
  pair?: boolean
}

export interface StarSection {
  name: string
  /** 卡面声明的本区块☆数（评分用，可能与条目数口径不同） */
  declaredStars: number | null
  items: StarItem[]
}

export interface StarCard {
  /** app 内课程 id（L01..L13，y w 为 L08Y），用于关联现有课程/音频体系 */
  id: string
  /** 摘星卡课次 1..14 */
  lesson: number
  title: string
  totalStars: number | null
  sections: StarSection[]
  /** 不发音的提示：拼音秘诀、背诵儿歌、签名/熟练程度行等 */
  notes: string[]
}
