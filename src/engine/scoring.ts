// 计分引擎 - 4维度×2题 = 16型人格匹配

import type { Answer, DimensionScores, PersonalityTypeId } from './types';
import { questionDimensionMap } from './questions';
import { getPersonality } from './personalities';

/**
 * 根据8个答案计算维度得分
 * 规则：每维度2题，每题正向=1分。维度总分≥1判定为正向
 */
export function calculateScores(answers: Answer[]): DimensionScores {
  const scores: Record<string, number> = {
    motivation: 0,
    equipment: 0,
    social: 0,
    planning: 0,
  };

  for (const answer of answers) {
    const dim = questionDimensionMap[answer.questionId];
    if (dim) {
      scores[dim] += answer.score;
    }
  }

  return {
    motivation: (scores.motivation >= 1 ? 1 : 0) as 0 | 1,
    equipment: (scores.equipment >= 1 ? 1 : 0) as 0 | 1,
    social: (scores.social >= 1 ? 1 : 0) as 0 | 1,
    planning: (scores.planning >= 1 ? 1 : 0) as 0 | 1,
  };
}

/**
 * 根据维度得分匹配人格类型ID
 * 编码规则: [动机位, 装备位, 社交位, 计划位] 作为二进制
 */
export function matchPersonality(scores: DimensionScores): PersonalityTypeId {
  const bits = [
    scores.motivation,
    scores.equipment,
    scores.social,
    scores.planning,
  ];

  // 二进制转十进制: 动机×8 + 装备×4 + 社交×2 + 计划×1
  // 但我们需要映射到 1-16
  // 映射关系:
  // [0,0,0,0]=0 → typeId 16  (享受+极简+独行+随性)
  // [0,0,0,1]=1 → typeId 15  (享受+极简+独行+计划)
  // [0,0,1,0]=2 → typeId 14  (享受+极简+群跑+随性)
  // [0,0,1,1]=3 → typeId 13  (享受+极简+群跑+计划)
  // [0,1,0,0]=4 → typeId 12  (享受+装备+独行+随性)
  // [0,1,0,1]=5 → typeId 11  (享受+装备+独行+计划)
  // [0,1,1,0]=6 → typeId 10  (享受+装备+群跑+随性)
  // [0,1,1,1]=7 → typeId 9   (享受+装备+群跑+计划)
  // [1,0,0,0]=8 → typeId 8   (成绩+极简+独行+随性)
  // [1,0,0,1]=9 → typeId 7   (成绩+极简+独行+计划)
  // [1,0,1,0]=10 → typeId 6  (成绩+极简+群跑+随性)
  // [1,0,1,1]=11 → typeId 5  (成绩+极简+群跑+计划)
  // [1,1,0,0]=12 → typeId 4  (成绩+装备+独行+随性)
  // [1,1,0,1]=13 → typeId 3  (成绩+装备+独行+计划)
  // [1,1,1,0]=14 → typeId 2  (成绩+装备+群跑+随性)
  // [1,1,1,1]=15 → typeId 1  (成绩+装备+群跑+计划)

  const decimal = bits[0] * 8 + bits[1] * 4 + bits[2] * 2 + bits[3] * 1;

  // 映射: decimal → typeId
  const mapping: Record<number, PersonalityTypeId> = {
    0: 16,  1: 15,  2: 14,  3: 13,
    4: 12,  5: 11,  6: 10,  7: 9,
    8: 8,   9: 7,  10: 6,  11: 5,
    12: 4,  13: 3,  14: 2,  15: 1,
  };

  return mapping[decimal];
}

/**
 * 完整计分流程: 答案 → 维度得分 → 人格类型 → 人格数据
 */
export function calculateResult(answers: Answer[]) {
  const dimensionScores = calculateScores(answers);
  const typeId = matchPersonality(dimensionScores);
  const personality = getPersonality(typeId);
  return {
    ...personality,
    dimensionScores,
  };
}
