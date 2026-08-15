import { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import type { Criterion } from '@/types';

interface Props {
  criterion: Criterion;
  labelA: string;
  labelB: string;
  onWeightChange: (weight: number) => void;
  compact?: boolean;
}

export function CriteriaSlider({ criterion, labelA, labelB, onWeightChange, compact }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{criterion.name}</h3>
            {criterion.confidence === 'low' && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                Low confidence
              </span>
            )}
          </div>
          {!compact && <p className="mt-1 text-sm text-slate-500">{criterion.description}</p>}
        </div>
        <span className="shrink-0 rounded-lg bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
          {criterion.weight}%
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={criterion.weight}
        onChange={(e) => onWeightChange(Number(e.target.value))}
        className="mt-4 w-full"
        aria-label={`Importance of ${criterion.name}`}
      />

      {!compact && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <ScorePill label={labelA} score={criterion.scoreA} tone="a" />
            <ScorePill label={labelB} score={criterion.scoreB} tone="b" />
          </div>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <Info className="h-3.5 w-3.5" />
            {expanded ? 'Hide reasoning' : 'Why these scores?'}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ReasonCard label={labelA} reason={criterion.scoreReasonA} />
              <ReasonCard label={labelB} reason={criterion.scoreReasonB} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ScorePill({ label, score, tone }: { label: string; score: number; tone: 'a' | 'b' }) {
  const color = tone === 'a' ? 'bg-slate-700' : 'bg-brand-600';
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="truncate text-xs font-medium text-slate-500">{label}</span>
        <span className="text-sm font-bold text-slate-900">{score}/10</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}

function ReasonCard({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{reason}</p>
    </div>
  );
}
