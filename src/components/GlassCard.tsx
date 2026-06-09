// GlassCard — v4.0 毛玻璃卡片容器
// 简单的容器组件，应用 .glass-card 通用类
import type { CSSProperties } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function GlassCard({ children, className, style }: GlassCardProps) {
  return (
    <div className={`glass-card ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
