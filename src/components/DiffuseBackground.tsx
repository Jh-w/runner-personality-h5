// DiffuseBackground — v4.0 弥散光球背景
// 渲染 2-3 个绝对定位的弥散光球 div，缓慢浮动
import styles from '../styles/components/DiffuseBackground.module.css';

interface DiffuseBackgroundProps {
  /** CSS 颜色值（如 rgba 或 hex），用于光球 radial-gradient */
  glowColor?: string;
}

export default function DiffuseBackground({ glowColor }: DiffuseBackgroundProps) {
  const color = glowColor || 'rgba(255, 107, 53, 0.12)';

  return (
    <div className={styles.container} aria-hidden="true">
      <div
        className={`${styles.orb} ${styles.orb1}`}
        style={{ background: `radial-gradient(ellipse 400px 300px at center, ${color}, transparent)` }}
      />
      <div
        className={`${styles.orb} ${styles.orb2}`}
        style={{ background: `radial-gradient(ellipse 350px 250px at center, ${color}, transparent)` }}
      />
      <div
        className={`${styles.orb} ${styles.orb3}`}
        style={{ background: `radial-gradient(ellipse 300px 200px at center, ${color}, transparent)` }}
      />
    </div>
  );
}
