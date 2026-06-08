// pkMatching.ts — PK 匹配度引擎
// v3.3-Phase3: 4维比较 256对全覆盖，互补判定 + 评级 + 解读
// 纯函数，无副作用

import type { PersonalityCode, DimensionScores, PkResult, PkRating, DimensionComparison } from './types';
import { getPersonality } from './personalities';

// ─── 维度标签 ────────────────────────────────────────

const DIM_LABELS: Record<string, [string, string]> = {
  motivation: ['竞技驱动', '体验驱动'],
  social: ['独狼', '社群动物'],
  style: ['计划狂', '随性派'],
  ritual: ['装备党', '极简派'],
};

const DIM_LEFT: Record<string, string> = {
  motivation: 'C', social: 'S', style: 'D', ritual: 'G',
};
const DIM_RIGHT: Record<string, string> = {
  motivation: 'E', social: 'G', style: 'P', ritual: 'M',
};

// ─── 维度符号提取 ────────────────────────────────────

function getSign(ds: DimensionScores, dim: string): string {
  const val = ds[dim as keyof DimensionScores] as number;
  return val < 0 ? DIM_LEFT[dim] : DIM_RIGHT[dim];
}

// ─── 维度匹配度计算 ──────────────────────────────────

function calcDimensionMatch(
  signA: string,
  signB: string,
  scoreA: number,
  scoreB: number,
): number {
  // 方向相反 → 互补 100%
  if (signA !== signB) return 100;
  // 方向相同 + 得分差值 < 0.5 → 高度相似 75%
  if (Math.abs(scoreA - scoreB) < 0.5) return 75;
  // 方向相同 → 相似 50%
  return 50;
}

// ─── 评级与解读 ──────────────────────────────────────

function getRating(complementCount: number): PkRating {
  if (complementCount >= 4) return 5;
  if (complementCount === 3) return 4;
  if (complementCount === 2) return 3;
  if (complementCount === 1) return 2;
  return 1;
}

function getJudgment(rating: PkRating): { judgment: string; description: string } {
  const table: Record<PkRating, { judgment: string; description: string }> = {
    5: {
      judgment: '天选跑搭子！',
      description: '你们是跑道上最互补的存在——一个定配速，一个讲笑话，绝了。',
    },
    4: {
      judgment: '最佳互补搭档',
      description: '你们在一起跑，比各自独跑更舒服——这就是搭档的意义。',
    },
    3: {
      judgment: '不错的跑步伙伴',
      description: '你们虽然风格不同，但正好能在关键维度上互相拉扯。',
    },
    2: {
      judgment: '风格迥异的朋友',
      description: '你们可能不会是最合拍的训练搭档，但一起参加比赛会很有趣。',
    },
    1: {
      judgment: '镜子里的自己',
      description: '你们是同型人格！这没什么不好——你们可以 PK 同样的路线。',
    },
  };
  return table[rating];
}

// ─── 主算法 ──────────────────────────────────────────

/**
 * 计算两个跑步人格的 PK 对比结果
 * @param codeA 邀请者人格编码
 * @param codeB 被邀请者（当前用户）人格编码
 * @returns PkResult 或 null（若编码无效）
 */
export function calculatePkResult(
  codeA: PersonalityCode,
  codeB: PersonalityCode,
): PkResult | null {
  const pA = getPersonality(codeA);
  const pB = getPersonality(codeB);
  if (!pA || !pB) return null;

  const dsA = pA.dimensionScores;
  const dsB = pB.dimensionScores;

  const dimensions = ['motivation', 'social', 'style', 'ritual'] as const;
  const dimResults: { dim: string; signA: string; signB: string; score: number; complementary: boolean }[] = [];

  for (const dim of dimensions) {
    const signA = getSign(dsA, dim);
    const signB = getSign(dsB, dim);
    const score = calcDimensionMatch(signA, signB, dsA[dim], dsB[dim]);
    dimResults.push({ dim, signA, signB, score, complementary: signA !== signB });
  }

  const totalScore = dimResults.reduce((s, r) => s + r.score, 0);
  const matchPercentage = Math.round(totalScore / 4);
  const complementCount = dimResults.filter(r => r.complementary).length;

  const rating = getRating(complementCount);
  const { judgment, description } = getJudgment(rating);

  const dimensionComparisons: DimensionComparison[] = dimResults.map(r => {
    const [left, right] = DIM_LABELS[r.dim] || [r.signA, r.signB];
    return {
      dimension: r.dim as DimensionComparison['dimension'],
      typeA: r.signA,
      typeB: r.signB,
      isComplementary: r.complementary,
      label: r.complementary ? `${left} ←→ ${right}` : `${left}  VS  ${right}`,
    };
  });

  return {
    codeA, codeB,
    nameA: pA.name, nameB: pB.name,
    matchPercentage,
    complementCount,
    rating,
    judgment,
    description,
    dimensionComparisons,
  };
}
