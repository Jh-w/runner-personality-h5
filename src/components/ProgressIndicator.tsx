import { memo } from 'react';
import styles from '../styles/components/ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  total: number;
  current: number;
  answered: number; // number of answered questions
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
