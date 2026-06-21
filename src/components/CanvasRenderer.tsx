// CanvasRenderer — v4.3 浅色底分享卡片 (1080×1440)
// v4.3: 动物PNG替代SVG跑者 / 5维标签条 / 风味角标 / shareTagline
// Layer 1: 浅色底 #f5f0eb
// Layer 2: 人格色弥散光（左上 + 右下 radialGradient）
// 组件不渲染 DOM，仅提供 generateImage() 并在挂载时预生成
import { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import type { PersonalityResult, BestBuddy } from '../engine/types';
import type { PersonalityCode } from '../engine/types';
import { getPersonality } from '../engine/personalities';

interface CanvasRendererProps {
  personality: PersonalityResult;
  onGenerated?: (blob: Blob) => void;
}

// ---------- 常量 ----------

const W = 1080, H = 1440;
const CARD_W = 880;
const CARD_X = (W - CARD_W) / 2;
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

// ---------- 图片加载 ----------

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

// ---------- 背景绘制 v4.3 — 浅色底 + 弥散光 ═══

function drawBackground(ctx: CanvasRenderingContext2D, glowColor: string) {
  // Layer 1: 浅色底
  ctx.fillStyle = '#f5f0eb';
  ctx.fillRect(0, 0, W, H);

  // Layer 2: 左上弥散光球（人格色）
  const orb1 = ctx.createRadialGradient(W * 0.15, H * 0.12, 0, W * 0.15, H * 0.12, 500);
  orb1.addColorStop(0, glowColor);
  orb1.addColorStop(0.5, glowColor.replace(/[\d.]+\)$/, '0.06)'));
  orb1.addColorStop(1, 'transparent');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, W, H);

  // 右下弥散光球（人格色）
  const orb2 = ctx.createRadialGradient(W * 0.85, H * 0.55, 0, W * 0.85, H * 0.55, 450);
  orb2.addColorStop(0, glowColor);
  orb2.addColorStop(0.5, glowColor.replace(/[\d.]+\)$/, '0.05)'));
  orb2.addColorStop(1, 'transparent');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, W, H);
}

// ---------- v4.3 动物PNG绘制（替代原来SVG跑者小人）----------

async function drawAnimalPng(
  ctx: CanvasRenderingContext2D,
  animalImg: string | undefined,
  animalEmoji: string,
  x: number,
  y: number,
  size: number,
): Promise<void> {
  if (animalImg) {
    try {
      const img = await loadImage(animalImg);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      ctx.restore();
      return;
    } catch {
      // fallback to emoji
    }
  }

  // Emoji fallback
  ctx.textAlign = 'center';
  ctx.font = `${size * 0.7}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 4;
  ctx.fillText(animalEmoji, x, y + size * 0.3);
  ctx.restore();
}

// ---------- v4.3 5维标签条 ----------

const DIMENSION_LABELS: Record<string, { emoji: string; left: string; right: string }> = {
  motivation: { emoji: '💥', left: '竞技驱动', right: '体验驱动' },
  social: { emoji: '👥', left: '独狼', right: '社群跑者' },
  style: { emoji: '🎨', left: '计划型', right: '随性型' },
  ritual: { emoji: '🎒', left: '装备党', right: '极简派' },
  expression: { emoji: '📊', left: '数据派', right: '文艺派' },
};

const DIMENSION_ORDER = ['motivation', 'social', 'style', 'ritual', 'expression'] as const;

function drawDimensionStrip(
  ctx: CanvasRenderingContext2D,
  dimensionScores: { motivation: number; social: number; style: number; ritual: number; expression: number },
  y: number,
): number {
  const tagHeight = 44;
  const tagGap = 12;
  const totalWidth = CARD_W;
  const stripX = CARD_X;

  // 计算所有标签宽度
  const tags = DIMENSION_ORDER.map(dim => {
    const info = DIMENSION_LABELS[dim];
    const score = dimensionScores[dim];
    const label = score < 0 ? info.left : info.right;
    return { emoji: info.emoji, label };
  });

  // 动态计算每个标签宽度
  ctx.font = 'bold 18px "PingFang SC", "Helvetica Neue", sans-serif';
  const widths = tags.map(t => {
    const textW = ctx.measureText(`${t.emoji} ${t.label}`).width;
    return textW + 28; // padding
  });
  const totalTagsWidth = widths.reduce((a, b) => a + b, 0) + tagGap * (tags.length - 1);
  let curX = stripX + (totalWidth - totalTagsWidth) / 2;

  for (let i = 0; i < tags.length; i++) {
    const w = widths[i];
    const t = tags[i];

    // 标签背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    drawRoundedRect(ctx, curX, y, w, tagHeight, tagHeight / 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, curX, y, w, tagHeight, tagHeight / 2);
    ctx.stroke();

    // 标签文字
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px "PingFang SC", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${t.emoji} ${t.label}`, curX + w / 2, y + tagHeight / 2);
    ctx.textBaseline = 'alphabetic';

    curX += w + tagGap;
  }

  return tagHeight;
}

// ---------- v4.1 Hook 金句绘制 ----------

function drawHook(ctx: CanvasRenderingContext2D, hook: string, y: number): number {
  if (!hook) return 0;
  const fontSize = 36;
  const lineHeight = 52;
  const maxWidth = W - 160;
  const text = `「${hook}」`;

  ctx.font = `bold ${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = '#1a1a2e';
  ctx.textAlign = 'center';

  let lines = wrapText(ctx, text, maxWidth);
  if (lines.length > 2) lines = lines.slice(0, 2);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, y + i * lineHeight);
  }
  return lines.length * lineHeight;
}

// ---------- v4.1 Roast 脱口秀卡片绘制 ----------

function drawRoastCard(
  ctx: CanvasRenderingContext2D,
  roast: string,
  x: number,
  y: number,
): number {
  if (!roast) return 0;

  const cardPadding = 32;
  const cardW = CARD_W;
  const textMaxWidth = cardW - cardPadding * 2;
  const fontSize = 22;
  const lineHeight = 36;
  const maxLines = 7;

  ctx.font = `${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = '#444';

  let lines: string[] = [];
  const paragraphs = roast.split('\n');
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    const wrapped = wrapText(ctx, para, textMaxWidth);
    lines.push(...wrapped);
  }

  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines - 1);
    const lastLine = lines[lines.length - 1];
    while (ctx.measureText(lastLine + '…').width > textMaxWidth && lastLine.length > 0) {
      lines[lines.length - 1] = lastLine.slice(0, -1);
    }
    lines[lines.length - 1] += '…';
  }

  const textHeight = lines.length * lineHeight;
  const cardH = textHeight + cardPadding * 2;

  // 半透明白色卡片背景
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  drawRoundedRect(ctx, x, y, cardW, cardH, 20);
  ctx.fill();
  ctx.restore();

  // 边框
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, cardW, cardH, 20);
  ctx.stroke();

  // 文字
  ctx.fillStyle = '#444';
  ctx.font = `${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'left';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + cardPadding, y + cardPadding + (i + 1) * lineHeight - 8);
  }
  ctx.textAlign = 'center';

  return cardH;
}

// ---------- 金句绘制 ----------

function drawQuote(ctx: CanvasRenderingContext2D, quote: string, y: number, maxLines = 2): number {
  if (!quote) return 0;

  const fontSize = 30;
  const lineHeight = 44;
  const maxWidth = W - 200;
  const text = `「${quote}」`;

  ctx.font = `italic ${fontSize}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = '#666';

  let lines = wrapText(ctx, text, maxWidth);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[lines.length - 1];
    while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
      lines[lines.length - 1] = last.slice(0, -1);
    }
    lines[lines.length - 1] += '...';
  }

  drawTextLines(ctx, lines, 0, y, lineHeight, 'center');
  return lines.length * lineHeight;
}

// ---------- 胶囊标签 v4.3 — 浅色底半透明，最多5个 ───────────

function drawSingleCapsule(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = 'bold 20px "PingFang SC", "Helvetica Neue", sans-serif';
  const textWidth = ctx.measureText(text).width;
  const width = textWidth + 24 * 2;
  const height = 20 + 10 * 2;
  const radius = 20;

  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // 边框
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();

  // 文字
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
  ctx.textBaseline = 'alphabetic';

  return { width, height };
}

function drawCapsuleTags(ctx: CanvasRenderingContext2D, keywords: string[], y: number): number {
  const gap = 14;
  const metrics = keywords.map(k => {
    ctx.font = 'bold 20px "PingFang SC", "Helvetica Neue", sans-serif';
    const w = ctx.measureText(k).width + 24 * 2;
    return { width: w, height: 20 + 10 * 2 };
  });
  const totalWidth = metrics.reduce((sum, m) => sum + m.width, 0) + gap * (keywords.length - 1);
  let x = (W - totalWidth) / 2;

  for (let i = 0; i < keywords.length; i++) {
    drawSingleCapsule(ctx, keywords[i], x, y);
    x += metrics[i].width + gap;
  }

  return metrics[0].height;
}

// ---------- QR Code ----------

async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
}

// ---------- v4.3 风味角标 ----------

function drawFlavorBadge(ctx: CanvasRenderingContext2D) {
  const badgeSize = 80;
  const badgeX = W - badgeSize - 40;
  const badgeY = H - badgeSize - 40;

  // 圆形角标背景
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.10)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 标签文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('风味', badgeX + badgeSize / 2, badgeY + badgeSize / 2 - 6);
  ctx.fillText('标签', badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 14);
  ctx.textBaseline = 'alphabetic';
}

// ---------- 搭档卡片辅助函数 v4.3 ═══

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

  let estY = 0;
  estY += 50;       // 标题
  estY += 80;       // emoji + name
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  const quoteLines = wrapText(ctx, `「${buddy.quote}」`, innerW - 20);
  estY += quoteLines.length * 38;
  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  const descLines = wrapText(ctx, buddy.pairDescription, innerW - 20);
  estY += descLines.length * 34 + 16;

  const cardH = estY + cardPadding;

  // 半透明白色卡片
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  drawRoundedRect(ctx, x, y, CARD_W, cardH, 24);
  ctx.fill();
  ctx.restore();

  // 左侧色条
  const barX = x + 30;
  const barW = 6;
  ctx.fillStyle = buddyColor;
  drawRoundedRect(ctx, barX, y + 30, barW, cardH - 60, 3);
  ctx.fill();

  let cy = y + cardPadding;

  // 标题
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🤝 最佳跑团搭档', innerX, cy + 28);
  cy += 50;

  // 搭档 emoji + 名称
  ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(buddy.emoji, innerX, cy + 48);
  ctx.fillStyle = buddyColor;
  ctx.font = 'bold 36px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(buddy.name, innerX + 80, cy + 36);
  cy += 80;

  // 搭档金句
  ctx.fillStyle = '#999';
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  for (let i = 0; i < quoteLines.length; i++) {
    ctx.fillText(quoteLines[i], innerX, cy + i * 38);
  }
  cy += quoteLines.length * 38 + 16;

  // 搭档解读
  ctx.fillStyle = '#666';
  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], innerX, cy + i * 34);
  }

  return cardH;
}

// ---------- 核心绘制 v4.3 ═══

export async function renderShareCard(personality: PersonalityResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const code = personality.code as PersonalityCode;
  let glowColor = 'rgba(255, 107, 53, 0.25)';
  try {
    const { getTypeGlowValue } = await import('../utils/typeColorMap');
    glowColor = getTypeGlowValue(code);
  } catch { /* fallback */ }
  if (!glowColor || !glowColor.startsWith('rgba')) {
    glowColor = 'rgba(255, 107, 53, 0.25)';
  }

  // ═══ 1. 背景：浅色底 + 弥散光 ═══
  drawBackground(ctx, glowColor);

  // ═══ 2. v4.3 动物PNG（替代SVG跑者小人）═══
  let curY = 180;
  const iconSize = 280;
  const animalImg = personality.animalImg;
  const animalEmoji = personality.animalEmoji || personality.emoji;
  await drawAnimalPng(ctx, animalImg, animalEmoji, W / 2, curY + iconSize / 2, iconSize);
  curY += iconSize + 16;

  // ═══ 3. 人格名 ═══
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 64px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(personality.name, W / 2, curY);
  curY += 84;

  // ═══ 4. v4.3 5维标签条（横向排列5个维度标签）═══
  if (personality.dimensionComments) {
    const stripH = drawDimensionStrip(ctx, personality.dimensionScores, curY);
    curY += stripH + 36;
  }

  // ═══ 5. Hook 金句 ═══
  if (personality.hook) {
    const hookH = drawHook(ctx, personality.hook, curY);
    curY += hookH + 40;
  }

  // ═══ 6. 金句 ═══
  if (personality.quote) {
    const quoteH = drawQuote(ctx, personality.quote, curY);
    curY += quoteH + 36;
  }

  // ═══ 7. Roast 脱口秀卡片 ═══
  if (personality.roast) {
    const cardH = drawRoastCard(ctx, personality.roast, CARD_X, curY);
    curY += cardH + 36;
  }

  // ═══ 8. 胶囊标签 (最多5个) ═══
  if (personality.keywords && personality.keywords.length > 0) {
    const tagH = drawCapsuleTags(ctx, personality.keywords.slice(0, 5), curY);
    curY += tagH + 40;
  }

  // ═══ 9. 最佳搭档卡片 ═══
  if (personality.bestBuddy) {
    const cardY = curY + 16;
    const cardH = drawBuddyCardFull(ctx, personality.bestBuddy, CARD_X, cardY);
    curY = cardY + cardH + 40;
  }

  // ═══ 10. ShareTagline + CTA 引导语 ═══
  const brandY = 1380;
  const qrSize = 180;
  const qrPadding = 16;
  const qrSubstrateSize = qrSize + qrPadding * 2;
  const minQrTop = brandY - qrSubstrateSize - 60 - 60 - (personality.shareTagline ? 40 : 0);

  if (curY > minQrTop) {
    curY = minQrTop;
  }

  const ctaY = curY;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 32px "PingFang SC", "Helvetica Neue", sans-serif';
  const ctaText1 = `你是「${personality.name}」吗？`;
  ctx.fillText(ctaText1, W / 2, ctaY);

  // v4.1: shareTagline
  if (personality.shareTagline) {
    ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`"${personality.shareTagline}"`, W / 2, ctaY + 44);
    ctx.fillStyle = '#666';
    ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
    ctx.fillText('扫码测测看 → 和好友 PK！', W / 2, ctaY + 76);
    curY = ctaY + 100;
  } else {
    ctx.font = '28px "PingFang SC", "Helvetica Neue", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('扫码测测看 → 和好友 PK！', W / 2, ctaY + 48);
    curY = ctaY + 72;
  }

  // ═══ 11. QR Code ═══
  const qrSubstrateY = curY;
  const qrSubstrateX = (W - qrSubstrateSize) / 2;

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
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrSubstrateX + qrPadding, qrSubstrateY + qrPadding, qrSize, qrSize);
    ctx.fillStyle = '#999';
    ctx.font = '20px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码测试', W / 2, qrSubstrateY + qrPadding + qrSize / 2);
  }

  // ═══ 12. 品牌标识 (无编码水印) ═══
  ctx.textAlign = 'center';
  ctx.fillStyle = '#999';
  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('跑步人格测试 · Running Personality', W / 2, brandY);

  // ═══ 13. v4.3 风味角标 (右下角) ═══
  drawFlavorBadge(ctx);

  // 导出 JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

// ---------- React 组件 ----------

export default function CanvasRenderer({ personality, onGenerated }: CanvasRendererProps) {
  const blobRef = useRef<Blob | null>(null);
  const generatedRef = useRef(false);

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

  useEffect(() => {
    (window as any).__shareGenerateImage = generateImage;
    return () => { delete (window as any).__shareGenerateImage; };
  }, [generateImage]);

  return null;
}
