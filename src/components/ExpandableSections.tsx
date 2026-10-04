import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';
import type { Analysis, HiddenAssumption, OverlookedRisk, ProbingQuestion } from '../types';

interface ExpandableSectionsProps {
  analysis: Analysis;
}

export function ExpandableSections({ analysis }: ExpandableSectionsProps) {
  const [openSection, setOpenSection] = useState<'assumptions' | 'risks' | 'questions' | null>(
    'assumptions'
  );
  const [verifiedStepIds, setVerifiedStepIds] = useState<Record<string, boolean>>({});

  const toggleStep = (stepKey: string) => {
    setVerifiedStepIds((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const toggleSection = (sec: 'assumptions' | 'risks' | 'questions') => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  const assumptions = analysis.hiddenAssumptions || [];
  const risks = analysis.overlookedRisks || [];
  const questions = analysis.probingQuestions || [];

  return (
    <div className="w-full space-y-4">
      {/* 1. Hidden Assumptions Section */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-lg transition-colors">
        <button
          onClick={() => toggleSection('assumptions')}
          type="button"
          className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-800/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-400">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-stone-100">
                  Hidden Assumptions ({assumptions.length})
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                  Dotted in map
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Beliefs you are taking for granted without empirical verification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 hidden sm:inline">
              {openSection === 'assumptions' ? 'Collapse' : 'Expand'}
            </span>
            {openSection === 'assumptions' ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </div>
        </button>

        {openSection === 'assumptions' && (
          <div className="p-5 pt-0 border-t border-stone-800/60 space-y-4 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assumptions.map((assump, index) => {
                const isCheckable = assump.checkability === 'checkable';

                return (
                  <div
                    key={assump.id || index}
                    className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-medium">
                        Assumption #{index + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          isCheckable
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                            : 'bg-stone-800 text-stone-400 border-stone-700'
                        }`}
                      >
                        {assump.checkability}
                      </span>
                    </div>

                    <p className="font-serif italic text-sm text-stone-100 leading-snug">
                      "{assump.assumption}"
                    </p>

                    <div className="text-xs text-stone-300 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                      <span className="text-amber-300 font-mono block mb-0.5">
                        Why It Matters:
                      </span>
                      {assump.whyItMatters}
                    </div>

                    <div className="text-xs text-stone-200 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                      <span className="text-blue-300 font-mono block mb-0.5">
                        Test Question:
                      </span>
                      <span className="font-serif italic">"{assump.testQuestion}"</span>
                    </div>

                    {/* Verification Checklist */}
                    {isCheckable && assump.verificationSteps && assump.verificationSteps.length > 0 && (
                      <div className="pt-2 border-t border-stone-800/80">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-2">
                          Verification Checklist:
                        </span>
                        <div className="space-y-2">
                          {assump.verificationSteps.map((step, sIdx) => {
                            const stepKey = `${assump.id}_step_${sIdx}`;
                            const isChecked = !!verifiedStepIds[stepKey];

                            return (
                              <div
                                key={sIdx}
                                onClick={() => toggleStep(stepKey)}
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                                  isChecked
                                    ? 'bg-emerald-950/30 border-emerald-800/60 text-stone-400 line-through'
                                    : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 text-stone-200'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition ${
                                    isChecked
                                      ? 'bg-emerald-600 border-emerald-500 text-white'
                                      : 'border-stone-600 bg-stone-950'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-medium">{step.step}</span>
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                                      {step.effort} effort
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                                    Source: {step.whoOrWhere}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Overlooked Risks Section */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-lg transition-colors">
        <button
          onClick={() => toggleSection('risks')}
          type="button"
          className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-800/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-600/50 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-stone-100">
                  Overlooked Risks ({risks.length})
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-900/40">
                  Ghost nodes in map
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Plausible scenarios and trade-offs that did not appear in your stated factors
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 hidden sm:inline">
              {openSection === 'risks' ? 'Collapse' : 'Expand'}
            </span>
            {openSection === 'risks' ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </div>
        </button>

        {openSection === 'risks' && (
          <div className="p-5 pt-0 border-t border-stone-800/60 space-y-4 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {risks.map((risk, index) => (
                <div
                  key={risk.id || index}
                  className="p-4 rounded-xl bg-stone-950/80 border border-red-950/60 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono uppercase">
                      <span className="text-red-400 font-semibold">Risk #{index + 1}</span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                        {risk.area}
                      </span>
                    </div>

                    <h4 className="font-sans font-semibold text-stone-100 text-sm leading-snug">
                      {risk.risk}
                    </h4>

                    <p className="text-xs text-stone-400">
                      <strong className="text-stone-300 font-mono">Why Overlooked: </strong>
                      {risk.whyOverlooked}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-xs text-stone-200 font-serif italic leading-relaxed">
                    "{risk.question}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Questions to Sit With Section */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden shadow-lg transition-colors">
        <button
          onClick={() => toggleSection('questions')}
          type="button"
          className="w-full p-5 flex items-center justify-between text-left hover:bg-stone-800/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-600/50 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-stone-100">
                  Questions to Sit With ({questions.length})
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-900/40">
                  Socratic probes
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Probing queries to stress-test your thinking before committing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 hidden sm:inline">
              {openSection === 'questions' ? 'Collapse' : 'Expand'}
            </span>
            {openSection === 'questions' ? (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            )}
          </div>
        </button>

        {openSection === 'questions' && (
          <div className="p-5 pt-0 border-t border-stone-800/60 space-y-4 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {questions.map((q, index) => (
                <div
                  key={q.id || index}
                  className="p-5 rounded-xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold block">
                      Target: {q.targets}
                    </span>
                    <p className="font-serif italic text-sm text-stone-100 leading-relaxed">
                      "{q.question}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-800/80 text-[11px] text-stone-400 font-mono">
                    Take 10 minutes to write an honest answer without rationalizing.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
