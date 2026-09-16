export type HealthRequest = {
  mode?: 'analysis' | 'question' | 'scenario' | 'checkin';
  prompt?: string;
  financial?: {
    score?: number;
    income?: number;
    expenses?: number;
    investing?: number;
    debtPayments?: number;
    surplus?: number;
    emergencyMonths?: number;
  };
  scenario?: {
    expenseReduction?: number;
    investingIncrease?: number;
    debtPaymentIncrease?: number;
  };
  checkin?: { confidence?: string; priority?: string; surprise?: string };
};

export type HealthCoachResponse = {
  headline: string;
  summary: string;
  actions: string[];
  question: string;
  caution: string;
};

export type HealthEntitlement = {
  plan_id?: string | null;
  status?: string | null;
  trial_ends_at?: string | null;
} | null;

export const healthCoachSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    actions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    question: { type: 'string' },
    caution: { type: 'string' },
  },
  required: ['headline', 'summary', 'actions', 'question', 'caution'],
};

function cleanNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(-100_000_000, Math.min(100_000_000, number)) : 0;
}

export function cleanHealthRequest(body: HealthRequest): HealthRequest {
  const financial = body.financial ?? {};
  const scenario = body.scenario ?? {};
  return {
    mode: ['analysis', 'question', 'scenario', 'checkin'].includes(body.mode ?? '') ? body.mode : 'analysis',
    prompt: String(body.prompt ?? '').trim().slice(0, 1200),
    financial: {
      score: Math.max(0, Math.min(100, cleanNumber(financial.score))),
      income: Math.max(0, cleanNumber(financial.income)),
      expenses: Math.max(0, cleanNumber(financial.expenses)),
      investing: Math.max(0, cleanNumber(financial.investing)),
      debtPayments: Math.max(0, cleanNumber(financial.debtPayments)),
      surplus: cleanNumber(financial.surplus),
      emergencyMonths: Math.max(0, Math.min(1_200, cleanNumber(financial.emergencyMonths))),
    },
    scenario: {
      expenseReduction: Math.max(0, cleanNumber(scenario.expenseReduction)),
      investingIncrease: Math.max(0, cleanNumber(scenario.investingIncrease)),
      debtPaymentIncrease: Math.max(0, cleanNumber(scenario.debtPaymentIncrease)),
    },
    checkin: {
      confidence: String(body.checkin?.confidence ?? '').trim().slice(0, 80),
      priority: String(body.checkin?.priority ?? '').trim().slice(0, 200),
      surprise: String(body.checkin?.surprise ?? '').trim().slice(0, 300),
    },
  };
}

function boundedText(value: unknown, max: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
    ? value.trim()
    : null;
}

export function parseHealthCoachResponse(value: unknown): HealthCoachResponse | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const headline = boundedText(row.headline, 180);
  const summary = boundedText(row.summary, 1_200);
  const question = boundedText(row.question, 300);
  const caution = boundedText(row.caution, 500);
  const actions = Array.isArray(row.actions)
    ? row.actions.map((item) => boundedText(item, 300)).filter((item): item is string => Boolean(item))
    : [];
  if (!headline || !summary || !question || !caution || actions.length < 1 || actions.length > 3) return null;
  return { headline, summary, actions, question, caution };
}

export function parseHealthCoachOutputText(value: unknown): HealthCoachResponse | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    return parseHealthCoachResponse(JSON.parse(value));
  } catch {
    return null;
  }
}

export function hasHealthCoachAccess(
  entitlement: HealthEntitlement,
  isAdmin: boolean,
  now = Date.now(),
) {
  if (isAdmin) return true;
  if (entitlement?.plan_id !== 'complete') return false;
  if (entitlement.status === 'active') return true;
  return entitlement.status === 'trialing' && Boolean(entitlement.trial_ends_at) &&
    new Date(entitlement.trial_ends_at!).getTime() > now;
}
