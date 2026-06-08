// ProgressIndicator.legacy.tsx - 旧进度条组件备份
// Phase 2 模块四：保留此文件以备回退
// 已被 RunwayProgress 替代

import { memo } from 'react';
import styles from '../styles/components/ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  total: number;
  current: number;
  answered: number;
}

export const ProgressIndicator = memo(function ProgressIndicator({
  total,
  current,
  answered,
}: ProgressIndicatorProps) {
  return (
    <div className={styles.container} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}>
      <div className={styles.dots}>
        {Array.from({ length: total }, (_, i) => {
          let dotClass = styles.dot;
          if (i < answered) {
            dotClass += ` ${styles.answered}`;
          } else if (i === current) {
            dotClass += ` ${styles.current}`;
          }
          return <span key={i} className={dotClass} />;
        })}
      </div>
      <span className={styles.label}>
        {answered}/{total}
      </span>
    </div>
  );
});
