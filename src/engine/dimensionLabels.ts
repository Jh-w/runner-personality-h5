// 维度标签映射 — PRD v3.0 新四维框架
// 用于结果页雷达图标注和埋点属性

import type { Dimension } from './types';

// ─── 维度中文标签 ─────────────────────────────────────

export const dimensionNames: Record<Dimension, string> = {
  motivation: '动机',
  social: '社交',
  style: '风格',
  ritual: '仪式感',
};

// ─── 维度方向标签（左极/右极） ─────────────────────────
// 编码映射:
//   motivation: C (竞技驱动/左)  vs E (体验驱动/右)
//   social:     S (独狼/左)      vs G (社群动物/右)
//   style:      D (计划狂/左)    vs P (随性派/右)
//   ritual:     G (装备党/左)    vs M (极简派/右)

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
    left:  { code: 'S', label: '独狼' },
    right: { code: 'G', label: '社群动物' },
  },
  style: {
    name: '风格',
    left:  { code: 'D', label: '计划狂' },
    right: { code: 'P', label: '随性派' },
  },
  ritual: {
    name: '仪式感',
    left:  { code: 'G', label: '装备党' },
    right: { code: 'M', label: '极简派' },
  },
};
