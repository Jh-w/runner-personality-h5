import { memo } from 'react';
import { OptionItem, type SelectPhase } from './OptionItem';
import type { Option } from '../engine/types';
import styles from '../styles/components/QuestionCard.module.css';

interface QuestionCardProps {
  questionText: string;
  questionNumber: number;
  options: Option[];
  selectedOptionId: string | null;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  selectPhase?: SelectPhase;
}

export const QuestionCard = memo(function QuestionCard({
  questionText,
  questionNumber,
  options,
  selectedOptionId,
  disabled,
  onSelect,
  selectPhase = 'idle',
}: QuestionCardProps) {
  return (
    <div className={styles.card} role="radiogroup" aria-label={`第${questionNumber}题`}>
      <div className={styles.questionNum}>Q{questionNumber}</div>
      <h2 className={styles.question}>{questionText}</h2>
      <div className={styles.options}>
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          // For selected item: pass the real selectPhase
          // For unselected items when a selection is in progress: pass a non-idle phase
          // (OptionItem uses !isSelected && phase !== 'idle' to add .dimmed)
          const phase = isSelected
            ? selectPhase
            : selectPhase !== 'idle'
              ? 'selecting' // any non-idle triggers dimmed for unselected
              : 'idle';

          return (
            <OptionItem
              key={opt.id}
              id={opt.id}
              emoji={opt.emoji}
              text={opt.text}
              isSelected={isSelected}
              disabled={disabled}
              onSelect={onSelect}
              selectPhase={phase}
            />
          );
        })}
      </div>
    </div>
  );
});
