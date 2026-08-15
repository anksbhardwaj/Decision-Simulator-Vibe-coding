import { ArrowRight, Scale, BarChart3, Sparkles } from 'lucide-react';
import { exampleDecisions } from '@/data/mockData';
import type { DecisionInput } from '@/types';

interface Props {
  onStart: (prefill?: DecisionInput) => void;
}

export function Home({ onStart }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Structured, weighted decision analysis
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Make better decisions with clarity.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          Compare your options, understand the trade-offs and see what would change the outcome.
        </p>
        <button
          type="button"
          onClick={() => onStart()}
          className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lift transition-all hover:bg-brand-700"
        >
          Start a Decision
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-20">
        <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-400">
          Or start from an example
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {exampleDecisions.map((ex) => (
            <button
              key={ex.title}
              type="button"
              onClick={() => onStart({ question: ex.question, optionA: ex.optionA, optionB: ex.optionB })}
              className="group rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{ex.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{ex.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                Try this
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-card sm:grid-cols-3 sm:p-10">
        <Feature icon={Scale} title="Weighted scoring" text="Set how much each factor matters and let the math do the rest." />
        <Feature icon={BarChart3} title="Clear trade-offs" text="See exactly where each option wins and where it falls short." />
        <Feature icon={Sparkles} title="Sensitivity analysis" text="Discover the tipping point that would flip your decision." />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Scale; title: string; text: string }) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}
