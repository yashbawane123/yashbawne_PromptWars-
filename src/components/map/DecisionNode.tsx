import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Compass, Sparkles } from 'lucide-react';

interface DecisionNodeData {
  title: string;
  initialStance: string;
  initialConfidence: number;
  statedPriorities: string[];
}

export function DecisionNode({ data }: { data: DecisionNodeData }) {
  return (
    <div className="relative group max-w-xs rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-stone-600 shadow-2xl p-4 text-stone-100 transition-all duration-300 hover:border-amber-400/80 hover:shadow-amber-500/10">
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-stone-400 !w-3 !h-3 !border-2 !border-stone-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-stone-400 !w-3 !h-3 !border-2 !border-stone-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-stone-400 !w-3 !h-3 !border-2 !border-stone-900"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!bg-stone-400 !w-3 !h-3 !border-2 !border-stone-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-700/60">
        <div className="flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-amber-300/90 font-semibold">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          The Decision
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-700/70 text-stone-300">
          Anchor
        </span>
      </div>

      <h3 className="font-serif font-medium text-sm text-stone-100 leading-snug line-clamp-2 mb-2">
        {data.title}
      </h3>

      <div className="text-xs text-stone-400 space-y-1.5 bg-stone-950/40 p-2 rounded-lg border border-stone-800">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-stone-400 font-mono">Leaning:</span>
          <span className="text-amber-200 font-medium truncate max-w-[120px]">
            {data.initialStance || 'Evaluating'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-stone-400 font-mono">Certainty:</span>
          <span className="text-stone-200 font-mono font-medium">
            {data.initialConfidence}%
          </span>
        </div>
      </div>

      {data.statedPriorities?.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {data.statedPriorities.map((p, i) => (
            <span
              key={i}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700"
            >
              ★ {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
