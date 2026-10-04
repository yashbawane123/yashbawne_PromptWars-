import React from 'react';
import { X, ShieldAlert, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import type { GuardrailReport } from '../types';

interface TransparencyPanelProps {
  guardrail: GuardrailReport;
  isOpen: boolean;
  onClose: () => void;
}

export function TransparencyPanel({
  guardrail,
  isOpen,
  onClose,
}: TransparencyPanelProps) {
  if (!isOpen) return null;

  const rewrites = guardrail?.rewrites || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-stone-100">
                0-Advice Guardrail Transparency Panel
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Real-time verification logs preventing unsolicited advice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Policy banner */}
          <div className="bg-stone-950/80 border border-stone-800 p-3.5 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-medium">
              <Info className="w-4 h-4 text-amber-400" />
              Strict Non-Prescriptive Constitutional Law
            </div>
            <p className="text-stone-300 leading-relaxed">
              Every raw AI inference passes through two sequential guardrail filters: a
              regex pattern detector (Layer 1) and a dedicated AI classifier (Layer 2).
              Any phrasing that nudges, recommends, or tells you what you "should" do is
              intercepted and automatically rewritten into an open-ended Socratic question.
            </p>
            <p className="text-[11px] text-stone-400 font-mono italic">
              Notice: Original raw phrases are shown in this session modal only for
              transparency and are never persisted to the permanent database.
            </p>
          </div>

          {/* Rewrite list */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-3">
              Intercepted and Rewritten Clauses ({rewrites.length})
            </h4>

            {rewrites.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-stone-950/40 border border-stone-800/80">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-mono text-stone-300">
                  Zero prescriptive advice patterns were detected.
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  The reasoning output natively adhered to 100% Socratic inquiry.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewrites.map((rw, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Flagged: {rw.reason || 'Directional recommendation detected'}
                      </span>
                      <span className="text-stone-400">Filter Pass #{index + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                        <div className="text-[10px] font-mono text-rose-300 uppercase mb-1">
                          Original AI Raw Draft:
                        </div>
                        <p className="text-rose-200/90 line-through italic font-sans">
                          "{rw.original}"
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                        <div className="text-[10px] font-mono text-emerald-300 uppercase mb-1 flex items-center gap-1">
                          <span>Socratic Question Shown to You:</span>
                        </div>
                        <p className="text-emerald-100 font-serif italic">
                          "{rw.rewritten}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
