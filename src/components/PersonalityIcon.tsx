// PersonalityIcon — 统一人格图标组件
// v3.3-Phase3: SVG 优先 + emoji fallback
import { useState, useEffect } from 'react';
import type { PersonalityCode } from '../engine/types';
import { loadPersonalitySvgImg } from '../utils/svgLoader';

interface PersonalityIconProps {
  code: PersonalityCode;
  emoji: string;
  size: number;
  className?: string;
  useSvg?: boolean;
}

export default function PersonalityIcon({
  code,
  emoji,
  size,
  className,
  useSvg = true,
}: PersonalityIconProps) {
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Track which code we loaded for to avoid stale state
  const [loadedCode, setLoadedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!useSvg || loadedCode === code) return;

    let cancelled = false;
    setSvgUrl(null);
    setLoadFailed(false);

    loadPersonalitySvgImg(code)
      .then(img => {
        if (cancelled) return;
        if (img) {
          setSvgUrl(img.src);
          setLoadedCode(code);
        } else {
          setLoadFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => { cancelled = true; };
  }, [code, useSvg, loadedCode]);

  if (!useSvg || loadFailed || !svgUrl) {
    return (
      <span className={className} style={{ fontSize: size * 0.7 }} aria-label={code}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={svgUrl}
      alt={code}
      className={className}
      width={size}
      height={size}
    />
  );
}
