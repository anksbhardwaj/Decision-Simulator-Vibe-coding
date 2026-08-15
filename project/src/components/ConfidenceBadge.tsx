import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { Confidence } from '@/types';

interface Props {
  confidence: Confidence;
  difference: number;
}

const CONFIG: Record<Confidence, { icon: typeof ShieldCheck; classes: string; blurb: string }> = {
  High: {
    icon: ShieldCheck,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blurb: 'A clear, comfortable margin between the two options.',
  },
  Medium: {
    icon: ShieldAlert,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    blurb: 'A meaningful lead, but worth reviewing your priorities.',
  },
  Low: {
    icon: ShieldQuestion,
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    blurb: 'The options are very close. Small changes could flip it.',
  },
};

export function ConfidenceBadge({ confidence, difference }: Props) {
  const { icon: Icon, classes, blurb } = CONFIG[confidence];
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-5 ${classes}`}>
      <Icon className="mt-0.5 h-6 w-6 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{confidence} confidence</p>
        <p className="mt-1 text-sm opacity-90">
          {blurb} A {difference}-point gap separates them.
        </p>
      </div>
    </div>
  );
}
