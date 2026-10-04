import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Compass,
  Layers,
  ListFilter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Quote,
  EyeOff,
  Zap,
  Sliders,
  SlidersHorizontal,
  Scale,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  Decision,
  Analysis,
  DecisionStatus,
  QuestionAnswer,
  VisibilityCalibration,
} from '../types';
import { ReasoningMap } from './map/ReasoningMap';
import { BalanceStrip } from './BalanceStrip';
import { GuardrailBadge } from './GuardrailBadge';
import { TransparencyPanel } from './TransparencyPanel';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { ExpandableSections } from './ExpandableSections';
import { RoundReflectionModal } from './RoundReflectionModal';
import { RoundComparisonView } from './RoundComparisonView';
import { VisibilityCalibrationStep } from './VisibilityCalibrationStep';
import { SayVsDoSection } from './SayVsDoSection';

interface ResultsScreenProps {
  decision: Decision;
  analyses: Analysis[];
  currentRoundIndex?: number;
  onBack: () => void;
  onUpdateStatus: (newStatus: DecisionStatus) => void;
  onRunSubsequentRound: (payload: {
    questionAnswers: QuestionAnswer[];
    editedReasons: string[];
    updatedConfidence: number;
  }) => Promise<void>;
  onSaveCalibration?: (analysisId: string, calibration: VisibilityCalibration) => void;
  isAnalyzingRound?: boolean;
}

export function ResultsScreen({
  decision,
  analyses,
  onBack,
  onUpdateStatus,
  onRunSubsequentRound,
  onSaveCalibration,
  isAnalyzingRound = false,
}: ResultsScreenProps) {
  // Sort analyses by round ascending
  const sortedAnalyses = [...analyses].sort((a, b) => a.round - b.round);
  const highestRound = sortedAnalyses[sortedAnalyses.length - 1]?.round || 1;

  const [selectedRound, setSelectedRound] = useState<number>(highestRound);
  const [viewMode, setViewMode] = useState<
    'map' | 'say-vs-do' | 'list' | 'side-by-side' | 'visibility-calibration'
  >('map');
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{
    type: 'decision' | 'claim' | 'assumption' | 'risk' | 'contradiction';
    data: any;
  } | null>(null);

  // Active analysis for selected round
  const activeAnalysis =
    sortedAnalyses.find((a) => a.round === selectedRound) ||
    sortedAnalyses[sortedAnalyses.length - 1];

  const statusOptions: { value: DecisionStatus; label: string }[] = [
    { value: 'exploring', label: 'Exploring' },
    { value: 'draft', label: 'Draft' },
    { value: 'decided', label: 'Decided' },
    { value: 'revisit', label: 'Revisit Later' },
  ];

  const canRunNextRound = highestRound < 3;
  const nextRoundNumber = highestRound + 1;

  const initialConf = decision.initialConfidence;
  const currentConf = activeAnalysis?.confidenceAfter ?? initialConf;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Reasoning Map • Round {selectedRound}
              </span>
              <span className="text-[11px] text-stone-400">•</span>
              <span className="text-[11px] text-stone-400 font-mono">
                {new Date(decision.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 line-clamp-1">
              {decision.title}
            </h1>
          </div>
        </div>

        {/* Right side controls: Confidence meter, Guardrail badge & Run Round button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Confidence Trajectory Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono">
            <span className="text-stone-400">Certainty:</span>
            <span className="text-stone-300">{initialConf}%</span>
            {highestRound > 1 && (
              <>
                <ArrowRight className="w-3 h-3 text-stone-400" />
                <span className="text-amber-400 font-bold">{currentConf}%</span>
              </>
            )}
          </div>

          {/* Always visible Guardrail Badge */}
          <GuardrailBadge
            guardrail={activeAnalysis.guardrail}
            onOpenTransparency={() => setIsTransparencyOpen(true)}
          />

          {/* Run Round 2 / Round 3 button */}
          {canRunNextRound && (
            <button
              onClick={() => setIsReflectionModalOpen(true)}
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Round {nextRoundNumber}</span>
            </button>
          )}

          {/* Status selector */}
          <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs font-mono">
            <span className="text-stone-400">Status:</span>
            <select
              value={decision.status}
              onChange={(e) => onUpdateStatus(e.target.value as DecisionStatus)}
              className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-stone-900 text-stone-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Step Callout: Visibility vs Importance */}
      {!activeAnalysis.visibilityCalibration && viewMode !== 'visibility-calibration' && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Recommended Next Step:</strong> Calibrate <em>Visibility vs. Importance</em> to see which factors occupied your mental space vs. the attention they warrant in context.
            </span>
          </div>
          <button
            onClick={() => setViewMode('visibility-calibration')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold transition shrink-0"
          >
            Start Calibration
          </button>
        </div>
      )}

      {/* Navigation Sub-Bar: Round Switcher & View Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-stone-900/60 border border-stone-800">
        {/* Round Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-2">
            Rounds:
          </span>
          {sortedAnalyses.map((a) => (
            <button
              key={a.round}
              onClick={() => {
                setSelectedRound(a.round);
                if (viewMode === 'side-by-side' || viewMode === 'visibility-calibration') {
                  setViewMode('map');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5 ${
                selectedRound === a.round &&
                viewMode !== 'side-by-side' &&
                viewMode !== 'visibility-calibration'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-stone-950/60 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Round {a.round}</span>
              {a.round > 1 && a.delta && (
                <span className="text-[9px] px-1 rounded bg-stone-900/60 text-amber-200">
                  +{a.delta.newFactors?.length || 0} factors
                </span>
              )}
            </button>
          ))}

          {/* Visibility vs Importance Tab */}
          <button
            onClick={() => setViewMode('visibility-calibration')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
              viewMode === 'visibility-calibration'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-stone-950/60 text-amber-300 hover:bg-stone-800 border border-amber-900/40'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Visibility vs. Importance</span>
            {activeAnalysis.visibilityCalibration && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Audited
              </span>
            )}
          </button>

          {/* Say vs. Do Tab */}
          <button
            onClick={() => setViewMode('say-vs-do')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
              viewMode === 'say-vs-do'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-stone-950/60 text-amber-300 hover:bg-stone-800 border border-amber-900/40'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Say vs. Do</span>
          </button>

          {highestRound > 1 && (
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
                viewMode === 'side-by-side'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-stone-950/60 text-indigo-300 hover:bg-stone-800 border border-indigo-900/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Side-by-Side Delta</span>
            </button>
          )}
        </div>

        {/* View toggle (Map vs Plain List) */}
        {viewMode !== 'side-by-side' &&
          viewMode !== 'visibility-calibration' &&
          viewMode !== 'say-vs-do' && (
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Visual</span> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              List View
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'say-vs-do' ? (
        <SayVsDoSection
          decision={decision}
          analysis={activeAnalysis}
          onHighlightValueOnMap={() => setViewMode('map')}
        />
      ) : viewMode === 'visibility-calibration' ? (
        <VisibilityCalibrationStep
          decision={decision}
          analysis={activeAnalysis}
          onSaveCalibration={(cal) => onSaveCalibration?.(activeAnalysis.id, cal)}
          onClose={() => setViewMode('map')}
        />
      ) : viewMode === 'side-by-side' && highestRound > 1 ? (
        <RoundComparisonView
          decision={decision}
          analyses={sortedAnalyses}
          activeRound={selectedRound > 1 ? selectedRound : highestRound}
        />
      ) : (
        <>
          {/* Balance Strip (above the map) */}
          <BalanceStrip decision={decision} analysis={activeAnalysis} />

          {/* Reasoning Map or Plain List Fallback */}
          {viewMode === 'map' ? (
            <ReasoningMap
              decision={decision}
              analysis={activeAnalysis}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          ) : (
            /* Plain List Fallback */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <h3 className="font-serif text-base font-semibold text-stone-100 flex items-center gap-2">
                  <Quote className="w-4 h-4 text-stone-400" />
                  Stated Premises & Claims ({activeAnalysis.claims.length})
                </h3>
                <div className="space-y-2.5">
                  {activeAnalysis.claims.map((claim) => (
                    <div
                      key={claim.id}
                      onClick={() => setSelectedNode({ type: 'claim', data: claim })}
                      className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 hover:border-stone-600 transition cursor-pointer text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-stone-400">
                        <span>{claim.area}</span>
                        {claim.isNewInRound && (
                          <span className="text-amber-400 font-bold">[New Factor]</span>
                        )}
                        <span>Emphasis {claim.emphasis || 2}/3</span>
                      </div>
                      <p className="text-stone-200 font-medium">"{claim.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                <h3 className="font-serif text-base font-semibold text-rose-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  Contradictions & Logic Tensions ({activeAnalysis.contradictions.length})
                </h3>
                <div className="space-y-2.5">
                  {activeAnalysis.contradictions.map((contra) => (
                    <div
                      key={contra.id}
                      onClick={() => setSelectedNode({ type: 'contradiction', data: contra })}
                      className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 hover:border-rose-700 transition cursor-pointer text-xs space-y-1.5"
                    >
                      <p className="text-stone-300">{contra.description}</p>
                      <p className="text-rose-200 font-serif italic">"{contra.question}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Say vs. Do Audit Section */}
          <SayVsDoSection
            decision={decision}
            analysis={activeAnalysis}
            onHighlightValueOnMap={() => setViewMode('map')}
          />

          {/* Three Expandable Sections Below the Map */}
          <ExpandableSections analysis={activeAnalysis} />
        </>
      )}

      {/* Node Inspection Drawer */}
      <NodeDetailDrawer
        selectedNode={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Guardrail Transparency Modal */}
      <TransparencyPanel
        guardrail={activeAnalysis.guardrail}
        isOpen={isTransparencyOpen}
        onClose={() => setIsTransparencyOpen(false)}
      />

      {/* Round Reflection & Calibration Modal */}
      <RoundReflectionModal
        decision={decision}
        currentAnalysis={activeAnalysis}
        targetRound={nextRoundNumber}
        isOpen={isReflectionModalOpen}
        onClose={() => setIsReflectionModalOpen(false)}
        onSubmitRound={async (payload) => {
          await onRunSubsequentRound(payload);
          setIsReflectionModalOpen(false);
          setSelectedRound(nextRoundNumber);
        }}
        isAnalyzing={isAnalyzingRound}
      />
    </div>
  );
}
