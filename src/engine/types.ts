// 跑步人格测试 - 核心类型定义
// 版本: v3.3-Phase3 — PRD v3.3 新四维框架 + PK + SVG

// ─── 维度与编码 ──────────────────────────────────────

/** 四个维度 */
export type Dimension = 'motivation' | 'social' | 'style' | 'ritual';

/** 四字母人格编码 (C/E × S/G × D/P × G/M) */
export type PersonalityCode = string; // e.g. "CSDG", "EPGM"

// ─── 维度得分 ─────────────────────────────────────────

/** 维度累积得分（可为负值，来自每题 dimensionScore 累加） */
export interface DimensionScores {
  motivation: number; // >0=体验驱动E, <0=竞技驱动C
  social: number;     // >0=社群动物G, <0=独狼S
  style: number;      // >0=随性派P,   <0=计划狂D
  ritual: number;     // >0=极简派M,   <0=装备党G
}

// ─── 人格 ────────────────────────────────────────────

/** 人格类型ID (1-16) */
export type PersonalityTypeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

/** 人格结果 */
export interface PersonalityResult {
  typeId: PersonalityTypeId;
  code: PersonalityCode;          // 四字母编码
  name: string;
  emoji: string;
  keywords: [string, string, string]; // 3个关键词
  roast: string;                      // 一句话吐槽
  traits: [string, string, string];   // 3条特征
  dimensionScores: DimensionScores;
  color: string;
  quote: string;                      // 跑者金句（v3.1 Phase1）
  colorDark?: string;                 // 深色变体，用于渐变（v3.1 Phase1）
  bestBuddy?: BestBuddy;              // 最佳跑团搭档（v3.1 Phase1）
  svgIcon: string;                    // SVG 图标文件名（v3.3 Phase3）
}

// ─── 最佳搭档（v3.1 Phase1）─────────────────────────────

/** 最佳跑团搭档 */
export interface BestBuddy {
  typeId: PersonalityTypeId;
  code: PersonalityCode;
  name: string;
  emoji: string;
  quote: string;
  pairDescription: string;  // 你们一起跑时的解读
}

// ─── 题目与选项 ───────────────────────────────────────

/** 选项 */
export interface Option {
  id: string;              // A/B/C/D
  text: string;            // 选项文案
  emoji: string;           // emoji图标
  dimensionScore: number;  // 该维度得分: ±1 (强倾向) / ±0.5 (弱倾向)
}

/** 题目 */
export interface Question {
  id: number;
  text: string;
  dimension: Dimension;
  options: Option[];
}

// ─── 答案与状态 ──────────────────────────────────────

/** 答案 */
export interface Answer {
  questionId: number;
  optionId: string;
  dimensionScore: number;
}

/** 答题阶段 */
export type TestPhase = 'idle' | 'testing' | 'calculating' | 'completed';

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
  | { type: 'SELECT_ANSWER'; questionIndex: number; optionId: string; dimensionScore: number }
  | { type: 'COMPLETE_TEST' }
  | { type: 'SET_RESULT'; result: PersonalityResult }
  | { type: 'RESET' }
  | { type: 'RESTORE_PROGRESS'; progress: SavedProgress };

/** localStorage 持久化的答题进度 */
export interface SavedProgress {
  version: number;           // v3.3: 版本号=3，用于兼容检测
  sessionId: string;
  currentQuestionIndex: number;
  answers: Record<number, Answer>;
  randomizedOptions: RandomizedQuestion[];
  savedAt: number;
}

// ─── PK 对比卡片（v3.3 Phase3）─────────────────────────

/** 维度对比信息 */
export interface DimensionComparison {
  dimension: 'motivation' | 'social' | 'style' | 'ritual';
  typeA: string;
  typeB: string;
  isComplementary: boolean;
  label: string;
}

/** PK 评级 1-5 */
export type PkRating = 1 | 2 | 3 | 4 | 5;

/** PK 对比结果 */
export interface PkResult {
  codeA: PersonalityCode;
  codeB: PersonalityCode;
  nameA: string;
  nameB: string;
  matchPercentage: number;
  complementCount: number;
  rating: PkRating;
  judgment: string;
  description: string;
  dimensionComparisons: DimensionComparison[];
}

/** 当前数据版本号 */
export const CURRENT_VERSION = 3;
