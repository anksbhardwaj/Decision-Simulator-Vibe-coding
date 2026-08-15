import { Check } from 'lucide-react';
import type { Step } from '@/types';

const STEPS: { key: Step; label: string }[] = [
  { key: 'decision', label: 'Decision' },
  { key: 'questions', label: 'Questions' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'results', label: 'Results' },
];

interface Props {
  current: Step;
  onNavigate: (step: Step) => void;
  furthest: Step;
}

const ORDER: Step[] = ['decision', 'questions', 'priorities', 'results'];

export function StepIndicator({ current, onNavigate, furthest }: Props) {
  const currentIdx = ORDER.indexOf(current);
  const furthestIdx = ORDER.indexOf(furthest);

  return (
    <nav className="w-full">
      <ol className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          const reachable = i <= furthestIdx;

          return (
            <li key={step.key} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onNavigate(step.key)}
                className={`group flex items-center gap-2.5 ${
                  reachable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : isDone
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    isActive ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-2 h-px flex-1 sm:mx-4 ${
                    i < currentIdx ? 'bg-brand-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
