import React, { useState } from 'react';
import {
  Plus,
  Compass,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import type { Decision, DecisionStatus } from '../types';
import type { User } from 'firebase/auth';

interface DashboardProps {
  user: User | null;
  decisions: Decision[];
  onNewDecision: () => void;
  onSelectDecision: (decision: Decision) => void;
  onDeleteDecision: (decisionId: string) => void;
  onLoadDemo: () => void;
  onLogout: () => void;
  isLoadingDemo?: boolean;
}

export function Dashboard({
  user,
  decisions,
  onNewDecision,
  onSelectDecision,
  onDeleteDecision,
  onLoadDemo,
  onLogout,
  isLoadingDemo = false,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.context.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case 'exploring':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      case 'decided':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      case 'revisit':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/80';
      case 'draft':
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-100">
              The Blind Spot
            </h1>
            <p className="text-xs text-stone-400 font-mono">
              Socratic Thinking Partner • 0-Advice Guarantee
            </p>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
              <UserIcon className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono text-[11px] truncate max-w-[140px]">
                {user.displayName || user.email || 'You'}
              </span>
            </div>
          )}

          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/60 text-stone-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isLoadingDemo ? 'Loading Demo...' : 'Load Demo'}</span>
          </button>

          <button
            onClick={onNewDecision}
            type="button"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Decision</span>
          </button>

          {user && (
            <button
              onClick={onLogout}
              type="button"
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Socratic philosophy banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Strict Non-Prescriptive Constitutional Directive
          </div>
          <p className="text-stone-300">
            This companion never recommends an option or says "you should". It maps the territory of your thoughts, surfaces assumptions, and leaves every decision in your hands.
          </p>
        </div>
        <div className="text-[11px] font-mono text-stone-400 shrink-0">
          Decisions tracked: <strong className="text-stone-200">{decisions.length}</strong>
        </div>
      </div>

      {/* Search and Filter Row */}
      {decisions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions or reasons..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400/80"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'exploring', 'decided', 'revisit', 'draft'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition ${
                  statusFilter === status
                    ? 'bg-stone-800 text-stone-100 border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decision List or Empty State */}
      {filteredDecisions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-stone-900/50 border border-dashed border-stone-800 space-y-5">
          <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 mx-auto flex items-center justify-center text-amber-400/80">
            <Compass className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-xl font-medium text-stone-200">
              No decisions under examination
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              "The unexamined decision is not worth making." Input any career, financial, or personal crossroad, or load the pre-configured internship case to see the reasoning map in action.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewDecision}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Begin Intake Wizard
            </button>
            <button
              onClick={onLoadDemo}
              disabled={isLoadingDemo}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs transition flex items-center gap-2 cursor-pointer border border-stone-700"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isLoadingDemo ? 'Loading...' : 'Load Internship Demo Case'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => onSelectDecision(decision)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all duration-200 shadow-lg cursor-pointer hover:shadow-xl hover:translate-y-[-2px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                      decision.status
                    )}`}
                  >
                    {decision.status}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    {new Date(decision.updatedAt || decision.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-serif text-base font-semibold text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-2">
                  {decision.title}
                </h3>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {decision.context}
                </p>

                <div className="text-[11px] font-mono text-stone-400 bg-stone-950/60 p-2 rounded-lg border border-stone-800/80">
                  <span className="text-amber-400/90 font-medium">Stance: </span>
                  {decision.initialStance} ({decision.initialConfidence}%)
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  <span>Round {decision.currentRound || 1} Map</span>
                </div>

                <div className="flex items-center gap-1">
                  {confirmDeleteId === decision.id ? (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onDeleteDecision(decision.id)}
                        className="px-2 py-1 rounded bg-rose-900 text-rose-200 text-[10px] font-mono hover:bg-rose-800"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded bg-stone-800 text-stone-400 text-[10px] font-mono hover:bg-stone-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(decision.id);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 transition"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="p-1.5 text-stone-400 group-hover:text-amber-300 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
