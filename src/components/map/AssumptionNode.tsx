import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CheckSquare, EyeOff } from 'lucide-react';
import type { HiddenAssumption } from '../../types';

export function AssumptionNode({ data }: { data: HiddenAssumption }) {
  const isCheckable = data.checkability === 'checkable';
  const isChecked = data.isCheckedInRound;

  return (
    <div
      className={`relative group w-64 rounded-xl border-2 p-3 shadow-lg text-stone-100 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        isChecked
          ? 'bg-stone-900 border-blue-400 ring-1 ring-blue-500/30'
          : 'bg-stone-900/90 border-dashed border-amber-500/70 hover:border-amber-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isChecked ? '!bg-blue-400' : '!bg-amber-400'
        }`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isChecked ? '!bg-blue-400' : '!bg-amber-400'
        }`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isChecked ? '!bg-blue-400' : '!bg-amber-400'
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`!w-2.5 !h-2.5 !border-2 !border-stone-900 ${
          isChecked ? '!bg-blue-400' : '!bg-amber-400'
        }`}
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-stone-800">
        <div className="flex items-center gap-1">
          {isChecked ? (
            <CheckSquare className="w-3 h-3 text-blue-400" />
          ) : (
            <EyeOff className="w-3 h-3 text-amber-400" />
          )}
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isChecked ? 'text-blue-300' : 'text-amber-300'
            }`}
          >
            {isChecked ? 'Tested in Round' : 'Unverified'}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
            isCheckable
              ? 'bg-blue-950/40 text-blue-300 border-blue-600/40'
              : 'bg-stone-800 text-stone-400 border-stone-700'
          }`}
        >
          {data.checkability}
        </span>
      </div>

      <p className="font-serif italic text-xs text-stone-200 leading-snug line-clamp-3 mb-2">
        "{data.assumption}"
      </p>

      <div className="text-[10px] text-stone-400 font-sans line-clamp-2 bg-stone-950/60 p-1.5 rounded border border-stone-800/80">
        <span className="text-amber-400/90 font-mono font-medium">Test: </span>
        {data.testQuestion}
      </div>

      {isCheckable && data.verificationSteps?.length > 0 && (
        <div className="mt-1.5 flex items-center gap-1 text-[9px] font-mono text-blue-300/80">
          <CheckSquare className="w-2.5 h-2.5" />
          <span>{data.verificationSteps.length} verification steps available</span>
        </div>
      )}
    </div>
  );
}
