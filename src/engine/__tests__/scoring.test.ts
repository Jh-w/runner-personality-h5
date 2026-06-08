// 计分引擎单元测试 — PRD v3.0 新四维框架
// 覆盖16种组合 + 边界零分

import { describe, it, expect } from 'vitest';
import { calculateScores, matchPersonality, calculateResult, codeFromScores } from '../scoring';
import { questions } from '../questions';
import { getAllPersonalities } from '../personalities';
import type { Answer, Dimension, DimensionScores, PersonalityTypeId } from '../types';

// ─── 辅助函数 ───────────────────────────────────────

/**
 * 为指定 typeId 生成模拟答案
 * 从人格数据中取出 dimensionScores 的符号方向，
 * 每题选择 dimensionScore 符号匹配且绝对值最大的选项
 */
function makeAnswersForTypeId(typeId: PersonalityTypeId): Answer[] {
  const personalities = getAllPersonalities();
  const personality = personalities.find(p => p.typeId === typeId);
  if (!personality) throw new Error(`TypeId ${typeId} not found`);

  const ds = personality.dimensionScores;
  const wantSign: Record<string, number> = {
    motivation: ds.motivation < 0 ? -1 : 1,
    social: ds.social < 0 ? -1 : 1,
    style: ds.style < 0 ? -1 : 1,
    ritual: ds.ritual < 0 ? -1 : 1,
  };

  const answers: Answer[] = [];

  for (const q of questions) {
    const dim = q.dimension as Dimension;
    const sign = wantSign[dim];
    // 找第一个符号匹配且绝对值最大的选项
    let best = q.options[0];
    for (const opt of q.options) {
      const currSign = Math.sign(opt.dimensionScore);
      const bestSign = Math.sign(best.dimensionScore);
      if (currSign === sign && (bestSign !== sign || Math.abs(opt.dimensionScore) > Math.abs(best.dimensionScore))) {
        best = opt;
      }
    }
    answers.push({
      questionId: q.id,
      optionId: best.id,
      dimensionScore: best.dimensionScore,
    });
  }

  return answers;
}

// ─── calculateScores 测试 ───────────────────────────

describe('calculateScores', () => {
  it('typeId 1 (赛道卷王) → 4维皆负', () => {
    const answers = makeAnswersForTypeId(1);
    const scores = calculateScores(answers);
    expect(scores.motivation).toBeLessThan(0);
    expect(scores.social).toBeLessThan(0);
    expect(scores.style).toBeLessThan(0);
    expect(scores.ritual).toBeLessThan(0);
  });

  it('typeId 16 (快乐散步跑者) → 4维皆正', () => {
    const answers = makeAnswersForTypeId(16);
    const scores = calculateScores(answers);
    expect(scores.motivation).toBeGreaterThan(0);
    expect(scores.social).toBeGreaterThan(0);
    expect(scores.style).toBeGreaterThan(0);
    expect(scores.ritual).toBeGreaterThan(0);
  });

  it('混合编码至少得分为非零值', () => {
    const answers = makeAnswersForTypeId(1);
    const scores = calculateScores(answers);
    expect(scores.motivation).not.toBe(0);
    expect(scores.social).not.toBe(0);
    expect(scores.style).not.toBe(0);
    expect(scores.ritual).not.toBe(0);
  });
});

// ─── codeFromScores 测试 ────────────────────────────

describe('codeFromScores', () => {
  it('全负 → CSDG', () => {
    const scores: DimensionScores = { motivation: -2, social: -2, style: -2, ritual: -2 };
    expect(codeFromScores(scores)).toBe('CSDG');
  });

  it('全正（框架编码）→ EGPM', () => {
    // 框架标准编码: motivation=E, social=G, style=P, ritual=M → "EGPM"
    // 注：PRD §6.3 中对应类型编码为 "EPGM"，但该表中的编码位置2-3与框架定义不一致。
    // 本函數严格遵循 PRD §5.1 的编码定义。
    const scores: DimensionScores = { motivation: 2, social: 2, style: 2, ritual: 2 };
    expect(codeFromScores(scores)).toBe('EGPM');
  });

  it('零分兜底偏右 → EGPM', () => {
    const scores: DimensionScores = { motivation: 0, social: 0, style: 0, ritual: 0 };
    expect(codeFromScores(scores)).toBe('EGPM');
  });

  it('边界: motivation = +0.5 (刚好>0) → E', () => {
    const scores: DimensionScores = { motivation: 0.5, social: -1, style: -1, ritual: -1 };
    expect(codeFromScores(scores)[0]).toBe('E');
  });

  it('边界: motivation = -0.5 (刚好<0) → C', () => {
    const scores: DimensionScores = { motivation: -0.5, social: -1, style: -1, ritual: -1 };
    expect(codeFromScores(scores)[0]).toBe('C');
  });

  it('social: 0 → G (社群)', () => {
    const scores: DimensionScores = { motivation: -1, social: 0, style: -1, ritual: -1 };
    expect(codeFromScores(scores)).toBe('CGDG');
  });

  it('style: 0 → P (随性)', () => {
    const scores: DimensionScores = { motivation: -1, social: -1, style: 0, ritual: -1 };
    expect(codeFromScores(scores)).toBe('CSPG');
  });

  it('ritual: 0 → M (极简)', () => {
    const scores: DimensionScores = { motivation: -1, social: -1, style: -1, ritual: 0 };
    expect(codeFromScores(scores)).toBe('CSDM');
  });
});

// ─── matchPersonality 测试 — 16种全量覆盖 ───────────

describe('matchPersonality', () => {
  const personalities = getAllPersonalities();

  personalities.forEach((personality) => {
    it(`typeId ${personality.typeId}: ${personality.name} (${personality.code})`, () => {
      const answers = makeAnswersForTypeId(personality.typeId);
      const scores = calculateScores(answers);
      const matched = matchPersonality(scores);
      expect(matched).toBe(personality.typeId);
    });
  });
});

// ─── calculateResult 测试 ────────────────────────────

describe('calculateResult', () => {
  it('typeId 1 → 赛道卷王', () => {
    const answers = makeAnswersForTypeId(1);
    const result = calculateResult(answers);
    expect(result.typeId).toBe(1);
    expect(result.name).toBe('赛道卷王');
    expect(result.code).toBe('CSDG');
    expect(result.keywords).toHaveLength(3);
    expect(result.keywords).toContain('数据狂魔');
  });

  it('typeId 16 → 快乐散步跑者', () => {
    const answers = makeAnswersForTypeId(16);
    const result = calculateResult(answers);
    expect(result.typeId).toBe(16);
    expect(result.name).toBe('快乐散步跑者');
    expect(result.code).toBe('EPGM');
  });

  it('返回的人格数据完整（新字段：code/keywords）', () => {
    const answers = makeAnswersForTypeId(1);
    const result = calculateResult(answers);
    expect(result.name).toBeTruthy();
    expect(result.code).toBeTruthy();
    expect(result.roast).toBeTruthy();
    expect(result.traits).toHaveLength(3);
    expect(result.keywords).toHaveLength(3);
    expect(result.emoji).toBeTruthy();
    expect(result.color).toMatch(/^#/);
    expect(result.dimensionScores.motivation).toBeLessThan(0);
  });

  it('typeId 10 → 修行式跑者', () => {
    const answers = makeAnswersForTypeId(10);
    const result = calculateResult(answers);
    expect(result.typeId).toBe(10);
    expect(result.name).toBe('修行式跑者');
    expect(result.code).toBe('ESDM');
  });
});
