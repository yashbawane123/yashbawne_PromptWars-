import type {
  Decision,
  Analysis,
  Claim,
  SayVsDoReport,
  SayVsDoValueCard,
  StatementContradiction,
} from '../types';

// Regex guardrail to ensure neutral Socratic tone
const ADVICE_REGEX =
  /\b(you\s+(should|must|ought\s+to|have\s+to|need\s+to)|i\s+(recommend|suggest|urge|advise)|the\s+(best|better|right)\s+(option|choice|path|decision|move)|go\s+for\s+it|don'?t\s+take\s+it)\b/i;

function sanitizeQuestion(q: string, fallback: string): string {
  if (!q || ADVICE_REGEX.test(q)) {
    return fallback;
  }
  // Ensure it ends with a question mark and is a single question
  const trimmed = q.trim();
  return trimmed.endsWith('?') ? trimmed : `${trimmed}?`;
}

/**
 * Keywords and areas associated with common user values
 */
const VALUE_KEYWORDS: Record<string, { areas: string[]; keywords: string[]; defaultQuestion: string }> = {
  learning: {
    areas: ['learning', 'growth'],
    keywords: ['learn', 'skill', 'mentor', 'knowledge', 'study', 'education', 'mastery', 'experience'],
    defaultQuestion: 'What would learning look like in this role, and where would you see it?',
  },
  money: {
    areas: ['finances'],
    keywords: ['money', 'stipend', 'salary', 'pay', 'debt', 'cash', 'income', 'cost', 'financial', 'compensation'],
    defaultQuestion: 'What concrete threshold would indicate whether this option actually delivers the financial security you prioritize?',
  },
  finances: {
    areas: ['finances'],
    keywords: ['money', 'stipend', 'salary', 'pay', 'debt', 'cash', 'income', 'cost', 'financial', 'compensation'],
    defaultQuestion: 'What concrete threshold would indicate whether this option actually delivers the financial security you prioritize?',
  },
  career: {
    areas: ['career'],
    keywords: ['career', 'resume', 'prestige', 'industry', 'advancement', 'promotion', 'network', 'hire', 'reputation'],
    defaultQuestion: 'How would you measure whether this opportunity advances your career trajectory rather than delaying it?',
  },
  time: {
    areas: ['time', 'health'],
    keywords: ['time', 'hours', 'schedule', 'balance', 'commute', 'flexibility', 'pace', 'burnout', 'overtime'],
    defaultQuestion: 'In what specific ways does your schedule safeguard the personal time you designated as essential?',
  },
  'work-life balance': {
    areas: ['time', 'health'],
    keywords: ['balance', 'time', 'burnout', 'hours', 'weekend', 'personal', 'rest', 'health'],
    defaultQuestion: 'What non-negotiable boundaries would keep your work and personal well-being balanced under pressure?',
  },
  autonomy: {
    areas: ['identity', 'career'],
    keywords: ['autonomy', 'freedom', 'independent', 'ownership', 'control', 'agency', 'flexible'],
    defaultQuestion: 'What concrete boundaries would be required for you to retain ownership over your daily decisions?',
  },
  relationships: {
    areas: ['relationships'],
    keywords: ['family', 'friend', 'partner', 'people', 'social', 'team', 'connection', 'community'],
    defaultQuestion: 'How does this commitment impact the core relationships and community you rely on?',
  },
};

export function analyzeSayVsDo(decision: Decision, analysis: Analysis): SayVsDoReport {
  const statedPriorities = decision.statedPriorities || [];
  const claims = analysis.claims || [];
  const totalReasons = Math.max(claims.length, 1);

  // 1. Process each stated value into a SayVsDoValueCard
  const valueCards: SayVsDoValueCard[] = statedPriorities.map((val) => {
    const valLower = val.toLowerCase().trim();
    let config = VALUE_KEYWORDS[valLower];

    if (!config) {
      // Find partial keyword match
      const matchedKey = Object.keys(VALUE_KEYWORDS).find((k) =>
        valLower.includes(k) || k.includes(valLower)
      );
      if (matchedKey) {
        config = VALUE_KEYWORDS[matchedKey];
      }
    }

    const matchingClaims: Claim[] = [];
    const crowdingClaims: Claim[] = [];

    claims.forEach((claim) => {
      const claimTextLower = claim.text.toLowerCase();
      const claimAreaLower = (claim.area || '').toLowerCase();

      let matched = false;
      if (config) {
        const areaMatch = config.areas.some((a) => claimAreaLower.includes(a));
        const keywordMatch = config.keywords.some((kw) => claimTextLower.includes(kw));
        matched = areaMatch || keywordMatch;
      } else {
        matched = claimTextLower.includes(valLower) || claimAreaLower.includes(valLower);
      }

      if (matched) {
        matchingClaims.push(claim);
      } else {
        crowdingClaims.push(claim);
      }
    });

    const isMatch = matchingClaims.length > 0;
    const matchCount = matchingClaims.length;

    let summary = '';
    let question: string | undefined = undefined;

    if (isMatch) {
      summary = `You said ${val.toLowerCase()} matters. ${matchCount} of your ${totalReasons} reasons reflect it.`;
    } else {
      summary = `You said ${val.toLowerCase()} matters most. 0 of your ${totalReasons} reasons mention ${val.toLowerCase()}.`;
      const fallbackQ = `What would ${val.toLowerCase()} look like in this choice, and where would you look to find it?`;
      question = sanitizeQuestion(config?.defaultQuestion || fallbackQ, fallbackQ);
    }

    return {
      value: val,
      isMatch,
      matchCount,
      totalReasons,
      summary,
      matchingClaims,
      crowdingClaims,
      question,
    };
  });

  // 2. Identify statement contradictions (user statement vs user statement)
  const statementContradictions: StatementContradiction[] = [];

  // A. Check for contradictions from analysis model
  if (analysis.contradictions && analysis.contradictions.length > 0) {
    analysis.contradictions.forEach((c) => {
      const idA = c.between[0];
      const idB = c.between[1];

      let stmtA = '';
      let stmtB = '';

      if (idA.startsWith('value:')) {
        stmtA = `Stated Priority: "${idA.replace('value:', '')}"`;
      } else {
        const claimA = claims.find((cl) => cl.id === idA);
        stmtA = claimA ? `"${claimA.text}"` : `Premise (${idA})`;
      }

      if (idB.startsWith('value:')) {
        stmtB = `Stated Priority: "${idB.replace('value:', '')}"`;
      } else {
        const claimB = claims.find((cl) => cl.id === idB);
        stmtB = claimB ? `"${claimB.text}"` : `Premise (${idB})`;
      }

      statementContradictions.push({
        id: c.id,
        statementA: stmtA,
        statementB: stmtB,
        tension: c.description,
        question: sanitizeQuestion(
          c.question,
          'When these two factors pull in opposite directions, which one is non-negotiable for you?'
        ),
      });
    });
  }

  // B. Specific heuristic check: Time / academic bandwidth vs full-time duration
  const allUserText = `${decision.context} ${decision.constraints || ''} ${(decision.reasons || []).join(' ')}`.toLowerCase();
  const hasTimeConstraint =
    allUserText.includes('very little time') ||
    allUserText.includes('busy') ||
    allUserText.includes('semester load') ||
    allUserText.includes('graduation delay') ||
    allUserText.includes('academic momentum');

  const hasFullTimeCommitment =
    allUserText.includes('6 months') ||
    allUserText.includes('full-time') ||
    allUserText.includes('internship') ||
    allUserText.includes('40 hours') ||
    allUserText.includes('alongside a semester');

  const alreadyHasTimeContradiction = statementContradictions.some(
    (sc) =>
      sc.statementA.toLowerCase().includes('time') ||
      sc.statementB.toLowerCase().includes('time') ||
      sc.tension.toLowerCase().includes('time') ||
      sc.tension.toLowerCase().includes('semester')
  );

  if (hasTimeConstraint && hasFullTimeCommitment && !alreadyHasTimeContradiction) {
    statementContradictions.unshift({
      id: 'contra_time_commitment',
      statementA: '"Stated constraint: Very little time & need to maintain academic progress"',
      statementB: '"Proposed plan: 6 months of full-time commitment alongside a demanding semester"',
      tension:
        'Your calendar constraint directly conflicts with the hourly realities of a full-time operational role.',
      question:
        'What specific weeks or deliverables would absorb the trade-off if both academic and internship deadlines peak simultaneously?',
    });
  }

  return {
    valueCards,
    statementContradictions,
  };
}
