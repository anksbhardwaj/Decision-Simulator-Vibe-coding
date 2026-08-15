import type { Confidence, Criterion, DecisionResult } from '@/types';

export function computeResult(criteria: Criterion[]): DecisionResult {
  const totalA = weightedScore(criteria, 'scoreA');
  const totalB = weightedScore(criteria, 'scoreB');
  const difference = Math.abs(totalA - totalB);
  const recommended: 'A' | 'B' = totalB >= totalA ? 'B' : 'A';

  let confidence: Confidence = 'Low';
  if (difference > 8) confidence = 'High';
  else if (difference >= 3) confidence = 'Medium';

  return { totalA, totalB, difference, recommended, confidence };
}

function weightedScore(criteria: Criterion[], key: 'scoreA' | 'scoreB'): number {
  const raw = criteria.reduce((sum, c) => sum + c.weight * c[key], 0);
  return Math.round(raw / 10);
}

// Change one criterion's weight and redistribute the rest proportionally so the total stays 100.
export function rebalanceWeights(
  criteria: Criterion[],
  changedId: string,
  newWeight: number,
): Criterion[] {
  const clamped = Math.max(0, Math.min(100, Math.round(newWeight)));
  const others = criteria.filter((c) => c.id !== changedId);
  const othersTotal = others.reduce((sum, c) => sum + c.weight, 0);
  const remaining = 100 - clamped;

  const floats = criteria.map((c) => {
    if (c.id === changedId) return clamped;
    if (othersTotal === 0) return remaining / others.length;
    return (c.weight / othersTotal) * remaining;
  });

  return applyRounding(criteria, floats, changedId);
}

// Round float weights to integers while guaranteeing the total is exactly 100.
function applyRounding(criteria: Criterion[], floats: number[], lockedId: string): Criterion[] {
  const rounded = floats.map((f) => Math.round(f));
  let diff = 100 - rounded.reduce((sum, n) => sum + n, 0);

  const order = criteria
    .map((c, i) => ({ i, frac: floats[i] - Math.floor(floats[i]), locked: c.id === lockedId }))
    .filter((x) => !x.locked)
    .sort((a, b) => b.frac - a.frac);

  let idx = 0;
  while (diff !== 0 && order.length > 0) {
    const target = order[idx % order.length].i;
    const next = rounded[target] + (diff > 0 ? 1 : -1);
    if (next >= 0 && next <= 100) {
      rounded[target] = next;
      diff += diff > 0 ? -1 : 1;
    }
    idx++;
    if (idx > order.length * 200) break;
  }

  return criteria.map((c, i) => ({ ...c, weight: rounded[i] }));
}

export interface TippingPoint {
  criterionName: string;
  threshold: number;
  flipsTo: 'A' | 'B';
  found: boolean;
}

// Search for the smallest weight change to a single criterion that flips the recommendation.
export function findTippingPoint(criteria: Criterion[]): TippingPoint | null {
  const current = computeResult(criteria).recommended;
  let best: TippingPoint | null = null;

  for (const c of criteria) {
    for (let w = 0; w <= 100; w++) {
      const rebalanced = rebalanceWeights(criteria, c.id, w);
      const outcome = computeResult(rebalanced).recommended;
      if (outcome !== current) {
        const distance = Math.abs(w - c.weight);
        if (!best || distance < Math.abs(best.threshold - criteriaWeight(criteria, best.criterionName))) {
          best = { criterionName: c.name, threshold: w, flipsTo: outcome, found: true };
        }
        break;
      }
    }
  }

  return best;
}

function criteriaWeight(criteria: Criterion[], name: string): number {
  return criteria.find((c) => c.name === name)?.weight ?? 0;
}
