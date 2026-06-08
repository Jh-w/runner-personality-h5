// 最佳跑团搭档匹配算法 — PRD v3.1 Phase1 §3
// 匹配原则：社交相同 + 其余三维全部相反（3反1同）

import type { PersonalityCode, BestBuddy } from './types';
import { getPersonality } from './personalities';

/** 搭档配对表：A↔B 双向 */
type BuddyPair = [PersonalityCode, PersonalityCode, string];
const PAIRS: BuddyPair[] = [
  ['CSDG', 'EPDM', '卷王负责带配速，流浪跑者负责带你绕路看风景。'],
  ['CSDM', 'EPDG', '破风者提供执行力，体验师提供开箱评测报告。'],
  ['CPDG', 'ESDM', '冲刺怪让你见识间歇跑的酸爽，修行者教你跑完怎么放松。'],
  ['CPDM', 'ESDG', '天赋型负责拉爆你，精致型负责拉爆后给你拍好看的照片。'],
  ['CGDG', 'EPGM', '结算官确保你不掉队，散步跑者确保你不崩溃。'],
  ['CGDM', 'EPGG', '教官给出课表，跟跑员告诉你们今天哪场活动最火。'],
  ['CPGG', 'EGDM', '竞速家负责 PB，慢跑队长负责赛后聚餐订位。'],
  ['CPGM', 'EGDG', '跟跑王提供稳定出勤，气氛组提供出勤的理由。'],
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
  
  const allCodes: PersonalityCode[] = [
    'CSDG','CSDM','CPDG','CPDM','CGDG','CGDM','CPGG','CPGM',
    'ESDG','ESDM','EPDG','EPDM','EGDG','EGDM','EPGG','EPGM',
  ];
  
  for (const otherCode of allCodes) {
    if (otherCode === myCode) continue;
    const other = getPersonality(otherCode);
    if (!other) continue;
    
    const dsMe = me.dimensionScores;
    const dsOth = other.dimensionScores;
    
    const sameSocial = Math.sign(dsMe.social) === Math.sign(dsOth.social);
    if (!sameSocial) continue; // 硬约束
    
    const oppositeM = Math.sign(dsMe.motivation) !== Math.sign(dsOth.motivation);
    const oppositeS = Math.sign(dsMe.style) !== Math.sign(dsOth.style);
    const oppositeR = Math.sign(dsMe.ritual) !== Math.sign(dsOth.ritual);
    
    const score = (oppositeM ? 1 : 0) + (oppositeS ? 1 : 0) + (oppositeR ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = otherCode;
    }
  }
  
  return best;
}
