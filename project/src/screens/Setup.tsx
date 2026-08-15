import { ArrowLeft } from 'lucide-react';
import { DecisionForm } from '@/components/DecisionForm';
import type { DecisionInput } from '@/types';

interface Props {
  value: DecisionInput;
  onChange: (value: DecisionInput) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Setup({ value, onChange, onContinue, onBack }: Props) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        What are you deciding?
      </h1>
      <p className="mt-2 text-slate-500">
        Frame your question and name the two options you are weighing.
      </p>

      <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <DecisionForm value={value} onChange={onChange} onContinue={onContinue} />
      </div>
    </div>
  );
}
