import { ArrowLeft, Calculator } from 'lucide-react';
import { CriteriaSlider } from '@/components/CriteriaSlider';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import type { Criterion } from '@/types';

interface Props {
  criteria: Criterion[] | null;
  loading: boolean;
  error: string | null;
  labelA: string;
  labelB: string;
  onWeightChange: (id: string, weight: number) => void;
  onCalculate: () => void;
  onBack: () => void;
  onRetry: () => void;
}

export function Priorities({
  criteria,
  loading,
  error,
  labelA,
  labelB,
  onWeightChange,
  onCalculate,
  onBack,
  onRetry,
}: Props) {
  if (loading) {
    return <LoadingState message="Building your decision model..." />;
  }

  if (error || !criteria) {
    return <ErrorState message={error ?? undefined} onRetry={onRetry} onBack={onBack} />;
  }

  const total = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to questions
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Set your priorities
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            These priorities are suggested based on your answers. Adjust them to reflect what matters most to you.
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
          <span className="block text-xs font-medium text-slate-500">Total weight</span>
          <span className="text-lg font-bold text-slate-900">{total}%</span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {criteria.map((c) => (
          <CriteriaSlider
            key={c.id}
            criterion={c}
            labelA={labelA}
            labelB={labelB}
            onWeightChange={(w) => onWeightChange(c.id, w)}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onCalculate}
          className="inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lift transition-all hover:bg-brand-700"
        >
          <Calculator className="h-5 w-5" />
          Calculate My Decision
        </button>
      </div>
    </div>
  );
}
