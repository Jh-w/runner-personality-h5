// useEntranceAnimation - 入场动画时序 Hook
// Phase 2 模块二：结果页入场动画基础设施
// 使用 setTimeout + useState 实现 staggered 延迟出现

import { useState, useEffect } from 'react';

/**
 * 延迟 staggerMs 毫秒后返回 true。
 * prefers-reduced-motion 时立即返回 true，跳过所有动画延迟。
 */
export function useEntranceAnimation(staggerMs: number = 0): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 检测 reduced-motion 偏好
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), staggerMs);
    return () => clearTimeout(timer);
  }, [staggerMs]);

  return visible;
}

/**
 * 检查系统是否偏好减少动效（同步版本，供组件中使用）
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
