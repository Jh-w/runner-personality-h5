import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import { loadProgress } from '../hooks/progressStore';
import { QuestionCard } from '../components/QuestionCard';
import { RunwayProgress } from '../components/RunwayProgress';
import PrivacyLink from '../components/PrivacyLink';
import { questions } from '../engine/questions';
import type { Option } from '../engine/types';
import type { SelectPhase } from '../components/OptionItem';
import styles from '../styles/pages/TestPage.module.css';

export default function TestPage() {
  const navigate = useNavigate();
  const { qid } = useParams<{ qid: string }>();
  const questionIndex = parseInt(qid || '0', 10);
  const { state, selectAnswer, goBack } = useTestEngine();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectPhase, setSelectPhase] = useState<SelectPhase>('idle');
  const selectTimer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Phase 3: 中段激励提示
  const [showHalfwayHint, setShowHalfwayHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guard: redirect if not in testing phase
  useEffect(() => {
    if (state.phase === 'idle') {
      if (!loadProgress()) {
        navigate('/', { replace: true });
      }
      return;
    }
    if (state.phase === 'completed') {
      navigate(`/result/${state.result!.typeId}`, { replace: true });
      return;
    }
    if (state.phase === 'calculating') {
      navigate('/calculating', { replace: true });
      return;
    }
  }, [state.phase, navigate, state.result]);

  // v5.1: 允许后退（questionIndex < currentQuestionIndex），但不允许前跳
  useEffect(() => {
    if (state.phase === 'testing' && questionIndex > state.currentQuestionIndex) {
      navigate(`/test/${state.currentQuestionIndex}`, { replace: true });
    }
  }, [questionIndex, state.currentQuestionIndex, state.phase, navigate]);

  // Restore previously selected answer when going back
  useEffect(() => {
    const prevAnswer = state.answers[questionIndex];
    if (prevAnswer) {
      setSelectedOptionId(prevAnswer.optionId);
    } else {
      setSelectedOptionId(null);
    }
    setSelectPhase('idle');
  }, [questionIndex, state.answers]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (selectTimer1.current) clearTimeout(selectTimer1.current);
      if (selectTimer2.current) clearTimeout(selectTimer2.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  // Get the current question (1-based ID = questionIndex + 1)
  const question = questions.find(q => q.id === questionIndex + 1);

  // Get randomized option order from session
  const randomizedQ = state.randomizedOptions.find(r => r.question_id === questionIndex + 1);
  const orderedOptions: Option[] = (() => {
    if (!question) return [];
    if (!randomizedQ) return question.options;
    return randomizedQ.options
      .map(rOpt => question.options.find(o => o.id === rOpt.id))
      .filter((o): o is Option => o != null);
  })();

  // Count answered questions
  const answeredCount = Object.keys(state.answers).length;

  const handleSelect = useCallback((optionId: string) => {
    if (selectPhase !== 'idle' || selectedOptionId) return;

    const option = question?.options.find(o => o.id === optionId);
    if (!option) return;

    // Phase 1: selecting (press-in)
    setSelectedOptionId(optionId);
    setSelectPhase('selecting');

    // Phase 2: bouncing (start after 100ms)
    selectTimer1.current = setTimeout(() => {
      setSelectPhase('bouncing');
    }, 100);

    // Phase 3: stable + select answer (after 250ms total)
    selectTimer2.current = setTimeout(() => {
      setSelectPhase('stable');
      selectAnswer(questionIndex, optionId, option.dimensionScore);

      // Phase 3: 中段激励提示（第10题=index 9 答完时 → 18题的中段）
      if (questionIndex === 9) {
        setShowHalfwayHint(true);
        hintTimer.current = setTimeout(() => setShowHalfwayHint(false), 2000);
      }

      // Check if this was the last question (index 17 = Q18)
      if (questionIndex >= 17) {
        navigate('/calculating');
      } else {
        navigate(`/test/${questionIndex + 1}`);
      }
    }, 250);
  }, [questionIndex, question, selectedOptionId, selectPhase, selectAnswer, navigate]);

  const handleBack = useCallback(() => {
    if (questionIndex > 0) {
      goBack();
      navigate(`/test/${questionIndex - 1}`);
    }
  }, [questionIndex, goBack, navigate]);

  if (!question) {
    return (
      <div className={`page ${styles.page}`}>
        <p>题目加载失败，请返回首页重新开始</p>
      </div>
    );
  }

  return (
    <div className={`page ${styles.page}`}>
      {/* v5.2: Top nav — back button only, left-aligned */}
      <div className={styles.topNav}>
        {questionIndex > 0 && (
          <button className={styles.navBackBtn} onClick={handleBack} aria-label="返回上一题">
            ← 返回上一题
          </button>
        )}
      </div>

      <RunwayProgress
        total={18}
        current={questionIndex}
        answered={answeredCount}
        color="#FF6B35"
      />

      {/* Phase 3: 中段激励提示 */}
      {showHalfwayHint && (
        <div className={styles.halfwayHint}>
          <span>🏃‍♂️ 已过半！凭直觉继续 →</span>
        </div>
      )}

      <div className={styles.cardWrapper} key={questionIndex}>
        <QuestionCard
          questionText={question.text}
          questionNumber={question.id}
          options={orderedOptions}
          selectedOptionId={selectedOptionId}
          disabled={selectPhase !== 'idle'}
          onSelect={handleSelect}
          selectPhase={selectPhase}
        />
      </div>

      <PrivacyLink />
    </div>
  );
}
