import { memo } from 'react';
import styles from '../styles/components/OptionItem.module.css';

export type SelectPhase = 'idle' | 'selecting' | 'bouncing' | 'stable';

interface OptionItemProps {
  id: string;
  emoji: string;
  text: string;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  selectPhase?: SelectPhase;
}

export const OptionItem = memo(function OptionItem({
  id,
  emoji,
  text,
  isSelected,
  disabled,
  onSelect,
  selectPhase = 'idle',
}: OptionItemProps) {
  // 构建 className
  let className = styles.option;

  if (isSelected) {
    if (selectPhase === 'selecting') {
      className += ` ${styles.selecting}`;
    } else if (selectPhase === 'bouncing') {
      className += ` ${styles.selecting} ${styles.bouncing}`;
    } else if (selectPhase === 'stable') {
      className += ` ${styles.selectedStable}`;
    }
  } else if (selectPhase !== 'idle') {
    // 未选中项淡化
    className += ` ${styles.dimmed}`;
  }

  return (
    <button
      className={className}
      onClick={() => onSelect(id)}
      disabled={disabled}
      role="radio"
      aria-checked={isSelected}
      aria-label={text}
    >
      <span className={styles.emoji} aria-hidden="true">{emoji}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
});
