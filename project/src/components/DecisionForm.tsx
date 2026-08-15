import { ArrowRight } from 'lucide-react';
import type { DecisionInput } from '@/types';

interface Props {
  value: DecisionInput;
  onChange: (value: DecisionInput) => void;
  onContinue: () => void;
}

export function DecisionForm({ value, onChange, onContinue }: Props) {
  const isComplete =
    value.question.trim() !== '' && value.optionA.trim() !== '' && value.optionB.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) onContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field
        label="Decision question"
        placeholder="Should I accept the new job offer or stay at my current company?"
        value={value.question}
        onChange={(question) => onChange({ ...value, question })}
        textarea
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Option A"
          placeholder="Accept the new offer"
          value={value.optionA}
          onChange={(optionA) => onChange({ ...value, optionA })}
        />
        <Field
          label="Option B"
          placeholder="Stay at my current company"
          value={value.optionB}
          onChange={(optionB) => onChange({ ...value, optionB })}
        />
      </div>

      <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {isComplete ? 'All set. Continue to a few questions about what matters to you.' : 'Complete all three fields to continue.'}
        </p>
        <button
          type="submit"
          disabled={!isComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}

function Field({ label, placeholder, value, onChange, textarea }: FieldProps) {
  const shared =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100';
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          rows={2}
          className={`${shared} resize-none`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={shared}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
