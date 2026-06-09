// PkCanvasRenderer — PK 对比卡片 Canvas 绘制器（1080×1920）
// v3.3-Phase3: 中性渐变 + 双SVG + 匹配度 + 维度对比
// Canvas 2D API only, zero new npm deps

import type { PkResult, PersonalityCode } from '../engine/types';
import { loadPersonalitySvgImg } from '../utils/svgLoader';
import { getPersonality } from '../engine/personalities';

const W = 1080;
const H = 1920;
const JPEG_QUALITY = 0.92;

// ─── 绘制工具 ────────────────────────────────────────

// ─── 背景 ───────────────────────────────────────────

function drawPkBackground(ctx: CanvasRenderingContext2D) {
  // 中性深色渐变
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#1a1a2e');
  bgGrad.addColorStop(0.5, '#16213e');
  bgGrad.addColorStop(1, '#0f3460');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 弥散光球
  const glow1 = ctx.createRadialGradient(W * 0.2, H * 0.1, 0, W * 0.2, H * 0.1, 300);
  glow1.addColorStop(0, 'rgba(255,107,53,0.06)');
  glow1.addColorStop(1, 'rgba(255,107,53,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, 300);
  glow2.addColorStop(0, 'rgba(33,150,243,0.05)');
  glow2.addColorStop(1, 'rgba(33,150,243,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);
}

// ─── 标题 ───────────────────────────────────────────

function drawTitle(ctx: CanvasRenderingContext2D, y: number) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('⚔️ 跑步人格 PK', W / 2, y);

  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('看看你和好友的跑步匹配度', W / 2, y + 48);
}

// ─── 双 SVG 绘制 ────────────────────────────────────

async function drawDualIcons(
  ctx: CanvasRenderingContext2D,
  codeA: PersonalityCode,
  codeB: PersonalityCode,
  y: number,
) {
  const iconSize = 200;
  const gap = 120;
  const leftX = W / 2 - gap - iconSize;
  const rightX = W / 2 + gap;

  const [imgA, imgB] = await Promise.all([
    loadPersonalitySvgImg(codeA),
    loadPersonalitySvgImg(codeB),
  ]);

  // VS标志
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 40px "PingFang SC", sans-serif';
  ctx.fillText('VS', W / 2, y + iconSize / 2 + 12);

  // 左侧图标
  if (imgA) {
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
    ctx.shadowBlur = 40;
    ctx.drawImage(imgA, leftX, y, iconSize, iconSize);
    ctx.restore();
  } else {
    // emoji fallback
    const pA = getPersonality(codeA);
    ctx.font = '120px "Apple Color Emoji", sans-serif';
    ctx.fillText(pA?.emoji ?? '🏃', leftX + iconSize / 2, y + iconSize * 0.75);
  }

  // 右侧图标
  if (imgB) {
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
    ctx.shadowBlur = 40;
    ctx.drawImage(imgB, rightX, y, iconSize, iconSize);
    ctx.restore();
  } else {
    const pB = getPersonality(codeB);
    ctx.font = '120px "Apple Color Emoji", sans-serif';
    ctx.fillText(pB?.emoji ?? '🏃', rightX + iconSize / 2, y + iconSize * 0.75);
  }
}

// ─── 人格名 ─────────────────────────────────────────

function drawNames(
  ctx: CanvasRenderingContext2D,
  nameA: string, codeA: string,
  nameB: string, codeB: string,
  colorA: string, colorB: string,
  y: number,
) {
  const gap = 120;
  const iconSize = 200;

  // 左名
  ctx.textAlign = 'center';
  ctx.fillStyle = colorA;
  ctx.font = 'bold 36px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(nameA, W / 2 - gap - iconSize / 2, y);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '22px "PingFang SC", sans-serif';
  ctx.fillText(codeA, W / 2 - gap - iconSize / 2, y + 36);

  // 右名
  ctx.fillStyle = colorB;
  ctx.font = 'bold 36px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(nameB, W / 2 + gap + iconSize / 2, y);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '22px "PingFang SC", sans-serif';
  ctx.fillText(codeB, W / 2 + gap + iconSize / 2, y + 36);
}

// ─── 匹配度 ─────────────────────────────────────────

function drawMatchScore(
  ctx: CanvasRenderingContext2D,
  matchPercentage: number,
  judgment: string,
  y: number,
) {
  // 匹配度数字
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFC107';
  ctx.font = 'bold 72px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(`${matchPercentage}%`, W / 2, y);

  // 匹配度标签
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '28px "PingFang SC", sans-serif';
  ctx.fillText('匹配度', W / 2, y + 48);

  // 判定
  ctx.fillStyle = '#FF6B35';
  ctx.font = 'bold 32px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(judgment, W / 2, y + 96);
}

// ─── 四维对比 ────────────────────────────────────────

const DIM_NAMES: Record<string, string> = {
  motivation: '动机',
  social: '社交',
  style: '风格',
  ritual: '仪式',
};

function drawDimensionComparison(
  ctx: CanvasRenderingContext2D,
  dim: string,
  label: string,
  isComplementary: boolean,
  rowY: number,
  leftColor: string,
  rightColor: string,
) {
  const dimName = DIM_NAMES[dim] || dim;
  const [leftLabel, rightLabel] = label.split(isComplementary ? ' ←→ ' : '  VS  ');

  // 左极
  ctx.textAlign = 'right';
  ctx.fillStyle = leftColor;
  ctx.font = 'bold 26px "PingFang SC", sans-serif';
  ctx.fillText(leftLabel || '', W * 0.3, rowY);

  // 维度名（中）
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '22px "PingFang SC", sans-serif';
  ctx.fillText(dimName, W / 2, rowY);

  // 互补标记
  if (isComplementary) {
    ctx.fillStyle = '#4CAF50';
    ctx.font = '18px "PingFang SC", sans-serif';
    ctx.fillText('✓互补', W / 2, rowY + 28);
  }

  // 右极
  ctx.textAlign = 'left';
  ctx.fillStyle = rightColor;
  ctx.font = 'bold 26px "PingFang SC", sans-serif';
  ctx.fillText(rightLabel || '', W * 0.7, rowY);
}

// ─── 底部 ────────────────────────────────────────────

function drawFooter(ctx: CanvasRenderingContext2D) {
  const y = H - 120;

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '24px "PingFang SC", sans-serif';
  ctx.fillText('扫码测测你的跑步人格 →', W / 2, y);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '20px "PingFang SC", sans-serif';
  ctx.fillText('跑步人格测试 · Running Personality', W / 2, y + 48);
}

// ─── 主入口 ──────────────────────────────────────────

export async function renderPkCard(
  pkResult: PkResult,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const pA = getPersonality(pkResult.codeA);
  const pB = getPersonality(pkResult.codeB);
  const colorA = pA?.color ?? '#FF6B35';
  const colorB = pB?.color ?? '#2196F3';

  // 1. 背景
  drawPkBackground(ctx);

  // 2. 标题
  let curY = 120;
  drawTitle(ctx, curY);
  curY += 100;

  // 3. 双SVG图标
  const iconY = curY;
  await drawDualIcons(ctx, pkResult.codeA, pkResult.codeB, iconY);
  curY = iconY + 240;

  // 4. 人格名
  drawNames(ctx, pkResult.nameA, pkResult.codeA, pkResult.nameB, pkResult.codeB, colorA, colorB, curY);
  curY += 80;

  // 5. 匹配度
  curY += 40;
  drawMatchScore(ctx, pkResult.matchPercentage, pkResult.judgment, curY);
  curY += 150;

  // 6. 四维对比
  curY += 40;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '24px "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('— 四维对比 —', W / 2, curY);
  curY += 56;

  const rowH = 72;
  for (const c of pkResult.dimensionComparisons) {
    drawDimensionComparison(
      ctx, c.dimension, c.label, c.isComplementary, curY,
      colorA, colorB,
    );
    curY += rowH;
  }

  // 7. 解读文字
  curY += 40;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  const descLines = wrapTextPk(ctx, `「${pkResult.description}」`, W - 200);
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], W / 2, curY + i * 40);
  }
  curY += descLines.length * 40 + 40;

  // 8. 匹配度总结
  const stars = '⭐'.repeat(pkResult.rating);
  ctx.fillStyle = '#FFC107';
  ctx.font = '32px "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stars, W / 2, curY);
  curY += 60;

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '24px "PingFang SC", sans-serif';
  ctx.fillText(`互补维度：${pkResult.complementCount}/4  |  匹配度：${pkResult.matchPercentage}%`, W / 2, curY);

  // 9. 底部
  drawFooter(ctx);

  // 导出 JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

function wrapTextPk(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
