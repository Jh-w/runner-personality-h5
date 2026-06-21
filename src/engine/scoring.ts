// 计分引擎 v4.2 — PRD §2.4 五维累积计分规则
// 每维度3题，每题 dimensionScore: ±1
// 3题总分 ≥ 2 → 右极, ≤ 1 → 左极 (signKey 用 < 0 判定)
// 5维组合 → 2⁵=32型人格匹配

import type { Answer, Dimension, DimensionScores, PersonalityCode, PersonalityResult, PersonalityTypeId } from './types';
import { questionDimensionMap } from './questions';
import { getPersonalityByTypeId, getAllPersonalities } from './personalities';
import { findBestBuddy } from './buddyMatching';

// ─── 维度符号 → 类型ID 查找表（惰性构建） ─────────────

let _signToTypeId: Map<string, PersonalityTypeId> | null = null;

function getSignToTypeId(): Map<string, PersonalityTypeId> {
  if (!_signToTypeId) {
    _signToTypeId = new Map();
    for (const p of getAllPersonalities()) {
      const ds = p.dimensionScores;
      const key = signKey(ds);
      _signToTypeId.set(key, p.typeId);
    }
  }
  return _signToTypeId;
}

/**
 * 将 DimensionScores 转为五字母符号键
 * 编码: M(motivation) E(equipment/ritual) S(social) P(plan/style) X(expression)
 * 左极(负): C=竞技 G=装备 L=独狼 P=计划 D=数据
 * 右极(正): E=体验 M=极简 S=社群 S=随性 A=文艺
 */
function signKey(scores: DimensionScores): string {
  const c1 = scores.motivation < 0 ? 'C' : 'E';    // C=竞技 / E=体验
  const c2 = scores.ritual < 0 ? 'G' : 'M';         // G=装备党 / M=极简派
  const c3 = scores.social < 0 ? 'L' : 'S';         // L=独狼 / S=社群
  const c4 = scores.style < 0 ? 'P' : 'S';          // P=计划型 / S=随性型
  const c5 = scores.expression < 0 ? 'D' : 'A';     // D=数据派 / A=文艺派
  return `${c1}${c2}${c3}${c4}_${c5}`;
}

// ─── 公开 API ───────────────────────────────────────

/**
 * 根据15个计分题答案计算五维累积得分
 * 风味题不在 questionDimensionMap 中，自动跳过
 */
export function calculateScores(answers: Answer[]): DimensionScores {
  const scores: Record<Dimension, number> = {
    motivation: 0,
    social: 0,
    style: 0,
    ritual: 0,
    expression: 0,
  };

  for (const answer of answers) {
    const dim = questionDimensionMap[answer.questionId];
    if (dim) {
      scores[dim] += answer.dimensionScore;
    }
  }

  return scores as DimensionScores;
}

/**
 * 根据维度累积得分生成五字母人格编码
 * 规则: 维度总分 < 0 → 左极; ≥ 0 → 右极
 *
 * 编码位置:
 *   位1 (motivation):  < 0 → 'C' (竞技驱动) | ≥ 0 → 'E' (体验驱动)
 *   位2 (ritual/equip): < 0 → 'G' (装备党)   | ≥ 0 → 'M' (极简派)
 *   位3 (social):       < 0 → 'L' (独狼)     | ≥ 0 → 'S' (社群跑者)
 *   位4 (style/plan):   < 0 → 'P' (计划型)   | ≥ 0 → 'S' (随性型)
 *   位5 (expression):   < 0 → 'D' (数据派)   | ≥ 0 → 'A' (文艺派)
 */
export function codeFromScores(scores: DimensionScores): PersonalityCode {
  return signKey(scores);
}

/**
 * 根据维度得分匹配人格类型ID
 * 通过维度符号直接查找 2⁵=32 型人格表
 */
export function matchPersonality(scores: DimensionScores): PersonalityTypeId {
  const key = signKey(scores);
  const map = getSignToTypeId();
  const typeId = map.get(key);
  if (typeId === undefined) {
    throw new Error(`No personality matched for score signs: ${key}`);
  }
  return typeId;
}

/**
 * 完整计分流程: 答案 → 维度得分 → 人格编码 → 人格结果
 */
export function calculateResult(answers: Answer[]): PersonalityResult {
  const dimensionScores = calculateScores(answers);
  const typeId = matchPersonality(dimensionScores);
  const personality = getPersonalityByTypeId(typeId);
  const bestBuddy = findBestBuddy(personality.code);
  return {
    ...personality,
    dimensionScores,
    bestBuddy,
  };
}
