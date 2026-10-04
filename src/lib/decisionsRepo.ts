import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type { Decision, Analysis, AnalysisInput } from '../types';

export function getDecisionsCollectionPath(userId: string): string {
  return `users/${userId}/decisions`;
}

export function getDecisionDocPath(userId: string, decisionId: string): string {
  return `users/${userId}/decisions/${decisionId}`;
}

export function getAnalysesCollectionPath(userId: string, decisionId: string): string {
  return `users/${userId}/decisions/${decisionId}/analyses`;
}

export function getAnalysisDocPath(
  userId: string,
  decisionId: string,
  analysisId: string
): string {
  return `users/${userId}/decisions/${decisionId}/analyses/${analysisId}`;
}

export async function createDecision(
  userId: string,
  input: Omit<Decision, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'currentRound'>
): Promise<Decision> {
  const decisionsPath = getDecisionsCollectionPath(userId);
  const decisionId = 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const docPath = getDecisionDocPath(userId, decisionId);

  const now = new Date().toISOString();
  const decisionData: Decision = {
    ...input,
    id: decisionId,
    userId,
    currentRound: 1,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'users', userId, 'decisions', decisionId);
    await setDoc(docRef, decisionData);
    return decisionData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateDecision(
  userId: string,
  decisionId: string,
  updates: Partial<Omit<Decision, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docPath = getDecisionDocPath(userId, decisionId);
  try {
    const docRef = doc(db, 'users', userId, 'decisions', decisionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteDecision(userId: string, decisionId: string): Promise<void> {
  const docPath = getDecisionDocPath(userId, decisionId);
  try {
    const docRef = doc(db, 'users', userId, 'decisions', decisionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export async function getDecision(userId: string, decisionId: string): Promise<Decision | null> {
  const docPath = getDecisionDocPath(userId, decisionId);
  try {
    const docRef = doc(db, 'users', userId, 'decisions', decisionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Decision;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeToUserDecisions(
  userId: string,
  onData: (decisions: Decision[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collPath = getDecisionsCollectionPath(userId);
  const collRef = collection(db, 'users', userId, 'decisions');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: Decision[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Decision);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, collPath);
    }
  );
}

export async function saveAnalysis(
  userId: string,
  decisionId: string,
  analysis: Analysis
): Promise<void> {
  const analysisId = (analysis.id || 'analysis_' + Date.now()).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const analysisDocPath = getAnalysisDocPath(userId, decisionId, analysisId);
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'decisions',
      decisionId,
      'analyses',
      analysisId
    );
    const payload = {
      ...analysis,
      id: analysisId,
      decisionId,
      round: analysis.round || 1,
      claims: analysis.claims || [],
      hiddenAssumptions: analysis.hiddenAssumptions || [],
      overlookedRisks: analysis.overlookedRisks || [],
      probingQuestions: analysis.probingQuestions || [],
      contradictions: analysis.contradictions || [],
      guardrail: analysis.guardrail || { applied: true, rewriteCount: 0, rewrites: [] },
      createdAt: analysis.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, analysisDocPath);
  }
}

export async function getLatestAnalysis(
  userId: string,
  decisionId: string
): Promise<Analysis | null> {
  const collPath = getAnalysesCollectionPath(userId, decisionId);
  try {
    const collRef = collection(
      db,
      'users',
      userId,
      'decisions',
      decisionId,
      'analyses'
    );
    const snap = await getDocs(collRef);
    if (snap.empty) return null;

    const list: Analysis[] = [];
    snap.forEach((d) => list.push(d.data() as Analysis));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list[0] ?? null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
  }
}

export async function getAllAnalysesForDecision(
  userId: string,
  decisionId: string
): Promise<Analysis[]> {
  const collPath = getAnalysesCollectionPath(userId, decisionId);
  try {
    const collRef = collection(
      db,
      'users',
      userId,
      'decisions',
      decisionId,
      'analyses'
    );
    const snap = await getDocs(collRef);
    if (snap.empty) return [];

    const list: Analysis[] = [];
    snap.forEach((d) => list.push(d.data() as Analysis));
    list.sort((a, b) => a.round - b.round);
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collPath);
  }
}

export function getRoundResponseDocPath(
  userId: string,
  decisionId: string,
  round: number
): string {
  return `users/${userId}/decisions/${decisionId}/responses/round_${round}`;
}

export async function saveUserRoundResponse(
  userId: string,
  decisionId: string,
  round: number,
  response: {
    questionAnswers: { questionId: string; question: string; answer: string }[];
    editedReasons: string[];
    confidence: number;
  }
): Promise<void> {
  const docPath = getRoundResponseDocPath(userId, decisionId, round);
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'decisions',
      decisionId,
      'responses',
      `round_${round}`
    );
    await setDoc(docRef, {
      ...response,
      decisionId,
      round,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function getUserRoundResponse(
  userId: string,
  decisionId: string,
  round: number
): Promise<{
  questionAnswers: { questionId: string; question: string; answer: string }[];
  editedReasons: string[];
  confidence: number;
} | null> {
  const docPath = getRoundResponseDocPath(userId, decisionId, round);
  try {
    const docRef = doc(
      db,
      'users',
      userId,
      'decisions',
      decisionId,
      'responses',
      `round_${round}`
    );
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as any;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

