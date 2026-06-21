// 维度标签映射 — PRD v4.2 五维框架
// 用于结果页雷达图标注和埋点属性

import type { Dimension } from './types';

// ─── 维度中文标签 ─────────────────────────────────────

export const dimensionNames: Record<Dimension, string> = {
  motivation: '动机',
  social: '社交',
  style: '计划',
  ritual: '装备',
  expression: '表达',
};

// ─── 维度方向标签（左极/右极） ─────────────────────────
// 编码映射:
//   motivation: C (竞技驱动/左)  vs E (体验驱动/右)
//   social:     L (独狼/左)      vs S (社群跑者/右)
//   style:      P (计划型/左)    vs S (随性型/右)
//   ritual:     G (装备党/左)    vs M (极简派/右)
//   expression: D (数据派/左)    vs A (文艺派/右)

export interface DimensionLabels {
  name: string;
  left: { code: string; label: string };
  right: { code: string; label: string };
}

export const dimensionLabels: Record<Dimension, DimensionLabels> = {
  motivation: {
    name: '动机',
    left:  { code: 'C', label: '竞技驱动' },
    right: { code: 'E', label: '体验驱动' },
  },
  social: {
    name: '社交',
    left:  { code: 'L', label: '独狼' },
    right: { code: 'S', label: '社群跑者' },
  },
  style: {
    name: '计划',
    left:  { code: 'P', label: '计划型' },
    right: { code: 'S', label: '随性型' },
  },
  ritual: {
    name: '装备',
    left:  { code: 'G', label: '装备党' },
    right: { code: 'M', label: '极简派' },
  },
  expression: {
    name: '表达',
    left:  { code: 'D', label: '数据派' },
    right: { code: 'A', label: '文艺派' },
  },
};
