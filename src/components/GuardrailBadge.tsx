import React from 'react';
import { ShieldCheck, Sparkles, ChevronRight, Eye } from 'lucide-react';
import type { GuardrailReport } from '../types';

interface GuardrailBadgeProps {
  guardrail: GuardrailReport;
  onOpenTransparency: () => void;
}

export function GuardrailBadge({ guardrail, onOpenTransparency }: GuardrailBadgeProps) {
  const count = guardrail?.rewriteCount || 0;

  return (
    <button
      onClick={onOpenTransparency}
      type="button"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs font-mono transition-all duration-150 cursor-pointer shadow-sm group"
      title="Click to inspect 0-Advice Guardrail transparency logs"
    >
      <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span>
        Advice check: <strong>passed</strong>
        {count > 0 ? (
          <span className="text-amber-300">, {count} rewritten</span>
        ) : (
          <span>, 0 rewritten</span>
        )}
      </span>
      <span className="text-[10px] text-emerald-400/80 underline decoration-dotted ml-1 flex items-center gap-0.5">
        <Eye className="w-3 h-3" />
        Audit
      </span>
    </button>
  );
}
