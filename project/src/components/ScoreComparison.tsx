import { Trophy } from 'lucide-react';

interface Props {
  labelA: string;
  labelB: string;
  scoreA: number;
  scoreB: number;
  recommended: 'A' | 'B';
}

export function ScoreComparison({ labelA, labelB, scoreA, scoreB, recommended }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <OptionCard label={labelA} score={scoreA} won={recommended === 'A'} tone="a" />
      <OptionCard label={labelB} score={scoreB} won={recommended === 'B'} tone="b" />
    </div>
  );
}

function OptionCard({
  label,
  score,
  won,
  tone,
}: {
  label: string;
  score: number;
  won: boolean;
  tone: 'a' | 'b';
}) {
  const bar = tone === 'a' ? 'bg-slate-700' : 'bg-brand-600';
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
        won ? 'border-emerald-300 bg-emerald-50/60 shadow-lift' : 'border-slate-100 bg-white shadow-card'
      }`}
    >
      {won && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
          <Trophy className="h-3.5 w-3.5" />
          Recommended
        </span>
      )}
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight text-slate-900">{score}</span>
        <span className="text-lg font-medium text-slate-400">/ 100</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
