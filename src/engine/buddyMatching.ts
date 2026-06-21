// 最佳跑团搭档匹配算法 — v4.2: 32型配对
// 匹配原则：表达相同(都D或都A) + 其余四维全部相反（4反1同）
// 覆盖所有32型

import type { PersonalityCode, BestBuddy } from './types';
import { getPersonality } from './personalities';

/** 搭档配对表：A↔B 双向，每对表达维度相同 */
type BuddyPair = [PersonalityCode, PersonalityCode, string];
const PAIRS: BuddyPair[] = [
  // 数据派(D)配对 (表达维度同为D, 其余四维互补)
  ['CSGP_D', 'EMLS_D', '精算赛道王负责配速和数据分析，自由流浪者负责带你感受风和自由。'],
  ['CGSS_D', 'EMLP_D', '炸鱼特种兵负责冲刺拉爆，身体翻译官负责让你听懂身体的信号。'],
  ['CGLP_D', 'EMSS_D', '暗影破风者负责沉默发力，随缘数据派负责活跃气氛随时响应。'],
  ['CGLS_D', 'EMSP_D', '鞋狗研究员负责装备推荐，数据稳定流负责稳定出勤和陪伴。'],
  ['CMSP_D', 'EGLS_D', '数据大管家负责全团数据管理，装备品鉴师负责装备库维护。'],
  ['CMSS_D', 'EGLP_D', '赤脚数据狂负责降维打击，精密独行侠负责路线规划。'],
  ['CMLP_D', 'EGSS_D', '数据修行者负责配速稳定，穿搭分析师负责穿搭评分。'],
  ['CMLS_D', 'EGSP_D', '野路子数据师负责天赋碾压，慢摇装备党负责气氛活跃。'],
  // 文艺派(A)配对 (表达维度同为A, 其余四维互补)
  ['CSGP_A', 'EMLS_A', '出片赛道王负责大片拍摄，自由流浪者负责带路探索未知。'],
  ['CGSS_A', 'EMLP_A', '花式特种兵负责穿搭指导，都市隐修士负责心灵按摩。'],
  ['CGLP_A', 'EMSS_A', '孤风诗人负责审美氛围，松弛代言人负责降低全团血压。'],
  ['CGLS_A', 'EMSP_A', '鞋柜收藏家负责讲鞋的故事，朴素陪伴者负责递水陪聊。'],
  ['CMSP_A', 'EGLS_A', '跑团聚心人负责情感连接，审美漫游者负责发现沿途美景。'],
  ['CMSS_A', 'EGLP_A', '跑团开心果负责笑声，仪式感独行侠负责精致体验。'],
  ['CMLP_A', 'EGSS_A', '跑道沉思者负责深度思考，穿搭艺术家负责视觉呈现。'],
  ['CMLS_A', 'EGSP_A', '天生跑者负责天赋展示，跑团策展人负责全程统筹。'],
];

/**
 * 查找最佳跑团搭档
 * @returns 最佳搭档信息，若配对表不完整则返回 undefined（不应发生）
 */
export function findBestBuddy(myCode: PersonalityCode): BestBuddy | undefined {
  for (const [a, b, desc] of PAIRS) {
    if (a === myCode) {
      const personality = getPersonality(b as PersonalityCode);
      if (!personality) return undefined;
      return {
        typeId: personality.typeId,
        code: personality.code,
        name: personality.name,
        emoji: personality.emoji,
        quote: personality.quote,
        pairDescription: desc,
      };
    }
    if (b === myCode) {
      const personality = getPersonality(a as PersonalityCode);
      if (!personality) return undefined;
      return {
        typeId: personality.typeId,
        code: personality.code,
        name: personality.name,
        emoji: personality.emoji,
        quote: personality.quote,
        pairDescription: desc,
      };
    }
  }
  return undefined;
}

/**
 * 验证配对双向对称性（用于单元测试）
 */
export function getBuddyPairs(): BuddyPair[] {
  return PAIRS;
}

/**
 * 基于 dimensionScores 计算最佳搭档
 * 用于 verify 配对表与实际算法一致
 */
export function computeBuddyByAlgorithm(myCode: PersonalityCode): PersonalityCode | null {
  const me = getPersonality(myCode as PersonalityCode);
  if (!me) return null;

  let best: PersonalityCode | null = null;
  let bestScore = -1;

  const allCodes: PersonalityCode[] = (() => {
    const codes: PersonalityCode[] = [];
    for (const pair of PAIRS) {
      codes.push(pair[0]);
      codes.push(pair[1]);
    }
    return [...new Set(codes)];
  })();

  for (const otherCode of allCodes) {
    if (otherCode === myCode) continue;
    const other = getPersonality(otherCode);
    if (!other) continue;

    const dsMe = me.dimensionScores;
    const dsOth = other.dimensionScores;

    const sameExpression = Math.sign(dsMe.expression) === Math.sign(dsOth.expression);
    if (!sameExpression) continue; // 硬约束：表达维度必须相同

    const oppositeM = Math.sign(dsMe.motivation) !== Math.sign(dsOth.motivation);
    const oppositeE = Math.sign(dsMe.ritual) !== Math.sign(dsOth.ritual);
    const oppositeS = Math.sign(dsMe.social) !== Math.sign(dsOth.social);
    const oppositeP = Math.sign(dsMe.style) !== Math.sign(dsOth.style);

    const score = (oppositeM ? 1 : 0) + (oppositeE ? 1 : 0) + (oppositeS ? 1 : 0) + (oppositeP ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = otherCode;
    }
  }

  return best;
}
