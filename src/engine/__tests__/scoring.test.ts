// 计分引擎单元测试
import { describe, it, expect } from 'vitest';
import { calculateScores, matchPersonality, calculateResult } from '../scoring';
import { questions } from '../questions';
import type { Answer, DimensionScores, PersonalityTypeId } from '../types';

/** 为指定人格生成标准答案（选择所有正向选项） */
function makeAnswersForType(
  motivation: 0 | 1,
  equipment: 0 | 1,
  social: 0 | 1,
  planning: 0 | 1,
): Answer[] {
  const answers: Answer[] = [];
  const target: Record<string, number> = { motivation, equipment, social, planning };

  for (const q of questions) {
    const dim = q.dimension;
    const wantScore = target[dim]; // 0 or 1
    // 找第一个匹配score的选项
    const option = q.options.find(o => o.score === wantScore) || q.options[0];
    answers.push({
      questionId: q.id,
      optionId: option.id,
      score: option.score,
    });
  }
  return answers;
}

describe('calculateScores', () => {
  it('全正向 → 全部维度得1', () => {
    const answers = makeAnswersForType(1, 1, 1, 1);
    const scores = calculateScores(answers);
    expect(scores).toEqual({ motivation: 1, equipment: 1, social: 1, planning: 1 });
  });

  it('全反向 → 全部维度得0', () => {
    const answers = makeAnswersForType(0, 0, 0, 0);
    const scores = calculateScores(answers);
    expect(scores).toEqual({ motivation: 0, equipment: 0, social: 0, planning: 0 });
  });

  it('动机正向+装备正向+社交反向+计划反向', () => {
    const answers = makeAnswersForType(1, 1, 0, 0);
    const scores = calculateScores(answers);
    expect(scores).toEqual({ motivation: 1, equipment: 1, social: 0, planning: 0 });
  });

  it('动机反向+装备反向+社交正向+计划正向', () => {
    const answers = makeAnswersForType(0, 0, 1, 1);
    const scores = calculateScores(answers);
    expect(scores).toEqual({ motivation: 0, equipment: 0, social: 1, planning: 1 });
  });
});

describe('matchPersonality', () => {
  // 16种人格匹配测试
  const cases: [PersonalityTypeId, DimensionScores, string][] = [
    [1,  { motivation: 1, equipment: 1, social: 1, planning: 1 }, '赛道卷王'],
    [2,  { motivation: 1, equipment: 1, social: 1, planning: 0 }, 'PB特种兵'],
    [3,  { motivation: 1, equipment: 1, social: 0, planning: 1 }, '竞速社交达人'],
    [4,  { motivation: 1, equipment: 1, social: 0, planning: 0 }, '装备理财产品经理'],
    [5,  { motivation: 1, equipment: 0, social: 1, planning: 1 }, '跑圈政委'],
    [6,  { motivation: 1, equipment: 0, social: 1, planning: 0 }, '气氛组卷王'],
    [7,  { motivation: 1, equipment: 0, social: 0, planning: 1 }, '沉默破风者'],
    [8,  { motivation: 1, equipment: 0, social: 0, planning: 0 }, '天赋型选手'],
    [9,  { motivation: 0, equipment: 1, social: 1, planning: 1 }, '跑步气氛组'],
    [10, { motivation: 0, equipment: 1, social: 1, planning: 0 }, '跑团穿搭博主'],
    [11, { motivation: 0, equipment: 1, social: 0, planning: 1 }, '精致独行侠'],
    [12, { motivation: 0, equipment: 1, social: 0, planning: 0 }, '装备颜控散步党'],
    [13, { motivation: 0, equipment: 0, social: 1, planning: 1 }, '佛系约跑人PLUS'],
    [14, { motivation: 0, equipment: 0, social: 1, planning: 0 }, '真·佛系约跑人'],
    [15, { motivation: 0, equipment: 0, social: 0, planning: 1 }, '禅修跑者'],
    [16, { motivation: 0, equipment: 0, social: 0, planning: 0 }, '城市流浪跑者'],
  ];

  cases.forEach(([typeId, scores, name]) => {
    it(`[${scores.motivation}${scores.equipment}${scores.social}${scores.planning}] → ${name} (类型${typeId})`, () => {
      expect(matchPersonality(scores)).toBe(typeId);
    });
  });
});

describe('calculateResult', () => {
  it('全正向答案 → 赛道卷王 (类型1)', () => {
    const answers = makeAnswersForType(1, 1, 1, 1);
    const result = calculateResult(answers);
    expect(result.typeId).toBe(1);
    expect(result.name).toBe('赛道卷王');
    expect(result.dimensionScores).toEqual({ motivation: 1, equipment: 1, social: 1, planning: 1 });
  });

  it('全反向答案 → 城市流浪跑者 (类型16)', () => {
    const answers = makeAnswersForType(0, 0, 0, 0);
    const result = calculateResult(answers);
    expect(result.typeId).toBe(16);
    expect(result.name).toBe('城市流浪跑者');
  });

  it('返回的人格数据完整（有name/roast/traits/advice/color）', () => {
    const answers = makeAnswersForType(1, 1, 1, 1);
    const result = calculateResult(answers);
    expect(result.name).toBeTruthy();
    expect(result.roast).toBeTruthy();
    expect(result.traits).toHaveLength(3);
    expect(result.advice).toBeTruthy();
    expect(result.color).toMatch(/^#/);
  });
});
