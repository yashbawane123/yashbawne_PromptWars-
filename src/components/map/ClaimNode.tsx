import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Quote } from 'lucide-react';
import type { Claim } from '../../types';

const AREA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  money: { bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-600/40' },
  learning: { bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-600/40' },
  location: { bg: 'bg-teal-950/40', text: 'text-teal-300', border: 'border-teal-600/40' },
  career: { bg: 'bg-sky-950/40', text: 'text-sky-300', border: 'border-sky-600/40' },
  time: { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-600/40' },
  health: { bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-600/40' },
  relationships: { bg: 'bg-pink-950/40', text: 'text-pink-300', border: 'border-pink-600/40' },
  emotion: { bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-600/40' },
  other: { bg: 'bg-stone-800/60', text: 'text-stone-300', border: 'border-stone-700' },
};

export function ClaimNode({ data }: { data: Claim }) {
  const emphasis = data.emphasis || 2;
  const areaTheme = AREA_COLORS[data.area] || AREA_COLORS.other;

  // Emphasis determines node sizing
  const widthClass =
    emphasis === 3 ? 'w-72 p-4 text-sm' : emphasis === 1 ? 'w-56 p-2.5 text-xs' : 'w-64 p-3.5 text-xs';

  const isNew = data.isNewInRound;

  return (
    <div
      className={`relative group rounded-xl bg-stone-900 border-2 shadow-xl text-stone-100 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isNew
          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
          : 'border-stone-700 hover:border-stone-400'
      } ${widthClass}`}
    >
      {isNew && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-mono font-bold tracking-wider uppercase shadow-md animate-pulse">
          New Factor
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-stone-400 !w-2.5 !h-2.5 !border-2 !border-stone-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-stone-400 !w-2.5 !h-2.5 !border-2 !border-stone-900"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-stone-400 !w-2.5 !h-2.5 !border-2 !border-stone-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-stone-400 !w-2.5 !h-2.5 !border-2 !border-stone-900"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1">
          <Quote className="w-3 h-3 text-stone-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
            You said
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${areaTheme.bg} ${areaTheme.text} ${areaTheme.border}`}
          >
            {data.area}
          </span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-stone-800 text-stone-400">
            {data.horizon}
          </span>
        </div>
      </div>

      <p className="font-sans leading-relaxed text-stone-200 line-clamp-4">
        "{data.text}"
      </p>

      {emphasis === 3 && (
        <div className="mt-2 pt-1.5 border-t border-stone-800 text-[10px] font-mono text-amber-400/90 flex items-center justify-between">
          <span>High emphasis in reasoning</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}
