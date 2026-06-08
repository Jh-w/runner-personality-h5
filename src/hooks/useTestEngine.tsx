// 答题状态机 - 通过 React Context 跨页面共享状态
// v3.0 AC-10: localStorage 持久化答题进度，支持断点续答
import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { TestState, TestAction, SessionData, SavedProgress } from '../engine/types';
import { calculateResult } from '../engine/scoring';

const COOLDOWN_MS = 300;
const PROGRESS_KEY = 'rp_progress';
const PROGRESS_TTL = 30 * 60 * 1000; // 30分钟，与 session TTL 一致

const INITIAL_STATE: TestState = {
  sessionId: '',
  currentQuestionIndex: 0,
  answers: {},
  randomizedOptions: [],
  phase: 'idle',
};

// ─── localStorage 持久化工具 ──────────────────────────

function saveProgress(state: TestState): void {
  if (state.phase !== 'testing') return;
  try {
    const progress: SavedProgress = {
      sessionId: state.sessionId,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      randomizedOptions: state.randomizedOptions,
      savedAt: Date.now(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch { /* localStorage full — silently drop */ }
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const progress: SavedProgress = JSON.parse(raw);
    // TTL 过期检查
    if (Date.now() - progress.savedAt > PROGRESS_TTL) {
      localStorage.removeItem(PROGRESS_KEY);
      return null;
    }
    return progress;
  } catch {
    localStorage.removeItem(PROGRESS_KEY);
    return null;
  }
}

function clearProgress(): void {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}

// ─── Reducer ──────────────────────────────────────────

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'START_TEST':
      return {
        ...INITIAL_STATE,
        sessionId: action.session.sessionId,
        randomizedOptions: action.session.randomizedOptions,
        phase: 'testing',
        currentQuestionIndex: 0,
      };

    case 'RESTORE_PROGRESS': {
      const { progress } = action;
      return {
        ...INITIAL_STATE,
        sessionId: progress.sessionId,
        currentQuestionIndex: progress.currentQuestionIndex,
        answers: progress.answers,
        randomizedOptions: progress.randomizedOptions,
        phase: 'testing',
      };
    }

    case 'SELECT_ANSWER': {
      if (state.phase !== 'testing') return state;
      const { questionIndex, optionId, dimensionScore } = action;
      const newAnswers = { ...state.answers, [questionIndex]: { questionId: questionIndex + 1, optionId, dimensionScore } };
      const isLast = questionIndex >= 7;
      return {
        ...state,
        answers: newAnswers,
        currentQuestionIndex: isLast ? questionIndex : questionIndex + 1,
        phase: isLast ? 'calculating' : 'testing',
      };
    }

    case 'SET_RESULT':
      clearProgress(); // 答题完成，清除进度
      return { ...state, phase: 'completed', result: action.result };

    case 'RESET':
      clearProgress();
      return { ...INITIAL_STATE };

    case 'COMPLETE_TEST':
      // 保留以备将来使用
      return state;

    default:
      return state;
  }
}

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

// 导出供单元测试使用
export { testReducer, saveProgress, loadProgress, clearProgress, PROGRESS_KEY };
