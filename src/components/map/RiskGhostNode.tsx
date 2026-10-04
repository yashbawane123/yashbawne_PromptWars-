import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { OverlookedRisk } from '../../types';

export function RiskGhostNode({ data }: { data: OverlookedRisk }) {
  const isAddressed = data.isAddressedInRound;

  return (
    <div
      className={`relative group w-64 rounded-xl p-3 shadow-lg text-stone-100 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isAddressed
          ? 'bg-stone-900 border-2 border-emerald-500 shadow-emerald-500/10 ring-1 ring-emerald-500/40'
          : 'bg-stone-950/40 border-2 border-dashed border-red-500/50 hover:border-red-400 hover:bg-stone-900/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isAddressed ? '!bg-emerald-400' : '!bg-red-400'
        }`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isAddressed ? '!bg-emerald-400' : '!bg-red-400'
        }`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isAddressed ? '!bg-emerald-400' : '!bg-red-400'
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isAddressed ? '!bg-emerald-400' : '!bg-red-400'
        }`}
      />

      <div
        className={`flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b ${
          isAddressed ? 'border-emerald-800/40' : 'border-red-900/30'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {isAddressed ? (
            <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-300">
              ✓
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-xs font-mono font-bold text-red-300">
              ?
            </span>
          )}
          <span
            className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
              isAddressed ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {isAddressed ? 'Filled Blind Spot' : 'Missing Factor'}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
            isAddressed
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              : 'bg-red-950/50 text-red-300 border-red-800/40'
          }`}
        >
          {data.area}
        </span>
      </div>

      <h4
        className={`font-sans font-medium text-xs leading-snug line-clamp-2 mb-1.5 ${
          isAddressed ? 'text-emerald-100' : 'text-red-100'
        }`}
      >
        {data.risk}
      </h4>

      {isAddressed && data.howAddressed ? (
        <div className="text-[10px] text-emerald-200 bg-emerald-950/40 border border-emerald-900/60 p-2 rounded leading-relaxed mb-1">
          <span className="font-mono text-emerald-400 block font-semibold">
            Addressed in Round:
          </span>
          {data.howAddressed}
        </div>
      ) : (
        <p className="font-serif italic text-[11px] text-stone-300 line-clamp-3 bg-stone-950/80 p-2 rounded border border-red-950/60">
          "{data.question}"
        </p>
      )}

      {!isAddressed && (
        <div className="mt-1.5 text-[9px] font-mono text-stone-400 line-clamp-1">
          Overlooked: {data.whyOverlooked}
        </div>
      )}
    </div>
  );
}
