// 人教版（一年级起点）新起点英语 一年级上/下册
// 内容严格对齐课本：词汇=附录二单元词汇表，句子=各单元课文对话/指令/常用语表
// 教材铁律：不自编，不声称对齐；课本原句原词。

export interface EnWord {
  en: string
  zh: string
  /** 无贴切 emoji 的词留空 → 文字卡；练一练只对有图的词出「听音选图」 */
  emoji?: string
}

export interface EnSentence {
  en: string
  zh: string
}

export interface EnUnit {
  id: string
  book: '1a' | '1b' // 一年级上 / 下
  label: string // 'Starter' | 'Unit 1' | 'Revision 1'
  title: string // 英文主题词（Starter/Revision 为空）
  titleZh: string
  emoji: string
  words: EnWord[]
  sentences: EnSentence[]
}

export const BOOKS: Record<'1a' | '1b', { name: string; short: string; emoji: string }> = {
  '1a': { name: '一年级上册', short: '上册', emoji: '📘' },
  '1b': { name: '一年级下册', short: '下册', emoji: '📗' },
}

export const UNITS: EnUnit[] = [
  // ================= 一年级上册 =================
  {
    id: 's1a', book: '1a', label: 'Starter', title: '', titleZh: '开学问候', emoji: '👋',
    words: [],
    sentences: [
      { en: 'Good morning!', zh: '早上好！' },
      { en: 'Good afternoon!', zh: '下午好！' },
      { en: 'Hello!', zh: '你好！' },
      { en: 'Hi!', zh: '你好！' },
      { en: "I'm Miss Wu.", zh: '我是吴老师。' },
      { en: "What's your name?", zh: '你叫什么名字？' },
      { en: 'My name is Bill.', zh: '我叫比尔。' },
      { en: 'Bye!', zh: '再见！' },
      { en: 'Goodbye!', zh: '再见！' },
    ],
  },
  {
    id: 'b1a1', book: '1a', label: 'Unit 1', title: 'School', titleZh: '学校', emoji: '🏫',
    words: [
      { en: 'book', zh: '书，书本', emoji: '📖' },
      { en: 'ruler', zh: '尺子', emoji: '📏' },
      { en: 'pencil', zh: '铅笔', emoji: '✏️' },
      { en: 'schoolbag', zh: '书包', emoji: '🎒' },
      { en: 'teacher', zh: '教师', emoji: '👩‍🏫' },
      { en: 'I', zh: '我' },
      { en: 'have', zh: '有' },
      { en: 'a/an', zh: '一（个）' },
    ],
    sentences: [
      { en: 'I have a ruler.', zh: '我有一把尺子。' },
      { en: 'I have a pencil.', zh: '我有一支铅笔。' },
      { en: 'I have a book.', zh: '我有一本书。' },
      { en: 'I have a schoolbag.', zh: '我有一个书包。' },
      { en: 'Stand up, Joy.', zh: '乔伊，请起立。' },
      { en: 'Sit down, please.', zh: '请坐下。' },
      { en: 'Show me your pencil.', zh: '出示你的铅笔。' },
      { en: 'Close your eyes.', zh: '闭上眼睛。' },
      { en: 'Open your eyes.', zh: '睁开眼睛。' },
      { en: "What's missing?", zh: '什么东西不见了？' },
      { en: 'Good night!', zh: '晚安！' },
    ],
  },
  {
    id: 'b1a2', book: '1a', label: 'Unit 2', title: 'Face', titleZh: '脸', emoji: '😀',
    words: [
      { en: 'face', zh: '脸', emoji: '😀' },
      { en: 'ear', zh: '耳朵', emoji: '👂' },
      { en: 'eye', zh: '眼睛', emoji: '👁️' },
      { en: 'nose', zh: '鼻子', emoji: '👃' },
      { en: 'mouth', zh: '嘴巴', emoji: '👄' },
      { en: 'this', zh: '这（个）' },
      { en: 'is', zh: '是' },
      { en: 'my', zh: '我的' },
    ],
    sentences: [
      { en: 'This is my mouth.', zh: '这是我的嘴巴。' },
      { en: 'This is my nose.', zh: '这是我的鼻子。' },
      { en: 'This is my ear.', zh: '这是我的耳朵。' },
      { en: 'This is my eye.', zh: '这是我的眼睛。' },
      { en: 'This is my face.', zh: '这是我的脸。' },
      { en: 'Touch your ear.', zh: '摸摸你的耳朵。' },
      { en: 'Touch your mouth.', zh: '摸摸你的嘴巴。' },
      { en: 'Touch your nose.', zh: '摸摸你的鼻子。' },
      { en: 'Touch your face.', zh: '摸摸你的脸。' },
      { en: 'I have no tail.', zh: '我没有尾巴。' },
    ],
  },
  {
    id: 'b1a3', book: '1a', label: 'Unit 3', title: 'Animals', titleZh: '动物', emoji: '🐾',
    words: [
      { en: 'dog', zh: '狗', emoji: '🐶' },
      { en: 'bird', zh: '鸟', emoji: '🐦' },
      { en: 'tiger', zh: '老虎', emoji: '🐯' },
      { en: 'monkey', zh: '猴子', emoji: '🐵' },
      { en: 'cat', zh: '猫', emoji: '🐱' },
      { en: 'what', zh: '什么' },
      { en: 'it', zh: '它' },
    ],
    sentences: [
      { en: "What's this?", zh: '这是什么？' },
      { en: "It's a tiger.", zh: '这是一只老虎。' },
      { en: "It's a dog.", zh: '这是一只狗。' },
      { en: 'Act like a monkey.', zh: '模仿猴子动作。' },
      { en: 'Act like a bird.', zh: '模仿小鸟动作。' },
      { en: 'Act like a cat.', zh: '模仿小猫动作。' },
      { en: 'Touch your tail.', zh: '摸摸你的尾巴。' },
    ],
  },
  {
    id: 'b1a4', book: '1a', label: 'Unit 4', title: 'Numbers', titleZh: '数字', emoji: '🔢',
    words: [
      { en: 'one', zh: '一', emoji: '1️⃣' },
      { en: 'two', zh: '二', emoji: '2️⃣' },
      { en: 'three', zh: '三', emoji: '3️⃣' },
      { en: 'four', zh: '四', emoji: '4️⃣' },
      { en: 'five', zh: '五', emoji: '5️⃣' },
      { en: 'six', zh: '六', emoji: '6️⃣' },
      { en: 'seven', zh: '七', emoji: '7️⃣' },
      { en: 'eight', zh: '八', emoji: '8️⃣' },
      { en: 'nine', zh: '九', emoji: '9️⃣' },
      { en: 'ten', zh: '十', emoji: '🔟' },
      { en: 'how', zh: '多少' },
      { en: 'many', zh: '多的，许多的' },
    ],
    sentences: [
      { en: 'How many tigers are there?', zh: '那里有几只老虎？' },
      { en: 'How many birds are there?', zh: '那里有几只鸟？' },
      { en: 'How many dogs are there?', zh: '那里有几只狗？' },
      { en: 'Five.', zh: '五只。' },
      { en: 'Six.', zh: '六只。' },
      { en: 'Nine.', zh: '九只。' },
      { en: 'Show me five.', zh: '出示"5"。' },
      { en: 'One, two, three...', zh: '一、二、三……' },
      { en: "Let's share!", zh: '我们一起分享吧！' },
      { en: 'One for Joy and one for me.', zh: '一个给乔伊，一个给我。' },
      { en: 'Thank you!', zh: '谢谢你！' },
    ],
  },
  {
    id: 'b1a5', book: '1a', label: 'Unit 5', title: 'Colours', titleZh: '颜色', emoji: '🎨',
    words: [
      { en: 'black', zh: '黑色；黑色的', emoji: '⚫' },
      { en: 'yellow', zh: '黄色；黄色的', emoji: '💛' },
      { en: 'blue', zh: '蓝色；蓝色的', emoji: '💙' },
      { en: 'red', zh: '红色；红色的', emoji: '❤️' },
      { en: 'green', zh: '绿色；绿色的', emoji: '💚' },
      { en: 'colour', zh: '颜色' },
    ],
    sentences: [
      { en: 'What colour is it?', zh: '它是什么颜色？' },
      { en: "It's yellow.", zh: '它是黄色的。' },
      { en: "It's black.", zh: '它是黑色的。' },
      { en: 'Show me red.', zh: '出示红色的东西。' },
      { en: 'Oh, a bird!', zh: '啊，一只鸟！' },
      { en: 'Guess!', zh: '猜一猜！' },
      { en: 'A red balloon, please.', zh: '请给我一个红气球。' },
      { en: 'Wow! Balloons!', zh: '哇！好多气球！' },
    ],
  },
  {
    id: 'b1a6', book: '1a', label: 'Unit 6', title: 'Fruit', titleZh: '水果', emoji: '🍎',
    words: [
      { en: 'apple', zh: '苹果', emoji: '🍎' },
      { en: 'pear', zh: '梨', emoji: '🍐' },
      { en: 'banana', zh: '香蕉', emoji: '🍌' },
      { en: 'orange', zh: '柑橘；橙', emoji: '🍊' },
      { en: 'do', zh: '（助动词）' },
      { en: 'you', zh: '你；你们' },
      { en: 'like', zh: '喜欢，喜爱' },
      { en: 'yes', zh: '是，是的' },
      { en: 'no', zh: '不，不是' },
    ],
    sentences: [
      { en: 'Do you like bananas?', zh: '你喜欢香蕉吗？' },
      { en: 'Do you like pears?', zh: '你喜欢梨吗？' },
      { en: 'Do you like apples?', zh: '你喜欢苹果吗？' },
      { en: 'Do you like fish?', zh: '你喜欢鱼吗？' },
      { en: 'Yes, I do.', zh: '是的，我喜欢。' },
      { en: "No, I don't.", zh: '不，我不喜欢。' },
      { en: 'Show me an apple.', zh: '出示苹果。' },
      { en: 'Choose a number, please.', zh: '请选一个数字。' },
      { en: 'A gift for you.', zh: '送你一个礼物。' },
      { en: 'What is it?', zh: '它是什么？' },
      { en: 'Oh no, a fish!', zh: '哎呀，一条鱼！' },
    ],
  },
  {
    id: 'b1ar1', book: '1a', label: 'Revision 1', title: '', titleZh: '复习一（U1–U3）', emoji: '⭐',
    words: [],
    sentences: [
      { en: 'I have a ...', zh: '我有一个……（说文具）' },
      { en: 'This is my ...', zh: '这是我的……（说五官）' },
      { en: "What's this?", zh: '这是什么？' },
      { en: "It's a ...", zh: '它是一只……（说动物）' },
    ],
  },
  {
    id: 'b1ar2', book: '1a', label: 'Revision 2', title: '', titleZh: '复习二（U4–U6）', emoji: '🌟',
    words: [],
    sentences: [
      { en: 'How many ... are there?', zh: '那里有几个……？' },
      { en: 'What colour is it?', zh: '它是什么颜色？' },
      { en: 'Do you like ...?', zh: '你喜欢……吗？' },
      { en: 'Yes, I do. / No, I don\u2019t.', zh: '是的，我喜欢。/ 不，我不喜欢。' },
    ],
  },

  // ================= 一年级下册 =================
  {
    id: 'b1b1', book: '1b', label: 'Unit 1', title: 'Classroom', titleZh: '教室', emoji: '🪑',
    words: [
      { en: 'chair', zh: '椅子', emoji: '🪑' },
      { en: 'desk', zh: '书桌，写字台' },
      { en: 'blackboard', zh: '黑板' },
      { en: 'on', zh: '在……上' },
      { en: 'under', zh: '在……下面' },
      { en: 'in', zh: '在……里面' },
      { en: 'where', zh: '在哪里' },
      { en: 'the', zh: '放在名词前，特指人、事或物' },
    ],
    sentences: [
      { en: 'Where is the ruler?', zh: '尺子在哪里？' },
      { en: 'Where is the book?', zh: '书在哪里？' },
      { en: "It's on the desk.", zh: '它在书桌上。' },
      { en: 'Put your schoolbag under the chair.', zh: '把书包放到椅子下面。' },
      { en: 'Put your schoolbag on the chair.', zh: '把书包放到椅子上面。' },
      { en: 'Where is my pencil box?', zh: '我的铅笔盒在哪里？' },
      { en: 'Where is the apple?', zh: '苹果在哪里？' },
    ],
  },
  {
    id: 'b1b2', book: '1b', label: 'Unit 2', title: 'Room', titleZh: '房间', emoji: '🛏️',
    words: [
      { en: 'light', zh: '灯', emoji: '💡' },
      { en: 'bed', zh: '床', emoji: '🛏️' },
      { en: 'door', zh: '门；出入口', emoji: '🚪' },
      { en: 'box', zh: '箱子；盒子', emoji: '📦' },
      { en: 'near', zh: '靠近，接近' },
      { en: 'behind', zh: '在……背后' },
    ],
    sentences: [
      { en: "What's behind the door?", zh: '门后面是什么？' },
      { en: "What's under the desk?", zh: '书桌下面是什么？' },
      { en: "What's near the light?", zh: '灯旁边是什么？' },
      { en: 'A chair.', zh: '一把椅子。' },
      { en: 'A bird.', zh: '一只鸟。' },
      { en: 'I have a gift for you.', zh: '我有一份礼物送给你。' },
      { en: 'Go and find it.', zh: '去找找它吧。' },
      { en: 'Near the light?', zh: '在灯旁边吗？' },
      { en: 'On the desk?', zh: '在书桌上吗？' },
      { en: 'On the bed?', zh: '在床上吗？' },
      { en: 'Under the chair?', zh: '在椅子下面吗？' },
      { en: "Yeah! It's under the chair!", zh: '耶！它在椅子下面！' },
      { en: 'Thank you, Mum.', zh: '谢谢妈妈。' },
    ],
  },
  {
    id: 'b1b3', book: '1b', label: 'Unit 3', title: 'Toys', titleZh: '玩具', emoji: '🧸',
    words: [
      { en: 'plane', zh: '飞机', emoji: '✈️' },
      { en: 'ball', zh: '球', emoji: '⚽' },
      { en: 'doll', zh: '玩偶，玩具娃娃', emoji: '🪆' },
      { en: 'train', zh: '列车，火车', emoji: '🚂' },
      { en: 'car', zh: '小汽车，轿车', emoji: '🚗' },
      { en: 'bear', zh: '玩具熊；熊', emoji: '🧸' },
      { en: 'can', zh: '可以；能够' },
      { en: 'sure', zh: '当然' },
      { en: 'sorry', zh: '对不起，抱歉' },
    ],
    sentences: [
      { en: 'Can I have a car?', zh: '我能要一辆小汽车吗？' },
      { en: 'Can I have a bear?', zh: '我能要一只玩具熊吗？' },
      { en: 'Can I have a doll?', zh: '我能要一个玩偶吗？' },
      { en: 'Can I have a ball?', zh: '我能要一个球吗？' },
      { en: 'Sure. Here you are.', zh: '当然。给你。' },
      { en: 'Sorry, no.', zh: '抱歉，不行。' },
      { en: 'I have many toys.', zh: '我有许多玩具。' },
      { en: 'Can I have your plane?', zh: '我能玩一下你的飞机吗？' },
      { en: 'Oh, I have two.', zh: '啊，我有两个……了。' },
    ],
  },
  {
    id: 'b1b4', book: '1b', label: 'Unit 4', title: 'Food', titleZh: '食物', emoji: '🍚',
    words: [
      { en: 'rice', zh: '米饭；米', emoji: '🍚' },
      { en: 'noodles', zh: '面条', emoji: '🍜' },
      { en: 'vegetable', zh: '蔬菜', emoji: '🥦' },
      { en: 'fish', zh: '鱼肉；鱼', emoji: '🐟' },
      { en: 'chicken', zh: '鸡肉；鸡', emoji: '🍗' },
      { en: 'egg', zh: '鸡蛋', emoji: '🥚' },
      { en: 'hungry', zh: '饥饿的' },
      { en: 'want', zh: '要；想要' },
      { en: 'and', zh: '和' },
    ],
    sentences: [
      { en: "I'm hungry.", zh: '我饿了。' },
      { en: 'I want rice and vegetables.', zh: '我想要米饭和蔬菜。' },
      { en: 'I want noodles.', zh: '我想要面条。' },
      { en: 'Here you are.', zh: '给你。' },
      { en: 'Do you like fish?', zh: '你喜欢鱼吗？' },
      { en: "No, I don't.", zh: '不，我不喜欢。' },
      { en: "Hi, I'm a cat.", zh: '嗨，我是一只猫。（角色扮演）' },
      { en: "I'm hungry. I want fish.", zh: '我饿了。我想要鱼。' },
    ],
  },
  {
    id: 'b1b5', book: '1b', label: 'Unit 5', title: 'Drink', titleZh: '饮品', emoji: '🧃',
    words: [
      { en: 'juice', zh: '果汁；蔬菜汁', emoji: '🧃' },
      { en: 'tea', zh: '茶；茶叶', emoji: '🍵' },
      { en: 'milk', zh: '奶；牛奶', emoji: '🥛' },
      { en: 'water', zh: '水', emoji: '💧' },
      { en: 'thirsty', zh: '口渴的' },
      { en: 'thanks', zh: '感谢' },
    ],
    sentences: [
      { en: "I'm thirsty.", zh: '我渴了。' },
      { en: 'Do you want tea?', zh: '你想喝茶吗？' },
      { en: 'Do you want water?', zh: '你想喝水吗？' },
      { en: 'Do you want juice?', zh: '你想喝果汁吗？' },
      { en: 'Yes, please.', zh: '好的，谢谢。' },
      { en: 'Yes, thanks.', zh: '好的，谢谢。' },
      { en: 'No, thanks. I want juice.', zh: '不用了，谢谢。我想喝果汁。' },
      { en: 'No, thanks. I want water.', zh: '不用了，谢谢。我想喝水。' },
      { en: 'Can I have juice?', zh: '我能要果汁吗？' },
      { en: 'Do you want chicken?', zh: '你想吃鸡肉吗？' },
      { en: 'No, thanks. I want fish.', zh: '不用了，谢谢。我想吃鱼。' },
    ],
  },
  {
    id: 'b1b6', book: '1b', label: 'Unit 6', title: 'Clothes', titleZh: '衣服', emoji: '👕',
    words: [
      { en: 'shirt', zh: '衬衫', emoji: '👔' },
      { en: 'T-shirt', zh: 'T恤衫', emoji: '👕' },
      { en: 'skirt', zh: '裙子' },
      { en: 'dress', zh: '连衣裙；套裙' },
      { en: 'socks', zh: '短袜', emoji: '🧦' },
      { en: 'shorts', zh: '短裤', emoji: '🩳' },
      { en: 'your', zh: '你的；你们的' },
    ],
    sentences: [
      { en: 'I like your skirt.', zh: '我喜欢你的裙子。' },
      { en: 'I like your T-shirt.', zh: '我喜欢你的T恤。' },
      { en: 'Thank you.', zh: '谢谢你。' },
      { en: 'Put on your socks.', zh: '穿上你的袜子。' },
      { en: 'Put on your shirt.', zh: '穿上你的衬衫。' },
      { en: 'Look at my dress.', zh: '看看我的连衣裙。' },
      { en: 'I like your dress.', zh: '我喜欢你的连衣裙。' },
      { en: "Look at my shirt. It's blue.", zh: '看看我的衬衫。它是蓝色的。' },
    ],
  },
  {
    id: 'b1br1', book: '1b', label: 'Revision 1', title: '', titleZh: '复习一（U1–U3）', emoji: '⭐',
    words: [],
    sentences: [
      { en: 'Where is the ...?', zh: '……在哪里？' },
      { en: "It's on / under / in the ...", zh: '它在……上/下/里面。' },
      { en: 'Can I have a ...?', zh: '我能要一个……吗？' },
      { en: 'Sure. Here you are.', zh: '当然。给你。' },
    ],
  },
  {
    id: 'b1br2', book: '1b', label: 'Revision 2', title: '', titleZh: '复习二（U4–U6）', emoji: '🌟',
    words: [],
    sentences: [
      { en: "I'm hungry / thirsty.", zh: '我饿了 / 我渴了。' },
      { en: 'I want ...', zh: '我想要……' },
      { en: 'Do you want ...?', zh: '你想要……吗？' },
      { en: 'I like your ...', zh: '我喜欢你的……' },
    ],
  },
]

export const unitById = (id: string) => UNITS.find((u) => u.id === id)
