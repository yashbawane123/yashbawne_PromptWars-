import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ValueNodeData {
  value: string;
  isMatch: boolean;
  matchCount: number;
  totalReasons: number;
}

export function ValueNode({ data }: { data: ValueNodeData }) {
  const isMatch = data.isMatch;

  return (
    <div
      className={`relative rounded-xl border-2 p-3.5 shadow-2xl text-stone-100 w-56 text-xs transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isMatch
          ? 'bg-emerald-950/40 border-emerald-500 shadow-emerald-500/10'
          : 'bg-rose-950/50 border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500/30'
      }`}
    >
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

      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
          <Scale className="w-3 h-3" />
          Stated Value
        </div>
        <span
          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
            isMatch
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              : 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse'
          }`}
        >
          {isMatch ? 'Reflected' : 'Crowded Out'}
        </span>
      </div>

      <div className="font-serif font-bold text-sm text-stone-100">
        "{data.value}"
      </div>

      <div className="mt-2 pt-1.5 border-t border-stone-800 text-[10px] font-mono flex items-center justify-between">
        <span className={isMatch ? 'text-emerald-300' : 'text-rose-300 font-semibold'}>
          {isMatch
            ? `${data.matchCount} of ${data.totalReasons} reasons reflect this`
            : `0 of ${data.totalReasons} reasons reflect this`}
        </span>
        {isMatch ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
        )}
      </div>
    </div>
  );
}
