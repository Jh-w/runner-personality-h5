import { memo } from 'react';
import styles from '../styles/components/OptionItem.module.css';

interface OptionItemProps {
  id: string;
  emoji: string;
  text: string;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}

export const OptionItem = memo(function OptionItem({
  id,
  emoji,
  text,
  isSelected,
  disabled,
  onSelect,
}: OptionItemProps) {
  return (
    <button
      className={`${styles.option} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(id)}
      disabled={disabled}
      aria-label={text}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.text}>{text}</span>
    </button>
  );
});
