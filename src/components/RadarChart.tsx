// RadarChart - Canvas 四维雷达图组件
// Phase 2 模块三：四维雷达图
// Canvas 四边形雷达图 + DOM 维度表格
// 注意: 仅展示4个维度（motivation/social/style/ritual），expression另作展示

import { useRef, useEffect } from 'react';
import type { DimensionScores } from '../engine/types';
import { dimensionLabels } from '../engine/dimensionLabels';
import styles from '../styles/components/RadarChart.module.css';

// ─── 类型定义 ────────────────────────────────────────

/** 雷达图使用4维（排除expression，该维度单独展示） */
export type RadarDimension = 'motivation' | 'social' | 'style' | 'ritual';

interface RadarChartProps {
  dimensionScores: DimensionScores;
  color: string;
  width?: number;
  height?: number;
  animate?: boolean;
  visible?: boolean; // 配合入场动画
}

interface Vertex {
  x: number;
  y: number;
}

// ─── 纯函数：数据转换 ────────────────────────────────

/** score ∈ [-2, 2] → percentage ∈ [0, 100] */
export function scoreToPercent(score: number): number {
  return ((score + 2) / 4) * 100;
}

/** 计算四维顶点坐标 */
export function computeVertices(
  percents: Record<RadarDimension, number>,
  cx: number,
  cy: number,
  radius: number
): Record<RadarDimension, Vertex> {
  // 四边形顶点：上=右=下=左
  return {
    motivation: {
      x: cx,
      y: cy - (percents.motivation / 100) * radius,
    },
    social: {
      x: cx + (percents.social / 100) * radius,
      y: cy,
    },
    style: {
      x: cx,
      y: cy + (percents.style / 100) * radius,
    },
    ritual: {
      x: cx - (percents.ritual / 100) * radius,
      y: cy,
    },
  };
}

// ─── Canvas 绘制函数 ─────────────────────────────────

function drawBackgroundGrid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 0.5;

  for (const ratio of [0.25, 0.5, 0.75]) {
    const r = radius * ratio;
    ctx.beginPath();
    // 四边形：上→右→下→左→闭合
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.stroke();
  }

  // 中轴线
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx, cy + radius);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.stroke();
}

function drawDataPolygon(
  ctx: CanvasRenderingContext2D,
  vertices: Record<RadarDimension, Vertex>,
  color: string,
  progress: number
): void {
  const dims: RadarDimension[] = ['motivation', 'social', 'style', 'ritual'];
  const cx = vertices.motivation.x; // 圆心 x（motivation 顶点 x 即 centerX）
  const cy = (vertices.motivation.y + vertices.style.y) / 2; // 圆心 y

  // 根据 progress 内插顶点位置
  ctx.beginPath();
  const firstV = vertices[dims[0]];
  const firstX = cx + (firstV.x - cx) * progress;
  const firstY = cy + (firstV.y - cy) * progress;
  ctx.moveTo(firstX, firstY);

  for (let i = 1; i < dims.length; i++) {
    const v = vertices[dims[i]];
    const x = cx + (v.x - cx) * progress;
    const y = cy + (v.y - cy) * progress;
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  // 填充
  ctx.fillStyle = color + '40'; // 25% opacity
  ctx.fill();

  // 描边
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawVertexDots(
  ctx: CanvasRenderingContext2D,
  vertices: Record<RadarDimension, Vertex>,
  color: string,
  progress: number
): void {
  const dims: RadarDimension[] = ['motivation', 'social', 'style', 'ritual'];
  const cx = vertices.motivation.x;
  const cy = (vertices.motivation.y + vertices.style.y) / 2;

  ctx.fillStyle = color;

  for (const dim of dims) {
    const v = vertices[dim];
    const x = cx + (v.x - cx) * progress;
    const y = cy + (v.y - cy) * progress;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.font = 'bold 14px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#9CA3AF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const labels: Record<string, { x: number; y: number; label: string }> = {
    motivation: { x: cx, y: cy - radius - 12, label: '动机' },
    social: { x: cx + radius + 24, y: cy + 6, label: '社交' },
    style: { x: cx, y: cy + radius + 20, label: '风格' },
    ritual: { x: cx - radius - 24, y: cy + 6, label: '仪式感' },
  };

  for (const key of Object.keys(labels)) {
    const l = labels[key];
    ctx.fillText(l.label, l.x, l.y);
  }
}

// ─── React 组件 ──────────────────────────────────────

export default function RadarChart({
  dimensionScores,
  color,
  width = 280,
  height = 280,
  animate = true,
  visible = true,
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const startTimeRef = useRef(0);

  const dims: RadarDimension[] = ['motivation', 'social', 'style', 'ritual'];
  const percents: Record<RadarDimension, number> = {
    motivation: scoreToPercent(dimensionScores.motivation),
    social: scoreToPercent(dimensionScores.social),
    style: scoreToPercent(dimensionScores.style),
    ritual: scoreToPercent(dimensionScores.ritual),
  };

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const vertices = computeVertices(percents, cx, cy, radius);

  // 绘制函数
  const render = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // dpr 适配
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = width;
    const logicalH = height;
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = logicalW + 'px';
    canvas.style.height = logicalH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, logicalW, logicalH);

    drawBackgroundGrid(ctx, cx, cy, radius);
    drawDataPolygon(ctx, vertices, color, progress);
    drawVertexDots(ctx, vertices, color, progress);
    drawLabels(ctx, cx, cy, radius);
  };

  // 动画循环
  useEffect(() => {
    if (!animate || !visible) {
      render(1);
      return;
    }

    progressRef.current = 0;
    startTimeRef.current = 0;

    const animateLoop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const duration = 300; // 300ms
      const t = Math.min(elapsed / duration, 1);

      // ease-out: 1 - (1-t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      progressRef.current = eased;
      render(eased);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animateLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, visible, color, dimensionScores.motivation, dimensionScores.social, dimensionScores.style, dimensionScores.ritual]);

  // prefers-reduced-motion 立即渲染
  useEffect(() => {
    if (!animate) {
      render(1);
    }
  });

  // ─── 维度表格数据 ──────────────────────────────────

  const tableData = dims.map((dim) => {
    const labels = dimensionLabels[dim];
    const score = dimensionScores[dim];
    const percent = percents[dim];
    const direction = score > 0 ? 'right' : 'left';

    return {
      dim,
      name: labels.name,
      leftLabel: labels.left.label,
      rightLabel: labels.right.label,
      percent: Math.round(percent),
      direction,
    };
  });

  return (
    <div className={styles.radarCard}>
      <h3 className={styles.radarTitle}>📊 你的跑步能力面板</h3>

      <canvas
        ref={canvasRef}
        className={styles.radarCanvas}
        aria-label="四维跑步人格雷达图"
        role="img"
      />

      {/* 维度表格 */}
      <div className={styles.dimensionTable}>
        {tableData.map((row) => (
          <div key={row.dim} className={styles.dimensionRow}>
            <div className={styles.dimensionHeader}>
              <span
                className={`${styles.poleLabel} ${row.direction === 'left' ? styles.activePole : ''}`}
              >
                {row.leftLabel}
              </span>
              <span className={styles.dimName}>{row.name}</span>
              <span
                className={`${styles.poleLabel} ${row.direction === 'right' ? styles.activePole : ''}`}
              >
                {row.rightLabel}
              </span>
            </div>
            <div className={styles.dimensionBar}>
              <div
                className={styles.dimensionBarFill}
                style={{
                  width: `${row.percent}%`,
                  background: color,
                }}
              />
            </div>
            <span className={styles.dimensionPercent}>{row.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
