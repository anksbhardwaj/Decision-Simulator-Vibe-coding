import type { AnswerValue, ClarifyingQuestion } from '@/types';

interface Props {
  question: ClarifyingQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

const SCALE_LABELS = ['Not at all', 'Slightly', 'Moderately', 'Very', 'Critical'];

export function QuestionInput({ question, value, onChange }: Props) {
  switch (question.type) {
    case 'scale':
      return <ScaleInput question={question} value={value} onChange={onChange} />;
    case 'single_choice':
      return <SingleChoiceInput question={question} value={value} onChange={onChange} />;
    case 'yes_no':
      return <YesNoInput value={value} onChange={onChange} />;
    case 'number':
      return <NumberInput question={question} value={value} onChange={onChange} suffix="" />;
    case 'currency':
      return <NumberInput question={question} value={value} onChange={onChange} prefix="$" />;
    case 'percentage':
      return <NumberInput question={question} value={value} onChange={onChange} suffix="%" />;
    case 'text':
      return <TextInput question={question} value={value} onChange={onChange} />;
    default:
      return <TextInput question={question} value={value} onChange={onChange} />;
  }
}

function ScaleInput({ question, value, onChange }: Props) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const count = max - min + 1;
  const minLabel = question.minLabel ?? 'Not important';
  const maxLabel = question.maxLabel ?? 'Critical';
  const labels = count === 5 ? SCALE_LABELS : null;

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {Array.from({ length: count }, (_, i) => {
        const n = min + i;
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex flex-col items-center gap-2 rounded-xl border py-4 transition-all ${
              selected
                ? 'border-brand-600 bg-brand-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            <span className={`text-lg font-bold ${selected ? 'text-brand-700' : 'text-slate-700'}`}>
              {n}
            </span>
            {labels && (
              <span className={`text-[11px] leading-tight ${selected ? 'text-brand-600' : 'text-slate-400'}`}>
                {labels[i]}
              </span>
            )}
          </button>
        );
      })}
      <div className="col-span-5 mt-1 flex justify-between text-xs text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function SingleChoiceInput({ question, value, onChange }: Props) {
  const options = question.options ?? [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-xl border px-4 py-4 text-left text-sm font-medium transition-all ${
              selected
                ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function YesNoInput({ value, onChange }: { value: AnswerValue; onChange: (v: AnswerValue) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {['Yes', 'No'].map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-xl border py-5 text-center text-base font-semibold transition-all ${
              selected
                ? opt === 'Yes'
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-rose-400 bg-rose-50 text-rose-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  question,
  value,
  onChange,
  prefix,
  suffix,
}: Props & { prefix?: string; suffix?: string }) {
  const shared =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-lg text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100';
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="numeric"
        className={shared}
        style={{ paddingLeft: prefix ? '2.25rem' : undefined, paddingRight: suffix ? '2.5rem' : undefined }}
        placeholder={question.type === 'currency' ? '0' : 'Enter a number'}
        value={value === null ? '' : String(value)}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function TextInput({ question, value, onChange }: Props) {
  const shared =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100';
  return (
    <textarea
      rows={3}
      className={`${shared} resize-none`}
      placeholder="Type your answer..."
      value={value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
