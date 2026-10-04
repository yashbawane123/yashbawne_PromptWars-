import React from 'react';
import {
  X,
  Quote,
  EyeOff,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import type { Claim, HiddenAssumption, OverlookedRisk, Contradiction } from '../types';

interface NodeDetailDrawerProps {
  selectedNode: {
    type: 'decision' | 'claim' | 'assumption' | 'risk' | 'contradiction';
    data: any;
  } | null;
  onClose: () => void;
}

export function NodeDetailDrawer({ selectedNode, onClose }: NodeDetailDrawerProps) {
  if (!selectedNode) return null;

  const { type, data } = selectedNode;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl p-6 flex flex-col text-stone-100 animate-slide-left overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-5">
        <div className="flex items-center gap-2">
          {type === 'claim' && <Quote className="w-5 h-5 text-stone-300" />}
          {type === 'assumption' && <EyeOff className="w-5 h-5 text-amber-400" />}
          {type === 'risk' && <AlertTriangle className="w-5 h-5 text-red-400" />}
          {type === 'contradiction' && <Zap className="w-5 h-5 text-rose-400" />}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
              Inspector • {type}
            </span>
            <h3 className="font-serif text-lg font-medium text-stone-100 capitalize">
              {type === 'claim'
                ? 'Your Stated Premise'
                : type === 'assumption'
                ? 'Hidden Assumption'
                : type === 'risk'
                ? 'Overlooked Blind Spot'
                : type === 'contradiction'
                ? 'Identified Contradiction'
                : 'Decision Anchor'}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content based on type */}
      <div className="space-y-5 flex-1">
        {type === 'claim' && (
          <>
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1 block">
                Direct Stated Text
              </span>
              <p className="font-sans text-stone-200 text-sm leading-relaxed">
                "{data.text}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <span className="text-stone-400 block mb-1">Life Area</span>
                <span className="text-stone-200 capitalize font-medium">{data.area}</span>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <span className="text-stone-400 block mb-1">Time Horizon</span>
                <span className="text-stone-200 capitalize font-medium">{data.horizon}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800 text-xs">
              <span className="text-amber-400 font-mono block mb-1">Emphasis Rating</span>
              <p className="text-stone-400">
                Level {data.emphasis || 2} of 3. This premise heavily anchors your current
                leaning. Check linked assumptions to test if it holds up.
              </p>
            </div>
          </>
        )}

        {type === 'assumption' && (
          <>
            <div className="p-4 rounded-xl bg-stone-950/60 border border-amber-900/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 mb-1 block">
                Unspoken Underlying Belief
              </span>
              <p className="font-serif italic text-stone-100 text-sm leading-relaxed">
                "{data.assumption}"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800 text-xs space-y-1">
              <span className="text-amber-300 font-mono font-medium block">Why This Matters</span>
              <p className="text-stone-300 leading-relaxed">{data.whyItMatters}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800 text-xs space-y-1">
              <span className="text-blue-300 font-mono font-medium block">
                The Disconfirming Test Question
              </span>
              <p className="text-stone-200 font-serif italic leading-relaxed">
                "{data.testQuestion}"
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-stone-300 uppercase tracking-wider">
                  Verification Roadmap
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
                  {data.checkability}
                </span>
              </div>

              {data.verificationSteps && data.verificationSteps.length > 0 ? (
                <div className="space-y-2">
                  {data.verificationSteps.map((v: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-stone-950/60 border border-stone-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-300 font-medium">Step {idx + 1}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 uppercase">
                          {v.effort} effort
                        </span>
                      </div>
                      <p className="text-stone-200">{v.step}</p>
                      <div className="text-[10px] font-mono text-stone-400">
                        Where / Who: {v.whoOrWhere}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-stone-400 italic">
                  This assumption is based on subjective values and internal feelings rather than
                  external documentation.
                </div>
              )}
            </div>
          </>
        )}

        {type === 'risk' && (
          <>
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-300 mb-1 block">
                Overlooked Dimension
              </span>
              <h4 className="font-sans font-semibold text-stone-100 text-sm leading-snug">
                {data.risk}
              </h4>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/40 border border-stone-800 text-xs space-y-1">
              <span className="text-stone-400 font-mono block">Why You Overlooked It</span>
              <p className="text-stone-300 leading-relaxed">{data.whyOverlooked}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-red-950 text-xs space-y-1">
              <span className="text-red-300 font-mono font-medium block">
                Penetrating Question
              </span>
              <p className="text-stone-200 font-serif italic text-sm leading-relaxed">
                "{data.question}"
              </p>
            </div>
          </>
        )}

        {type === 'contradiction' && (
          <>
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 block">
                Tension in Reasoning
              </span>
              <p className="font-sans text-stone-200 text-xs leading-relaxed">
                {data.description}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs space-y-1">
              <span className="text-rose-400 font-mono font-medium block">
                Reconciliation Question
              </span>
              <p className="text-stone-100 font-serif italic text-sm leading-relaxed">
                "{data.question}"
              </p>
            </div>
          </>
        )}

        {type === 'decision' && (
          <>
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                Decision Focus
              </span>
              <h4 className="font-serif text-base text-stone-100">{data.title}</h4>
              <p className="text-xs text-stone-400">{data.context}</p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-stone-800 mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition"
        >
          Dismiss Inspector
        </button>
      </div>
    </div>
  );
}
