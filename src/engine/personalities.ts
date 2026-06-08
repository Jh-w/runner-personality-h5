// 16种跑步人格完整数据 — PRD v3.0 §6.2
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
  },

  // ═══ 2. CSDM | 沉默破风者 | 竞技+独狼+计划+极简 ═══
  CSDM: {
    typeId: 2,
    code: 'CSDM',
    name: '沉默破风者',
    emoji: '🌬️',
    keywords: ['黑练', '一双鞋跑到退役', '不跑团不打卡不废话'],
    roast: '训练计划精确到分钟，但从没人知道你在练——直到比赛日你从后面超过去，留下一阵风和一堆问号。',
    traits: [
      '训练计划精确到分钟，但从不发朋友圈',
      '一双跑鞋穿到报废，跑鞋墙是什么？',
      '比赛中很少说话，超你的时候也不说话',
    ],
    dimensionScores: { motivation: -1, social: -1, style: -1, ritual: 1 },
    color: '#607D8B',
  },

  // ═══ 3. CPDG | 装备型冲刺怪 | 竞技+独狼+随性+装备 ═══
  CPDG: {
    typeId: 3,
    code: 'CPDG',
    name: '装备型冲刺怪',
    emoji: '⚡',
    keywords: ['间歇跑上头', '买了等于练了', '冲动报名型'],
    roast: '你的鞋墙比训练日志丰富，但每次间歇跑你都能把自己逼到怀疑人生的地步——然后发朋友圈说「爽」。',
    traits: [
      '装备比训练计划多，但该拼的时候绝对拼',
      '报名马拉松通常发生在深夜刷小红书之后',
      '一个人跑间歇跑到怀疑人生，然后发朋友圈说「爽」',
    ],
    dimensionScores: { motivation: -1, social: -1, style: 1, ritual: -1 },
    color: '#FF6B35',
  },

  // ═══ 4. CPDM | 野生竞速者 | 竞技+独狼+随性+极简 ═══
  CPDM: {
    typeId: 4,
    code: 'CPDM',
    name: '野生竞速者',
    emoji: '😎',
    keywords: ['天赋型选手', '赛前一周才想起有比赛', '天生跑得快'],
    roast: '赛前一周才想起有比赛，不热身、不补给、不拉伸——然后PB了。你是所有认真训练的人的天敌。',
    traits: [
      '训练没有计划，但PB刷新得比谁都勤',
      '赛前不碳水加载，赛中不补给策略，跑完不拉伸',
      '让所有科学训练派咬牙切齿的人',
    ],
    dimensionScores: { motivation: -1, social: -1, style: 1, ritual: 1 },
    color: '#4CAF50',
  },

  // ═══ 5. CGDG | 跑团结算官 | 竞技+社群+计划+装备 ═══
  CGDG: {
    typeId: 5,
    code: 'CGDG',
    name: '跑团结算官',
    emoji: '🧮',
    keywords: ['群接龙永远第一个', '团服收集者', '配速警察'],
    roast: '跑团群就是你的第二个家——的物业管理处。你比团长还清楚每个人的出勤率和最近三场的配速曲线。',
    traits: [
      '跑团群就是你的第二个家……的物业管理员',
      '团训迟到30秒会焦虑一整个热身',
      '装备不仅要好，还要和团服配色匹配',
    ],
    dimensionScores: { motivation: -1, social: 1, style: -1, ritual: -1 },
    color: '#2196F3',
  },

  // ═══ 6. CGDM | 团练教官 | 竞技+社群+计划+极简 ═══
  CGDM: {
    typeId: 6,
    code: 'CGDM',
    name: '团练教官',
    emoji: '🫡',
    keywords: ['间歇课表执行器', '拉爆队友不计后果', '严肃跑者脸'],
    roast: '带着课本来团练，不聊天、不拍照、不放过任何一个拉爆队友的机会。严肃跑者的脸上写满了「再来一组」。',
    traits: [
      '带着课表来团练，且严格执行，不聊天',
      '装备实用至上，但训练日志写了一本又一本',
      '队友的配速就是你最大的焦虑来源',
    ],
    dimensionScores: { motivation: -1, social: 1, style: -1, ritual: 1 },
    color: '#00BCD4',
  },

  // ═══ 7. CPGG | 社交竞速家 | 竞技+社群+随性+装备 ═══
  CPGG: {
    typeId: 7,
    code: 'CPGG',
    name: '社交竞速家',
    emoji: '🎭',
    keywords: ['比赛就是聚会', '完赛奖牌收藏家', '装备比配速好看'],
    roast: '每场比赛的OOTD比配速策略早一周定好。跑完第一件事：找人合影，配速是次要的。',
    traits: [
      '每场比赛的装备搭配比配速策略更用心',
      '跑完第一件事是找人合影，配速是次要的',
      '跑团里最擅长组织「赛后聚餐」的人',
    ],
    dimensionScores: { motivation: -1, social: 1, style: 1, ritual: -1 },
    color: '#E91E63',
  },

  // ═══ 8. CPGM | 佛系跟跑王 | 竞技+社群+随性+极简 ═══
  CPGM: {
    typeId: 8,
    code: 'CPGM',
    name: '佛系跟跑王',
    emoji: '😌',
    keywords: ['配速随缘', '跟团就行', '永远在队伍中段'],
    roast: '一个人不跑，一群人跑开心。你不追PB，你追的是「跑完这顿去哪吃」。让所有严肃跑者又爱又困惑。',
    traits: [
      '一个人不跑，一群人跑开心',
      '不追求PB，追求「今天跑完又和大家吃了顿好的」',
      '让严肃跑者困惑「他明明不怎么练为什么也能跑完」',
    ],
    dimensionScores: { motivation: -1, social: 1, style: 1, ritual: 1 },
    color: '#FF9800',
  },

  // ═══ 9. ESDG | 精致漫跑者 | 体验+独狼+计划+装备 ═══
  ESDG: {
    typeId: 9,
    code: 'ESDG',
    name: '精致漫跑者',
    emoji: '🎩',
    keywords: ['路线先导组', '装备穿搭博主', '跑步是生活方式'],
    roast: '路线必须有好风景、好光线、好路面。配速不重要——今天的穿搭和今天的风景配不配，才是你出门跑步的真正动力。',
    traits: [
      '路线比配速重要——必须是好风景、好路面、好光线',
      '穿搭在跑前花的时间比热身长',
      '一个人跑，因为节奏要自己掌控',
    ],
    dimensionScores: { motivation: 1, social: -1, style: -1, ritual: -1 },
    color: '#9C27B0',
  },

  // ═══ 10. ESDM | 修行式跑者 | 体验+独狼+计划+极简 ═══
  ESDM: {
    typeId: 10,
    code: 'ESDM',
    name: '修行式跑者',
    emoji: '🧘',
    keywords: ['跑步=冥想', '不说话的跑者', '规律得像钟摆'],
    roast: '跑步是你的移动冥想时间。固定路线、固定时间、固定配速——像个钟摆，也像个禅师。朋友问你跑步时在想什么，你说「什么都没想，这就是重点」。',
    traits: [
      '跑步不是为了比赛，是为了独自思考的时间',
      '路线固定、时间固定、距离固定——跑步是一种仪式',
      '不需要跑步社交，跑步本身就是最好的陪伴',
    ],
    dimensionScores: { motivation: 1, social: -1, style: -1, ritual: 1 },
    color: '#3F51B5',
  },

  // ═══ 11. EPDG | 装备体验师 | 体验+独狼+随性+装备 ═══
  EPDG: {
    typeId: 11,
    code: 'EPDG',
    name: '装备体验师',
    emoji: '🔬',
    keywords: ['开箱型跑者', '试跑三公里退货', '装备才是本体'],
    roast: '买装备的频率是跑步频率的两倍。每双新鞋「开光」需要选一个好天气、好路线、好心情的日子——然后跑三公里，回家写测评。',
    traits: [
      '买装备的频率是跑步频率的两倍',
      '新鞋开光要选一个好天气、好路线、好心情的日子',
      '「这双鞋的脚感我不喜欢」——每三双鞋有这一句',
    ],
    dimensionScores: { motivation: 1, social: -1, style: 1, ritual: -1 },
    color: '#E040FB',
  },

  // ═══ 12. EPDM | 自由流浪跑者 | 体验+独狼+随性+极简 ═══
  EPDM: {
    typeId: 12,
    code: 'EPDM',
    name: '自由流浪跑者',
    emoji: '🗺️',
    keywords: ['想跑就跑', '一双跑鞋走天下', '今天不跑明天再说'],
    roast: '没有训练计划，没有跑步App，一双鞋走天下。跑步存在于「突然想跑」的瞬间，不在日程表上——你的闹钟就是窗外的阳光。',
    traits: [
      '没有训练计划，甚至连跑步App都没有',
      '但跑起来的时候比谁都享受',
      '跑步存在于「突然想跑」的瞬间，不是日程表上',
    ],
    dimensionScores: { motivation: 1, social: -1, style: 1, ritual: 1 },
    color: '#795548',
  },

  // ═══ 13. EGDG | 跑团气氛组 | 体验+社群+计划+装备 ═══
  EGDG: {
    typeId: 13,
    code: 'EGDG',
    name: '跑团气氛组',
    emoji: '🎉',
    keywords: ['团服一定要好看', '加油声比脚步声响', '跑团灵魂人物'],
    roast: '每次团练都到，配速不重要。跑团没你会安静很多——安静到跑不起来。你是跑团的精神支柱，虽然你的配速完全不是。',
    traits: [
      '每次团练都到，但配速不重要',
      '热心组织队服定制、团建聚餐、赛事应援',
      '跑团没有你会安静很多，跑不起来了',
    ],
    dimensionScores: { motivation: 1, social: 1, style: -1, ritual: -1 },
    color: '#F44336',
  },

  // ═══ 14. EGDM | 社区慢跑队长 | 体验+社群+计划+极简 ═══
  EGDM: {
    typeId: 14,
    code: 'EGDM',
    name: '社区慢跑队长',
    emoji: '🐢',
    keywords: ['养生跑组织者', '每次跑完必合影', '享受陪跑'],
    roast: '配速不快但每周准时出现。最擅长陪新人完成第一次5公里——装备越简单越好，这样人人都觉得自己也可以跑。你是跑步界的「入门友善大使」。',
    traits: [
      '跑的配速不快，但每周准时出现',
      '最擅长陪新人完成第一次5公里',
      '装备越简单越好，这样人人觉得自己也可以跑',
    ],
    dimensionScores: { motivation: 1, social: 1, style: -1, ritual: 1 },
    color: '#8BC34A',
  },

  // ═══ 15. EPGG | 潮流跟跑员 | 体验+社群+随性+装备 ═══
  EPGG: {
    typeId: 15,
    code: 'EPGG',
    name: '潮流跟跑员',
    emoji: '🌟',
    keywords: ['什么流行跑什么', '跑团打卡王', '装备分享狂'],
    roast: '跑团里什么新活动都有你的身影。你的Sunday Scaries和跑步有关：「这周末跑哪儿？」——答案是哪儿火跑哪儿。',
    traits: [
      '跑团里什么新活动都有你的身影',
      '跑步装备一半是功能需求，一半是社交货币',
      '「这周末跑哪儿？」——你的Sunday Scaries和跑步有关',
    ],
    dimensionScores: { motivation: 1, social: 1, style: 1, ritual: -1 },
    color: '#FF5722',
  },

  // ═══ 16. EPGM | 快乐散步跑者 | 体验+社群+随性+极简 ═══
  EPGM: {
    typeId: 16,
    code: 'EPGM',
    name: '快乐散步跑者',
    emoji: '☀️',
    keywords: ['跑着玩', '聊着天就跑完了', '比赛=大型派对'],
    roast: '跑步的终极目的是「开心」。你对跑圈所有严肃争论表示困惑——碳板还是薄底？前掌还是后跟？有差吗？开心就好。',
    traits: [
      '跑步的终极目的是「开心」',
      '和不同人一起跑最开心，一个人跑容易放弃',
      '对跑圈所有严肃争论（碳板vs薄底、前掌vs后跟）表示困惑',
    ],
    dimensionScores: { motivation: 1, social: 1, style: 1, ritual: 1 },
    color: '#FFC107',
  },
};

// ─── 导出函数 ──────────────────────────────────────

/** 根据四字母编码获取人格数据 */
export function getPersonalityByCode(code: PersonalityCode): PersonalityResult {
  const p = personalityData[code];
  if (!p) {
    throw new Error(`Invalid personality code: ${code}`);
  }
  return p;
}

/** 根据typeId获取人格数据 */
export function getPersonality(typeId: PersonalityTypeId): PersonalityResult {
  const p = Object.values(personalityData).find(p => p.typeId === typeId);
  if (!p) {
    throw new Error(`Invalid personality typeId: ${typeId}`);
  }
  return p;
}

/** 编码→typeId 映射（用于计分引擎） */
export function codeToTypeId(code: PersonalityCode): PersonalityTypeId {
  const p = personalityData[code];
  if (!p) {
    throw new Error(`Invalid personality code: ${code}`);
  }
  return p.typeId;
}

/** 获取所有16型人格 */
export function getAllPersonalities(): PersonalityResult[] {
  // 按typeId升序排列
  return Object.values(personalityData).sort((a, b) => a.typeId - b.typeId);
}
