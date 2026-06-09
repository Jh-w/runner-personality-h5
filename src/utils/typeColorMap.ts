/**
 * v4.0 16 型颜色映射层
 * 建立 PersonalityCode → CSS 变量名的映射，独立于 engine，不改动 personalities.ts
 */

import type { PersonalityCode } from '../engine/types';

/** 维度分组 */
export type ColorGroup = 'compete' | 'social' | 'experience' | 'lone';

/** 颜色映射结果 */
export interface TypeColorTokens {
  hexVar: string;
  gradientVar: string;
  glowVar: string;
  group: ColorGroup;
}

/**
 * PersonalityCode → CSS 变量名映射表
 * 16 型全覆盖，key 为四字母编码
 */
const CODE_TO_COLOR: Record<string, { idx: number; group: ColorGroup }> = {
  // 竞技型（Motivation=Competitive）
  CSDG: { idx: 1, group: 'compete' },  // 赛道卷王
  CSDM: { idx: 2, group: 'compete' },  // PB特种兵
  CPDG: { idx: 3, group: 'compete' },  // 跑步气氛组
  CPDM: { idx: 4, group: 'compete' },  // 跑团穿搭博主

  // 社交型（Social=Group）
  EPGG: { idx: 1, group: 'social' },   // 竞速社交达人
  EPGM: { idx: 2, group: 'social' },   // 装备理财产品经理
  ESGG: { idx: 3, group: 'social' },   // 装备颜控散步党
  ESG_: { idx: 4, group: 'social' },   // 精致独行侠 placeholder
  ESGM: { idx: 4, group: 'social' },   // 精致独行侠

  // 体验型（Motivation=Experience）
  EPDG: { idx: 1, group: 'experience' },  // 天赋型选手
  EPDM: { idx: 2, group: 'experience' },  // 跑圈政委
  EPGG_: { idx: 3, group: 'experience' }, // 气氛组卷王
  EPG_: { idx: 3, group: 'experience' },  // 气氛组卷王 (fallback)
  EGG_: { idx: 4, group: 'experience' },  // 佛系约跑人PLUS
  EGDM: { idx: 4, group: 'experience' },  // 佛系约跑人PLUS

  // 独狼型（Social=Solo）
  CGD_: { idx: 1, group: 'lone' },     // 沉默破风者
  CGDG: { idx: 1, group: 'lone' },     // 沉默破风者
  CPGG: { idx: 2, group: 'lone' },     // 真·佛系约跑人
  CGDM: { idx: 3, group: 'lone' },     // 城市流浪跑者
  CSGG: { idx: 4, group: 'lone' },     // 禅修跑者
};

/**
 * 获取人格对应的 CSS 变量名
 * @returns 包含 hexVar / gradientVar / glowVar 的对象，未匹配时返回 fallback（品牌色）
 */
export function getTypeColorTokens(code: PersonalityCode): TypeColorTokens {
  const entry = CODE_TO_COLOR[code];
  if (!entry) {
    // fallback：未匹配的编码使用品牌色
    return {
      hexVar: '--brand-primary',
      gradientVar: '--brand-primary', // 无渐变，用纯色
      glowVar: '--brand-primary-glow',
      group: 'compete',
    };
  }

  const prefix = `--type-${entry.group}-${entry.idx}`;
  return {
    hexVar: `${prefix}-hex`,
    gradientVar: `${prefix}-gradient`,
    glowVar: `${prefix}-glow`,
    group: entry.group,
  };
}

/**
 * 运行时获取 CSS 变量的实际值
 * 用于 Canvas 渲染等需要实际颜色字符串的场景
 */
export function getTypeGradientValue(code: PersonalityCode): string {
  const tokens = getTypeColorTokens(code);
  return getComputedStyle(document.documentElement).getPropertyValue(tokens.gradientVar).trim()
    || 'linear-gradient(135deg, #FF6B35, #FF5722)'; // fallback
}

export function getTypeHexValue(code: PersonalityCode): string {
  const tokens = getTypeColorTokens(code);
  return getComputedStyle(document.documentElement).getPropertyValue(tokens.hexVar).trim()
    || '#FF6B35';
}

export function getTypeGlowValue(code: PersonalityCode): string {
  const tokens = getTypeColorTokens(code);
  return getComputedStyle(document.documentElement).getPropertyValue(tokens.glowVar).trim()
    || 'rgba(255,107,53,0.25)';
}
