import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';
import type { Analysis, Decision, RoundDelta } from '../types';

interface RoundComparisonViewProps {
  decision: Decision;
  analyses: Analysis[]; // All rounds [Round 1, Round 2, ...]
  activeRound: number;
}

export function RoundComparisonView({
  decision,
  analyses,
  activeRound,
}: RoundComparisonViewProps) {
  const round1 = analyses.find((a) => a.round === 1) || analyses[0];
  const currentRoundAnalysis =
    analyses.find((a) => a.round === activeRound) || analyses[analyses.length - 1];

  const delta = currentRoundAnalysis?.delta;
  const confidenceBefore =
    currentRoundAnalysis?.confidenceBefore ?? decision.initialConfidence;
  const confidenceAfter =
    currentRoundAnalysis?.confidenceAfter ?? decision.initialConfidence;
  const confidenceDelta = confidenceAfter - confidenceBefore;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Neutral Observations & Confidence Delta Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Round 1 vs. Round {activeRound} Calibration Delta
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-100">
              Neutral Observations on Reasoning Evolution
            </h3>
          </div>

          {/* Confidence Before vs After Trajectory */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs font-mono">
            <div>
              <span className="text-stone-400 block text-[10px]">Start Confidence</span>
              <span className="text-stone-200 font-bold text-sm">{confidenceBefore}%</span>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
            <div>
              <span className="text-stone-400 block text-[10px]">Round {activeRound} Confidence</span>
              <span className="text-amber-400 font-bold text-sm">{confidenceAfter}%</span>
            </div>
            <div className="pl-2 border-l border-stone-800 flex items-center gap-1 text-[11px]">
              {confidenceDelta > 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{confidenceDelta}%
                </span>
              ) : confidenceDelta < 0 ? (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {confidenceDelta}%
                </span>
              ) : (
                <span className="text-stone-400 flex items-center">
                  <Minus className="w-3.5 h-3.5 mr-0.5" /> 0%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Neutral Bullet Points */}
        <div className="space-y-2">
          {delta?.neutralObservations && delta.neutralObservations.length > 0 ? (
            <div className="space-y-1.5">
              {delta.neutralObservations.map((obs, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-stone-200 font-sans"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">{obs}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic">
              No substantive changes between rounds were recorded.
            </p>
          )}

          <div className="pt-2 text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400/80" />
            <span>
              Neutrality guarantee: No change is a completely valid result. The thinking partner never implies you should have changed your mind.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Four Delta Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: New Factors Introduced */}
        <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                <PlusCircle className="w-4 h-4" />
                New Factors
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                {delta?.newFactors?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Premises newly added or derived from your answered questions
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {delta?.newFactors && delta.newFactors.length > 0 ? (
              delta.newFactors.map((f, i) => (
                <div
                  key={f.id || i}
                  className="p-2.5 rounded-lg bg-stone-950 border border-amber-950 text-xs text-stone-200"
                >
                  <span className="text-[9px] font-mono uppercase text-amber-400/80 block mb-0.5">
                    {f.area} • {f.horizon}
                  </span>
                  "{f.text}"
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-950/40 rounded">
                No new factors introduced in this round.
              </div>
            )}
          </div>
        </div>

        {/* Card B: Overlooked Risks Now Addressed */}
        <div className="p-4 rounded-xl bg-stone-900/80 border border-emerald-900/40 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Blind Spots Addressed
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {delta?.overlookedNowAddressed?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Previously missing factors that you actively planned for (ghost nodes filled in)
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {delta?.overlookedNowAddressed && delta.overlookedNowAddressed.length > 0 ? (
              delta.overlookedNowAddressed.map((oa, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/60 text-xs text-stone-200 space-y-1"
                >
                  <div className="font-medium text-emerald-200">{oa.title}</div>
                  <div className="text-[10px] text-stone-400 font-sans">{oa.howAddressed}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-950/40 rounded">
                No prior overlooked risks addressed yet.
              </div>
            )}
          </div>
        </div>

        {/* Card C: Assumptions Tested/Checked */}
        <div className="p-4 rounded-xl bg-stone-900/80 border border-blue-900/40 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Assumptions Tested
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {delta?.assumptionsNowChecked?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Assumptions verified or clarified with empirical test questions
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {delta?.assumptionsNowChecked && delta.assumptionsNowChecked.length > 0 ? (
              delta.assumptionsNowChecked.map((ac, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/60 text-xs text-stone-200 space-y-1"
                >
                  <div className="font-medium text-blue-200">{ac.title}</div>
                  <div className="text-[10px] text-stone-400 font-sans">
                    {ac.note || 'Status: ' + ac.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-950/40 rounded">
                No assumptions checked in this round.
              </div>
            )}
          </div>
        </div>

        {/* Card D: Still Unaddressed Blind Spots */}
        <div className="p-4 rounded-xl bg-stone-900/80 border border-red-900/40 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4" />
                Still Unaddressed
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
                {delta?.stillUnaddressed?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Remaining gaps that stay dotted/ghost on the reasoning map
            </p>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {delta?.stillUnaddressed && delta.stillUnaddressed.length > 0 ? (
              delta.stillUnaddressed.map((su, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/50 text-xs text-stone-200 space-y-0.5"
                >
                  <div className="font-medium text-red-200">{su.item}</div>
                  <div className="text-[10px] text-stone-400">{su.observation}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-950/40 rounded">
                All identified risks have been addressed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side Round 1 vs Round 2 Comparison Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-stone-800 bg-stone-950/60 flex items-center justify-between">
          <h4 className="font-serif text-sm font-semibold text-stone-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Side-by-Side Round Breakdown
          </h4>
          <span className="text-xs font-mono text-stone-400">
            Round 1 (Initial Intake) vs Round {activeRound} (Calibrated)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-800">
          {/* Round 1 Column */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-stone-400 font-bold">
                Round 1 (Initial Intake)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                Confidence: {decision.initialConfidence}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  Stated Claims ({round1.claims?.length || 0})
                </span>
                <ul className="space-y-1 list-disc list-inside text-stone-300">
                  {round1.claims?.slice(0, 4).map((c) => (
                    <li key={c.id} className="line-clamp-1">
                      "{c.text}"
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  Unaddressed Blind Spots ({round1.overlookedRisks?.length || 0})
                </span>
                <ul className="space-y-1 list-disc list-inside text-red-300/80">
                  {round1.overlookedRisks?.slice(0, 3).map((r) => (
                    <li key={r.id} className="line-clamp-1">
                      {r.risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  Active Contradictions ({round1.contradictions?.length || 0})
                </span>
                <p className="text-stone-400 line-clamp-2">
                  {round1.contradictions?.[0]?.description || 'None noted'}
                </p>
              </div>
            </div>
          </div>

          {/* Round 2 / Current Round Column */}
          <div className="p-5 space-y-4 bg-stone-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                Round {activeRound} (Calibrated)
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                Confidence: {confidenceAfter}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  Active Claims ({currentRoundAnalysis.claims?.length || 0})
                </span>
                <ul className="space-y-1 list-disc list-inside text-stone-200">
                  {currentRoundAnalysis.claims?.slice(0, 4).map((c) => (
                    <li key={c.id} className="line-clamp-1">
                      "{c.text}"{' '}
                      {c.isNewInRound && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          [New Factor]
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  Blind Spots Status
                </span>
                <p className="text-stone-300">
                  <strong className="text-emerald-400">
                    {delta?.overlookedNowAddressed?.length || 0}
                  </strong>{' '}
                  addressed & filled in •{' '}
                  <strong className="text-rose-400">
                    {delta?.stillUnaddressed?.length || 0}
                  </strong>{' '}
                  still unaddressed.
                </p>
              </div>

              <div>
                <span className="text-stone-400 font-mono block mb-1">
                  New Probing Questions ({currentRoundAnalysis.probingQuestions?.length || 0})
                </span>
                <p className="font-serif italic text-stone-300 line-clamp-2">
                  "{currentRoundAnalysis.probingQuestions?.[0]?.question}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
