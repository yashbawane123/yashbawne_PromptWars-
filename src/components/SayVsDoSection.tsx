import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HelpCircle,
  Quote,
  Eye,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Decision, Analysis, SayVsDoReport, SayVsDoValueCard, StatementContradiction } from '../types';
import { analyzeSayVsDo } from '../lib/sayVsDoAnalyzer';

interface SayVsDoSectionProps {
  decision: Decision;
  analysis: Analysis;
  onHighlightValueOnMap?: (valueName: string) => void;
}

export function SayVsDoSection({
  decision,
  analysis,
  onHighlightValueOnMap,
}: SayVsDoSectionProps) {
  const report: SayVsDoReport = analyzeSayVsDo(decision, analysis);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

  const matchCount = report.valueCards.filter((c) => c.isMatch).length;
  const mismatchCount = report.valueCards.filter((c) => !c.isMatch).length;
  const contradictionCount = report.statementContradictions.length;

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 shadow-2xl p-6 sm:p-8 space-y-8 animate-fade-in text-stone-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-amber-400" />
            Say vs. Do Alignment Audit
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
            Stated Values vs. Deliberated Reasons
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 font-sans">
            We measure whether the values you declared as paramount in Step 3 actually appear in your conscious reasoning, or if immediate factors crowd them out.
          </p>
        </div>

        {/* Quick summary tally pills */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {matchCount} Reflected
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {mismatchCount} Crowded Out
          </span>
          {contradictionCount > 0 && (
            <span className="px-3 py-1 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              {contradictionCount} Tensions
            </span>
          )}
        </div>
      </div>

      {/* Part 1: Stated Values Cards (Matches and Mismatches) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400">
            1. Value Alignment Check ({report.valueCards.length} Stated Priorities)
          </h3>
          <span className="text-[11px] text-stone-400 font-sans">
            Showing both matches and omissions to keep the audit balanced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.valueCards.map((card) => {
            const isExpanded = expandedValue === card.value;

            if (card.isMatch) {
              /* MATCH CARD */
              return (
                <div
                  key={card.value}
                  className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/60 space-y-3.5 transition hover:border-emerald-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Reflected in Reasons
                    </span>
                    <span className="text-xs font-mono text-emerald-400/80">
                      {card.matchCount} of {card.totalReasons} reasons
                    </span>
                  </div>

                  <h4 className="font-serif text-base font-semibold text-emerald-100">
                    "{card.summary}"
                  </h4>

                  {/* Matching premises list */}
                  <div className="space-y-2 pt-1 border-t border-emerald-900/40">
                    <span className="text-[11px] font-mono text-stone-400 block uppercase">
                      Where this value shows up:
                    </span>
                    <div className="space-y-1.5">
                      {card.matchingClaims.map((claim) => (
                        <div
                          key={claim.id}
                          className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-mono text-[10px] mt-0.5 shrink-0">
                            ✓
                          </span>
                          <span className="font-sans">"{claim.text}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            /* MISMATCH CARD */
            return (
              <div
                key={card.value}
                className="p-5 rounded-2xl bg-rose-950/25 border-2 border-rose-800/70 space-y-3.5 transition hover:border-rose-600 shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Value Crowded Out
                  </span>
                  {onHighlightValueOnMap && (
                    <button
                      type="button"
                      onClick={() => onHighlightValueOnMap(card.value)}
                      className="text-[11px] font-mono text-rose-400 hover:text-rose-200 underline transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      View Red Edge on Map
                    </button>
                  )}
                </div>

                <h4 className="font-serif text-base font-bold text-rose-100">
                  "{card.summary}"
                </h4>

                {/* Reasons that crowd it out */}
                <div className="space-y-2 pt-1 border-t border-rose-900/50">
                  <span className="text-[11px] font-mono text-rose-300/80 block uppercase">
                    Factors currently crowding it out:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {card.crowdingClaims.slice(0, 3).map((claim) => (
                      <div
                        key={claim.id}
                        className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 flex items-start gap-2"
                      >
                        <span className="text-rose-400 font-mono text-[10px] mt-0.5 shrink-0">
                          ✕
                        </span>
                        <span className="font-sans line-clamp-2">"{claim.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Socratic Question Ending (Never a conclusion!) */}
                {card.question && (
                  <div className="p-3.5 rounded-xl bg-stone-950/90 border border-rose-900/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase font-semibold">
                      <HelpCircle className="w-3 h-3" />
                      Question to Examine
                    </div>
                    <p className="font-serif text-xs sm:text-sm italic text-stone-200 leading-relaxed">
                      "{card.question}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Contradictions Between Two of the User's Own Statements */}
      {report.statementContradictions.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-stone-800">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Zap className="w-4 h-4 text-amber-400" />
            2. Contradictions Between Your Own Statements ({report.statementContradictions.length})
          </div>
          <p className="text-xs text-stone-400 font-sans">
            Direct tensions where two premises or constraints you articulated compete with one another.
          </p>

          <div className="space-y-4">
            {report.statementContradictions.map((contra) => (
              <div
                key={contra.id}
                className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-900/60 transition space-y-4 shadow-md"
              >
                {/* Statement vs Statement Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">
                      Statement A
                    </span>
                    <p className="font-serif text-stone-200 font-medium">
                      {contra.statementA}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">
                      Statement B (In Tension)
                    </span>
                    <p className="font-serif text-stone-200 font-medium">
                      {contra.statementB}
                    </p>
                  </div>
                </div>

                {/* Tension Explanation */}
                <div className="text-xs text-stone-300 font-sans leading-relaxed">
                  <strong className="text-amber-300 font-mono text-[11px] block uppercase mb-0.5">
                    Structural Tension:
                  </strong>
                  {contra.tension}
                </div>

                {/* Ending with ONE Question, Never a Conclusion */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase font-semibold">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Socratic Question
                  </div>
                  <p className="font-serif text-xs sm:text-sm italic text-amber-100 leading-relaxed">
                    "{contra.question}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
