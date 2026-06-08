// useShareImage hook - 管理分享图片生成状态
import { useState, useRef, useCallback } from 'react';
import type { PersonalityResult } from '../engine/types';

export type ImageState = 'loading' | 'ready' | 'error';

interface UseShareImageReturn {
  state: ImageState;
  imageBlob: Blob | null;
  generateImage: (personality: PersonalityResult) => Promise<Blob>;
  preGenerate: (personality: PersonalityResult) => void;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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

async function renderShareImage(personality: PersonalityResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const [r, g, b] = hexToRgb(personality.color);
  const scale = CANVAS_WIDTH / 375; // 基于 375 设计稿缩放

  // 1. 填充背景渐变（淡色版）
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},0.08)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0.15)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 白色底部卡片区域
  ctx.fillStyle = '#ffffff';
  drawRoundedRect(ctx, 30 * scale, 30 * scale, CANVAS_WIDTH - 60 * scale, CANVAS_HEIGHT - 60 * scale, 24 * scale);
  ctx.fill();

  // 2. 人格 emoji + 名称
  const emojiY = 120 * scale;
  ctx.font = `${80 * scale}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(personality.emoji, CANVAS_WIDTH / 2, emojiY);

  ctx.fillStyle = '#1a1a2e';
  ctx.font = `bold ${40 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillText(personality.name, CANVAS_WIDTH / 2, emojiY + 80 * scale);

  // 3. 吐槽卡片
  const roastY = emojiY + 140 * scale;
  const roastWidth = CANVAS_WIDTH - 120 * scale;
  const roastX = 60 * scale;
  const roastPadding = 30 * scale;

  // 先测量吐槽文字高度
  ctx.font = `italic ${24 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  const roastLines = wrapText(ctx, `「${personality.roast}」`, roastWidth - roastPadding * 2);
  const roastCardHeight = roastLines.length * 36 * scale + roastPadding * 2;

  // 绘制吐槽卡片背景
  ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
  drawRoundedRect(ctx, roastX, roastY, roastWidth, roastCardHeight, 16 * scale);
  ctx.fill();

  // 绘制左侧引号装饰线
  ctx.fillStyle = personality.color;
  ctx.fillRect(roastX + roastPadding - 4 * scale, roastY + 20 * scale, 4 * scale, roastCardHeight - 40 * scale);

  // 绘制吐槽文字
  ctx.fillStyle = '#333';
  ctx.textAlign = 'left';
  ctx.font = `italic ${24 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  roastLines.forEach((line, i) => {
    ctx.fillText(line, roastX + roastPadding + 12 * scale, roastY + roastPadding + (i + 1) * 34 * scale);
  });

  // 4. 特征列表
  const traitsY = roastY + roastCardHeight + 40 * scale;
  ctx.fillStyle = '#1a1a2e';
  ctx.font = `bold ${26 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('核心特征', 60 * scale, traitsY);

  const traitStartY = traitsY + 50 * scale;
  ctx.font = `${22 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  personality.traits.forEach((trait, i) => {
    const y = traitStartY + i * 48 * scale;
    // 📌 emoji
    ctx.fillText('📌', 70 * scale, y);
    const traitLines = wrapText(ctx, trait, roastWidth - 80 * scale);
    traitLines.forEach((line, li) => {
      ctx.fillStyle = '#555';
      ctx.fillText(line, 120 * scale, y + li * 34 * scale);
    });
  });

  // 5. 钩子文案
  const hookY = CANVAS_HEIGHT - 200 * scale;
  ctx.fillStyle = personality.color;
  ctx.font = `bold ${28 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('你的跑步人格是？', CANVAS_WIDTH / 2, hookY);
  ctx.fillText('扫码测测看 →', CANVAS_WIDTH / 2, hookY + 45 * scale);

  // 7. 底部品牌标识
  const brandY = CANVAS_HEIGHT - 60 * scale;
  ctx.fillStyle = '#999';
  ctx.font = `${18 * scale}px "PingFang SC", "Helvetica Neue", sans-serif`;
  ctx.fillText('跑步人格测试 · Running Personality Test', CANVAS_WIDTH / 2, brandY);

  // 导出为 JPEG Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.85
    );
  });
}

export function useShareImage(): UseShareImageReturn {
  const [state, setState] = useState<ImageState>('loading');
  const imageBlobRef = useRef<Blob | null>(null);
  const cacheKeyRef = useRef<number | null>(null);
  const generatingRef = useRef(false);

  const generateImage = useCallback(async (personality: PersonalityResult): Promise<Blob> => {
    // 缓存命中
    if (imageBlobRef.current && cacheKeyRef.current === personality.typeId) {
      return imageBlobRef.current;
    }

    setState('loading');
    generatingRef.current = true;

    try {
      const blob = await renderShareImage(personality);
      imageBlobRef.current = blob;
      cacheKeyRef.current = personality.typeId;
      setState('ready');
      generatingRef.current = false;
      return blob;
    } catch (err) {
      console.error('Failed to generate share image:', err);
      setState('error');
      generatingRef.current = false;
      throw err;
    }
  }, []);

  const preGenerate = useCallback((personality: PersonalityResult) => {
    if (imageBlobRef.current && cacheKeyRef.current === personality.typeId) return;
    if (generatingRef.current) return;

    generatingRef.current = true;
    setState('loading');

    renderShareImage(personality)
      .then(blob => {
        imageBlobRef.current = blob;
        cacheKeyRef.current = personality.typeId;
        setState('ready');
        generatingRef.current = false;
      })
      .catch(err => {
        console.error('Pre-generate failed:', err);
        setState('error');
        generatingRef.current = false;
      });
  }, []);

  return {
    state,
    imageBlob: imageBlobRef.current,
    generateImage,
    preGenerate,
  };
}
