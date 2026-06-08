// ParticleBackground - Canvas 粒子背景组件
// Phase 2 模块五：背景粒子效果
// 全屏 Canvas 覆盖，粒子向上漂浮，不拦截点击

import { useEffect } from 'react';
import { useParticleEngine } from '../hooks/useParticleEngine';
import styles from '../styles/components/ParticleBackground.module.css';

interface ParticleBackgroundProps {
  color: string;
  count?: number;
  speed?: number;
}

export default function ParticleBackground({
  color,
  count,
  speed,
}: ParticleBackgroundProps) {
  const { canvasRef, start, stop } = useParticleEngine(color, count, speed);

  useEffect(() => {
    // 启动粒子
    start();

    // Page Visibility API
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        stop(); // 先停再启，重置时间基准
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      stop();
      start();
    });
    resizeObserver.observe(document.body);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObserver.disconnect();
    };
  }, [start, stop]);

  // prefers-reduced-motion: 不渲染
  if (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.particleCanvas}
      aria-hidden="true"
    />
  );
}
