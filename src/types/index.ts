export type LifeArea =
  | 'money'
  | 'learning'
  | 'location'
  | 'career'
  | 'time'
  | 'health'
  | 'relationships'
  | 'emotion'
  | 'other';

export type TimeHorizon = 'short' | 'long';

export type DecisionStatus = 'draft' | 'exploring' | 'decided' | 'revisit';

export interface Decision {
  id: string;
  userId: string;
  title: string;
  context: string;
  initialStance: string;
  initialConfidence: number; // 0 - 100
  statedPriorities: string[]; // up to 3
  reasons: string[];
  constraints?: string;
  status: DecisionStatus;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  text: string;
  area: LifeArea;
  horizon: TimeHorizon;
  emphasis?: number; // 1 (mild) to 3 (heavy focus)
  isNewInRound?: boolean; // Highlighted in map for Round 2+
}

export interface VerificationStep {
  step: string;
  whoOrWhere: string;
  effort: 'low' | 'medium' | 'high';
}

export interface HiddenAssumption {
  id: string;
  assumption: string;
  linkedClaimId: string;
  checkability: 'checkable' | 'uncheckable';
  whyItMatters: string;
  testQuestion: string;
  verificationSteps: VerificationStep[];
  isCheckedInRound?: boolean; // Addressed / checked in Round 2+
}

export interface OverlookedRisk {
  id: string;
  risk: string;
  area: LifeArea | string;
  whyOverlooked: string;
  question: string;
  isAddressedInRound?: boolean; // Addressed in Round 2+ (ghost node filled in)
  howAddressed?: string;
}

export interface Contradiction {
  id: string;
  between: [string, string]; // e.g. [claimId, claimId] or ["value:learning", claimId]
  description: string;
  question: string;
}

export interface ProbingQuestion {
  id: string;
  question: string;
  targets: string;
}

export interface GuardrailRewrite {
  original: string;
  rewritten: string;
  reason: string;
}

export interface GuardrailReport {
  applied: boolean;
  rewriteCount: number;
  rewrites?: GuardrailRewrite[];
}

export interface SayVsDoValueCard {
  value: string;
  isMatch: boolean;
  matchCount: number;
  totalReasons: number;
  summary: string;
  matchingClaims: Claim[];
  crowdingClaims: Claim[];
  question?: string; // Mismatch card ends with ONE question, never a conclusion
}

export interface StatementContradiction {
  id: string;
  statementA: string;
  statementB: string;
  tension: string;
  question: string;
}

export interface SayVsDoReport {
  valueCards: SayVsDoValueCard[];
  statementContradictions: StatementContradiction[];
}

export interface RoundDelta {
  newFactors: Claim[];
  overlookedNowAddressed: {
    riskId: string;
    title: string;
    howAddressed: string;
  }[];
  assumptionsNowChecked: {
    assumptionId: string;
    title: string;
    status: string;
    note?: string;
  }[];
  stillUnaddressed: {
    item: string;
    area: string;
    observation: string;
  }[];
  neutralObservations: string[];
}

export type WeightLevel = 'low' | 'medium' | 'high';

export interface FactorAttentionEstimate {
  factorId: string;
  factorText: string;
  type: 'claim' | 'risk';
  userWeight: WeightLevel;
  aiWeight: WeightLevel;
  userAdjustedWeight?: WeightLevel;
  reason: string;
}

export interface VisibilityCalibration {
  estimates: FactorAttentionEstimate[];
  submittedAt: string;
}

export interface Analysis {
  id: string;
  decisionId: string;
  round: number;
  claims: Claim[];
  hiddenAssumptions: HiddenAssumption[];
  overlookedRisks: OverlookedRisk[];
  contradictions: Contradiction[];
  probingQuestions: ProbingQuestion[];
  delta?: RoundDelta;
  confidenceBefore?: number;
  confidenceAfter?: number;
  visibilityCalibration?: VisibilityCalibration;
  guardrail: GuardrailReport;
  createdAt: string;
}

export interface AnalysisInput {
  title: string;
  context: string;
  initialStance: string;
  initialConfidence: number;
  statedPriorities: string[];
  reasons: string[];
  constraints?: string;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface UserRoundResponse {
  decisionId: string;
  round: number;
  questionAnswers: QuestionAnswer[];
  editedReasons: string[];
  confidence: number;
  createdAt: string;
}

export interface RoundAnalysisInput {
  decisionId: string;
  targetRound: number;
  decision: Decision;
  priorAnalysis: Analysis;
  questionAnswers: QuestionAnswer[];
  editedReasons: string[];
  updatedConfidence: number;
}

export interface GuardrailTestResult {
  id: number;
  prompt: string;
  adviceDetected: boolean;
  detectedLayer: 'regex' | 'classifier' | 'none';
  detectionReason?: string;
  wasRewritten: boolean;
  rawResponse: string;
  finalOutput: string;
  passed: boolean;
  failureReason?: string;
}

