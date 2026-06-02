import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { questions } from '../engine/questions';
import type { Option } from '../engine/types';
import styles from '../styles/pages/TestPage.module.css';

export default function TestPage() {
  const navigate = useNavigate();
  const { qid } = useParams<{ qid: string }>();
  const questionIndex = parseInt(qid || '0', 10);
  const { state, selectAnswer } = useTestEngine();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guard: redirect if not in testing phase
  useEffect(() => {
    if (state.phase === 'idle') {
      navigate('/', { replace: true });
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

  // If navigating to a different question than current, redirect
  useEffect(() => {
    if (state.phase === 'testing' && questionIndex !== state.currentQuestionIndex) {
      navigate(`/test/${state.currentQuestionIndex}`, { replace: true });
    }
  }, [questionIndex, state.currentQuestionIndex, state.phase, navigate]);

  // Reset selected option when question changes
  useEffect(() => {
    setSelectedOptionId(null);
  }, [questionIndex]);

  // Cleanup transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
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
    if (isTransitioning || selectedOptionId) return;

    const option = question?.options.find(o => o.id === optionId);
    if (!option) return;

    setSelectedOptionId(optionId);
    setIsTransitioning(true);

    // After 0.3s highlight, move to next question
    transitionTimer.current = setTimeout(() => {
      selectAnswer(questionIndex, optionId, option.score);

      // Check if this was the last question (index 7 = Q8)
      if (questionIndex >= 7) {
        navigate('/calculating');
      }
      // Navigation to next question happens via the useEffect
      // that watches currentQuestionIndex
    }, 300);
  }, [questionIndex, question, selectedOptionId, isTransitioning, selectAnswer, navigate]);

  // Navigate when engine advances to next question
  useEffect(() => {
    if (isTransitioning && state.currentQuestionIndex !== questionIndex && state.phase === 'testing') {
      setIsTransitioning(false);
      navigate(`/test/${state.currentQuestionIndex}`);
    }
  }, [state.currentQuestionIndex, questionIndex, state.phase, isTransitioning, navigate]);

  if (!question) {
    return (
      <div className={`page ${styles.page}`}>
        <p>题目加载失败，请返回首页重新开始</p>
      </div>
    );
  }

  return (
    <div className={`page ${styles.page}`}>
      <ProgressIndicator
        total={8}
        current={questionIndex}
        answered={answeredCount}
      />

      <div className={styles.cardWrapper} key={questionIndex}>
        <QuestionCard
          questionText={question.text}
          questionNumber={question.id}
          options={orderedOptions}
          selectedOptionId={selectedOptionId}
          disabled={isTransitioning}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
