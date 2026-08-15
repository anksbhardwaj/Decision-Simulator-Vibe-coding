export type Step = 'home' | 'decision' | 'questions' | 'priorities' | 'results';

export type QuestionType =
  | 'scale'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'single_choice'
  | 'yes_no'
  | 'text';

export interface ClarifyingQuestion {
  id: string;
  question: string;
  description: string;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface QuestionSet {
  decisionType: string;
  questions: ClarifyingQuestion[];
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoreA: number;
  scoreB: number;
  scoreReasonA: string;
  scoreReasonB: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface CriterionResult {
  criteria: Criterion[];
}

export interface DecisionInput {
  question: string;
  optionA: string;
  optionB: string;
}

export type Confidence = 'Low' | 'Medium' | 'High';

export interface DecisionResult {
  totalA: number;
  totalB: number;
  difference: number;
  recommended: 'A' | 'B';
  confidence: Confidence;
}

export type AnswerValue = string | number | null;
export type Answers = Record<string, AnswerValue>;
