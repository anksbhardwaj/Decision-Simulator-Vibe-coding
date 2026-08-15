import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { QuestionCard } from '@/components/QuestionCard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import type { Answers, QuestionSet } from '@/types';

interface Props {
  questionSet: QuestionSet | null;
  loading: boolean;
  error: string | null;
  answers: Answers;
  onChange: (answers: Answers) => void;
  onContinue: () => void;
  onBack: () => void;
  onRetry: () => void;
}

export function Questions({
  questionSet,
  loading,
  error,
  answers,
  onChange,
  onContinue,
  onBack,
  onRetry,
}: Props) {
  const [index, setIndex] = useState(0);

  const questions = questionSet?.questions ?? [];
  const total = questions.length;

  // Reset to first question when a new question set arrives
  useEffect(() => {
    if (questionSet) setIndex(0);
  }, [questionSet]);

  if (loading) {
    return <LoadingState message="Understanding your decision..." />;
  }

  if (error || !questionSet) {
    return (
      <ErrorState
        message={error ?? undefined}
        onRetry={onRetry}
        onBack={onBack}
      />
    );
  }

  const question = questions[index];
  const current = answers[question.id] ?? null;
  const isLast = index === total - 1;
  const isAnswered = current !== null && current !== '' && current !== undefined;

  const select = (value: typeof current) => onChange({ ...answers, [question.id]: value });

  const goBack = () => {
    if (index === 0) onBack();
    else setIndex((i) => i - 1);
  };

  const goForward = () => {
    if (isLast) onContinue();
    else setIndex((i) => i + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-600">
          Question {index + 1} of {total}
        </p>
        <p className="text-sm text-slate-400">{Math.round(((index + 1) / total) * 100)}% complete</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
        <Tag className="h-3.5 w-3.5 text-slate-400" />
        Decision type: {questionSet.decisionType}
      </div>

      <div className="mt-6">
        <QuestionCard question={question} value={current} onSelect={select} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={goForward}
          disabled={!isAnswered}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {isLast ? 'See priorities' : 'Continue'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
