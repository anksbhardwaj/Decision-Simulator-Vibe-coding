import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, Scale, Sparkles, Repeat, Target } from 'lucide-react';
import { ScoreComparison } from '@/components/ScoreComparison';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { TradeoffCard } from '@/components/TradeoffCard';
import { CriteriaSlider } from '@/components/CriteriaSlider';
import { computeResult, findTippingPoint } from '@/lib/decision';
import type { Criterion } from '@/types';

interface Props {
  criteria: Criterion[];
  labelA: string;
  labelB: string;
  initialRecommended: 'A' | 'B';
  onWeightChange: (id: string, weight: number) => void;
  onBack: () => void;
  onRestart: () => void;
}

const WHY_ICONS = [TrendingUp, Scale, Sparkles];

export function Results({
  criteria,
  labelA,
  labelB,
  initialRecommended,
  onWeightChange,
  onBack,
  onRestart,
}: Props) {
  const result = useMemo(() => computeResult(criteria), [criteria]);
  const tipping = useMemo(() => findTippingPoint(criteria), [criteria]);

  const recLabel = result.recommended === 'A' ? labelA : labelB;
  const otherLabel = result.recommended === 'A' ? labelB : labelA;

  const advantages = useMemo(() => {
    const recKey = result.recommended === 'A' ? 'scoreA' : 'scoreB';
    const otherKey = result.recommended === 'A' ? 'scoreB' : 'scoreA';
    return criteria
      .map((c) => ({ c, edge: (c[recKey] - c[otherKey]) * c.weight, diff: c[recKey] - c[otherKey] }))
      .filter((x) => x.diff > 0)
      .sort((a, b) => b.edge - a.edge)
      .slice(0, 3);
  }, [criteria, result.recommended]);

  const tradeoff = useMemo(() => buildTradeoff(criteria, result.recommended, recLabel, otherLabel), [
    criteria,
    result.recommended,
    recLabel,
    otherLabel,
  ]);

  const shifted = result.recommended !== initialRecommended;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to priorities
      </button>

      <div className="rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-card sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Recommended option</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{recLabel}</h1>
        <p className="mt-2 text-slate-500">
          Based on your weighted priorities, {recLabel} comes out ahead by {result.difference} points.
        </p>

        <div className="mt-7">
          <ScoreComparison
            labelA={labelA}
            labelB={labelB}
            scoreA={result.totalA}
            scoreB={result.totalB}
            recommended={result.recommended}
          />
        </div>

        <div className="mt-6">
          <ConfidenceBadge confidence={result.confidence} difference={result.difference} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Why {recLabel} wins</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {advantages.length === 0 ? (
            <p className="text-slate-500">The two options are evenly matched across your criteria.</p>
          ) : (
            advantages.map((a, i) => (
              <TradeoffCard
                key={a.c.id}
                icon={WHY_ICONS[i % WHY_ICONS.length]}
                title={a.c.name}
                description={`Scores ${result.recommended === 'A' ? a.c.scoreA : a.c.scoreB}/10 versus ${
                  result.recommended === 'A' ? a.c.scoreB : a.c.scoreA
                }/10, and it carries ${a.c.weight}% of your decision.`}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Scale className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Biggest trade-off</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tradeoff}</p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Decision tipping point</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {tipping
              ? `If ${tipping.criterionName} becomes more than ${tipping.threshold}% of your total decision weight, ${
                  tipping.flipsTo === 'A' ? labelA : labelB
                } becomes the preferred choice.`
              : `${recLabel} stays ahead across every reasonable shift in a single priority. This is a robust decision.`}
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              What would change the decision?
            </h2>
            <p className="mt-1 text-slate-500">
              Adjust any priority and watch the recommendation update instantly.
            </p>
          </div>
        </div>

        <div
          className={`mt-6 rounded-xl border p-4 text-sm font-semibold ${
            shifted
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {shifted
            ? `The decision has now shifted toward ${recLabel}.`
            : `${recLabel} remains the better fit.`}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {criteria.map((c) => (
            <CriteriaSlider
              key={c.id}
              criterion={c}
              labelA={labelA}
              labelB={labelB}
              onWeightChange={(w) => onWeightChange(c.id, w)}
              compact
            />
          ))}
        </div>
      </section>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Start a new decision
        </button>
      </div>
    </div>
  );
}

function buildTradeoff(
  criteria: Criterion[],
  recommended: 'A' | 'B',
  recLabel: string,
  otherLabel: string,
): string {
  const recKey = recommended === 'A' ? 'scoreA' : 'scoreB';
  const otherKey = recommended === 'A' ? 'scoreB' : 'scoreA';

  const recStrength = [...criteria]
    .map((c) => ({ c, edge: (c[recKey] - c[otherKey]) * c.weight }))
    .sort((a, b) => b.edge - a.edge)[0];

  const otherStrength = [...criteria]
    .map((c) => ({ c, edge: (c[otherKey] - c[recKey]) * c.weight }))
    .sort((a, b) => b.edge - a.edge)[0];

  if (!otherStrength || otherStrength.edge <= 0) {
    return `${recLabel} leads on nearly every priority you set, so there is little you give up by choosing it.`;
  }

  return `${recLabel} offers stronger ${recStrength.c.name.toLowerCase()}, but ${otherLabel} provides noticeably better ${otherStrength.c.name.toLowerCase()}. Choosing ${recLabel} means accepting that trade.`;
}
