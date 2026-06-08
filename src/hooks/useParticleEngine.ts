// useParticleEngine - 粒子引擎逻辑 Hook
// Phase 2 模块五：背景粒子效果
// 管理粒子生命周期：初始化、更新、绘制

import { useCallback, useRef } from 'react';

// ─── 类型定义 ────────────────────────────────────────

export interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
  baseOpacity: number;
  opacityPhase: number;
  shape: 'circle' | 'diamond';
}

// ─── 颜色生成 ────────────────────────────────────────

/** hex → {r, g, b} */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 255, g: 107, b: 53 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/** 生成粒子颜色变体数组 */
export function particleColors(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  return [
    // 1. 浅色版
    `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`,
    `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`,
    `rgba(${rgb.r},${rgb.g},${rgb.b},0.06)`,
    // 2. 白色混合
    `rgba(255,255,255,0.06)`,
    `rgba(255,255,255,0.04)`,
    // 3. 微调色相
    `rgba(${Math.min(255, rgb.r + 20)},${rgb.g},${Math.max(0, rgb.b - 10)},0.08)`,
  ];
}

// ─── 粒子初始化 ──────────────────────────────────────

export function initParticles(
  count: number,
  baseColor: string,
  width: number,
  height: number
): Particle[] {
  const colors = particleColors(baseColor);
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 4 + Math.random() * 8, // 4-12px
      color,
      vx: (Math.random() - 0.5) * 20, // -10 ~ 10 px/s
      vy: -(20 + Math.random() * 40), // -20 ~ -60 px/s (向上)
      opacity: 0.08,
      baseOpacity: 0.08,
      opacityPhase: Math.random() * Math.PI * 2,
      shape: Math.random() < 0.8 ? 'circle' : 'diamond',
    });
  }

  return particles;
}

// ─── 粒子更新 ────────────────────────────────────────

export function updateParticle(
  p: Particle,
  dt: number,
  width: number,
  height: number,
  time: number
): Particle {
  let x = p.x + p.vx * dt;
  let y = p.y + p.vy * dt;

  // 边界回收 / 反弹
  if (y < -20) {
    y = height + 20;
    x = Math.random() * width;
  }
  if (x < -20 || x > width + 20) {
    p = { ...p, vx: -p.vx };
    x = Math.max(-20, Math.min(width + 20, x));
  }

  // 透明度波动
  const opacity = p.baseOpacity + Math.sin(time * 0.5 + p.opacityPhase) * 0.02;

  return { ...p, x, y, opacity };
}

// ─── 粒子绘制 ────────────────────────────────────────

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
  ctx.fillStyle = p.color;
  ctx.beginPath();

  if (p.shape === 'circle') {
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  } else {
    // diamond
    const r = p.radius;
    ctx.moveTo(p.x, p.y - r);
    ctx.lineTo(p.x + r, p.y);
    ctx.lineTo(p.x, p.y + r);
    ctx.lineTo(p.x - r, p.y);
    ctx.closePath();
  }

  ctx.fill();
}

// ─── 性能降级检测 ────────────────────────────────────

export interface DegradeConfig {
  count: number;
  fps: number;
}

export function getDegradeConfig(): DegradeConfig {
  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 4) {
    return { count: 10, fps: 30 };
  }
  return { count: 20, fps: 60 };
}

// ─── Hook ────────────────────────────────────────────

export interface ParticleEngine {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  start: () => void;
  stop: () => void;
}

export function useParticleEngine(
  color: string,
  count?: number,
  speed?: number
): ParticleEngine {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const runningRef = useRef(false);

  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    let dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0.016;
    lastTimeRef.current = now;

    // Cap dt to prevent spiral of death after tab switch
    dt = Math.min(dt, 0.1);

    timeRef.current += dt;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Try screen blend mode, fallback to lighter
    try {
      ctx.globalCompositeOperation = 'screen';
    } catch {
      ctx.globalCompositeOperation = 'lighter';
    }

    // Update and draw particles
    const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
    const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

    particlesRef.current = particlesRef.current.map((p) =>
      updateParticle(p, dt * (speed || 1), width, height, timeRef.current)
    );

    for (const p of particlesRef.current) {
      drawParticle(ctx, p);
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [speed]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Detect degradation
    const degrade = getDegradeConfig();
    const particleCount = count ?? degrade.count;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth * dpr;
    const height = window.innerHeight * dpr;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    particlesRef.current = initParticles(
      particleCount,
      color,
      window.innerWidth,
      window.innerHeight
    );

    lastTimeRef.current = 0;
    timeRef.current = 0;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(renderLoop);
  }, [color, count, renderLoop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  return { canvasRef, start, stop };
}
