// TypeIllustration — v4.2.5 动物插图组件
// 加载静态动物PNG，降级为动物emoji + 颜色圆
import { useState } from 'react';

interface TypeIllustrationProps {
  /** 动物 PNG 路径 */
  animalImg?: string;
  /** 动物 emoji（降级用） */
  animalEmoji?: string;
  /** 动物名（alt用） */
  animalName?: string;
  /** 尺寸（px），默认 200 */
  size?: number;
  /** 降级颜色（用于emoji背景圆） */
  color?: string;
}

export default function TypeIllustration({
  animalImg,
  animalEmoji,
  animalName,
  size = 200,
  color = '#e74c3c',
}: TypeIllustrationProps) {
  const [imgError, setImgError] = useState(false);

  // 有图片路径且未加载失败 → 显示静态PNG
  if (animalImg && !imgError) {
    return (
      <img
        src={animalImg}
        alt={animalName || '动物插图'}
        width={size}
        height={size}
        style={{ display: 'block', objectFit: 'contain' }}
        onError={() => setImgError(true)}
      />
    );
  }

  // 降级：动物emoji + 彩色圆背景
  if (animalEmoji) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}40, ${color}20)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label={animalName || '动物插图'}
      >
        <span style={{ fontSize: `${size * 0.55}px`, lineHeight: 1 }}>
          {animalEmoji}
        </span>
      </div>
    );
  }

  // 无数据
  return null;
}
