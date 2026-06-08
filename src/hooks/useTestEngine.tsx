// 答题状态机 - 通过 React Context 跨页面共享状态
// v3.0 AC-10: localStorage 持久化答题进度，支持断点续答
import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { TestState, SessionData } from '../engine/types';
import { calculateResult } from '../engine/scoring';
import { INITIAL_STATE, testReducer, saveProgress, loadProgress } from './progressStore';

const COOLDOWN_MS = 300;

// ─── Context ──────────────────────────────────────────

interface EngineContextValue {
  state: TestState;
  startTest: (session: SessionData) => void;
  selectAnswer: (questionIndex: number, optionId: string, dimensionScore: number) => void;
  setResult: () => void;
  reset: () => void;
}

const EngineContext = createContext<EngineContextValue | null>(null);

let globalLastClick = 0;

export function TestEngineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, INITIAL_STATE);

  // AC-10: 页面加载时尝试恢复答题进度
  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.sessionId && Object.keys(saved.answers).length > 0) {
      dispatch({ type: 'RESTORE_PROGRESS', progress: saved });
    }
  }, []);

  // AC-10: 每次答题后自动保存
  useEffect(() => {
    saveProgress(state);
  }, [state.answers, state.currentQuestionIndex]);

  const startTest = useCallback((session: SessionData) => {
    dispatch({ type: 'START_TEST', session });
  }, []);

  const selectAnswer = useCallback((questionIndex: number, optionId: string, dimensionScore: number) => {
    const now = Date.now();
    if (now - globalLastClick < COOLDOWN_MS) return;
    globalLastClick = now;
    dispatch({ type: 'SELECT_ANSWER', questionIndex, optionId, dimensionScore });
  }, []);

  const setResult = useCallback(() => {
    const answersArray = Object.values(state.answers);
    if (answersArray.length < 8) return;
    const result = calculateResult(answersArray);
    dispatch({ type: 'SET_RESULT', result });
  }, [state.answers]);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <EngineContext.Provider value={{ state, startTest, selectAnswer, setResult, reset }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useTestEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useTestEngine must be used within TestEngineProvider');
  return ctx;
}
