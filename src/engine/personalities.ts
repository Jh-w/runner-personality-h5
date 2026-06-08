// 16种跑步人格完整数据 — PRD v3.0 §6.2 + v3.1 Phase1 (quote + colorDark)
// 按四维编码排序: CSDG → EPGM

import type { PersonalityCode, PersonalityResult, PersonalityTypeId } from './types';

/** 16型人格数据 */
const personalityData: Record<PersonalityCode, PersonalityResult> = {
  // ═══ 1. CSDG | 赛道卷王 | 竞技+独狼+计划+装备 ═══
  CSDG: {
    typeId: 1,
    code: 'CSDG',
    name: '赛道卷王',
    emoji: '🏆',
    keywords: ['数据狂魔', 'PB焦虑症', '装备测评师'],
    roast: '你认识每一代Vaporfly的差别，也知道自己最近30天的配速曲线，但朋友只知道你周末没法约饭——你要跑LSD。',
    traits: [
      '每次跑完第一件事不是拉伸，是看数据',
      '买跑鞋前至少看了5篇测评',
      '一个人跑得比一群人快，也不想等人',
    ],
    dimensionScores: { motivation: -1, social: -1, style: -1, ritual: -1 },
    color: '#FF4444',
    quote: '我不和别人比，我只和昨天的自己比——然后发现昨天的自己真菜。',
    colorDark: '#CC2222',
  },

  // ═══ 2. CSDM | 沉默破风者 | 竞技+独狼+计划+极简 ═══
  CSDM: {
    typeId: 2,
    code: 'CSDM',
    name: '沉默破风者',
    emoji: '🌬️',
    keywords: ['低调输出', '暗中观察', '稳定配速'],
    roast: '从不发朋友圈，但Strava上全是PR。跑团群永远潜水，但比赛永远站台。',
    traits: [
      '配速稳定得像巡航导弹',
      '训练计划写在备忘录里，不给你看',
      '合影永远站最边上，但背影被拍得最多',
    ],
    dimensionScores: { motivation: -1, social: -1, style: -1, ritual: 1 },
    color: '#607D8B',
    quote: '不说话，不打卡，不解释。只是在你没看见的时候，又跑了一个全马。',
    colorDark: '#37474F',
  },

  // ═══ 3. CPDG | 装备型冲刺怪 | 竞技+独狼+随性+装备 ═══
  CPDG: {
    typeId: 3,
    code: 'CPDG',
    name: '装备型冲刺怪',
    emoji: '⚡',
    keywords: ['间歇狂魔', '新款必入', '即兴发挥'],
    roast: '训练计划？不需要。新款碳板鞋到了？冲！结果是跑完3组间歇后蹲在路边刷鞋。',
    traits: [
      '间歇跑是信仰，每组必须跑到怀疑人生',
      '对最新装备了如指掌，比品牌PR还快',
      '训练全靠感觉，偶尔暴走偶尔躺平',
    ],
    dimensionScores: { motivation: -1, social: -1, style: 1, ritual: -1 },
    color: '#FF6B35',
    quote: '鞋墙比我的人生规划还整齐，间歇跑比我的情绪还稳定。',
    colorDark: '#CC4400',
  },

  // ═══ 4. CPDM | 野生竞速者 | 竞技+独狼+随性+极简 ═══
  CPDM: {
    typeId: 4,
    code: 'CPDM',
    name: '野生竞速者',
    emoji: '😎',
    keywords: ['天赋碾压', '随性取胜', '从不焦虑'],
    roast: '从不刻意训练，但比赛从不掉链子。你怀疑他是外星人，他只是说"跑就完了"。',
    traits: [
      '不热身不拉伸，直接开跑',
      '比赛前不紧张，比赛后不酸痛',
      '天赋型选手，但从不炫耀',
    ],
    dimensionScores: { motivation: -1, social: -1, style: 1, ritual: 1 },
    color: '#4CAF50',
    quote: '赛前不练，赛中不乱，赛后不酸——别问，问就是天赋。',
    colorDark: '#2E7D32',
  },

  // ═══ 5. CGDG | 跑团结算官 | 竞技+社群+计划+装备 ═══
  CGDG: {
    typeId: 5,
    code: 'CGDG',
    name: '跑团结算官',
    emoji: '🧮',
    keywords: ['数据管家', '规则捍卫者', '装备顾问'],
    roast: '跑完第一句话不是"好累"，是"今天的平均配速是5:23，心率区间分布..."。跑团的最强大脑，配速的警察叔叔，团费的财务总监。',
    traits: [
      '跑完立刻发数据分析到群里',
      '记住所有人的PB，比本人还清楚',
      '装备测评写得比品牌官方还详细',
    ],
    dimensionScores: { motivation: -1, social: 1, style: -1, ritual: -1 },
    color: '#2196F3',
    quote: '跑团的数据中心，配速的警察叔叔，团费的财务总监。',
    colorDark: '#0D47A1',
  },

  // ═══ 6. CGDM | 团练教官 | 竞技+社群+计划+极简 ═══
  CGDM: {
    typeId: 6,
    code: 'CGDM',
    name: '团练教官',
    emoji: '🫡',
    keywords: ['课表执行者', '纪律严明', '配速机器'],
    roast: '课表就是法律，天气不是借口。下雨？跑。下雪？跑。世界末日？跑完再说。',
    traits: [
      '训练课表从不缺席，风雨无阻',
      '带新人耐心但要求严苛',
      '装备够用就行，核心是执行力',
    ],
    dimensionScores: { motivation: -1, social: 1, style: -1, ritual: 1 },
    color: '#00BCD4',
    quote: '课表就是课表，风雨无阻。拉爆你不是目的，是被迫的。',
    colorDark: '#006064',
  },

  // ═══ 7. CPGG | 社交竞速家 | 竞技+社群+随性+装备 ═══
  CPGG: {
    typeId: 7,
    code: 'CPGG',
    name: '社交竞速家',
    emoji: '🎭',
    keywords: ['两面派', '装备控', '社交达人'],
    roast: '对跑团说"今天慢摇"，对竞速组说"今天冲PB"。装备是通行证，比赛是社交场。',
    traits: [
      '装备和社交两手抓，两手都硬',
      '不同跑团切换不同人设',
      '比赛即聚会，PB是顺便的事',
    ],
    dimensionScores: { motivation: -1, social: 1, style: 1, ritual: -1 },
    color: '#E91E63',
    quote: '装备是通行证，比赛是社交场，PB 是顺便的事。',
    colorDark: '#AD1457',
  },

  // ═══ 8. CPGM | 佛系跟跑王 | 竞技+社群+随性+极简 ═══
  CPGM: {
    typeId: 8,
    code: 'CPGM',
    name: '佛系跟跑王',
    emoji: '😌',
    keywords: ['群跑达人', '快乐至上', '随叫随到'],
    roast: '一个人能鸽，但群里一喊立马到。PB不重要，重要的是跑完去哪儿喝豆浆。',
    traits: [
      '跑团出勤率最高，但从不争第一',
      '享受跑步的社交属性而非竞技',
      '装备只有一双鞋，但跑得比装备党还多',
    ],
    dimensionScores: { motivation: -1, social: 1, style: 1, ritual: 1 },
    color: '#FF9800',
    quote: '一个人不跑，一群人跑开心。PB 不重要，重要的是跑完去哪吃。',
    colorDark: '#E65100',
  },

  // ═══ 9. ESDG | 精致漫跑者 | 体验+独狼+计划+装备 ═══
  ESDG: {
    typeId: 9,
    code: 'ESDG',
    name: '精致漫跑者',
    emoji: '🎩',
    keywords: ['穿搭博主', '路线艺术家', '仪式感拉满'],
    roast: '跑步10分钟，自拍20张。今天的穿搭必须配今天的天气，今天的路线必须有今天的审美。',
    traits: [
      '跑鞋和穿搭必须配套，颜色不搭不跑',
      '精选跑步路线，必须有好风景',
      '跑步是生活方式，不是运动',
    ],
    dimensionScores: { motivation: 1, social: -1, style: -1, ritual: -1 },
    color: '#9C27B0',
    quote: '配速可以慢，但穿搭必须在线。今天的光线和今天的鞋，必须配。',
    colorDark: '#6A1B9A',
  },

  // ═══ 10. ESDM | 修行式跑者 | 体验+独狼+计划+极简 ═══
  ESDM: {
    typeId: 10,
    code: 'ESDM',
    name: '修行式跑者',
    emoji: '🧘',
    keywords: ['冥想跑者', '固定路线', '极简主义'],
    roast: '跑步不为比赛不为数据，只为那一刻的平静。固定路线、固定时间、固定自己。',
    traits: [
      '同一条路线跑了三年不腻',
      '跑步时不听歌，听自己的呼吸',
      '配速不重要，重要的是心流状态',
    ],
    dimensionScores: { motivation: 1, social: -1, style: -1, ritual: 1 },
    color: '#3F51B5',
    quote: '固定的路线，固定的时间，固定的自己。跑步是我的移动冥想室。',
    colorDark: '#1A237E',
  },

  // ═══ 11. EPDG | 装备体验师 | 体验+独狼+随性+装备 ═══
  EPDG: {
    typeId: 11,
    code: 'EPDG',
    name: '装备体验师',
    emoji: '🔬',
    keywords: ['开箱博主', '科技控', '收藏家'],
    roast: '鞋柜比衣柜大，每双鞋都有一段故事——虽然有的故事只有3公里长。',
    traits: [
      '新款跑鞋发布时比品牌方还激动',
      '家里鞋墙是主要资产',
      '买装备的乐趣超过跑步本身',
    ],
    dimensionScores: { motivation: 1, social: -1, style: 1, ritual: -1 },
    color: '#E040FB',
    quote: '买的装备比跑的路多，但每一双都试过——试了三公里。',
    colorDark: '#7B1FA2',
  },

  // ═══ 12. EPDM | 自由流浪跑者 | 体验+独狼+随性+极简 ═══
  EPDM: {
    typeId: 12,
    code: 'EPDM',
    name: '自由流浪跑者',
    emoji: '🗺️',
    keywords: ['无计划派', '自由灵魂', '探索者'],
    roast: '没有训练计划，没有配速目标，没有固定路线——但有风，有路，有自由。',
    traits: [
      '出门方向随机，跑到哪算哪',
      '从不看表，只看风景',
      '认为跑步被数据绑架是一种悲哀',
    ],
    dimensionScores: { motivation: 1, social: -1, style: 1, ritual: 1 },
    color: '#795548',
    quote: '没有计划，没有 App，没有目标。但有风，有路，有自由。',
    colorDark: '#4E342E',
  },

  // ═══ 13. EGDG | 跑团气氛组 | 体验+社群+计划+装备 ═══
  EGDG: {
    typeId: 13,
    code: 'EGDG',
    name: '跑团气氛组',
    emoji: '🎉',
    keywords: ['气氛担当', '社交引擎', '后勤部长'],
    roast: '跑团没你跑不起来——不是因为你快，是因为没你没人张罗。补给站站长、合影导演、群聊焦点。',
    traits: [
      '跑团活动组织者，出勤率靠你维持',
      '总能找到跑完聚餐的好馆子',
      '装备不一定最贵，但一定最骚',
    ],
    dimensionScores: { motivation: 1, social: 1, style: -1, ritual: -1 },
    color: '#F44336',
    quote: '跑步不重要，重要的是跑团里有你。没你，他们跑不起来。',
    colorDark: '#B71C1C',
  },

  // ═══ 14. EGDM | 社区慢跑队长 | 体验+社群+计划+极简 ═══
  EGDM: {
    typeId: 14,
    code: 'EGDM',
    name: '社区慢跑队长',
    emoji: '🐢',
    keywords: ['新人导师', '慢跑推广者', '社区支柱'],
    roast: '配速不快，但从不错过每次活动。最成功的PB不是破3，是陪新人跑完第一个五公里。',
    traits: [
      '永远在队伍最后面陪着最慢的人',
      '跑步只为健康和陪伴',
      '一双鞋穿三年，但里程数最高',
    ],
    dimensionScores: { motivation: 1, social: 1, style: -1, ritual: 1 },
    color: '#8BC34A',
    quote: '配速不快，但从不缺席。最成功的 PB，是陪新人跑完第一个五公里。',
    colorDark: '#558B2F',
  },

  // ═══ 15. EPGG | 潮流跟跑员 | 体验+社群+随性+装备 ═══
  EPGG: {
    typeId: 15,
    code: 'EPGG',
    name: '潮流跟跑员',
    emoji: '🌟',
    keywords: ['潮流风向标', '热门雷达', '打卡达人'],
    roast: '什么火跑什么，哪热闹去哪。跑圈热门路线的第一批打卡者，跑团朋友圈的封面人物。',
    traits: [
      '城市最火的跑步活动你永远在现场',
      '新路线、新装备、新趋势统统第一时间体验',
      '跑步更多是为了故事和社交货币',
    ],
    dimensionScores: { motivation: 1, social: 1, style: 1, ritual: -1 },
    color: '#FF5722',
    quote: '什么火跑什么，哪热闹去哪。跑圈潮流的风向标，跑团朋友圈的封面。',
    colorDark: '#BF360C',
  },

  // ═══ 16. EPGM | 快乐散步跑者 | 体验+社群+随性+极简 ═══
  EPGM: {
    typeId: 16,
    code: 'EPGM',
    name: '快乐散步跑者',
    emoji: '☀️',
    keywords: ['快乐至上', '真诚分享', '无压力派'],
    roast: '跑步？更像是散步快了一点。碳板还是薄底、前掌还是后跟——有差吗？开心就好。',
    traits: [
      '跑步的唯一KPI是开心',
      '从不纠结配速和跑量',
      '跑跑走走、走走停停，享受每一公里',
    ],
    dimensionScores: { motivation: 1, social: 1, style: 1, ritual: 1 },
    color: '#FFC107',
    quote: '碳板还是薄底？前掌还是后跟？——有差吗？开心就好。',
    colorDark: '#FF8F00',
  },
};

/** 按 typeId 索引的人格查找表 */
const byTypeId: Record<PersonalityTypeId, PersonalityResult> = {} as any;
for (const p of Object.values(personalityData)) {
  byTypeId[p.typeId] = p;
}

/** 按编码获取人格 */
export function getPersonality(code: PersonalityCode): PersonalityResult | undefined {
  return personalityData[code];
}

/** 按 typeId 获取人格 */
export function getPersonalityByTypeId(typeId: PersonalityTypeId): PersonalityResult {
  return byTypeId[typeId];
}

/** 获取全部 16 型人格 */
export function getAllPersonalities(): PersonalityResult[] {
  return Object.values(personalityData);
}
