import React from 'react';
import type { Analysis, Decision, LifeArea } from '../types';
import { AlertCircle, Scale } from 'lucide-react';

interface BalanceStripProps {
  decision: Decision;
  analysis: Analysis;
}

const ALL_AREAS: LifeArea[] = [
  'money',
  'learning',
  'location',
  'career',
  'time',
  'health',
  'relationships',
  'emotion',
];

export function BalanceStrip({ decision, analysis }: BalanceStripProps) {
  // Tally areas from claims
  const areaCounts: Record<string, number> = {};
  ALL_AREAS.forEach((a) => (areaCounts[a] = 0));

  analysis.claims?.forEach((claim) => {
    const area = claim.area || 'other';
    areaCounts[area] = (areaCounts[area] || 0) + 1;
  });

  // Check which stated priorities have 0 claims in their area
  const neglectedPriorities = decision.statedPriorities?.filter((prio) => {
    const prioLower = prio.toLowerCase();
    const count = areaCounts[prioLower] || 0;
    return count === 0;
  });

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold">
            Reasoning Balance Strip
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            (Distribution of claims across life dimensions)
          </span>
        </div>

        {neglectedPriorities && neglectedPriorities.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2.5 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Lopsided focus: Stated core value{' '}
              <strong className="underline">{neglectedPriorities.join(', ')}</strong> has 0
              claims
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ALL_AREAS.map((area) => {
          const count = areaCounts[area] || 0;
          const isStatedValue = decision.statedPriorities?.some(
            (p) => p.toLowerCase() === area.toLowerCase()
          );
          const isNeglected = isStatedValue && count === 0;

          return (
            <div
              key={area}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                isNeglected
                  ? 'bg-rose-950/50 text-rose-300 border border-rose-600/70 shadow-sm'
                  : count > 0
                  ? 'bg-stone-800 text-stone-200 border border-stone-700'
                  : 'bg-stone-950/40 text-stone-400 border border-stone-900'
              }`}
            >
              <span className="capitalize">{area}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold ${
                  count > 0
                    ? 'bg-stone-700 text-amber-300'
                    : isNeglected
                    ? 'bg-rose-900/80 text-rose-100'
                    : 'bg-stone-900 text-stone-400'
                }`}
              >
                {count}
              </span>
              {isStatedValue && (
                <span
                  title="Stated as a core value in intake"
                  className="text-[10px] text-amber-400"
                >
                  ★
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
