// CanvasRenderer — Phase 1+3 满幅高饱和渐变分享卡片 (1080×1440)
// Phase 3: SVG drawImage + emoji fallback
// 组件不渲染 DOM，仅提供 generateImage() 并在挂载时预生成
import { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import type { PersonalityResult, BestBuddy } from '../engine/types';
import type { PersonalityCode } from '../engine/types';
import { getPersonality } from '../engine/personalities';
import { loadPersonalitySvgImg } from '../utils/svgLoader';

interface CanvasRendererProps {
  personality: PersonalityResult;
  onGenerated?: (blob: Blob) => void;
}

// ---------- 常量 ----------

const W = 1080, H = 1440;
const CARD_W = 880;          // 搭档卡片宽度
const CARD_X = (W - CARD_W) / 2; // 100
const JPEG_QUALITY = 0.92;

// ---------- 绘制工具 ----------

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** 绘制文字并返回占用的高度（行高 × 行数） */
function drawTextLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center',
): number {
  ctx.textAlign = align;
  const baseX = align === 'center' ? W / 2 : x;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], baseX, y + i * lineHeight);
  }
  return lines.length * lineHeight;
}

// ---------- 背景绘制 ----------

function drawBackground(ctx: CanvasRenderingContext2D, color: string, colorDark: string) {
  // 1. 满幅高饱和渐变 (135° 对角线: 左上→右下)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, color);
  grad.addColorStop(1, colorDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. 弥散光球叠加 (径向渐变模拟)
  const cx = W * 0.3;
  const cy = H * 0.15;
  const radius = 185;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glow.addColorStop(0, 'rgba(255,255,255,0.12)');
  glow.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

// ---------- 人格图标绘制（Phase 3: SVG 优先）----------

async function drawPersonalityIcon(
  ctx: CanvasRenderingContext2D,
  code: PersonalityCode,
  emoji: string,
  x: number,
  y: number,
  size: number,
): Promise<void> {
  const img = await loadPersonalitySvgImg(code);

  if (img) {
    // SVG 绘制 + 底部弥散光效
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 32;
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    ctx.restore();
  } else {
    // Emoji fallback
    ctx.textAlign = 'center';
    ctx.font = `${size * 0.83}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 8;
    ctx.fillText(emoji, x, y + size * 0.35);
    ctx.restore();
  }
}

// ---------- 金句绘制 ----------

function drawQuote(ctx: CanvasRenderingContext2D, quote: string, y: number, maxLines = 3): number {
  if (!quote) return 0;

  const fontSize = 36;
  const lineHeight = 52;
  const maxWidth = W - 200; // 左右留 100px
  const text = `「${quote}」`;

  ctx.font = `italic ${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';

  let lines = wrapText(ctx, text, maxWidth);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    // 最后一行加省略号
    const last = lines[lines.length - 1];
    while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
      lines[lines.length - 1] = last.slice(0, -1);
    }
    lines[lines.length - 1] += '...';
  }

  drawTextLines(ctx, lines, 0, y, lineHeight, 'center');
  return lines.length * lineHeight;
}

// ---------- 胶囊标签 ----------

interface CapsuleMetrics { width: number; height: number }

function measureCapsule(ctx: CanvasRenderingContext2D, text: string): CapsuleMetrics {
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", sans-serif';
  const textWidth = ctx.measureText(text).width;
  return {
    width: textWidth + 28 * 2,   // 左右 padding 28px
    height: 24 + 12 * 2,          // 上下 padding 12px
  };
}

function drawSingleCapsule(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  const { width, height } = measureCapsule(ctx, text);
  const radius = 20;

  // 背景
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // 边框
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();

  // 文字
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.textBaseline = 'alphabetic';
}

function drawCapsuleTags(ctx: CanvasRenderingContext2D, keywords: [string, string, string], y: number): number {
  const gap = 16;
  const metrics = keywords.map(k => measureCapsule(ctx, k));
  const totalWidth = metrics.reduce((sum, m) => sum + m.width, 0) + gap * (keywords.length - 1);
  let x = (W - totalWidth) / 2;

  for (let i = 0; i < keywords.length; i++) {
    drawSingleCapsule(ctx, keywords[i], x, y);
    x += metrics[i].width + gap;
  }

  return metrics[0].height;
}

// ---------- QR Code 相关 ----------

async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

// ---------- 核心绘制 ----------

export async function renderShareCard(personality: PersonalityResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const color = personality.color;
  const colorDark = personality.colorDark ?? personality.color;

  // ═══ 1. 背景 ═══
  drawBackground(ctx, color, colorDark);

  // ═══ 2. 人格图标（Phase 3: SVG 优先）═══
  let curY = 250;
  const iconSize = 180;
  await drawPersonalityIcon(ctx, personality.code as PersonalityCode, personality.emoji, W / 2, curY + iconSize / 2, iconSize);
  curY += iconSize + 20;

  // ═══ 3. 人格名 ═══
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(personality.name, W / 2, curY);
  curY += 80;

  // ═══ 4. 金句 ═══
  if (personality.quote) {
    const quoteH = drawQuote(ctx, personality.quote, curY);
    curY += quoteH + 50;
  }

  // ═══ 5. 胶囊标签 ═══
  if (personality.keywords?.length === 3) {
    const tagH = drawCapsuleTags(ctx, personality.keywords, curY);
    curY += tagH + 50;
  }

  // ═══ 6. 最佳搭档卡片 ═══
  if (personality.bestBuddy) {
    const cardY = curY + 30;
    const cardH = drawBuddyCardFull(ctx, personality.bestBuddy, CARD_X, cardY);
    curY = cardY + cardH + 60;
  }

  // ═══ 7. CTA 引导语 ═══
  const brandY = 1400;
  const qrSize = 200;
  const qrPadding = 16;
  const qrSubstrateSize = qrSize + qrPadding * 2;
  const minQrTop = brandY - qrSubstrateSize - 80 - 60;

  if (curY > minQrTop) {
    curY = minQrTop;
  }

  // CTA 文案
  const ctaY = curY;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px "PingFang SC", "Helvetica Neue", sans-serif';
  const ctaText1 = `你是「${personality.name}」吗？`;
  ctx.fillText(ctaText1, W / 2, ctaY);
  ctx.font = '28px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('扫码测测看 → 和好友 PK！', W / 2, ctaY + 48);
  curY = ctaY + 80;

  // ═══ 8. QR Code ═══
  const qrSubstrateY = curY;
  const qrSubstrateX = (W - qrSubstrateSize) / 2;

  // 白色圆角衬底
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrSubstrateX, qrSubstrateY, qrSubstrateSize, qrSubstrateSize, 10);
  ctx.fill();

  const shareUrl = `https://runningtype.cn/#/result/${personality.typeId}`;
  try {
    const qrDataUrl = await generateQRDataUrl(shareUrl);
    const qrImg = await loadImage(qrDataUrl);
    const qrX = qrSubstrateX + qrPadding;
    const qrY = qrSubstrateY + qrPadding;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrSubstrateX + qrPadding, qrSubstrateY + qrPadding, qrSize, qrSize);
    ctx.fillStyle = '#999999';
    ctx.font = '20px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码测试', W / 2, qrSubstrateY + qrPadding + qrSize / 2);
  }

  // ═══ 9. 品牌标识 ═══
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '28px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('跑步人格测试 · Running Personality', W / 2, brandY);

  // ═══ 导出 JPEG ═══
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

// ---------- 搭档卡片辅助函数 ----------

function drawBuddyCardFull(
  ctx: CanvasRenderingContext2D,
  buddy: BestBuddy,
  x: number,
  y: number,
): number {
  const buddyPersonality = getPersonality(buddy.code);
  const buddyColor = buddyPersonality?.color ?? '#888888';
  const cardPadding = 40;
  const innerX = x + cardPadding;
  const innerW = CARD_W - cardPadding * 2;

  // ── 预测量各部分高度 ──
  let estY = 0;

  // 标题
  estY += 50;

  // 搭档 emoji + name 行
  estY += 80;

  // 搭档金句
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  const quoteLines = wrapText(ctx, `「${buddy.quote}」`, innerW - 20);
  estY += quoteLines.length * 38;

  // 搭档解读
  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  const descLines = wrapText(ctx, buddy.pairDescription, innerW - 20);
  estY += descLines.length * 34 + 16;

  const cardH = estY + cardPadding;

  // ── 绘制卡片背景 ──
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  drawRoundedRect(ctx, x, y, CARD_W, cardH, 24);
  ctx.fill();
  ctx.restore();

  // ── 左侧色条 ──
  const barX = x + 30;
  const barW = 6;
  ctx.fillStyle = buddyColor;
  drawRoundedRect(ctx, barX, y + 30, barW, cardH - 60, 3);
  ctx.fill();

  // ── 绘制内容 ──
  let cy = y + cardPadding;

  // 标题
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 28px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🤝 最佳跑团搭档', innerX, cy + 28);
  cy += 50;

  // 搭档 emoji + 名称（同一行）
  ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(buddy.emoji, innerX, cy + 48);
  ctx.fillStyle = buddyColor;
  ctx.font = 'bold 36px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(buddy.name, innerX + 80, cy + 36);
  cy += 80;

  // 搭档金句
  ctx.fillStyle = '#888888';
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  for (let i = 0; i < quoteLines.length; i++) {
    ctx.fillText(quoteLines[i], innerX, cy + i * 38);
  }
  cy += quoteLines.length * 38 + 16;

  // 搭档解读
  ctx.fillStyle = '#555555';
  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], innerX, cy + i * 34);
  }

  return cardH;
}

// ---------- React 组件 ----------

export default function CanvasRenderer({ personality, onGenerated }: CanvasRendererProps) {
  const blobRef = useRef<Blob | null>(null);
  const generatedRef = useRef(false);

  // 预生成策略：挂载时自动生成
  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;

    renderShareCard(personality).then(blob => {
      blobRef.current = blob;
      onGenerated?.(blob);
    }).catch(err => {
      console.error('CanvasRenderer pre-generate failed:', err);
    });
  }, [personality, onGenerated]);

  const generateImage = useCallback(async (): Promise<Blob> => {
    if (blobRef.current) return blobRef.current;
    const blob = await renderShareCard(personality);
    blobRef.current = blob;
    return blob;
  }, [personality]);

  // 暴露方法给父组件
  useEffect(() => {
    (window as any).__shareGenerateImage = generateImage;
    return () => { delete (window as any).__shareGenerateImage; };
  }, [generateImage]);

  return null; // 不渲染 DOM
}
