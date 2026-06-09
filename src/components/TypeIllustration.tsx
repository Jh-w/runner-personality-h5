// TypeIllustration — v4.0 人格插图组件
// 尝试加载 SVG 插图，失败时降级为大号 emoji
import { useState, useEffect } from 'react';
import type { PersonalityCode } from '../engine/types';
import { loadPersonalityIllustration } from '../utils/svgLoader';

interface TypeIllustrationProps {
  code: PersonalityCode;
  /** 默认 emoji（插图加载失败时的降级） */
  emoji: string;
  /** 尺寸（px），默认 200 */
  size?: number;
}

export default function TypeIllustration({ code, emoji, size = 200 }: TypeIllustrationProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPersonalityIllustration(code).then((img) => {
      if (cancelled) return;
      if (img) {
        setImgSrc(img.src);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [code]);

  if (loaded && imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={`${code} 人格插图`}
        width={size}
        height={size}
        style={{ display: 'block', objectFit: 'contain' }}
      />
    );
  }

  // 降级：大号 emoji
  return (
    <span
      style={{
        fontSize: `${size * 0.7}px`,
        lineHeight: 1,
        display: 'block',
        textAlign: 'center',
      }}
      role="img"
      aria-label={code}
    >
      {emoji}
    </span>
  );
}
