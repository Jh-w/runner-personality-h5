// 风味标签系统 — v4.2.5 PRD §2.3 + §4.5
// 3个风味维度独立判定，不影响32型分类
// 由第2、10、13题（风味题）选项决定

import type { Answer } from './types';

// ─── 风味维度类型 ──────────────────────────────────────

export type FlavorDimension = 'time' | 'injury' | 'diet';

/** 时间偏好 */
export type TimeFlavor = '晨型' | '夜型' | '周末型' | '随机型';
/** 伤痛态度 */
export type InjuryFlavor = '保养型' | '硬扛型' | '佛系型' | '求关注型';
/** 饮食关系 */
export type DietFlavor = '自律型' | '奖励型' | '社交型' | '记录型';

export interface FlavorResult {
  time: TimeFlavor;
  injury: InjuryFlavor;
  diet: DietFlavor;
}

export interface FlavorCard {
  emoji: string;
  title: string;
  subtitle: string;
  body: string;
}

// ─── 风味判定（基于答案选项ID）─────────────────────────

/** Q2: 时间偏好 */
const TIME_MAP: Record<string, TimeFlavor> = {
  A: '晨型',
  B: '夜型',
  C: '周末型',
  D: '随机型',
};

/** Q10: 伤痛态度 */
const INJURY_MAP: Record<string, InjuryFlavor> = {
  A: '保养型',
  B: '硬扛型',
  C: '佛系型',
  D: '求关注型',
};

/** Q13: 饮食关系 */
const DIET_MAP: Record<string, DietFlavor> = {
  A: '自律型',
  B: '奖励型',
  C: '社交型',
  D: '记录型',
};

// ─── 12条风味文案 ──────────────────────────────────────

const TIME_CARDS: Record<TimeFlavor, FlavorCard> = {
  '晨型': {
    emoji: '🌅',
    title: '你的黄金跑道时刻：凌晨',
    subtitle: '晨型跑者',
    body: '当城市还在沉睡，你已经在路上。5点的空气有自由的味道——这是独属于你的秘密。',
  },
  '夜型': {
    emoji: '🌙',
    title: '你的黄金跑道时刻：夜晚',
    subtitle: '夜型跑者',
    body: '白天属于世界，夜晚才属于你。路灯下的影子拉长又缩短——夜风是最好的解药。',
  },
  '周末型': {
    emoji: '☀️',
    title: '你的黄金跑道时刻：周末',
    subtitle: '周末型跑者',
    body: '平日是生存，周末是生活。阳光正好的上午，约上跑友——这才是跑步的正确打开方式。',
  },
  '随机型': {
    emoji: '🎲',
    title: '你的黄金跑道时刻：随缘',
    subtitle: '随机型跑者',
    body: '没有固定时间——但每一刻都是最好的时间。想跑就跑，不想跑就躺。自由是你的时区。',
  },
};

const INJURY_CARDS: Record<InjuryFlavor, FlavorCard> = {
  '保养型': {
    emoji: '🩹',
    title: '伤病预警：你是理智派',
    subtitle: '保养型跑者',
    body: '「恢复也是训练的一部分」——这句话你已经刻在心里了。受伤就停、康复再跑。你能跑得最久。',
  },
  '硬扛型': {
    emoji: '🏃',
    title: '伤病预警：你是硬扛派',
    subtitle: '硬扛型跑者',
    body: '「轻伤不下火线」——请记住：伤病不会因为你的意志力而消失。偶尔停下不是放弃，是更远的策略。',
  },
  '佛系型': {
    emoji: '🎉',
    title: '伤病预警：你是休息派',
    subtitle: '佛系型跑者',
    body: '受伤=名正言顺休息。但别休息太久——肌肉的记忆力比你以为的短。',
  },
  '求关注型': {
    emoji: '📱',
    title: '伤病预警：你是分享派',
    subtitle: '求关注型跑者',
    body: '受伤了先发朋友圈——没关系，跑圈的关怀是真实的热量。但别忘了发完之后真的去康复。',
  },
};

const DIET_CARDS: Record<DietFlavor, FlavorCard> = {
  '自律型': {
    emoji: '🥗',
    title: '跑后补给风格：自律狂',
    subtitle: '自律型跑者',
    body: '跑完也要管住嘴——鸡胸肉+西兰花是你对跑步的尊重。吃进去的每一卡路里都要对得起刚才的每一公里。',
  },
  '奖励型': {
    emoji: '🍜',
    title: '跑后补给风格：碳水战士',
    subtitle: '奖励型跑者',
    body: '跑步就是为了吃！拉面+炒饭+甜品——刚才消耗的卡路里？那是我提前预支的美食额度。',
  },
  '社交型': {
    emoji: '🍻',
    title: '跑后补给风格：聚餐为王',
    subtitle: '社交型跑者',
    body: '跑步只是前菜，聚餐才是主菜。吃什么不重要——跟谁吃、聊什么、笑多久才重要。',
  },
  '记录型': {
    emoji: '📸',
    title: '跑后补给风格：先拍为敬',
    subtitle: '记录型跑者',
    body: '菜上来了先拍——这桌美食必须配上今天的配速截图一起发。跑步和美食，都是你的内容素材。',
  },
};

// ─── 公开 API ──────────────────────────────────────────

/** 从答案中提取风味标签（仅处理Q2, Q10, Q13） */
export function calculateFlavor(answers: Answer[]): FlavorResult {
  const result: FlavorResult = {
    time: '随机型',
    injury: '佛系型',
    diet: '自律型',
  };

  for (const answer of answers) {
    switch (answer.questionId) {
      case 2:
        result.time = TIME_MAP[answer.optionId] || '随机型';
        break;
      case 10:
        result.injury = INJURY_MAP[answer.optionId] || '佛系型';
        break;
      case 13:
        result.diet = DIET_MAP[answer.optionId] || '自律型';
        break;
    }
  }

  return result;
}

/** 获取时间偏好风味卡片 */
export function getTimeFlavorCard(flavor: TimeFlavor): FlavorCard {
  return TIME_CARDS[flavor];
}

/** 获取伤痛态度风味卡片 */
export function getInjuryFlavorCard(flavor: InjuryFlavor): FlavorCard {
  return INJURY_CARDS[flavor];
}

/** 获取饮食关系风味卡片 */
export function getDietFlavorCard(flavor: DietFlavor): FlavorCard {
  return DIET_CARDS[flavor];
}

/** 获取全部风味卡片 */
export function getAllFlavorCards(result: FlavorResult): { time: FlavorCard; injury: FlavorCard; diet: FlavorCard } {
  return {
    time: getTimeFlavorCard(result.time),
    injury: getInjuryFlavorCard(result.injury),
    diet: getDietFlavorCard(result.diet),
  };
}
