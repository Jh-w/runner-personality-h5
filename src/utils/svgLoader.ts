// svgLoader.ts — SVG 图标加载工具
// v3.3-Phase3: Vite ?url import, data URL, 零网络请求
// 缓存 + fallback + 预加载支持

import type { PersonalityCode } from '../engine/types';

/** SVG 图标模块映射（Vite ?url import 为 data URL 字符串） */
const SVG_IMPORTS: Record<PersonalityCode, () => Promise<string>> = {
  CSDG: () => import('../assets/svg_icons/CSDG.svg?url').then(m => m.default),
  CSDM: () => import('../assets/svg_icons/CSDM.svg?url').then(m => m.default),
  CPDG: () => import('../assets/svg_icons/CPDG.svg?url').then(m => m.default),
  CPDM: () => import('../assets/svg_icons/CPDM.svg?url').then(m => m.default),
  CGDG: () => import('../assets/svg_icons/CGDG.svg?url').then(m => m.default),
  CGDM: () => import('../assets/svg_icons/CGDM.svg?url').then(m => m.default),
  CPGG: () => import('../assets/svg_icons/CPGG.svg?url').then(m => m.default),
  CPGM: () => import('../assets/svg_icons/CPGM.svg?url').then(m => m.default),
  ESDG: () => import('../assets/svg_icons/ESDG.svg?url').then(m => m.default),
  ESDM: () => import('../assets/svg_icons/ESDM.svg?url').then(m => m.default),
  EPDG: () => import('../assets/svg_icons/EPDG.svg?url').then(m => m.default),
  EPDM: () => import('../assets/svg_icons/EPDM.svg?url').then(m => m.default),
  EGDG: () => import('../assets/svg_icons/EGDG.svg?url').then(m => m.default),
  EGDM: () => import('../assets/svg_icons/EGDM.svg?url').then(m => m.default),
  EPGG: () => import('../assets/svg_icons/EPGG.svg?url').then(m => m.default),
  EPGM: () => import('../assets/svg_icons/EPGM.svg?url').then(m => m.default),
};

/** 缓存：已加载的 Image 元素 */
const imageCache = new Map<PersonalityCode, HTMLImageElement>();

/**
 * 加载 SVG 为 HTMLImageElement（带缓存）
 * @returns HTMLImageElement 或 null（加载失败时）
 */
export async function loadPersonalitySvgImg(code: PersonalityCode): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(code);
  if (cached) return cached;

  const loader = SVG_IMPORTS[code];
  if (!loader) return null;

  try {
    const dataUrl = await loader();
    const img = new Image();
    img.src = dataUrl;
    await img.decode(); // 确保图片完全解码
    imageCache.set(code, img);
    return img;
  } catch {
    console.warn(`SVG load failed for ${code}, will fallback to emoji`);
    return null;
  }
}

/**
 * 预加载一组 SVG 图标（页面初始化时调用）
 */
export async function preloadSvgIcons(codes: PersonalityCode[]): Promise<void> {
  await Promise.allSettled(codes.map(loadPersonalitySvgImg));
}

/**
 * 清空缓存（用于测试）
 */
export function clearSvgCache(): void {
  imageCache.clear();
}
