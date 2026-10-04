import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  Scale,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
} from 'lucide-react';
import type {
  Decision,
  Analysis,
  WeightLevel,
  FactorAttentionEstimate,
  VisibilityCalibration,
} from '../types';

interface VisibilityCalibrationStepProps {
  decision: Decision;
  analysis: Analysis;
  onSaveCalibration: (calibration: VisibilityCalibration) => void;
  onClose?: () => void;
}

const WEIGHT_NUM: Record<WeightLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function VisibilityCalibrationStep({
  decision,
  analysis,
  onSaveCalibration,
  onClose,
}: VisibilityCalibrationStepProps) {
  // Combine claims and overlooked risks as factors
  const factors = [
    ...(analysis.claims || []).map((c) => ({
      id: c.id,
      text: c.text,
      type: 'claim' as const,
      area: c.area,
    })),
    ...(analysis.overlookedRisks || []).map((r) => ({
      id: r.id,
      text: r.risk,
      type: 'risk' as const,
      area: r.area,
    })),
  ];

  // User ratings state: default medium or pre-existing
  const [userRatings, setUserRatings] = useState<Record<string, WeightLevel>>(() => {
    const initial: Record<string, WeightLevel> = {};
    if (analysis.visibilityCalibration?.estimates) {
      analysis.visibilityCalibration.estimates.forEach((e) => {
        initial[e.factorId] = e.userWeight;
      });
    } else {
      factors.forEach((f) => {
        initial[f.id] = f.type === 'claim' ? 'high' : 'low';
      });
    }
    return initial;
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    !!analysis.visibilityCalibration?.estimates?.length
  );
  const [estimates, setEstimates] = useState<FactorAttentionEstimate[]>(
    analysis.visibilityCalibration?.estimates || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle user rating change before submit
  const handleRatingChange = (factorId: string, level: WeightLevel) => {
    setUserRatings((prev) => ({ ...prev, [factorId]: level }));
  };

  // Handle user override/adjustment of AI estimate
  const handleAdjustAiEstimate = (factorId: string, adjustedLevel: WeightLevel) => {
    setEstimates((prev) =>
      prev.map((est) =>
        est.factorId === factorId ? { ...est, userAdjustedWeight: adjustedLevel } : est
      )
    );
  };

  // Submit to server ONLY AFTER user rates all factors
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const payloadFactors = factors.map((f) => ({
        id: f.id,
        text: f.text,
        type: f.type,
        userWeight: userRatings[f.id] || 'medium',
      }));

      const res = await fetch('/api/estimate-attention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: {
            title: decision.title,
            context: decision.context,
            statedPriorities: decision.statedPriorities,
          },
          factors: payloadFactors,
        }),
      });

      const data = await res.json();
      if (!data.success || !Array.isArray(data.estimates)) {
        throw new Error(data.error || 'Failed to estimate factor attention.');
      }

      const returnedEstimates: FactorAttentionEstimate[] = data.estimates;
      setEstimates(returnedEstimates);
      setIsSubmitted(true);

      const calibrationResult: VisibilityCalibration = {
        estimates: returnedEstimates,
        submittedAt: new Date().toISOString(),
      };
      onSaveCalibration(calibrationResult);
    } catch (err: any) {
      console.error('Error fetching attention estimates:', err);
      setErrorMessage(err.message || 'Could not retrieve attention estimates.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gap summary statistics
  const underweightedCount = estimates.filter((e) => {
    const aiW = e.userAdjustedWeight || e.aiWeight;
    return WEIGHT_NUM[e.userWeight] < WEIGHT_NUM[aiW];
  }).length;

  const overweightedCount = estimates.filter((e) => {
    const aiW = e.userAdjustedWeight || e.aiWeight;
    return WEIGHT_NUM[e.userWeight] > WEIGHT_NUM[aiW];
  }).length;

  const alignedCount = estimates.filter((e) => {
    const aiW = e.userAdjustedWeight || e.aiWeight;
    return WEIGHT_NUM[e.userWeight] === WEIGHT_NUM[aiW];
  }).length;

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in text-stone-100">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            Visibility vs. Importance Calibration
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
            Audit Your Mental Bandwidth vs. Contextual Significance
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 font-sans">
            Cognitive bias causes immediate, high-salience factors to hijack attention while silent, long-term trade-offs remain invisible.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-auto p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* PHASE 1: User Rating Form (Before Submitting) */}
      {!isSubmitted ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-medium">
              <Scale className="w-4 h-4 text-amber-400" />
              Step 1: Rate How Much Weight Each Factor Got In Your Head
            </div>
            <p className="text-stone-300 leading-relaxed font-sans">
              Be completely honest about how much daily thought and emotional weight you gave each factor. Only after you submit will the Socratic engine estimate how much attention each factor objectively warrants based on the decision context.
            </p>
          </div>

          <div className="space-y-3.5">
            {factors.map((f, idx) => {
              const currentRating = userRatings[f.id] || 'medium';

              return (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          f.type === 'claim'
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-red-950/70 text-red-300 border-red-900/60'
                        }`}
                      >
                        {f.type === 'claim' ? 'You Said It' : 'Overlooked Risk'}
                      </span>
                      <span className="text-stone-400">{f.area}</span>
                    </div>
                    <p className="font-serif text-sm text-stone-200">
                      "{f.text}"
                    </p>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleRatingChange(f.id, 'low')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        currentRating === 'low'
                          ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Low Weight
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingChange(f.id, 'medium')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        currentRating === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRatingChange(f.id, 'high')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        currentRating === 'high'
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      High Weight
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Estimating Context Attention...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Submit & Reveal Attention Gap</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 2: Paired Bars & Gap Analysis View */
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-300 font-bold">
                {underweightedCount}
              </div>
              <div>
                <span className="text-rose-300 font-bold block">Attention Deficits</span>
                <span className="text-[11px] text-stone-400">Under-weighted vs context</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-300 font-bold">
                {overweightedCount}
              </div>
              <div>
                <span className="text-amber-300 font-bold block">Hyper-Focused</span>
                <span className="text-[11px] text-stone-400">Over-weighted vs context</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 font-bold">
                {alignedCount}
              </div>
              <div>
                <span className="text-emerald-300 font-bold block">Calibrated</span>
                <span className="text-[11px] text-stone-400">Aligned with stakes</span>
              </div>
            </div>
          </div>

          {/* Factor List with Paired Bars and One-Line Reasons */}
          <div className="space-y-4">
            {estimates.map((est) => {
              const activeAiWeight = est.userAdjustedWeight || est.aiWeight;
              const userVal = WEIGHT_NUM[est.userWeight];
              const aiVal = WEIGHT_NUM[activeAiWeight];
              const gap = userVal - aiVal;

              const gapLabel =
                gap === 0
                  ? 'Aligned'
                  : gap > 0
                  ? `Over-weighted by +${gap}`
                  : `Under-weighted by ${gap}`;

              const gapClass =
                gap === 0
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                  : gap < 0
                  ? 'text-rose-300 bg-rose-950/60 border-rose-800'
                  : 'text-amber-300 bg-amber-950/60 border-amber-800';

              return (
                <div
                  key={est.factorId}
                  className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4 shadow-md"
                >
                  {/* Factor Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          est.type === 'claim'
                            ? 'bg-stone-800 text-stone-300 border-stone-700'
                            : 'bg-red-950/70 text-red-300 border-red-900/60'
                        }`}
                      >
                        {est.type === 'claim' ? 'You Said It' : 'Overlooked Risk'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${gapClass}`}>
                        {gapLabel}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-stone-400">
                      Factor ID: {est.factorId}
                    </div>
                  </div>

                  <h3 className="font-serif text-sm font-medium text-stone-100">
                    "{est.factorText}"
                  </h3>

                  {/* Paired Bars: You vs Context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-stone-800/80">
                    {/* Bar 1: You (Mental Weight) */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-300">You (Mental Space Given):</span>
                        <span className="capitalize font-bold text-stone-100">
                          {est.userWeight}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden flex gap-1 p-0.5 border border-stone-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            userVal >= 1 ? 'bg-amber-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                        <div
                          className={`h-full rounded-full transition-all ${
                            userVal >= 2 ? 'bg-amber-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                        <div
                          className={`h-full rounded-full transition-all ${
                            userVal >= 3 ? 'bg-amber-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                      </div>
                    </div>

                    {/* Bar 2: Context (AI's estimate) */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-stone-900/60 border border-stone-800">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-300">Context Attention Needed:</span>
                        <span className="capitalize font-bold text-amber-300">
                          {activeAiWeight}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden flex gap-1 p-0.5 border border-stone-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            aiVal >= 1 ? 'bg-blue-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                        <div
                          className={`h-full rounded-full transition-all ${
                            aiVal >= 2 ? 'bg-blue-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                        <div
                          className={`h-full rounded-full transition-all ${
                            aiVal >= 3 ? 'bg-blue-400' : 'bg-stone-800'
                          }`}
                          style={{ width: '33.3%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Estimate Card with Explicit Label & User Adjustment */}
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-300 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        AI's estimate. Challenge it.
                      </div>

                      {/* User Adjustment Control */}
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className="text-stone-400 flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          Adjust AI estimate:
                        </span>
                        {(['low', 'medium', 'high'] as WeightLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleAdjustAiEstimate(est.factorId, lvl)}
                            className={`px-2 py-0.5 rounded capitalize transition ${
                              activeAiWeight === lvl
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      "{est.reason}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
            <button
              onClick={() => setIsSubmitted(false)}
              type="button"
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition"
            >
              Re-rate Mental Weights
            </button>

            <button
              onClick={() => {
                onSaveCalibration({
                  estimates,
                  submittedAt: new Date().toISOString(),
                });
                if (onClose) onClose();
              }}
              type="button"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Save Calibration & Return</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
