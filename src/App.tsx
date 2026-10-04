import React, { useState, useEffect } from 'react';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  testFirestoreConnection,
  type User,
} from './lib/firebase';
import {
  createDecision,
  updateDecision,
  deleteDecision,
  subscribeToUserDecisions,
  saveAnalysis,
  getAllAnalysesForDecision,
  saveUserRoundResponse,
} from './lib/decisionsRepo';
import type {
  Decision,
  Analysis,
  AnalysisInput,
  DecisionStatus,
  QuestionAnswer,
} from './types';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { IntakeWizard } from './components/IntakeWizard';
import { ResultsScreen } from './components/ResultsScreen';
import { GuardrailTestPage } from './components/GuardrailTestPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<
    'login' | 'dashboard' | 'intake' | 'results' | 'guardrail-test'
  >(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname === '/guardrail-test' ||
        window.location.hash === '#/guardrail-test'
      ) {
        return 'guardrail-test';
      }
    }
    return 'login';
  });

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);
  const [activeAnalyses, setActiveAnalyses] = useState<Analysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingRound, setIsAnalyzingRound] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Listen to path or hash changes for /guardrail-test
  useEffect(() => {
    const handleUrlChange = () => {
      if (
        window.location.pathname === '/guardrail-test' ||
        window.location.hash === '#/guardrail-test'
      ) {
        setView('guardrail-test');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // 1. Check connection and listen for Auth state changes
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setView((prev) =>
          prev === 'login' ? 'dashboard' : prev === 'guardrail-test' ? prev : prev
        );
      } else {
        setView((prev) =>
          prev === 'dashboard' ? 'login' : prev === 'guardrail-test' ? prev : prev
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscription to user decisions when logged in
  useEffect(() => {
    if (!currentUser) {
      setDecisions([]);
      return;
    }

    const unsubscribe = subscribeToUserDecisions(
      currentUser.uid,
      (list) => {
        setDecisions(list);
      },
      (err) => {
        console.error('Subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load demo case: 6-month internship student
  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch demo data');
      }

      const { input, analysis } = data;

      if (currentUser) {
        // Persist demo decision and analysis in Firestore under current user
        const newDec = await createDecision(currentUser.uid, {
          title: input.title,
          context: input.context,
          initialStance: input.initialStance,
          initialConfidence: input.initialConfidence,
          statedPriorities: input.statedPriorities,
          reasons: input.reasons,
          constraints: input.constraints,
          status: 'exploring',
        });

        const demoAnalysisWithId: Analysis = {
          ...analysis,
          decisionId: newDec.id,
        };

        await saveAnalysis(currentUser.uid, newDec.id, demoAnalysisWithId);

        setActiveDecision(newDec);
        setActiveAnalyses([demoAnalysisWithId]);
      } else {
        // Guest mode demonstration
        const guestDecision: Decision = {
          id: 'demo_internship',
          userId: 'guest_user',
          title: input.title,
          context: input.context,
          initialStance: input.initialStance,
          initialConfidence: input.initialConfidence,
          statedPriorities: input.statedPriorities,
          reasons: input.reasons,
          constraints: input.constraints,
          status: 'exploring',
          currentRound: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setActiveDecision(guestDecision);
        setActiveAnalyses([analysis]);
      }

      setView('results');
    } catch (err: any) {
      console.error('Error loading demo:', err);
      setErrorMessage(err.message || 'Could not load the demo case.');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Submit intake form to analyze decision
  const handleAnalyzeDecision = async (input: AnalysisInput) => {
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      // 1. Call server-side API (Gemini + Guardrail)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Analysis failed. Please try again.');
      }

      const analysis: Analysis = result.analysis;

      if (currentUser) {
        // 2. Save decision in Firestore
        const newDecision = await createDecision(currentUser.uid, {
          title: input.title,
          context: input.context,
          initialStance: input.initialStance,
          initialConfidence: input.initialConfidence,
          statedPriorities: input.statedPriorities,
          reasons: input.reasons,
          constraints: input.constraints,
          status: 'exploring',
        });

        // 3. Save analysis under decision
        analysis.decisionId = newDecision.id;
        await saveAnalysis(currentUser.uid, newDecision.id, analysis);

        setActiveDecision(newDecision);
        setActiveAnalyses([analysis]);
      } else {
        // Guest mode fallback
        const guestDecision: Decision = {
          id: 'guest_dec_' + Date.now(),
          userId: 'guest',
          title: input.title,
          context: input.context,
          initialStance: input.initialStance,
          initialConfidence: input.initialConfidence,
          statedPriorities: input.statedPriorities,
          reasons: input.reasons,
          constraints: input.constraints,
          status: 'exploring',
          currentRound: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        analysis.decisionId = guestDecision.id;
        setActiveDecision(guestDecision);
        setActiveAnalyses([analysis]);
      }

      setView('results');
    } catch (err: any) {
      console.error('Analysis submission failed:', err);
      setErrorMessage(
        err.message || 'Failed to generate reasoning map. Please review your input and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select decision from dashboard
  const handleSelectDecision = async (decision: Decision) => {
    setActiveDecision(decision);
    setErrorMessage('');

    if (currentUser) {
      try {
        const allAnalyses = await getAllAnalysesForDecision(currentUser.uid, decision.id);
        if (allAnalyses && allAnalyses.length > 0) {
          setActiveAnalyses(allAnalyses);
          setView('results');
          return;
        }
      } catch (err) {
        console.error('Failed to load existing analyses:', err);
      }
    }

    // If no analysis document found, regenerate on demand
    handleAnalyzeDecision({
      title: decision.title,
      context: decision.context,
      initialStance: decision.initialStance,
      initialConfidence: decision.initialConfidence,
      statedPriorities: decision.statedPriorities,
      reasons: decision.reasons,
      constraints: decision.constraints,
    });
  };

  // Run subsequent round (Round 2 or Round 3)
  const handleRunSubsequentRound = async (payload: {
    questionAnswers: QuestionAnswer[];
    editedReasons: string[];
    updatedConfidence: number;
  }) => {
    if (!activeDecision || activeAnalyses.length === 0) return;
    setIsAnalyzingRound(true);
    setErrorMessage('');

    try {
      const priorAnalysis = activeAnalyses[activeAnalyses.length - 1];
      const targetRound = priorAnalysis.round + 1;

      // 1. Save response to users/{uid}/decisions/{id}/responses/round_{targetRound}
      if (currentUser) {
        await saveUserRoundResponse(currentUser.uid, activeDecision.id, targetRound, {
          questionAnswers: payload.questionAnswers,
          editedReasons: payload.editedReasons,
          confidence: payload.updatedConfidence,
        });
      }

      // 2. Call server-side /api/analyze-round
      const response = await fetch('/api/analyze-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: activeDecision.id,
          targetRound,
          decision: activeDecision,
          priorAnalysis,
          questionAnswers: payload.questionAnswers,
          editedReasons: payload.editedReasons,
          updatedConfidence: payload.updatedConfidence,
        }),
      });

      const result = await response.json();
      if (!result.success || !result.analysis) {
        throw new Error(result.error || 'Round analysis failed. Please try again.');
      }

      const newAnalysis: Analysis = result.analysis;
      newAnalysis.decisionId = activeDecision.id;

      // 3. Save new analysis to Firestore and update decision
      if (currentUser) {
        await saveAnalysis(currentUser.uid, activeDecision.id, newAnalysis);
        await updateDecision(currentUser.uid, activeDecision.id, {
          currentRound: targetRound,
          reasons: payload.editedReasons,
        });
      }

      // 4. Update local state
      const updatedDecision: Decision = {
        ...activeDecision,
        currentRound: targetRound,
        reasons: payload.editedReasons,
      };
      setActiveDecision(updatedDecision);
      setActiveAnalyses((prev) => [...prev, newAnalysis]);
    } catch (err: any) {
      console.error('Failed to run round:', err);
      setErrorMessage(err.message || 'Failed to complete round analysis.');
    } finally {
      setIsAnalyzingRound(false);
    }
  };

  // Update status (draft, exploring, decided, revisit)
  const handleUpdateStatus = async (newStatus: DecisionStatus) => {
    if (!activeDecision) return;
    const updated = { ...activeDecision, status: newStatus };
    setActiveDecision(updated);

    if (currentUser && activeDecision.userId === currentUser.uid) {
      try {
        await updateDecision(currentUser.uid, activeDecision.id, { status: newStatus });
      } catch (err) {
        console.error('Failed to update status in Firestore:', err);
      }
    }
  };

  // Save visibility vs importance calibration
  const handleSaveCalibration = async (
    analysisId: string,
    calibration: any
  ) => {
    if (!activeDecision) return;

    setActiveAnalyses((prev) =>
      prev.map((a) =>
        a.id === analysisId ? { ...a, visibilityCalibration: calibration } : a
      )
    );

    if (currentUser) {
      try {
        const target = activeAnalyses.find((a) => a.id === analysisId);
        if (target) {
          await saveAnalysis(currentUser.uid, activeDecision.id, {
            ...target,
            visibilityCalibration: calibration,
          });
        }
      } catch (err) {
        console.error('Failed to save calibration to Firestore:', err);
      }
    }
  };

  // Delete decision
  const handleDeleteDecision = async (decisionId: string) => {
    if (!currentUser) return;
    try {
      await deleteDecision(currentUser.uid, decisionId);
      if (activeDecision?.id === decisionId) {
        setActiveDecision(null);
        setActiveAnalyses([]);
        setView('dashboard');
      }
    } catch (err) {
      console.error('Failed to delete decision:', err);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await logoutUser();
    setActiveDecision(null);
    setActiveAnalyses([]);
    setView('login');
  };

  if (authLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-stone-950 text-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-stone-400">
            Initializing Socratic Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl bg-rose-950 border border-rose-800 text-rose-200 text-xs shadow-2xl max-w-md animate-fade-in flex items-start justify-between gap-3">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <main className="flex-1">
        {view === 'login' && (
          <LoginScreen
            onSignIn={async () => {
              await loginWithGoogle();
            }}
            onExploreDemo={handleLoadDemo}
            isLoadingDemo={isLoadingDemo}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard
            user={currentUser}
            decisions={decisions}
            onNewDecision={() => setView('intake')}
            onSelectDecision={handleSelectDecision}
            onDeleteDecision={handleDeleteDecision}
            onLoadDemo={handleLoadDemo}
            onLogout={handleSignOut}
            isLoadingDemo={isLoadingDemo}
          />
        )}

        {view === 'intake' && (
          <IntakeWizard
            onComplete={handleAnalyzeDecision}
            onCancel={() => setView(currentUser ? 'dashboard' : 'login')}
            isAnalyzing={isAnalyzing}
          />
        )}

        {view === 'results' && activeDecision && activeAnalyses.length > 0 && (
          <ResultsScreen
            decision={activeDecision}
            analyses={activeAnalyses}
            onBack={() => setView(currentUser ? 'dashboard' : 'login')}
            onUpdateStatus={handleUpdateStatus}
            onRunSubsequentRound={handleRunSubsequentRound}
            onSaveCalibration={handleSaveCalibration}
            isAnalyzingRound={isAnalyzingRound}
          />
        )}

        {view === 'guardrail-test' && (
          <GuardrailTestPage
            onBack={() => {
              window.history.pushState({}, '', '/');
              setView(currentUser ? 'dashboard' : 'login');
            }}
          />
        )}
      </main>

      {view !== 'guardrail-test' && (
        <footer className="py-2.5 px-4 border-t border-stone-900 bg-stone-950/90 text-center text-[10px] font-mono text-stone-400 flex items-center justify-center gap-3">
          <span>The Blind Spot • Non-prescriptive Thinking Partner</span>
          <span>•</span>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/guardrail-test');
              setView('guardrail-test');
            }}
            className="text-stone-400 hover:text-amber-400 underline transition cursor-pointer"
          >
            Adversarial Guardrail Audit (/guardrail-test)
          </button>
        </footer>
      )}
    </div>
  );
}
