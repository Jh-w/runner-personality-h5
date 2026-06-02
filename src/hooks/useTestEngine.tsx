// 答题状态机 - 通过 React Context 跨页面共享状态
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { TestState, TestAction, SessionData } from '../engine/types';
import { calculateResult } from '../engine/scoring';

const COOLDOWN_MS = 300;

const INITIAL_STATE: TestState = {
  sessionId: '',
  currentQuestionIndex: 0,
  answers: {},
  randomizedOptions: [],
  phase: 'idle',
};

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
    case 'SELECT_ANSWER': {
      if (state.phase !== 'testing') return state;
      const { questionIndex, optionId, score } = action;
      const newAnswers = { ...state.answers, [questionIndex]: { questionId: questionIndex + 1, optionId, score } };
      const isLast = questionIndex >= 7;
      return {
        ...state,
        answers: newAnswers,
        currentQuestionIndex: isLast ? questionIndex : questionIndex + 1,
        phase: isLast ? 'calculating' : 'testing',
      };
    }
    case 'SET_RESULT':
      return { ...state, phase: 'completed', result: action.result };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

interface EngineContextValue {
  state: TestState;
  startTest: (session: SessionData) => void;
  selectAnswer: (questionIndex: number, optionId: string, score: number) => void;
  setResult: () => void;
  reset: () => void;
}

const EngineContext = createContext<EngineContextValue | null>(null);

let globalLastClick = 0;

export function TestEngineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, INITIAL_STATE);

  const startTest = useCallback((session: SessionData) => {
    dispatch({ type: 'START_TEST', session });
  }, []);

  const selectAnswer = useCallback((questionIndex: number, optionId: string, score: number) => {
    const now = Date.now();
    if (now - globalLastClick < COOLDOWN_MS) return;
    globalLastClick = now;
    dispatch({ type: 'SELECT_ANSWER', questionIndex, optionId, score });
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
