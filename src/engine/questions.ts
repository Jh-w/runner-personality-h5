// 8道测试题数据
// 每维度2题，采用生活化场景

import type { Question } from './types';

export const questions: Question[] = [
  // === 第1题 | 维度：社交风格 ===
  {
    id: 1,
    text: '周末你计划跑一个10公里，你更倾向于？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '🐺', text: '一个人，戴上降噪耳机，10公里是我和世界的安全距离', score: 0 },
      { id: 'B', emoji: '👥', text: '约上跑团三五个搭子，边跑边聊八卦，跑完再约个Brunch', score: 1 },
      { id: 'C', emoji: '📱', text: '一个人跑，但开着跑步App和网友「云陪跑」，配速较劲不能输', score: 0 },
      { id: 'D', emoji: '🤷', text: '看状态：状态好就摇人，状态差就一个人默默跑，不勉强', score: 0 },
    ],
  },

  // === 第2题 | 维度：装备态度 ===
  {
    id: 2,
    text: '路过一家跑步装备店，你的本能反应是？',
    dimension: 'equipment',
    options: [
      { id: 'A', emoji: '🛍️', text: '腿不受控制走进去，每一双新鞋都要摸一摸，至少逛半小时', score: 1 },
      { id: 'B', emoji: '🚶', text: '目不斜视走过去——脚上这双减震快磨平了，但还能再撑200公里', score: 0 },
      { id: 'C', emoji: '🎯', text: '精准定位目标商品，试穿、付款、走人，全程不超过8分钟', score: 0 },
      { id: 'D', emoji: '👀', text: '站在橱窗外看两眼新品，打开手机搜同款，然后打开闲鱼', score: 1 },
    ],
  },

  // === 第3题 | 维度：跑步动机 ===
  {
    id: 3,
    text: '你报名了一场两个月后的半马比赛，赛前你脑子里想得最多的是？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '🏅', text: '这次PB稳不稳？配速策略已经算了三版，目标配速4\'50"', score: 1 },
      { id: 'B', emoji: '🎒', text: '终于有个理由去那座城市了！跑完去哪吃、去哪逛已经安排好了', score: 0 },
      { id: 'C', emoji: '📸', text: '完赛奖牌长什么样？参赛服好不好看？赛后照片能不能出片？', score: 0 },
      { id: 'D', emoji: '😰', text: '两个月能练出来吗？现在开始临时抱佛脚还来得及吗？', score: 1 },
    ],
  },

  // === 第4题 | 维度：计划方式 ===
  {
    id: 4,
    text: '关于跑步计划，下面哪句话最像你？',
    dimension: 'planning',
    options: [
      { id: 'A', emoji: '📋', text: '每周日晚是我的「排课时间」，下周每天跑什么、跑多少、什么配速，清清楚楚', score: 1 },
      { id: 'B', emoji: '🌊', text: '跑步需要计划吗？天气好+心情好+有时间=跑！三个条件凑齐两个就出发', score: 0 },
      { id: 'C', emoji: '🎯', text: '有大目标（月跑量100K），但具体哪天跑看那天的会议结束时间', score: 1 },
      { id: 'D', emoji: '⏰', text: '本来不跑，但报名了比赛→Deadline是第一生产力→赛前两周疯狂堆跑量', score: 0 },
    ],
  },

  // === 第5题 | 维度：跑步动机 ===
  {
    id: 5,
    text: '跑完步，你做的第一件事是什么？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '📊', text: '立刻看手表：配速、心率、步频、最大摄氧量……数据分析时间到', score: 1 },
      { id: 'B', emoji: '🌅', text: '停下来拍张照——今天的云/树/路/光太好了，必须记录下来', score: 0 },
      { id: 'C', emoji: '☕', text: '找个地方坐下，拉伸+喝水+发呆，享受跑完的放空感', score: 0 },
      { id: 'D', emoji: '📈', text: '打开App对比：同样的路线上次跑了多少？进步了还是退步了？', score: 1 },
    ],
  },

  // === 第6题 | 维度：社交风格 ===
  {
    id: 6,
    text: '跑团群里有人发「明早6点滨江约跑，来的扣1」，你？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '⚡', text: '秒回「11111」，然后打开天气App确认明天穿哪套', score: 1 },
      { id: 'B', emoji: '👻', text: '已读不回。6点太早了，我还是下午一个人去吧', score: 0 },
      { id: 'C', emoji: '🤔', text: '先看都有谁扣1了——有想见的人就去，没有就装死', score: 1 },
      { id: 'D', emoji: '💬', text: '回复「下次一定！」配上😭表情，然后继续按自己的计划跑', score: 0 },
    ],
  },

  // === 第7题 | 维度：装备态度 ===
  {
    id: 7,
    text: '一个刚入门跑步的朋友问你「跑步需要买什么」，你会说？',
    dimension: 'equipment',
    options: [
      { id: 'A', emoji: '📝', text: '「你先别跑。压缩裤要分冬夏，跑鞋至少两双轮换，手表我推荐……等我拉个清单」', score: 1 },
      { id: 'B', emoji: '👟', text: '「一双舒服的跑鞋就够了，其他都是消费主义陷阱。先跑起来再说。」', score: 0 },
      { id: 'C', emoji: '💰', text: '「看你预算。预算够就上全套少走弯路，不够就一双入门鞋先坚持一个月」', score: 1 },
      { id: 'D', emoji: '🏃', text: '「先别管装备，你先能坚持跑一个月再问我这个问题」', score: 0 },
    ],
  },

  // === 第8题 | 维度：计划方式 ===
  {
    id: 8,
    text: '手表弹出「今日建议休息」，但你本来计划今天要跑，你？',
    dimension: 'planning',
    options: [
      { id: 'A', emoji: '✅', text: '按手表来。恢复也是训练的一部分，课表不能乱', score: 1 },
      { id: 'B', emoji: '🙄', text: '「手表懂什么？」关了提醒出门就跑，身体自己最清楚', score: 0 },
      { id: 'C', emoji: '🤔', text: '评估一下：腿不酸就出去跑个短的，腿酸就听手表的', score: 1 },
      { id: 'D', emoji: '🎉', text: '太好了！正不想跑，手表给了我完美的偷懒理由', score: 0 },
    ],
  },
];

/** 题号→维度映射 */
export const questionDimensionMap: Record<number, 'social' | 'equipment' | 'motivation' | 'planning'> = {
  1: 'social',
  2: 'equipment',
  3: 'motivation',
  4: 'planning',
  5: 'motivation',
  6: 'social',
  7: 'equipment',
  8: 'planning',
};
