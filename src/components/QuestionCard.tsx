import { memo } from 'react';
import { OptionItem } from './OptionItem';
import type { Option } from '../engine/types';
import styles from '../styles/components/QuestionCard.module.css';

interface QuestionCardProps {
  questionText: string;
  questionNumber: number;
  options: Option[];
  selectedOptionId: string | null;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}

export const QuestionCard = memo(function QuestionCard({
  questionText,
  questionNumber,
  options,
  selectedOptionId,
  disabled,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className={styles.card} role="radiogroup" aria-label={`第${questionNumber}题`}>
      <div className={styles.questionNum}>Q{questionNumber}</div>
      <h2 className={styles.question}>{questionText}</h2>
      <div className={styles.options}>
        {options.map((opt) => (
          <OptionItem
            key={opt.id}
            id={opt.id}
            emoji={opt.emoji}
            text={opt.text}
            isSelected={selectedOptionId === opt.id}
            disabled={disabled}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
});
