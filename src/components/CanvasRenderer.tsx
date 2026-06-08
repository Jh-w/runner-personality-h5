// CanvasRenderer - 用 Canvas API 绘制分享卡片 (1080×1440)
// 组件不渲染 DOM，仅提供 generateImage() 并在挂载时预生成
import { useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import type { PersonalityResult } from '../engine/types';

interface CanvasRendererProps {
  personality: PersonalityResult;
  onGenerated?: (blob: Blob) => void;
}

// ---------- 绘制工具 ----------

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

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

// ---------- 核心绘制 ----------

export async function renderShareCard(personality: PersonalityResult): Promise<Blob> {
  const W = 1080, H = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const [r, g, b] = hexToRgb(personality.color);

  // 1. 背景渐变（淡色）
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.06)`);
  grad.addColorStop(0.6, `rgba(${r},${g},${b},0.06)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0.18)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 白色主卡片
  const margin = 40;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 30;
  drawRoundedRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  const cardX = margin + 60;
  const cardW = W - margin * 2 - 120;

  // 2. Emoji + 名称
  let curY = 180;
  ctx.textAlign = 'center';
  ctx.font = '96px sans-serif';
  ctx.fillText(personality.emoji, W / 2, curY);

  curY += 110;
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 44px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText(personality.name, W / 2, curY);

  // 3. 吐槽卡片
  curY += 70;
  ctx.textAlign = 'left';
  ctx.font = 'italic 26px "PingFang SC", "Helvetica Neue", sans-serif';
  const roastText = `「${personality.roast}」`;
  const roastLines = wrapText(ctx, roastText, cardW - 80);
  const roastH = roastLines.length * 42 + 60;

  // 吐槽卡片背景
  ctx.fillStyle = `rgba(${r},${g},${b},0.10)`;
  drawRoundedRect(ctx, cardX, curY, cardW, roastH, 18);
  ctx.fill();

  // 左侧色条
  ctx.fillStyle = personality.color;
  ctx.fillRect(cardX + 28, curY + 20, 5, roastH - 40);

  // 吐槽文字
  ctx.fillStyle = '#444';
  roastLines.forEach((line, i) => {
    ctx.fillText(line, cardX + 52, curY + 46 + i * 42);
  });

  curY += roastH + 50;

  // 4. 核心特征
  ctx.fillStyle = '#1a1a2e';
  ctx.font = 'bold 28px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('核心特征', cardX, curY);
  curY += 60;

  ctx.font = '24px "PingFang SC", "Helvetica Neue", sans-serif';
  for (const trait of personality.traits) {
    const tLines = wrapText(ctx, trait, cardW - 80);
    ctx.fillStyle = personality.color;
    ctx.fillText('📌', cardX + 10, curY);
    ctx.fillStyle = '#555';
    tLines.forEach((line, li) => {
      ctx.fillText(line, cardX + 60, curY + li * 38);
    });
    curY += Math.max(tLines.length * 38, 38) + 20;
  }

  curY += 10;

  // 5. 传播钩子文案 + 二维码
  const hookY = H - 280;
  ctx.fillStyle = personality.color;
  ctx.font = 'bold 30px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('你的跑步人格是？', W / 2, hookY);
  ctx.fillText('扫码测测看 →', W / 2, hookY + 50);

  // 生成二维码并绘制
  const shareUrl = `https://runningtype.cn/#/result/${personality.typeId}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    const qrImg = new Image();
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject(new Error('QR image load failed'));
      qrImg.src = qrDataUrl;
    });
    ctx.drawImage(qrImg, W / 2 - 100, hookY + 70, 200, 200);
  } catch {
    // 二维码生成失败时绘制占位框
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 100, hookY + 70, 200, 200);
    ctx.fillStyle = '#999';
    ctx.font = '20px "PingFang SC", sans-serif';
    ctx.fillText('扫码测试', W / 2, hookY + 175);
  }

  // 7. 品牌标识
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaa';
  ctx.font = '20px "PingFang SC", "Helvetica Neue", sans-serif';
  ctx.fillText('跑步人格测试 · Running Personality Test', W / 2, H - 60);

  // 导出 JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.85,
    );
  });
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
