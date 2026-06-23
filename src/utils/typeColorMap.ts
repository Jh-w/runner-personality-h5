/**
 * v5.0 5 色系颜色映射层
 * 基于 colorFamily + colorTone 直接计算颜色，不再依赖复杂 CSS 变量名拼接
 * 向后兼容 v4.0 接口：getTypeColorTokens / getTypeHexValue / getTypeGradientValue / getTypeGlowValue
 */

import type { PersonalityCode, ColorFamily, ColorTone } from '../engine/types';
import { getPersonality } from '../engine/personalities';

/** 5 色系 × 2 色调 颜色表 */
const COLOR_TABLE: Record<ColorFamily, Record<ColorTone, { hex: string; gradient: string; glow: string }>> = {
  warmred: {
    deep:   { hex: '#C0392B', gradient: 'linear-gradient(135deg, #D44637 0%, #C0392B 50%, #A33024 100%)', glow: 'rgba(192, 57, 43, 0.15)' },
    bright: { hex: '#E8734A', gradient: 'linear-gradient(135deg, #F08A62 0%, #E8734A 50%, #D4653F 100%)', glow: 'rgba(232, 115, 74, 0.15)' },
  },
  forest: {
    deep:   { hex: '#2E7D32', gradient: 'linear-gradient(135deg, #3D9142 0%, #2E7D32 50%, #1E5E22 100%)', glow: 'rgba(46, 125, 50, 0.15)' },
    bright: { hex: '#66BB6A', gradient: 'linear-gradient(135deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%)', glow: 'rgba(102, 187, 106, 0.15)' },
  },
  wisteria: {
    deep:   { hex: '#7B3F8C', gradient: 'linear-gradient(135deg, #8E4F9E 0%, #7B3F8C 50%, #5E2F6E 100%)', glow: 'rgba(123, 63, 140, 0.15)' },
    bright: { hex: '#C77DBD', gradient: 'linear-gradient(135deg, #D49AD0 0%, #C77DBD 50%, #B060AC 100%)', glow: 'rgba(199, 125, 189, 0.15)' },
  },
  coolblue: {
    deep:   { hex: '#3A5A8C', gradient: 'linear-gradient(135deg, #4A6EA0 0%, #3A5A8C 50%, #2A4570 100%)', glow: 'rgba(58, 90, 140, 0.15)' },
    bright: { hex: '#64B5F6', gradient: 'linear-gradient(135deg, #90CAF9 0%, #64B5F6 50%, #42A5F5 100%)', glow: 'rgba(100, 181, 246, 0.15)' },
  },
  amber: {
    deep:   { hex: '#BF7A3A', gradient: 'linear-gradient(135deg, #D4924D 0%, #BF7A3A 50%, #A0642D 100%)', glow: 'rgba(191, 122, 58, 0.15)' },
    bright: { hex: '#E8B44F', gradient: 'linear-gradient(135deg, #EFC875 0%, #E8B44F 50%, #D9A340 100%)', glow: 'rgba(232, 180, 79, 0.15)' },
  },
};

const FALLBACK = {
  hex: '#FF6B35',
  gradient: 'linear-gradient(135deg, #FF6B35, #FF5722)',
  glow: 'rgba(255, 107, 53, 0.25)',
};

/** 从 code 获取颜色数据（查 personalities 表的 colorFamily/colorTone） */
function getColorData(code: PersonalityCode) {
  try {
    const p = getPersonality(code);
    if (p?.colorFamily && p?.colorTone) {
      const entry = COLOR_TABLE[p.colorFamily]?.[p.colorTone];
      if (entry) return entry;
    }
  } catch { /* fallback */ }
  // v5.0 fallback: derive from code
  const family: ColorFamily = code.startsWith('C') ? 'warmred' : 'forest';
  const tone: ColorTone = code.endsWith('_D') ? 'deep' : 'bright';
  return COLOR_TABLE[family]?.[tone] ?? FALLBACK;
}

/** 维度分组（向后兼容 v4.0 接口） */
export type ColorGroup = 'compete' | 'social' | 'experience' | 'lone' | 'warmred' | 'forest' | 'wisteria' | 'coolblue' | 'amber';

export interface TypeColorTokens {
  hexVar: string;
  gradientVar: string;
  glowVar: string;
  group: ColorGroup;
}

/**
 * v5.0: 返回 CSS 变量名（向后兼容 v4.0 调用方）。
 * 新代码建议直接使用 getTypeHexValue / getTypeGradientValue / getTypeGlowValue。
 */
export function getTypeColorTokens(code: PersonalityCode): TypeColorTokens {
  const data = getColorData(code);
  // v5.0: 返回直接颜色值而非 CSS 变量引用
  // 为保持向后兼容，hexVar/gradientVar/glowVar 返回可直接用于 CSS 变量语法的值
  return {
    hexVar: data.hex,
    gradientVar: data.gradient,
    glowVar: data.glow,
    group: 'warmred',
  };
}

/** 运行时获取 hex 颜色值（Canvas 渲染用） */
export function getTypeHexValue(code: PersonalityCode): string {
  return getColorData(code).hex;
}

/** 运行时获取渐变值 */
export function getTypeGradientValue(code: PersonalityCode): string {
  return getColorData(code).gradient;
}

/** 运行时获取发光色 */
export function getTypeGlowValue(code: PersonalityCode): string {
  return getColorData(code).glow;
}
