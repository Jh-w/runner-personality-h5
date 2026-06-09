// AC-10: localStorage 持久化逻辑单元测试
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { TestState, SavedProgress } from '../types';
import { testReducer, saveProgress, loadProgress, clearProgress, PROGRESS_KEY } from '../../hooks/progressStore';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

vi.stubGlobal('localStorage', localStorageMock);

function makeTestState(overrides: Partial<TestState> = {}): TestState {
  return {
    sessionId: 'rp_test_session_001',
    currentQuestionIndex: 3,
    answers: {
      0: { questionId: 1, optionId: 'A', dimensionScore: 1 },
      1: { questionId: 2, optionId: 'B', dimensionScore: 0 },
      2: { questionId: 3, optionId: 'A', dimensionScore: 1 },
    },
    randomizedOptions: [],
    phase: 'testing',
    ...overrides,
  };
}

function makeProgress(overrides: Partial<SavedProgress> = {}): SavedProgress {
  return {
    version: 3,
    sessionId: 'rp_test_session_001',
    currentQuestionIndex: 3,
    answers: {
      0: { questionId: 1, optionId: 'A', dimensionScore: 1 },
      1: { questionId: 2, optionId: 'B', dimensionScore: 0 },
    },
    randomizedOptions: [],
    savedAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

// ─── saveProgress / loadProgress ──────────────────────

describe('saveProgress / loadProgress', () => {
  it('saves progress to localStorage with correct key', () => {
    const state = makeTestState();
    saveProgress(state);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(PROGRESS_KEY, expect.any(String));
  });

  it('loadProgress returns null when nothing saved', () => {
    const result = loadProgress();
    expect(result).toBeNull();
  });

  it('loadProgress returns saved data when exists', () => {
    const state = makeTestState();
    saveProgress(state);

    const result = loadProgress();
    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe('rp_test_session_001');
    expect(result!.currentQuestionIndex).toBe(3);
    expect(Object.keys(result!.answers)).toHaveLength(3);
    expect(result!.randomizedOptions).toEqual([]);
  });

  it('loadProgress return null when TTL expired (30min)', () => {
    const state = makeTestState();
    saveProgress(state);

    // Manually set savedAt to 31 minutes ago
    const raw = JSON.parse(store[PROGRESS_KEY]);
    raw.savedAt = Date.now() - 31 * 60 * 1000 - 1;
    store[PROGRESS_KEY] = JSON.stringify(raw);

    const result = loadProgress();
    expect(result).toBeNull();
    // Should also clean up expired data
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROGRESS_KEY);
  });

  it('does NOT save when phase is not testing', () => {
    const state = makeTestState({ phase: 'idle' });
    saveProgress(state);
    expect(store[PROGRESS_KEY]).toBeUndefined();
  });

  it('loadProgress discards old progress without version field', () => {
    const oldProgress = {
      sessionId: 'rp_old',
      currentQuestionIndex: 3,
      answers: { 0: { questionId: 1, optionId: 'A', dimensionScore: 1 } },
      randomizedOptions: [],
      savedAt: Date.now(),
    };
    store[PROGRESS_KEY] = JSON.stringify(oldProgress);
    const result = loadProgress();
    expect(result).toBeNull();
    // Should clean up
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROGRESS_KEY);
  });

  it('loadProgress discards progress with old version (v2)', () => {
    const oldProgress = {
      version: 2,
      sessionId: 'rp_old_v2',
      currentQuestionIndex: 3,
      answers: { 0: { questionId: 1, optionId: 'A', dimensionScore: 1 } },
      randomizedOptions: [],
      savedAt: Date.now(),
    };
    store[PROGRESS_KEY] = JSON.stringify(oldProgress);
    const result = loadProgress();
    expect(result).toBeNull();
  });

  it('loadProgress keeps progress with current version (v3)', () => {
    const currentProgress = {
      version: 3,
      sessionId: 'rp_current_v3',
      currentQuestionIndex: 5,
      answers: { 0: { questionId: 1, optionId: 'A', dimensionScore: 1 } },
      randomizedOptions: [],
      savedAt: Date.now(),
    };
    store[PROGRESS_KEY] = JSON.stringify(currentProgress);
    const result = loadProgress();
    expect(result).not.toBeNull();
    expect(result!.sessionId).toBe('rp_current_v3');
  });

  it('saveProgress writes version field', () => {
    const state = makeTestState();
    saveProgress(state);
    const raw = JSON.parse(store[PROGRESS_KEY]);
    expect(raw.version).toBe(3);
  });

  it('does NOT save when phase is completed', () => {
    const state = makeTestState({ phase: 'completed' });
    saveProgress(state);
    expect(store[PROGRESS_KEY]).toBeUndefined();
  });
});

// ─── clearProgress ────────────────────────────────────

describe('clearProgress', () => {
  it('removes saved progress from localStorage', () => {
    const state = makeTestState();
    saveProgress(state);
    expect(store[PROGRESS_KEY]).toBeDefined();

    clearProgress();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROGRESS_KEY);
  });

  it('is safe to call when nothing saved', () => {
    expect(() => clearProgress()).not.toThrow();
  });
});

// ─── Reducer actions ──────────────────────────────────

describe('testReducer', () => {
  it('RESTORE_PROGRESS restores state from saved data', () => {
    const progress = makeProgress({
      currentQuestionIndex: 2,
      answers: {
        0: { questionId: 1, optionId: 'A', dimensionScore: 1 },
        1: { questionId: 2, optionId: 'B', dimensionScore: 0 },
      },
    });

    const initial: TestState = {
      sessionId: '',
      currentQuestionIndex: 0,
      answers: {},
      randomizedOptions: [],
      phase: 'idle',
    };

    const restored = testReducer(initial, { type: 'RESTORE_PROGRESS', progress });
    expect(restored.phase).toBe('testing');
    expect(restored.sessionId).toBe('rp_test_session_001');
    expect(restored.currentQuestionIndex).toBe(2);
    expect(Object.keys(restored.answers)).toHaveLength(2);
    expect(restored.answers[0].optionId).toBe('A');
  });

  it('SET_RESULT clears progress from localStorage', () => {
    // First save progress
    saveProgress(makeTestState());
    expect(store[PROGRESS_KEY]).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockResult: any = {
      typeId: 5, code: 'CGDG', name: '跑团结算官', emoji: '🧮',
      keywords: ['数据', '规则', '装备'] as [string, string, string],
      roast: '最强大脑', traits: ['配速党', 'PB控', '赛霸'] as [string, string, string],
      dimensionScores: { motivation: -1, social: 1, style: -1, ritual: -1 },
      color: '#2196F3',
      svgIcon: 'CGDG',
    };

    const state = testReducer(makeTestState(), {
      type: 'SET_RESULT',
      result: mockResult,
    });

    expect(state.phase).toBe('completed');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROGRESS_KEY);
  });

  it('RESET clears progress from localStorage', () => {
    saveProgress(makeTestState());
    expect(store[PROGRESS_KEY]).toBeDefined();

    const state = testReducer(makeTestState(), { type: 'RESET' });
    expect(state.phase).toBe('idle');
    expect(state.answers).toEqual({});
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(PROGRESS_KEY);
  });

  it('SELECT_ANSWER does NOT mutate state when phase is not testing', () => {
    const idle: TestState = {
      sessionId: '',
      currentQuestionIndex: 0,
      answers: {},
      randomizedOptions: [],
      phase: 'idle',
    };
    const result = testReducer(idle, { type: 'SELECT_ANSWER', questionIndex: 0, optionId: 'A', dimensionScore: 1 });
    expect(result).toBe(idle); // Same reference — no change
  });

  it('SELECT_ANSWER transitions to calculating on last question (index 11)', () => {
    const state = makeTestState({ currentQuestionIndex: 11, answers: {
      0: { questionId: 1, optionId: 'A', dimensionScore: 1 },
      1: { questionId: 2, optionId: 'B', dimensionScore: 0.5 },
      2: { questionId: 3, optionId: 'A', dimensionScore: 1 },
      3: { questionId: 4, optionId: 'C', dimensionScore: -1 },
      4: { questionId: 5, optionId: 'D', dimensionScore: 1 },
      5: { questionId: 6, optionId: 'A', dimensionScore: 0.5 },
      6: { questionId: 7, optionId: 'B', dimensionScore: 1 },
      7: { questionId: 8, optionId: 'C', dimensionScore: -1 },
      8: { questionId: 9, optionId: 'D', dimensionScore: 1 },
      9: { questionId: 10, optionId: 'A', dimensionScore: 0.5 },
      10: { questionId: 11, optionId: 'B', dimensionScore: 1 },
    }});
    const result = testReducer(state, { type: 'SELECT_ANSWER', questionIndex: 11, optionId: 'C', dimensionScore: -1 });
    expect(result.phase).toBe('calculating');
    expect(Object.keys(result.answers)).toHaveLength(12);
  });
});
