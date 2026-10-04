import express, { type Request, type Response } from 'express';
import {
  analyzeDecision,
  analyzeSubsequentRound,
  generateDemoInternshipData,
} from './geminiService';
import type { AnalysisInput, RoundAnalysisInput } from '../types';

export const apiApp = express();
export const apiRouter = express.Router();

apiApp.use(express.json({ limit: '2mb' }));
apiRouter.use(express.json({ limit: '2mb' }));

const handleHealth = (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
};

const handleDemo = (_req: Request, res: Response) => {
  try {
    const demo = generateDemoInternshipData();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, ...demo }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message || 'Failed to load demo' }));
  }
};

const handleAnalyze = async (req: Request, res: Response) => {
  try {
    const input: AnalysisInput = req.body;

    if (!input || !input.title || !input.context) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Title and dilemma context are required for analysis.',
        })
      );
      return;
    }

    const analysis = await analyzeDecision(input);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, analysis }));
  } catch (err: any) {
    console.error('Error during decision analysis:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error:
          'An error occurred while generating your reasoning map. Please try submitting again.',
      })
    );
  }
};

const handleAnalyzeRound = async (req: Request, res: Response) => {
  try {
    const input: RoundAnalysisInput = req.body;

    if (!input || !input.decision || !input.priorAnalysis) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Prior analysis and decision data are required for subsequent rounds.',
        })
      );
      return;
    }

    const analysis = await analyzeSubsequentRound(input);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, analysis }));
  } catch (err: any) {
    console.error('Error during round analysis:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: 'Failed to process round reflection. Please try again.',
      })
    );
  }
};

const handleEstimateAttention = async (req: Request, res: Response) => {
  try {
    const { estimateFactorAttention } = await import('./geminiService');
    const input = req.body;

    if (!input || !input.decision || !Array.isArray(input.factors)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: 'Decision and factors are required for attention estimation.',
        })
      );
      return;
    }

    const result = await estimateFactorAttention(input);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, ...result }));
  } catch (err: any) {
    console.error('Error during attention estimation:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: 'Failed to estimate factor attention. Please try again.',
      })
    );
  }
};

const handleGuardrailPrompts = async (_req: Request, res: Response) => {
  try {
    const { ADVERSARIAL_PROMPTS } = await import('./geminiService');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, prompts: ADVERSARIAL_PROMPTS }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
};

const handleTestGuardrailSingle = async (req: Request, res: Response) => {
  try {
    const { runSingleGuardrailTest } = await import('./geminiService');
    const { id, prompt } = req.body;
    if (!prompt) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Prompt is required' }));
      return;
    }
    const result = await runSingleGuardrailTest(id || 1, prompt);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, result }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
};

const handleTestGuardrailBatch = async (_req: Request, res: Response) => {
  try {
    const { runAllGuardrailTests } = await import('./geminiService');
    const results = await runAllGuardrailTests();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, results }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
};

// Mount on apiRouter
apiRouter.get('/health', handleHealth);
apiRouter.get('/demo', handleDemo);
apiRouter.get('/guardrail-prompts', handleGuardrailPrompts);
apiRouter.post('/analyze', handleAnalyze);
apiRouter.post('/analyze-round', handleAnalyzeRound);
apiRouter.post('/estimate-attention', handleEstimateAttention);
apiRouter.post('/test-guardrail-single', handleTestGuardrailSingle);
apiRouter.post('/test-guardrail-batch', handleTestGuardrailBatch);

// Mount on apiApp
apiApp.get('/api/health', handleHealth);
apiApp.get('/api/demo', handleDemo);
apiApp.get('/api/guardrail-prompts', handleGuardrailPrompts);
apiApp.post('/api/analyze', handleAnalyze);
apiApp.post('/api/analyze-round', handleAnalyzeRound);
apiApp.post('/api/estimate-attention', handleEstimateAttention);
apiApp.post('/api/test-guardrail-single', handleTestGuardrailSingle);
apiApp.post('/api/test-guardrail-batch', handleTestGuardrailBatch);


