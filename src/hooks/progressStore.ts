// AC-10: localStorage 持久化工具 + Reducer（纯函数，无 React 依赖）
// v3.3-Phase3: 版本检测 + 旧进度自动丢弃
import type { TestState, TestAction, SavedProgress } from '../engine/types';
import { CURRENT_VERSION } from '../engine/types';

export const PROGRESS_KEY = 'rp_progress';
const PROGRESS_TTL = 30 * 60 * 1000; // 30分钟

// ─── localStorage 持久化 ───────────────────────────────

export function saveProgress(state: TestState): void {
  if (state.phase !== 'testing') return;
  try {
    const progress: SavedProgress = {
      version: CURRENT_VERSION,
      sessionId: state.sessionId,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      randomizedOptions: state.randomizedOptions,
      savedAt: Date.now(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch { /* localStorage full — silently drop */ }
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const progress: SavedProgress = JSON.parse(raw);

    // v3.3: 版本检测 — 旧版进度（无version或version < 3）自动丢弃
    if (!progress.version || progress.version < CURRENT_VERSION) {
      localStorage.removeItem(PROGRESS_KEY);
      return null;
    }

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

export function clearProgress(): void {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}

// ─── Reducer ──────────────────────────────────────────

export const INITIAL_STATE: TestState = {
  sessionId: '',
  currentQuestionIndex: 0,
  answers: {},
  randomizedOptions: [],
  phase: 'idle',
};

export function testReducer(state: TestState, action: TestAction): TestState {
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
      // v3.3: 版本检测已在 loadProgress 中处理，此处仅恢复
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
      // v3.3: 12题模式，最后一题 index=11
      const isLast = questionIndex >= 11;
      return {
        ...state,
        answers: newAnswers,
        currentQuestionIndex: isLast ? questionIndex : questionIndex + 1,
        phase: isLast ? 'calculating' : 'testing',
      };
    }

    case 'SET_RESULT':
      clearProgress();
      return { ...state, phase: 'completed', result: action.result };

    case 'RESET':
      clearProgress();
      return { ...INITIAL_STATE };

    case 'COMPLETE_TEST':
      return state;

    default:
      return state;
  }
}
