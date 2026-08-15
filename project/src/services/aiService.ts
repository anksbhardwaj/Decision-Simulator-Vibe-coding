import type { QuestionSet, CriterionResult, DecisionInput, Answers } from '@/types';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-decision`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

interface GenerateQuestionsParams extends DecisionInput {}

interface GenerateCriteriaParams extends DecisionInput {
  questions: { id: string; question: string; type: string }[];
  answers: Answers;
}

export async function generateQuestions(
  params: GenerateQuestionsParams,
): Promise<QuestionSet> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'questions',
      decisionQuestion: params.question,
      optionA: params.optionA,
      optionB: params.optionB,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? '';
    } catch {
      // ignore parse errors
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  if (!data || typeof data.decisionType !== 'string' || !Array.isArray(data.questions)) {
    throw new Error('The AI returned an unexpected response. Please try again.');
  }
  return data as QuestionSet;
}

export async function generateCriteria(
  params: GenerateCriteriaParams,
): Promise<CriterionResult> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'criteria',
      decisionQuestion: params.question,
      optionA: params.optionA,
      optionB: params.optionB,
      questions: params.questions,
      answers: params.answers,
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error ?? '';
    } catch {
      // ignore parse errors
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.criteria)) {
    throw new Error('The AI returned an unexpected response. Please try again.');
  }
  return data as CriterionResult;
}
