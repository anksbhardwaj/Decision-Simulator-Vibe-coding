import { QuestionInput } from '@/components/QuestionInput';
import type { AnswerValue, ClarifyingQuestion } from '@/types';

interface Props {
  question: ClarifyingQuestion;
  value: AnswerValue;
  onSelect: (value: AnswerValue) => void;
}

export function QuestionCard({ question, value, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{question.question}</h2>
      {question.description && (
        <p className="mt-2 text-sm text-slate-500">{question.description}</p>
      )}

      <div className="mt-8">
        <QuestionInput question={question} value={value} onChange={onSelect} />
      </div>
    </div>
  );
}
