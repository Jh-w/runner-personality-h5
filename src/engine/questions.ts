// 18道测试题数据 — v4.2.5 PRD 第3章
// 五维框架: motivation(3题) / equipment(3题) / social(3题) / plan(3题) / expression(3题)
// + 风味题: time(1题) / injury(1题) / diet(1题) = 18题
// 每维度3题，每题4选项，dimensionScore: ±1 (强倾向)
// 计分规则: 每维度3题总分≥2→右极, ≤1→左极

import type { Question, Dimension } from './types';

export const questions: Question[] = [
  // ═══ Q1 | 维度: social (S) | 跑步搭子偏好 ═══
  {
    id: 1,
    text: '周末你计划跑一个10公里，你更倾向于？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '🐺', text: '一个人，戴上降噪耳机，10公里是我和世界的安全距离', dimensionScore: -1 },
      { id: 'B', emoji: '👥', text: '约上跑团三五个搭子，边跑边聊八卦，跑完再约个Brunch', dimensionScore: 1 },
      { id: 'C', emoji: '📱', text: '一个人跑，但开着跑步App和网友「云陪跑」', dimensionScore: -1 },
      { id: 'D', emoji: '🤷', text: '看状态：状态好就摇人，状态差就一个人默默跑', dimensionScore: -1 },
    ],
  },

  // ═══ Q2 | 风味: 时间偏好 ═══
  {
    id: 2,
    text: '如果完全由你决定，你最想什么时间跑步？',
    dimension: 'expression',
    flavorDimension: 'time',
    options: [
      { id: 'A', emoji: '🌅', text: '凌晨5点，城市还没醒，空气是甜的', dimensionScore: 0 },
      { id: 'B', emoji: '🌙', text: '晚上8点后，路灯下奔跑，把白天的压力跑掉', dimensionScore: 0 },
      { id: 'C', emoji: '☀️', text: '周末上午，阳光正好，约上跑友一起出发', dimensionScore: 0 },
      { id: 'D', emoji: '🎲', text: '没有固定时间，看心情、看天气、看那天有没有吃火锅', dimensionScore: 0 },
    ],
  },

  // ═══ Q3 | 维度: equipment (E) | 装备消费行为 ═══
  {
    id: 3,
    text: '路过一家跑步装备店，你的本能反应是？',
    dimension: 'ritual', // ritual = equipment (装备)
    options: [
      { id: 'A', emoji: '🛍️', text: '腿不受控制走进去，每一双新鞋都要摸一摸，至少逛半小时', dimensionScore: -1 },
      { id: 'B', emoji: '🚶', text: '目不斜视走过去——脚上这双减震快磨平了，但还能再撑200公里', dimensionScore: 1 },
      { id: 'C', emoji: '🎯', text: '精准定位目标商品，试穿、付款、走人，全程不超过8分钟', dimensionScore: 1 },
      { id: 'D', emoji: '👀', text: '站在橱窗外看两眼新品，打开手机搜同款，然后打开闲鱼', dimensionScore: -1 },
    ],
  },

  // ═══ Q4 | 维度: expression (X) | 跑后第一反应 ═══
  {
    id: 4,
    text: '跑完一次酣畅淋漓的10公里，你第一件事做什么？',
    dimension: 'expression',
    options: [
      { id: 'A', emoji: '📊', text: '立刻打开手表/App，看配速曲线、心率区间、步频——数据不好明天加练', dimensionScore: -1 },
      { id: 'B', emoji: '📸', text: '拍张照：今天的天空/路边的花/镜子里满头大汗的自己，调好滤镜发圈', dimensionScore: 1 },
      { id: 'C', emoji: '🧘', text: '拉伸+喝水+发呆，享受跑完这一刻的放空和身体的酸爽', dimensionScore: 1 },
      { id: 'D', emoji: '📈', text: '截图手表/App数据，跟上次同样路线对比，分析进步还是退步', dimensionScore: -1 },
    ],
  },

  // ═══ Q5 | 维度: motivation (M) | 比赛心态 ═══
  {
    id: 5,
    text: '你报名了一场两个月后的半马/全马比赛，赛前你脑子里想得最多的是？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '🏅', text: '这次PB稳不稳？配速策略已经算了三版，目标配速X\'XX"', dimensionScore: -1 },
      { id: 'B', emoji: '🎒', text: '终于有个理由去那座城市了！跑完去哪吃、去哪逛已经安排好了', dimensionScore: 1 },
      { id: 'C', emoji: '📸', text: '完赛奖牌长什么样？参赛服好不好看？赛后照片能不能出片？', dimensionScore: 1 },
      { id: 'D', emoji: '😰', text: '两个月能练出来吗？现在开始临时抱佛脚还来得及吗？', dimensionScore: -1 },
    ],
  },

  // ═══ Q6 | 维度: plan (P) | 训练安排模式 ═══
  {
    id: 6,
    text: '关于跑步计划，下面哪句话最像你？',
    dimension: 'style', // style = plan (计划)
    options: [
      { id: 'A', emoji: '📋', text: '每周有一天是我的「排课时间」，下周每天跑什么、跑多少、什么配速，清清楚楚', dimensionScore: -1 },
      { id: 'B', emoji: '🌊', text: '跑步需要计划吗？天气好+心情好+有时间=跑！三个条件凑齐两个就出发', dimensionScore: 1 },
      { id: 'C', emoji: '🎯', text: '有大目标（比如，月跑量100K），但具体哪天跑看那天的会议结束时间', dimensionScore: -1 },
      { id: 'D', emoji: '⏰', text: '本来不跑，但报名了比赛→Deadline是第一生产力→赛前两周疯狂堆跑量', dimensionScore: 1 },
    ],
  },

  // ═══ Q7 | 维度: expression (X) | 社交媒体内容 ═══
  {
    id: 7,
    text: '你的跑步朋友圈/社交媒体，通常是？',
    dimension: 'expression',
    options: [
      { id: 'A', emoji: '📊', text: '数据截图+配速分析+心率区间——专业跑者的标配', dimensionScore: -1 },
      { id: 'B', emoji: '🌅', text: '风景+心情+小作文——从一片落叶聊到人生意义', dimensionScore: 1 },
      { id: 'C', emoji: '😂', text: '搞笑/自嘲——「今天又走了一段」「配速8分也是跑」', dimensionScore: 1 },
      { id: 'D', emoji: '👥', text: '感谢跑友/跑团——「今天又是元气满满的一天，感恩相遇」', dimensionScore: -1 },
    ],
  },

  // ═══ Q8 | 维度: social (S) | 约跑反应 ═══
  {
    id: 8,
    text: '跑团群里有人发起「明早6点公园约跑」，你的反应是？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '👋', text: '秒回「111」，然后开始看天气预报、搭配跑步穿搭', dimensionScore: 1 },
      { id: 'B', emoji: '🤔', text: '先不回复，看看去的人多不多、配速合不合适——合适再报名', dimensionScore: -1 },
      { id: 'C', emoji: '🙅', text: '已读不回。6点？我在梦里跑。一个人跑不香吗', dimensionScore: -1 },
      { id: 'D', emoji: '💬', text: '不跑但活跃：「加油！跑完发照片！」——然后继续睡', dimensionScore: 1 },
    ],
  },

  // ═══ Q9 | 维度: motivation (M) | 跑步意义 ═══
  {
    id: 9,
    text: '如果有人问你「为什么跑步」，你下意识的第一反应是？',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '🏆', text: '为了变强——破3、PB、站台，跑步是挑战自己的方式', dimensionScore: -1 },
      { id: 'B', emoji: '🧘', text: '为了健康——无伤跑到80岁，比什么配速都重要', dimensionScore: 1 },
      { id: 'C', emoji: '👫', text: '为了和大家在一起——跑步是借口，社交才是本体', dimensionScore: 1 },
      { id: 'D', emoji: '👟', text: '为了买装备有个正当理由——「这双鞋是为了训练！」', dimensionScore: -1 },
    ],
  },

  // ═══ Q10 | 风味: 伤痛态度 ═══
  {
    id: 10,
    text: '跑步受伤了（比如，膝盖隐隐作痛），你的态度是？',
    dimension: 'expression',
    flavorDimension: 'injury',
    options: [
      { id: 'A', emoji: '🩹', text: '立刻停跑，认真康复——恢复也是训练的一部分', dimensionScore: 0 },
      { id: 'B', emoji: '🏃', text: '忍一忍继续跑——「轻伤不下火线，跑完这次再说」', dimensionScore: 0 },
      { id: 'C', emoji: '🎉', text: '正好！名正言顺休息，躺着刷跑圈新闻', dimensionScore: 0 },
      { id: 'D', emoji: '📱', text: '发朋友圈：「膝盖又疼了，求跑友推荐康复机构」', dimensionScore: 0 },
    ],
  },

  // ═══ Q11 | 维度: equipment (E) | 装备推荐态度 ═══
  {
    id: 11,
    text: '朋友问「新手跑步买什么鞋」，你的反应是？',
    dimension: 'ritual',
    options: [
      { id: 'A', emoji: '🎓', text: '发一篇小作文：从足弓类型到落地姿态到各家缓震科技对比，附三款推荐按预算排列', dimensionScore: -1 },
      { id: 'B', emoji: '🤷', text: '「去迪卡侬试，哪双舒服买哪双」', dimensionScore: 1 },
      { id: 'C', emoji: '👟', text: '翻出自己鞋柜拍张全家福发过去，每双配一句话点评', dimensionScore: -1 },
      { id: 'D', emoji: '🔗', text: '转发跑鞋测评视频「你自己看吧」', dimensionScore: 1 },
    ],
  },

  // ═══ Q12 | 维度: plan (P) | 计划被打乱 ═══
  {
    id: 12,
    text: '你的训练计划被意外打乱了（比如，下雨/加班/饭局），你怎么办？',
    dimension: 'style',
    options: [
      { id: 'A', emoji: '📅', text: '立刻在脑中重排本周计划，把今天的训练挪到明天，绝不欠跑量', dimensionScore: -1 },
      { id: 'B', emoji: '🤷', text: '「无所谓，少跑一天又不会死」', dimensionScore: 1 },
      { id: 'C', emoji: '🏃', text: '想方设法挤时间：午休跑30分钟也行，爬楼梯也算', dimensionScore: -1 },
      { id: 'D', emoji: '🎉', text: '「不跑就不跑，正好多一个理由放纵」', dimensionScore: 1 },
    ],
  },

  // ═══ Q13 | 风味: 饮食关系 ═══
  {
    id: 13,
    text: '跑完一次长距离训练后，你的饮食选择是？',
    dimension: 'expression',
    flavorDimension: 'diet',
    options: [
      { id: 'A', emoji: '🥗', text: '高蛋白/低脂——鸡胸肉+西兰花，跑完更要管住嘴', dimensionScore: 0 },
      { id: 'B', emoji: '🍜', text: '狂吃碳水——拉面+炒饭+甜品，跑这么多就是为了吃！', dimensionScore: 0 },
      { id: 'C', emoji: '🍻', text: '约跑友一起聚餐——吃什么不重要，跟谁吃才重要', dimensionScore: 0 },
      { id: 'D', emoji: '📸', text: '先拍照再吃——这桌菜必须配上今天的配速截图一起发', dimensionScore: 0 },
    ],
  },

  // ═══ Q14 | 维度: motivation (M) | 终极目标 ═══
  {
    id: 14,
    text: '你的终极跑步目标是什么？（选最接近的一项）',
    dimension: 'motivation',
    options: [
      { id: 'A', emoji: '🏅', text: '六大满贯/破3——我要站在世界马拉松的最高舞台', dimensionScore: -1 },
      { id: 'B', emoji: '🗺️', text: '跑遍全国的马拉松，收集每一块完赛奖牌', dimensionScore: 1 },
      { id: 'C', emoji: '🧘', text: '无伤跑到80岁——配速不重要，健康跑才长久', dimensionScore: 1 },
      { id: 'D', emoji: '🎯', text: '每一年都比去年快一点——不断超越自己就行', dimensionScore: -1 },
    ],
  },

  // ═══ Q15 | 维度: expression (X) | 遇到熟人 ═══
  {
    id: 15,
    text: '跑步时遇到熟人/同事，你的反应是？',
    dimension: 'expression',
    options: [
      { id: 'A', emoji: '👋', text: '点头示意，继续按配速跑——节奏不能断', dimensionScore: -1 },
      { id: 'B', emoji: '📱', text: '停下来聊两句，顺便问问对方配速多少——数据交流也是跑步的一部分', dimensionScore: -1 },
      { id: 'C', emoji: '📸', text: '「来来来合影一张！」——跑步不拍等于没跑', dimensionScore: 1 },
      { id: 'D', emoji: '🙈', text: '假装没看见——怕被拉爆，也怕对方问你「这么慢还在跑啊」', dimensionScore: 1 },
    ],
  },

  // ═══ Q16 | 维度: equipment (E) | 跑鞋退役 ═══
  {
    id: 16,
    text: '你的跑鞋什么时候退役？',
    dimension: 'ritual',
    options: [
      { id: 'A', emoji: '📏', text: '严格按照里程记录——这双800公里了，下周换新的，退役仪式：拍照发朋友圈', dimensionScore: -1 },
      { id: 'B', emoji: '👞', text: '鞋底磨穿了才换——「还能跑」、「明天再换」、「下周一定」——然后下周又下周', dimensionScore: 1 },
      { id: 'C', emoji: '🆕', text: '新款一发售旧款自动退役——不是不能穿了，是它已经配不上现在的我了', dimensionScore: -1 },
      { id: 'D', emoji: '🔄', text: '好几双轮着穿，没有「退役」这个概念——每双都是现役，只是分工不同', dimensionScore: -1 },
    ],
  },

  // ═══ Q17 | 维度: social (S) | 赛后反应 ═══
  {
    id: 17,
    text: '刚跑完一场半马/全马比赛，冲过终点线后你最想做什么？',
    dimension: 'social',
    options: [
      { id: 'A', emoji: '🎉', text: '找到跑团的队友们，交换比赛体验——「你跑了多少？」「我崩了」「我也是！」——然后一群人浩浩荡荡去吃饭', dimensionScore: 1 },
      { id: 'B', emoji: '🎧', text: '戴上耳机，一个人慢慢走回酒店——刚才那两个小时已经跟全世界说了够多的话，现在需要安静', dimensionScore: -1 },
      { id: 'C', emoji: '📱', text: '立刻掏出手机——先在跑团群里报成绩，再发朋友圈九宫格', dimensionScore: 1 },
      { id: 'D', emoji: '🏅', text: '挂上奖牌，找个角落坐下来——什么都不想，什么都不做，就看着奖牌发呆，享受这一刻的平静', dimensionScore: -1 },
    ],
  },

  // ═══ Q18 | 维度: plan (P) | 旅行跑步 ═══
  {
    id: 18,
    text: '出差/旅行时，你的跑步计划是？',
    dimension: 'style',
    options: [
      { id: 'A', emoji: '🗺️', text: '订完机票第一件事——查酒店附近跑步路线。跑鞋永远第一个塞进行李箱，衣服可以忘，跑鞋不能忘', dimensionScore: -1 },
      { id: 'B', emoji: '🏨', text: '酒店有健身房就随便跑跑，没有就算了——反正旅行嘛，放松最重要', dimensionScore: 1 },
      { id: 'C', emoji: '📋', text: '根据行程表排好跑步时间：Day1晨跑探路、Day2休息、Day3长距离——精确到每个早晨', dimensionScore: -1 },
      { id: 'D', emoji: '🍹', text: '跑步？我连跑鞋都没带。旅行就是用来放纵的，回来再补', dimensionScore: 1 },
    ],
  },
];

/** 题号→维度映射（仅计分题，风味题不在此映射中） */
export const questionDimensionMap: Record<number, Dimension> = {
  // motivation (3题)
  5: 'motivation',
  9: 'motivation',
  14: 'motivation',
  // equipment/ritual (3题)
  3: 'ritual',
  11: 'ritual',
  16: 'ritual',
  // social (3题)
  1: 'social',
  8: 'social',
  17: 'social',
  // plan/style (3题)
  6: 'style',
  12: 'style',
  18: 'style',
  // expression (3题)
  4: 'expression',
  7: 'expression',
  15: 'expression',
};
