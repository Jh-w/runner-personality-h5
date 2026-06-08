// 12道测试题数据 — PRD v3.3-Phase3
// 新四维框架: motivation(1-3) / social(3-6) / style(5-8) / ritual(7-12)
// 每维度3题(2正向 + 1反向验证)，每题4选项，dimensionScore: ±1 (强倾向) / ±0.5 (弱倾向)

import type { Question, Dimension } from './types';

export const questions: Question[] = [
  // ═══ Q1 | 维度: motivation (C=竞技 vs E=体验) ═══
  {
    id: 1,
    text: 'Runkeeper 提示你「本周跑量低于上周」，你的第一反应是？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '📅', text: '打开日历找时间补跑，不能让曲线掉下来', dimensionScore: -1 },
      { id: 'B', emoji: '😌', text: '看了3秒，然后关掉，该吃吃该喝喝', dimensionScore: 0.5 },
      { id: 'C', emoji: '📱', text: '截图发跑团群：「兄弟们这周卷不动了」', dimensionScore: -0.5 },
      { id: 'D', emoji: '🗑️', text: '已经卸载Runkeeper了，数据焦虑不存在的', dimensionScore: 1 },
    ],
  },

  // ═══ Q2 | 维度: motivation (C=竞技 vs E=体验) ═══
  {
    id: 2,
    text: '比赛最后2公里，前面有一个你认识但不太熟的跑友，你会？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '💨', text: '加速超过去，然后假装不经意地说「嘿刚才没看到你」', dimensionScore: -1 },
      { id: 'B', emoji: '🎯', text: '保持自己节奏，终点线就是终点线', dimensionScore: 0.5 },
      { id: 'C', emoji: '💬', text: '追上去一起跑，聊两句', dimensionScore: 0.5 },
      { id: 'D', emoji: '🚶', text: '走走跑跑，反正都到终点了', dimensionScore: 1 },
    ],
  },

  // ═══ Q3 | 维度: social (S=独狼 vs G=社群) ═══
  {
    id: 3,
    text: '周日早上6:30，跑团团长的@所有人消息响了，你？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '⚡', text: '秒回「我来」，已经在穿鞋了', dimensionScore: 1 },
      { id: 'B', emoji: '🐺', text: '看到但不回，自己去跑，路线更自由', dimensionScore: -1 },
      { id: 'C', emoji: '🤔', text: '看心情，如果路线满意就去', dimensionScore: 0.5 },
      { id: 'D', emoji: '🔕', text: '开免打扰，周日早上是神圣的独跑时间', dimensionScore: -1 },
    ],
  },

  // ═══ Q4 | 维度: social (S=独狼 vs G=社群) ═══
  {
    id: 4,
    text: '跑完步拉伸的时候，你最喜欢？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '🗣️', text: '和跑友聊天，互相吐槽刚才谁崩了', dimensionScore: 1 },
      { id: 'B', emoji: '📊', text: '掏出手机看数据，配速、心率、步频逐一复盘', dimensionScore: -0.5 },
      { id: 'C', emoji: '📸', text: '拍照/拍视频，准备发小红书或朋友圈', dimensionScore: 0.5 },
      { id: 'D', emoji: '🧘', text: '一个人安静坐着，感受多巴胺', dimensionScore: -1 },
    ],
  },

  // ═══ Q5 | 维度: style (D=计划 vs P=随性) ═══
  {
    id: 5,
    text: '明天要跑步，你今晚的状态是？',
    dimension: 'style',
    options: [
      { id: 'A', emoji: '🎖️', text: '装备已经摆好：衣服、袜子、能量胶、号码簿，像军训查寝一样整齐', dimensionScore: -1 },
      { id: 'B', emoji: '🧠', text: '路线已经在脑中跑了一遍，包括哪段加速哪段放松', dimensionScore: -0.5 },
      { id: 'C', emoji: '🤷', text: '明天再说，起床看心情决定跑哪里', dimensionScore: 1 },
      { id: 'D', emoji: '😴', text: '设了闹钟但大概率会关掉继续睡', dimensionScore: 1 },
    ],
  },

  // ═══ Q6 | 维度: style (D=计划 vs P=随性) ═══
  {
    id: 6,
    text: '你看到一条「7天半马训练计划」的推送，你会？',
    dimension: 'style',
    options: [
      { id: 'A', emoji: '📋', text: '打开Excel，开始规划日程', dimensionScore: -1 },
      { id: 'B', emoji: '📱', text: '收藏，然后继续刷手机', dimensionScore: 0.5 },
      { id: 'C', emoji: '📸', text: '截图保存，虽然知道自己不会跟', dimensionScore: 0.5 },
      { id: 'D', emoji: '🫂', text: '转发给朋友：「一起？」然后两个人都不了了之', dimensionScore: 0.5 },
    ],
  },

  // ═══ Q7 | 维度: ritual (G=装备 vs M=极简) ═══
  {
    id: 7,
    text: '跑鞋的「退役仪式」，你是怎么处理的？',
    dimension: 'ritual',
    options: [
      { id: 'A', emoji: '📷', text: '拍照发朋友圈/小红书，配文「感谢这双鞋陪我跑过的XXX公里」', dimensionScore: -1 },
      { id: 'B', emoji: '👟', text: '洗干净放鞋柜，偶尔还会穿', dimensionScore: -0.5 },
      { id: 'C', emoji: '🗑️', text: '直接扔垃圾桶，去店里买双新的', dimensionScore: 0.5 },
      { id: 'D', emoji: '🤨', text: '什么退役？穿到烂为止，跑鞋哪有退役的说法', dimensionScore: 1 },
    ],
  },

  // ═══ Q8 | 维度: ritual (G=装备 vs M=极简) ═══
  {
    id: 8,
    text: '赛前领物，你在博览会现场的状态是？',
    dimension: 'ritual',
    options: [
      { id: 'A', emoji: '🛍️', text: '逛遍每个展位，能量胶、盐丸、压缩袜全部补货', dimensionScore: -1 },
      { id: 'B', emoji: '🏃', text: '领完号码簿就走，多一分钟都不待', dimensionScore: 1 },
      { id: 'C', emoji: '💎', text: '主要看有没有联名款/限量版周边', dimensionScore: -0.5 },
      { id: 'D', emoji: '🗺️', text: '找个角落坐着研究明天的赛道地图', dimensionScore: 0.5 },
    ],
  },

  // ═══ Q9 | 维度: motivation（反向验证）| 泛运动场景 ═══
  {
    id: 9,
    text: '朋友约你周末一起参加一个你从没试过的运动（比如飞盘/骑行），但你原计划那天要跑一个配速训练，你会？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '🌟', text: '果断改计划！新体验比配速重要多了', dimensionScore: 1 },
      { id: 'B', emoji: '🤔', text: '先跑完训练，结束后再赶去参加', dimensionScore: -0.5 },
      { id: 'C', emoji: '📅', text: '把配速训练调到前一天，两不误', dimensionScore: -0.5 },
      { id: 'D', emoji: '🏃', text: '婉拒朋友，训练计划不能打乱', dimensionScore: -1 },
    ],
  },

  // ═══ Q10 | 维度: social（反向验证）| 泛社交场景 ═══
  {
    id: 10,
    text: '你独自完成了一次特别满意的跑步后，你的第一反应是？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '📱', text: '立刻拍照/截图发跑团群/朋友圈分享', dimensionScore: 1 },
      { id: 'B', emoji: '📝', text: '记录在私人日记/App里，自己留着看', dimensionScore: -0.5 },
      { id: 'C', emoji: '💭', text: '在心里回味一下，继续做下一件事', dimensionScore: -0.5 },
      { id: 'D', emoji: '🤫', text: '什么都不说，跑完就完了，有什么好说的', dimensionScore: -1 },
    ],
  },

  // ═══ Q11 | 维度: style（反向验证）| 泛出行场景 ═══
  {
    id: 11,
    text: '你要出门旅行三天，你会怎么处理跑步这件事？',
    dimension: 'style',
    options: [
      { id: 'A', emoji: '📋', text: '提前查好酒店附近的跑步路线，每天跑多少都规划好了', dimensionScore: -1 },
      { id: 'B', emoji: '🎒', text: '带一双跑鞋，有机会就跑，没有就拉倒', dimensionScore: 0.5 },
      { id: 'C', emoji: '🗓️', text: '看看行程有没有空档，有的话跑个短距离', dimensionScore: -0.5 },
      { id: 'D', emoji: '🏖️', text: '旅行就是旅行，跑步的事回家再说', dimensionScore: 1 },
    ],
  },

  // ═══ Q12 | 维度: ritual（反向验证）| 泛消费场景 ═══
  {
    id: 12,
    text: '你打算买一双新跑鞋，你的选鞋过程最接近？',
    dimension: 'ritual',
    options: [
      { id: 'A', emoji: '🧪', text: '至少看 5 篇测评+对比视频，参数列 Excel 对比后才下单', dimensionScore: -1 },
      { id: 'B', emoji: '👀', text: '去店里试穿，哪双舒服买哪双', dimensionScore: 0.5 },
      { id: 'C', emoji: '💬', text: '问跑团里最懂鞋的人推荐，直接跟单', dimensionScore: -0.5 },
      { id: 'D', emoji: '🛒', text: '随便买一双顺眼的，够用就行', dimensionScore: 1 },
    ],
  },
];

/** 题号→维度映射 */
export const questionDimensionMap: Record<number, Dimension> = {
  1: 'motivation',
  2: 'motivation',
  9: 'motivation',
  3: 'social',
  4: 'social',
  10: 'social',
  5: 'style',
  6: 'style',
  11: 'style',
  7: 'ritual',
  8: 'ritual',
  12: 'ritual',
};
