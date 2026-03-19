// services/ai.js  – Google Gemini wrapper + all tool prompts
import 'dotenv/config';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) console.error('\n\x1b[31m❌  GEMINI_API_KEY not set in backend/.env\x1b[0m\n');

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GEMINI_KEY}&alt=sse`;
const GEMINI_URL_SYNC = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// ─── Common system preamble ────────────────────────────────────────────────────
const BASE_SYSTEM = `You are an expert Indian personal finance advisor with deep knowledge of:
- Indian tax laws (Income Tax Act, latest budget amendments)
- Investment instruments: ELSS, PPF, NPS, EPF, SGB, REITs, MFs, FDs, Bonds, Stocks
- Insurance products: Term, Health, ULIP, Endowment
- Indian financial regulations: SEBI, IRDAI, RBI guidelines
- Life stages and goals common to Indian middle-class families

Always:
- Use ₹ (Rupees) for all currency
- Cite specific Indian tax sections when relevant (80C, 80D, 24B, 10(13A), etc.)
- Consider inflation at 6% unless stated otherwise
- Format with ## headings, **bold** for key numbers, > for critical insights, bullet points for action items
- Be specific with amounts, percentages, and timelines
- Consider both old and new tax regimes where applicable
- Reference current FY 2024-25 tax slabs`;

// ─── Tool System Prompts ───────────────────────────────────────────────────────
const SYSTEMS = {
  fire: BASE_SYSTEM + `\nYou are specialising in FIRE (Financial Independence, Retire Early) planning. 
Build detailed, actionable roadmaps with specific SIP amounts, fund names, and year-by-year milestones.`,

  score: BASE_SYSTEM + `\nYou are computing a financial health score. 
Return ONLY valid JSON, no markdown fences. Schema: 
{ score: number(0-100), grade: string(A+|A|B+|B|C|D), summary: string, 
  dims: { emergency:{score,insight}, insurance:{score,insight}, 
          investment:{score,insight}, debt:{score,insight}, 
          tax:{score,insight}, retirement:{score,insight} } }`,

  life: BASE_SYSTEM + `\nYou specialise in life-event financial planning. 
Give immediately actionable advice tailored to specific Indian life events.`,

  tax: BASE_SYSTEM + `\nYou are an expert Indian tax consultant (CA-level). 
Model exact tax liability numbers, find every deduction, compare regimes precisely.`,

  couple: BASE_SYSTEM + `\nYou specialise in joint financial planning for Indian couples. 
Optimise across both incomes for maximum tax efficiency and goal achievement.`,

  xray: BASE_SYSTEM + `\nYou are an expert mutual fund analyst. 
Analyse portfolio quality, calculate XIRR, identify overlaps, suggest rebalancing.`,

  chat: BASE_SYSTEM + `\nYou are a conversational financial mentor. 
Answer questions concisely but with depth. Ask clarifying questions when needed.`,
};

// ─── User Prompts ──────────────────────────────────────────────────────────────
export function buildPrompt(tool, data) {
  switch (tool) {
    case 'fire':
      return `Create a comprehensive FIRE roadmap:
- **Age**: ${data.age} → Target Retirement: ${data.retireAge}
- **Monthly Income**: ₹${Number(data.income).toLocaleString('en-IN')}
- **Monthly Expenses**: ₹${Number(data.expenses).toLocaleString('en-IN')}
- **Monthly Savings Potential**: ₹${(data.income - data.expenses).toLocaleString('en-IN')}
- **Existing Corpus**: ₹${Number(data.savings).toLocaleString('en-IN')}
- **Life Goals**: ${data.goals}
- **Risk Profile**: ${data.risk || 'Moderate'}

Provide:
## FIRE Number Calculation
## Current Financial Snapshot
## Month-by-Month SIP Breakdown (Year 1)
## Asset Allocation Strategy (Age-based)
## Insurance Gap Analysis
## Tax-Saving Investment Moves
## Emergency Fund Target
## 5-Year & 10-Year Milestones
## Common Mistakes to Avoid`;

    case 'score':
      return `Evaluate financial health and return JSON only:
Emergency Fund: ${data.emergency}
Insurance: ${data.insurance}
Investments: ${data.investment}
Debt Level: ${data.debt}
Tax Planning: ${data.tax}
Retirement Savings: ${data.retirement}
Additional context: ${data.context || 'None'}`;

    case 'life':
      return `Life Event Financial Plan:
**Event**: ${data.event}
**Amount**: ₹${Number(data.amount).toLocaleString('en-IN')}
**Monthly Income**: ₹${Number(data.income).toLocaleString('en-IN')}
**Tax Bracket**: ${data.bracket}
**Risk Appetite**: ${data.risk}
**Existing Investments**: ₹${Number(data.existingInvestments || 0).toLocaleString('en-IN')}
**Context**: ${data.detail || 'None'}
${data.portfolioSnapshot ? `**Current Portfolio Snapshot**: ${data.portfolioSnapshot}` : ''}
${data.fireNumber ? `**FIRE Target**: ₹${Number(data.fireNumber).toLocaleString('en-IN')}` : ''}

Provide:
## Immediate Actions (This Week)
## Tax Implications & Savings Opportunity
## Optimal Deployment Plan (Amount breakdown with % allocation)
## How This Impacts Your FIRE Goal
## Insurance Review Required
## 3 Things NOT to Do
## 90-Day Checklist`;

    case 'tax':
      return `Analyse Indian salary and optimise tax:
**Annual CTC**: ₹${Number(data.ctc).toLocaleString('en-IN')}
**Basic Salary**: ₹${Number(data.basic).toLocaleString('en-IN')} p.a.
**HRA**: ₹${Number(data.hra).toLocaleString('en-IN')} p.a.
**LTA**: ₹${Number(data.lta).toLocaleString('en-IN')} p.a.
**PF (Employee + Employer)**: ₹${Number(data.pf).toLocaleString('en-IN')} p.a.
**Other Allowances**: ₹${Number(data.other || 0).toLocaleString('en-IN')} p.a.
**Monthly Rent Paid**: ₹${Number(data.rent).toLocaleString('en-IN')}
**City**: ${data.city}
**Existing 80C Investments**: ₹${Number(data.existing80c || 0).toLocaleString('en-IN')}

Provide:
## Old vs New Regime — Side-by-Side Numbers
## HRA Exemption Calculation (show workings)
## All Deductions You're Currently Missing
## Recommended Investments (ranked by risk & liquidity)
## Month-wise Tax Saving Calendar
## Final Recommendation with Expected Savings`;

    case 'couple':
      return `Joint financial plan for Indian couple:
**${data.p1name}**: ₹${Number(data.p1income).toLocaleString('en-IN')}/month, ${data.p1tax} bracket
**${data.p2name}**: ₹${Number(data.p2income).toLocaleString('en-IN')}/month, ${data.p2tax} bracket
**Combined Savings**: ₹${Number(data.combined_sav).toLocaleString('en-IN')}
**Primary Joint Goal**: ${data.joint_goal}
**Existing Loans**: ${data.loans || 'None mentioned'}

Provide:
## Combined Net Worth & Monthly Surplus
## HRA Optimisation (who should claim, how much)
## NPS Contribution Split (tax-efficiency)
## SIP Allocation Plan (goal-wise, account-wise)
## Joint vs Separate Insurance Strategy
## Tax Filing Strategy (old vs new for each)
## Monthly Budget Allocation Template
## 1-Year Financial Roadmap`;

    case 'xray':
      return `Analyse this mutual fund portfolio:
${data.portfolioText}

Additional context: ${data.context || 'None'}

Provide:
## Portfolio Overview (total invested, current value, gain/loss)
## True XIRR Calculation (show methodology)
## Asset Class & Category Breakdown
## Portfolio Overlap Analysis (identify duplicates)
## Expense Ratio Impact (annual drag in ₹)
## Benchmark Comparison (vs Nifty 50, Nifty 500)
## Risk Assessment (concentration, sector exposure)
## AI Rebalancing Plan (specific buy/sell/hold actions)
## Better Alternatives (if any funds underperform)`;

    default:
      return data.message;
  }
}

// ─── Gemini streaming helper ──────────────────────────────────────────────────
async function geminiStream(systemPrompt, userPrompt, onChunk, onDone, onError) {
  try {
    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    };
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) { fullText += chunk; onChunk(chunk); }
        } catch {}
      }
    }
    onDone(fullText);
  } catch (err) {
    onError(err);
  }
}

// ─── Gemini sync helper (for score JSON) ─────────────────────────────────────
async function geminiSync(systemPrompt, userPrompt) {
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
  };
  const res = await fetch(GEMINI_URL_SYNC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function streamAI(tool, data, onChunk, onDone, onError) {
  await geminiStream(
    SYSTEMS[tool] || SYSTEMS.chat,
    buildPrompt(tool, data),
    onChunk, onDone, onError
  );
}

export async function callAI(tool, data) {
  return await geminiSync(SYSTEMS[tool] || SYSTEMS.chat, buildPrompt(tool, data));
}

export async function streamChat(messages, userProfile, onChunk, onDone, onError) {
  const profileContext = userProfile
    ? `\nUser Profile: Age ${userProfile.age || 'unknown'}, Income ₹${userProfile.income || 'unknown'}/month, Risk: ${userProfile.risk || 'moderate'}`
    : '';
  const history = messages.map(m => m.content).join('\n');
  try {
    await geminiStream(
      SYSTEMS.chat + profileContext,
      history,
      onChunk, onDone, onError
    );
  } catch (err) {
    onError(err);
  }
}
