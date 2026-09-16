// 摘星卡数据入口。generated 文件由脚本产出，reviewed 状态由教师眼审后手工翻转。
import { starCards } from './cards.generated'
import type { StarCard, StarItem } from './types'

export { starCards }
export type { StarCard, StarItem, StarSection, StarItemKind } from './types'

/** 按摘星卡课次（1..14）取卡 */
export function cardByLesson(lesson: number): StarCard | undefined {
  return starCards.find(c => c.lesson === lesson)
}

/** 卡内所有可点读条目（含其区块/条目序号），整课连读与进度统计共用 */
export interface FlatItem {
  sectionIndex: number
  itemIndex: number
  item: StarItem
}

export function flatReadableItems(card: StarCard): FlatItem[] {
  const out: FlatItem[] = []
  card.sections.forEach((s, si) => {
    s.items.forEach((item, ii) => {
      if (item.kind !== 'text') out.push({ sectionIndex: si, itemIndex: ii, item })
    })
  })
  return out
}
