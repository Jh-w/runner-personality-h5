// RunwayProgress - 跑道进度条组件
// Phase 2 模块四：替换 ProgressIndicator
// 跑道隐喻：跑鞋 emoji 沿跑道移动到当前节点

import { memo } from 'react';
import styles from '../styles/components/RunwayProgress.module.css';

interface RunwayProgressProps {
  total: number;
  current: number;
  answered: number;
  color?: string;
}

export const RunwayProgress = memo(function RunwayProgress({
  total,
  current,
  answered,
  color,
}: RunwayProgressProps) {
  const steps = Array.from({ length: total }, (_, i) => i);

  // 节点位置计算：均匀分布
  const nodePercent = (i: number) => (total > 1 ? (i / (total - 1)) * 100 : 0);

  // 跑鞋位置：停在当前题节点
  const shoePos = nodePercent(current);

  // 已跑段宽度
  const filledWidth = nodePercent(answered);

  const brandColor = color || 'var(--brand-primary, #FF6B35)';

  return (
    <div
      className={styles.runway}
      role="progressbar"
      aria-valuenow={answered}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`答题进度：${answered}/${total}`}
    >
      <div className={styles.runwayTrack}>
        {/* 已跑段 */}
        <div
          className={styles.runwayFilled}
          style={{
            width: `${filledWidth}%`,
            background: `linear-gradient(90deg, ${brandColor}, ${brandColor}cc)`,
          }}
        />

        {/* 节点圆点 */}
        {steps.map((i) => {
          let dotClass = styles.runwayDot;
          if (i < answered) {
            dotClass += ` ${styles.answered}`;
          } else if (i === current) {
            dotClass += ` ${styles.current}`;
          }
          return (
            <span
              key={i}
              className={dotClass}
              style={{
                left: `${nodePercent(i)}%`,
                ...(i < answered ? { background: brandColor } : {}),
                ...(i === current ? { borderColor: brandColor } : {}),
              }}
            />
          );
        })}

        {/* 跑鞋 emoji */}
        <span
          className={styles.runwayShoe}
          style={{ left: `${shoePos}%` }}
          aria-hidden="true"
        >
          👟
        </span>
      </div>

      {/* 数字标注 */}
      <span className={styles.runwayLabel}>
        {answered}/{total}
      </span>
    </div>
  );
});
