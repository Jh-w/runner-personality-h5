// 雷达图数据转换单元测试 — Phase 2 模块三
// 覆盖 scoreToPercent / computeVertices / 32型全量快照

import { describe, it, expect } from 'vitest';
import { scoreToPercent, computeVertices } from '../../components/RadarChart';
import type { RadarDimension } from '../../components/RadarChart';
import { getAllPersonalities } from '../personalities';

// ─── scoreToPercent ─────────────────────────────────

describe('scoreToPercent', () => {
  it('score=-2 → 0%', () => {
    expect(scoreToPercent(-2)).toBe(0);
  });

  it('score=0 → 50%', () => {
    expect(scoreToPercent(0)).toBe(50);
  });

  it('score=+2 → 100%', () => {
    expect(scoreToPercent(2)).toBe(100);
  });

  it('score=-1 → 25%', () => {
    expect(scoreToPercent(-1)).toBe(25);
  });

  it('score=+1 → 75%', () => {
    expect(scoreToPercent(1)).toBe(75);
  });

  it('score=-0.5 → 37.5%', () => {
    expect(scoreToPercent(-0.5)).toBe(37.5);
  });

  it('score=+0.5 → 62.5%', () => {
    expect(scoreToPercent(0.5)).toBe(62.5);
  });
});

// ─── computeVertices ────────────────────────────────

describe('computeVertices', () => {
  const dims: RadarDimension[] = ['motivation', 'social', 'style', 'ritual'];
  const cx = 140;
  const cy = 140;
  const radius = 98; // 280 * 0.35

  it('all 50% → diamond shape (square rotated 45°)', () => {
    const percents: Record<RadarDimension, number> = {
      motivation: 50,
      social: 50,
      style: 50,
      ritual: 50,
    };
    const vertices = computeVertices(percents, cx, cy, radius);

    expect(vertices.motivation.x).toBe(cx);
    expect(vertices.motivation.y).toBe(cy - radius * 0.5);

    expect(vertices.social.x).toBe(cx + radius * 0.5);
    expect(vertices.social.y).toBe(cy);

    expect(vertices.style.x).toBe(cx);
    expect(vertices.style.y).toBe(cy + radius * 0.5);

    expect(vertices.ritual.x).toBe(cx - radius * 0.5);
    expect(vertices.ritual.y).toBe(cy);
  });

  it('all 0% → all vertices at center', () => {
    const percents: Record<RadarDimension, number> = {
      motivation: 0,
      social: 0,
      style: 0,
      ritual: 0,
    };
    const vertices = computeVertices(percents, cx, cy, radius);

    for (const dim of dims) {
      expect(vertices[dim].x).toBe(cx);
      expect(vertices[dim].y).toBe(cy);
    }
  });

  it('all 100% → full diamond', () => {
    const percents: Record<RadarDimension, number> = {
      motivation: 100,
      social: 100,
      style: 100,
      ritual: 100,
    };
    const vertices = computeVertices(percents, cx, cy, radius);

    expect(vertices.motivation.y).toBe(cy - radius);
    expect(vertices.social.x).toBe(cx + radius);
    expect(vertices.style.y).toBe(cy + radius);
    expect(vertices.ritual.x).toBe(cx - radius);
  });

  it('asymmetric scores produce deformed quadrilateral', () => {
    const percents: Record<RadarDimension, number> = {
      motivation: 75,
      social: 25,
      style: 60,
      ritual: 40,
    };
    const vertices = computeVertices(percents, cx, cy, radius);

    // All vertices should have different positions
    const positions = dims.map((d) => `${vertices[d].x},${vertices[d].y}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(dims.length);
  });
});

// ─── 32 型全量快照测试 ──────────────────────────────

describe('32-type dimension data snapshot', () => {
  const personalities = getAllPersonalities();

  personalities.forEach((p) => {
    it(`typeId ${p.typeId}: ${p.name} has valid dimensionScores`, () => {
      const ds = p.dimensionScores;

      // 所有得分在 -2 到 +2 范围内（检查所有5维）
      const allDims = ['motivation', 'social', 'style', 'ritual', 'expression'] as const;
      for (const dim of allDims) {
        expect(ds[dim]).toBeGreaterThanOrEqual(-2);
        expect(ds[dim]).toBeLessThanOrEqual(2);
      }

      // 至少有一个得分非零
      const hasNonZero = Object.values(ds).some((v) => v !== 0);
      expect(hasNonZero).toBe(true);
    });

    it(`typeId ${p.typeId}: radar vertices computed without NaN`, () => {
      const ds = p.dimensionScores;
      const percents: Record<RadarDimension, number> = {
        motivation: scoreToPercent(ds.motivation),
        social: scoreToPercent(ds.social),
        style: scoreToPercent(ds.style),
        ritual: scoreToPercent(ds.ritual),
      };

      const vertices = computeVertices(percents, 140, 140, 98);

      const radarDims: RadarDimension[] = ['motivation', 'social', 'style', 'ritual'];
      for (const dim of radarDims) {
        expect(Number.isFinite(vertices[dim].x)).toBe(true);
        expect(Number.isFinite(vertices[dim].y)).toBe(true);
      }
    });
  });
});
