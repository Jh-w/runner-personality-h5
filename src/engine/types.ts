// 跑步人格测试 - 核心类型定义
// 版本: v1.0

/** 四个维度 */
export type Dimension = 'motivation' | 'equipment' | 'social' | 'planning';

/** 维度方向 */
export type MotivationDirection = '成绩驱动' | '享受过程';
export type EquipmentDirection = '装备党' | '极简派';
export type SocialDirection = '群跑派' | '独行侠';
export type PlanningDirection = '计划控' | '随性派';

/** 维度得分 */
export interface DimensionScores {
  motivation: 0 | 1;  // 0=享受过程, 1=成绩驱动
  equipment: 0 | 1;   // 0=极简派, 1=装备党
  social: 0 | 1;      // 0=独行侠, 1=群跑派
  planning: 0 | 1;    // 0=随性派, 1=计划控
}

/** 人格类型ID (1-16) */
export type PersonalityTypeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

/** 人格结果 */
export interface PersonalityResult {
  typeId: PersonalityTypeId;
  name: string;
  emoji: string;
  roast: string;
  traits: [string, string, string];
  advice: string;
  motto: string;
  dimensionScores: DimensionScores;
  color: string;
}

/** 选项 */
export interface Option {
  id: string;       // A/B/C/D
  text: string;     // 选项文案
  emoji: string;    // emoji图标
  score: 0 | 1;     // 该维度正向得分 (1=正向, 0=反向)
}

/** 题目 */
export interface Question {
  id: number;
  text: string;
  dimension: Dimension;
  options: Option[];
}

/** 答案 */
export interface Answer {
  questionId: number;
  optionId: string;
  score: number;
}

/** Session数据 */
export interface SessionData {
  sessionId: string;
  randomizedOptions: RandomizedQuestion[];
  participantCount: number;
  expiresAt: string;
}

/** 单题随机化选项 */
export interface RandomizedQuestion {
  question_id: number;
  options: { id: string; text: string }[];
}

/** 答题状态 */
export type TestPhase = 'idle' | 'testing' | 'calculating' | 'completed';

/** 答题状态 */
export interface TestState {
  sessionId: string;
  currentQuestionIndex: number;
  answers: Record<number, Answer>;
  randomizedOptions: RandomizedQuestion[];
  phase: TestPhase;
  result?: PersonalityResult;
}

/** 答题动作 */
export type TestAction =
  | { type: 'START_TEST'; session: SessionData }
  | { type: 'SELECT_ANSWER'; questionIndex: number; optionId: string; score: number }
  | { type: 'COMPLETE_TEST' }
  | { type: 'SET_RESULT'; result: PersonalityResult }
  | { type: 'RESET' };
