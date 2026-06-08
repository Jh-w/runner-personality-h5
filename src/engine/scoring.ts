// 计分引擎 v3.0 — PRD §5.4 累积计分规则
// 每题 dimensionScore: ±1 (强倾向) / ±0.5 (弱倾向)
// 每维度2题累加 → >0=右极, <0=左极, ==0 偏右极
// 4维组合 → 16型人格匹配

import type { Answer, Dimension, DimensionScores, PersonalityCode, PersonalityResult, PersonalityTypeId } from './types';
import { questionDimensionMap } from './questions';
import { getAllPersonalities, getPersonality } from './personalities';

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

/** 将 DimensionScores 转为符号键 "CSPG" 等（按 [motivation][social][style][ritual]） */
function signKey(scores: DimensionScores): string {
  const c1 = scores.motivation < 0 ? 'C' : 'E';
  const c2 = scores.social < 0 ? 'S' : 'G';
  const c3 = scores.style < 0 ? 'D' : 'P';
  const c4 = scores.ritual < 0 ? 'G' : 'M';
  return `${c1}${c2}${c3}${c4}`;
}

// ─── 公开 API ───────────────────────────────────────

/**
 * 根据8个答案计算维度累积得分
 * 返回每个维度的连续累积值（可为负）
 */
export function calculateScores(answers: Answer[]): DimensionScores {
  const scores: Record<Dimension, number> = {
    motivation: 0,
    social: 0,
    style: 0,
    ritual: 0,
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
 * 根据维度累积得分生成四字母人格编码（框架标准编码）
 * 规则: 维度总分 > 0 → 右极; < 0 → 左极; == 0 → 右极（兜底偏右）
 *
 * 编码位置（PRD §5.1 定义）:
 *   位1 (motivation): < 0 → 'C' (竞技驱动) | ≥ 0 → 'E' (体验驱动)
 *   位2 (social):     < 0 → 'S' (独狼)     | ≥ 0 → 'G' (社群动物)
 *   位3 (style):      < 0 → 'D' (计划狂)   | ≥ 0 → 'P' (随性派)
 *   位4 (ritual):     < 0 → 'G' (装备党)   | ≥ 0 → 'M' (极简派)
 */
export function codeFromScores(scores: DimensionScores): PersonalityCode {
  return signKey(scores);
}

/**
 * 根据维度得分匹配人格类型ID
 * 通过维度符号直接查找，不依赖 PRD 中可能不一致的四字母编码
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
  const personality = getPersonality(typeId);
  return {
    ...personality,
    dimensionScores,
  };
}
