import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Compass,
  Sliders,
  Heart,
  ListPlus,
  Calendar,
  Send,
  HelpCircle,
} from 'lucide-react';
import type { AnalysisInput } from '../types';

interface IntakeWizardProps {
  initialData?: Partial<AnalysisInput>;
  onComplete: (data: AnalysisInput) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

const DEFAULT_SUGGESTED_VALUES = [
  'Learning',
  'Money',
  'Family',
  'Health',
  'Growth',
  'Security',
  'Autonomy',
  'Reputation',
  'Peace of Mind',
];

const STORAGE_KEY = 'blindspot_intake_draft';

export function IntakeWizard({
  initialData,
  onComplete,
  onCancel,
  isAnalyzing,
}: IntakeWizardProps) {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [context, setContext] = useState(initialData?.context || '');
  const [initialStance, setInitialStance] = useState(
    initialData?.initialStance || 'Leaning towards accepting'
  );
  const [initialConfidence, setInitialConfidence] = useState<number>(
    initialData?.initialConfidence ?? 70
  );
  const [statedPriorities, setStatedPriorities] = useState<string[]>(
    initialData?.statedPriorities || ['Learning']
  );
  const [customValueInput, setCustomValueInput] = useState('');
  const [reasons, setReasons] = useState<string[]>(
    initialData?.reasons?.length ? initialData.reasons : ['']
  );
  const [constraints, setConstraints] = useState(initialData?.constraints || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Draft autosave to localStorage
  useEffect(() => {
    if (!initialData?.title) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.context) setContext(parsed.context);
          if (parsed.initialStance) setInitialStance(parsed.initialStance);
          if (typeof parsed.initialConfidence === 'number')
            setInitialConfidence(parsed.initialConfidence);
          if (Array.isArray(parsed.statedPriorities))
            setStatedPriorities(parsed.statedPriorities);
          if (Array.isArray(parsed.reasons)) setReasons(parsed.reasons);
          if (parsed.constraints) setConstraints(parsed.constraints);
        } catch (e) {
          // ignore invalid draft
        }
      }
    }
  }, []);

  // Save changes
  useEffect(() => {
    const draft = {
      title,
      context,
      initialStance,
      initialConfidence,
      statedPriorities,
      reasons,
      constraints,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [title, context, initialStance, initialConfidence, statedPriorities, reasons, constraints]);

  const togglePriority = (val: string) => {
    if (statedPriorities.includes(val)) {
      setStatedPriorities(statedPriorities.filter((p) => p !== val));
    } else {
      if (statedPriorities.length >= 3) {
        setErrorMsg('You can select a maximum of 3 core values.');
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
      setStatedPriorities([...statedPriorities, val]);
    }
  };

  const addCustomValue = () => {
    const val = customValueInput.trim();
    if (!val) return;
    if (statedPriorities.length >= 3) {
      setErrorMsg('You can select a maximum of 3 core values.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (!statedPriorities.includes(val)) {
      setStatedPriorities([...statedPriorities, val]);
    }
    setCustomValueInput('');
  };

  const updateReason = (idx: number, val: string) => {
    const copy = [...reasons];
    copy[idx] = val;
    setReasons(copy);
  };

  const addReasonField = () => {
    setReasons([...reasons, '']);
  };

  const removeReasonField = (idx: number) => {
    if (reasons.length <= 1) return;
    setReasons(reasons.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!title.trim()) {
        setErrorMsg('Please enter a brief title for your decision.');
        return;
      }
      if (!context.trim() || context.trim().length < 15) {
        setErrorMsg('Please describe your dilemma in at least a sentence or two.');
        return;
      }
    }
    if (step === 2) {
      if (!initialStance.trim()) {
        setErrorMsg('Please state where you are currently leaning.');
        return;
      }
    }
    if (step === 3) {
      if (statedPriorities.length === 0) {
        setErrorMsg('Please select at least 1 core value that matters most.');
        return;
      }
    }
    if (step === 4) {
      const validReasons = reasons.filter((r) => r.trim().length > 0);
      if (validReasons.length === 0) {
        setErrorMsg('Please provide at least 1 primary reason or factor.');
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const validReasons = reasons.filter((r) => r.trim().length > 0);
    const payload: AnalysisInput = {
      title: title.trim(),
      context: context.trim(),
      initialStance: initialStance.trim(),
      initialConfidence,
      statedPriorities,
      reasons: validReasons,
      constraints: constraints.trim() || undefined,
    };

    localStorage.removeItem(STORAGE_KEY);
    onComplete(payload);
  };

  const stepsMeta = [
    { num: 1, title: 'The Decision', icon: Compass },
    { num: 2, title: 'Initial Stance', icon: Sliders },
    { num: 3, title: 'Core Values', icon: Heart },
    { num: 4, title: 'Reasons & Factors', icon: ListPlus },
    { num: 5, title: 'Constraints', icon: Calendar },
    { num: 6, title: 'Review & Submit', icon: Send },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Top Header & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-stone-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel & Return to Dashboard
        </button>

        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
          Autosaved Draft
        </span>
      </div>

      {/* Progress Bar & Steps Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">
            Step {step} of 6 • {stepsMeta[step - 1].title}
          </span>
          <span className="text-xs font-mono text-amber-400 font-semibold">
            {Math.round((step / 6) * 100)}% Complete
          </span>
        </div>

        {/* Bar */}
        <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Step chips */}
        <div className="hidden sm:grid grid-cols-6 gap-2">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isCurrent = s.num === step;
            const isDone = s.num < step;

            return (
              <div
                key={s.num}
                className={`p-2 rounded-xl text-center border transition-all ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-600/70 text-amber-200 shadow-md'
                    : isDone
                    ? 'bg-stone-900/60 border-stone-700/60 text-stone-300'
                    : 'bg-stone-950/40 border-stone-800/60 text-stone-500'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${isCurrent ? 'text-amber-400' : ''}`} />
                <div className="text-[11px] font-mono truncate">{s.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: The Decision */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                What choice is currently consuming your thoughts?
              </h2>
              <p className="text-sm text-stone-400">
                Frame the decision in your own words. Be as honest and transparent as possible.
              </p>
            </div>

            {/* Note requirement */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
              <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-semibold block mb-0.5">
                  The Socratic Pact
                </span>
                <p className="font-serif italic text-sm text-stone-200">
                  "I will ask questions. I will never decide for you."
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  You are the sole author of this decision. My only role is to reveal what is
                  currently invisible to you.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                  Short Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 6-Month Tech Internship vs. On-Time Graduation"
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-stone-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                  The Dilemma & Context <span className="text-amber-400">*</span>
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe the crossroad: what is at stake? Who is involved? What is making this choice challenging for you right now?"
                  rows={6}
                  maxLength={4000}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-stone-100 text-sm leading-relaxed"
                />
                <div className="text-right text-[11px] font-mono text-stone-400 mt-1">
                  {context.length} / 4000 characters
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Initial Stance */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                Where are your instincts leaning right now?
              </h2>
              <p className="text-sm text-stone-400">
                Acknowledge your preliminary bias. We will test whether your reasons justify your
                confidence.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                  Where I'm Leaning <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={initialStance}
                  onChange={(e) => setInitialStance(e.target.value)}
                  placeholder="e.g. Leaning strongly towards accepting the offer"
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-stone-100 text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Leaning towards saying YES / accepting',
                    'Leaning towards saying NO / declining',
                    'Completely torn 50 / 50',
                    'Leaning towards postponing',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInitialStance(preset)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/80 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-stone-300">
                    Confidence Level: <span className="text-amber-400 font-bold">{initialConfidence}%</span>
                  </label>
                  <span className="text-xs font-mono text-stone-400">
                    {initialConfidence < 30
                      ? 'Low Conviction / Highly Uncertain'
                      : initialConfidence < 65
                      ? 'Moderate Lean / Open to Influence'
                      : initialConfidence < 85
                      ? 'Strong Conviction'
                      : 'Near Certainty / Hard to Sway'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={initialConfidence}
                  onChange={(e) => setInitialConfidence(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>0% (Dart throw)</span>
                  <span>50% (Split coin)</span>
                  <span>100% (Absolute certainty)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Core Values */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                What matters most to you in this chapter of life?
              </h2>
              <p className="text-sm text-stone-400">
                Select <strong className="text-amber-300">up to 3 core values</strong>. The thinking partner will cross-reference these against your actual stated reasons to expose value contradictions.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-300">
                Selected: <strong className="text-amber-400">{statedPriorities.length} / 3</strong>
              </span>
              {statedPriorities.length === 3 && (
                <span className="text-amber-400 text-[11px]">Maximum values selected</span>
              )}
            </div>

            {/* Suggested Chips */}
            <div className="flex flex-wrap gap-2.5">
              {DEFAULT_SUGGESTED_VALUES.map((val) => {
                const isSelected = statedPriorities.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => togglePriority(val)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                        : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    {val}
                  </button>
                );
              })}
            </div>

            {/* Custom Value Adder */}
            <div className="pt-4 border-t border-stone-800">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                Add a custom personal value
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customValueInput}
                  onChange={(e) => setCustomValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomValue();
                    }
                  }}
                  placeholder="e.g. Creative Autonomy, Spiritual Alignment"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs font-mono text-stone-100 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomValue}
                  disabled={!customValueInput.trim() || statedPriorities.length >= 3}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 text-xs font-mono transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Value
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Reasons & Factors */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                What specific reasons or evidence support your leaning?
              </h2>
              <p className="text-sm text-stone-400">
                Write down each distinct factor, fact, promise, or expectation you are relying on.
              </p>
            </div>

            <div className="space-y-3">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="w-7 h-7 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 flex items-center justify-center text-xs font-mono shrink-0 mt-2">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => updateReason(idx, e.target.value)}
                      placeholder={
                        idx === 0
                          ? 'e.g. High compensation / stipend ($38/hr) to clear loan'
                          : idx === 1
                          ? 'e.g. Short commute from family home saves rent'
                          : 'e.g. Resume prestige that will open future doors'
                      }
                      className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-stone-100 text-sm"
                    />
                  </div>
                  {reasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReasonField(idx)}
                      className="p-3 text-stone-500 hover:text-rose-400 transition rounded-xl hover:bg-stone-800"
                      title="Remove this factor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addReasonField}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-dashed border-stone-700 text-stone-300 text-xs font-mono transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Add Another Reason or Premise
            </button>
          </div>
        )}

        {/* STEP 5: Constraints */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                What hard constraints or non-negotiables exist?
              </h2>
              <p className="text-sm text-stone-400">
                Deadlines, financial floors, family obligations, or legal terms (optional).
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5">
                Constraints & Boundaries (Optional)
              </label>
              <textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. Offer expires Friday at 5 PM. University department requires at least 15 credits to keep scholarship."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 focus:outline-none text-stone-100 text-sm leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-stone-100 mb-2">
                Review Your Reasoning Blueprint
              </h2>
              <p className="text-sm text-stone-400">
                Confirm your input before the Socratic engine maps your claims and probes for blind spots.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 font-mono uppercase text-[10px]">Decision:</span>
                <p className="font-serif font-medium text-stone-100 text-sm mt-0.5">{title}</p>
              </div>

              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-stone-400 font-mono uppercase text-[10px]">Dilemma:</span>
                <p className="text-stone-300 line-clamp-3 mt-0.5 leading-relaxed">{context}</p>
              </div>

              <div className="pt-2 border-t border-stone-800/80 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-stone-400 font-mono uppercase text-[10px]">Initial Stance:</span>
                  <p className="text-stone-200 mt-0.5">{initialStance}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-mono uppercase text-[10px]">Confidence:</span>
                  <p className="text-amber-400 font-mono mt-0.5 font-bold">{initialConfidence}%</p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-stone-400 font-mono uppercase text-[10px]">Stated Priorities:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {statedPriorities.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-[11px]"
                    >
                      ★ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-stone-400 font-mono uppercase text-[10px]">
                  Stated Reasons ({reasons.filter((r) => r.trim()).length}):
                </span>
                <ul className="list-disc list-inside space-y-1 mt-1 text-stone-300">
                  {reasons
                    .filter((r) => r.trim())
                    .map((r, i) => (
                      <li key={i} className="line-clamp-2">
                        {r}
                      </li>
                    ))}
                </ul>
              </div>

              {constraints && (
                <div className="pt-2 border-t border-stone-800/80">
                  <span className="text-stone-400 font-mono uppercase text-[10px]">Constraints:</span>
                  <p className="text-stone-300 mt-0.5">{constraints}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-stone-400 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                The AI will map your claims, extract unstated assumptions, flag value contradictions, and run a 2-layer advice guardrail. Zero opinions or advice will be given.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 text-xs font-mono transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xl shadow-amber-500/30"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Reasoning Map...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Reveal My Blind Spots</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
