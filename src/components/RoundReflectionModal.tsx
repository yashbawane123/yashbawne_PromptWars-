import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ListPlus,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { Decision, Analysis, QuestionAnswer } from '../types';

interface RoundReflectionModalProps {
  decision: Decision;
  currentAnalysis: Analysis;
  targetRound: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRound: (payload: {
    questionAnswers: QuestionAnswer[];
    editedReasons: string[];
    updatedConfidence: number;
  }) => void;
  isAnalyzing: boolean;
}

export function RoundReflectionModal({
  decision,
  currentAnalysis,
  targetRound,
  isOpen,
  onClose,
  onSubmitRound,
  isAnalyzing,
}: RoundReflectionModalProps) {
  if (!isOpen) return null;

  // Initialize question answers with empty text
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<string[]>(
    decision.reasons?.length ? [...decision.reasons] : ['']
  );
  const [confidence, setConfidence] = useState<number>(
    currentAnalysis.confidenceAfter ?? decision.initialConfidence
  );
  const [errorMsg, setErrorMsg] = useState('');

  const questions = currentAnalysis.probingQuestions || [];

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleReasonChange = (idx: number, val: string) => {
    const copy = [...reasons];
    copy[idx] = val;
    setReasons(copy);
  };

  const addReason = () => {
    setReasons([...reasons, '']);
  };

  const removeReason = (idx: number) => {
    if (reasons.length <= 1) return;
    setReasons(reasons.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedAnswers: QuestionAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: answers[q.id]?.trim() || '',
    }));

    const validReasons = reasons.map((r) => r.trim()).filter((r) => r.length > 0);
    if (validReasons.length === 0) {
      setErrorMsg('Please maintain at least 1 reason or factor.');
      return;
    }

    onSubmitRound({
      questionAnswers: formattedAnswers,
      editedReasons: validReasons,
      updatedConfidence: confidence,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Round {targetRound} Socratic Calibration
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Reflect, Clarify, & Update Reasoning
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Philosophy Note */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-stone-300 font-mono font-medium">
              <Info className="w-4 h-4 text-amber-400" />
              How Round {targetRound} Works
            </div>
            <p className="text-stone-300 leading-relaxed">
              Answer the Socratic questions below and update your stated reasons with any new thoughts or clarifications. A delta will be calculated in neutral language. No change is a completely valid result; we never imply you should change your mind.
            </p>
          </div>

          {/* 1. Answer Probing Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-semibold text-stone-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                1. Answer Probing Questions from Round {targetRound - 1}
              </h4>
              <span className="text-[11px] font-mono text-stone-400">
                Short notes or complete thoughts
              </span>
            </div>

            <div className="space-y-3.5">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-indigo-300 font-semibold">Question #{idx + 1}</span>
                    <span className="text-stone-400">Target: {q.targets}</span>
                  </div>
                  <p className="font-serif italic text-xs text-stone-200">
                    "{q.question}"
                  </p>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Your reflection or answers (e.g. 'I talked to my advisor about delaying graduation...')"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/80 focus:border-amber-400 focus:outline-none text-xs text-stone-100 font-sans"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2. Edit Reasons & Factors */}
          <div className="space-y-4 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-semibold text-stone-100 flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-amber-400" />
                2. Edit or Expand Stated Reasons & Premises
              </h4>
              <button
                type="button"
                onClick={addReason}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Add Factor
              </button>
            </div>

            <div className="space-y-2.5">
              {reasons.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-400 w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    value={r}
                    onChange={(e) => handleReasonChange(idx, e.target.value)}
                    placeholder="Describe a premise or reason..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-xs text-stone-100 font-sans"
                  />
                  {reasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReason(idx)}
                      className="p-2 text-stone-400 hover:text-rose-400 transition"
                      title="Remove factor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Confidence Before vs After Slider */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-semibold text-stone-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                3. Recalibrate Your Confidence
              </h4>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-stone-400">Before:</span>
                <span className="text-stone-300 font-bold">
                  {currentAnalysis.confidenceAfter ?? decision.initialConfidence}%
                </span>
                <ArrowRight className="w-3 h-3 text-stone-400" />
                <span className="text-amber-400 font-bold">Now: {confidence}%</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-stone-400">
              <span>0% (Completely uncertain)</span>
              <span>50% (Split coin toss)</span>
              <span>100% (Ironclad certainty)</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Round {targetRound} Delta...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Run Round {targetRound} Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
