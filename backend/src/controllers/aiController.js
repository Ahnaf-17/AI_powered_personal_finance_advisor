/**
 * AI Controller
 * Handles budget recommendations, savings suggestions, and financial chatbot.
 *
 * Author: Md Monsur Hossain (AI & Quality Lead)
 * COIT20273 – AI-Powered Personal Finance Advisor
 */

const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const { getMarketContextForAI } = require('./marketController');

// Lazy-initialise so the module loads even when OPENAI_API_KEY is not yet set
let _aiClient = null;
function getAIClient() {
  if (!_aiClient) {
    _aiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'not-configured',
      baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    });
  }
  return _aiClient;
}

const AI_MODEL = process.env.OPENAI_MODEL || 'llama-3.1-8b-instant';
const MAX_TOKENS = 700;

const DISCLAIMER =
  '\n\n---\n⚠️ This is AI-generated guidance for informational purposes only. ' +
  'It does not constitute certified financial advice. Please consult a licensed ' +
  'financial adviser for personalised recommendations.';

const SYSTEM_PROMPT =
  'You are a helpful personal finance assistant for a budgeting application. ' +
  'Your role is to provide supportive, data-driven financial guidance based only ' +
  'on the transaction data provided. You must:\n' +
  '- Never provide licensed financial advice, investment recommendations, or tax advice\n' +
  '- Base all advice strictly on the spending data provided\n' +
  '- Keep responses concise and actionable (under 250 words)\n' +
  '- If asked about topics outside personal budgeting, politely decline and redirect\n' +
  '- Present suggestions as informational guidance, not directives';

// ─── Helper: aggregate user transactions by category ─────────────────────────

async function getCategoryBreakdown(userId, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: since },
        type: 'expense',
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return results;
}

async function getMonthlyIncomeSummary(userId, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: since },
        type: 'income',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result[0]?.total || 0;
}

// ─── Fallback: rules-based 50/30/20 budget advice ────────────────────────────

function getRulesBasedAdvice(monthlyIncome) {
  const needs = (monthlyIncome * 0.5).toFixed(2);
  const wants = (monthlyIncome * 0.3).toFixed(2);
  const savings = (monthlyIncome * 0.2).toFixed(2);

  return (
    'AI service is temporarily unavailable. Here is standard budgeting guidance:\n\n' +
    '**50/30/20 Budget Rule:**\n' +
    `1. **Needs (50%):** Allocate up to $${needs}/month for essential expenses ` +
    '(rent, groceries, utilities, transport).\n' +
    `2. **Wants (30%):** Keep discretionary spending (dining, entertainment, ` +
    `subscriptions) under $${wants}/month.\n` +
    `3. **Savings (20%):** Aim to save at least $${savings}/month.\n\n` +
    'Track your transactions and return for personalised AI recommendations.'
  );
}

// ─── POST /api/ai/budget-advice ───────────────────────────────────────────────

const getBudgetAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const breakdown = await getCategoryBreakdown(userId, 90);
    const totalIncome = await getMonthlyIncomeSummary(userId, 90);

    if (breakdown.length === 0) {
      return res.json({
        advice:
          'You have no expense transactions recorded in the last 90 days. ' +
          'Please add some transactions first so I can generate personalised budget recommendations.',
        isAI: false,
      });
    }

    const categoryText = breakdown
      .map((c) => `- ${c._id}: $${c.total.toFixed(2)} (${c.count} transactions)`)
      .join('\n');

    const { monthlyIncome, savingsGoal } = req.user;
    const incomeContext =
      monthlyIncome > 0
        ? `Monthly income: $${monthlyIncome}`
        : `Approximate income from last 90 days: $${(totalIncome / 3).toFixed(2)}/month`;

    const marketContext = await getMarketContextForAI();

    const userPrompt =
      `The user has the following expense breakdown for the last 90 days:\n${categoryText}\n\n` +
      `${incomeContext}\n` +
      `Monthly savings goal: $${savingsGoal || 'not set'}\n` +
      (marketContext ? `\n${marketContext}\n` : '') +
      '\nBased on this data, provide 3–5 specific, realistic budget recommendations ' +
      'to help them improve their financial habits. Format as a numbered list.';

    let advice;
    let isAI = true;

    try {
      const completion = await getAIClient().chat.completions.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });
      advice = completion.choices[0].message.content.trim() + DISCLAIMER;
    } catch (aiError) {
      console.error('AI API error (budget-advice):', aiError.message);
      advice = getRulesBasedAdvice(monthlyIncome || totalIncome / 3) + DISCLAIMER;
      isAI = false;
    }

    res.json({ advice, isAI });
  } catch (error) {
    console.error('getBudgetAdvice error:', error.message);
    res.status(500).json({ message: 'Server error generating budget advice.' });
  }
};

// ─── POST /api/ai/savings-suggestions ────────────────────────────────────────

const getSavingsSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const breakdown = await getCategoryBreakdown(userId, 90);

    if (breakdown.length === 0) {
      return res.json({
        suggestions:
          'No transactions found for the last 90 days. Please add transactions to receive savings suggestions.',
        isAI: false,
      });
    }

    // Top 5 expense categories
    const top5 = breakdown.slice(0, 5);
    const categoryText = top5
      .map((c) => `- ${c._id}: $${c.total.toFixed(2)} over 3 months ($${(c.total / 3).toFixed(2)}/month avg)`)
      .join('\n');

    const totalExpenses = breakdown.reduce((sum, c) => sum + c.total, 0);
    const totalIncome = await getMonthlyIncomeSummary(userId, 90);
    const savingsRate =
      totalIncome > 0
        ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
        : 'unknown';

    const marketContext = await getMarketContextForAI();

    const userPrompt =
      `The user's top discretionary spending categories over 3 months:\n${categoryText}\n\n` +
      `Current savings rate: ${savingsRate}%\n` +
      `Monthly savings goal: $${req.user.savingsGoal || 'not set'}\n` +
      (marketContext ? `\n${marketContext}\n` : '') +
      '\nIdentify 3 realistic savings opportunities with estimated monthly saving for each. ' +
      'Be specific and practical.';

    let suggestions;
    let isAI = true;

    try {
      const completion = await getAIClient().chat.completions.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });
      suggestions = completion.choices[0].message.content.trim() + DISCLAIMER;
    } catch (aiError) {
      console.error('AI API error (savings):', aiError.message);
      suggestions =
        'AI service temporarily unavailable. General savings tips:\n\n' +
        '1. Review subscriptions – cancel unused ones (potential saving: $20–50/month)\n' +
        '2. Meal prep instead of dining out (potential saving: $100–200/month)\n' +
        '3. Use the 24-hour rule before non-essential purchases\n' + DISCLAIMER;
      isAI = false;
    }

    res.json({ suggestions, isAI });
  } catch (error) {
    console.error('getSavingsSuggestions error:', error.message);
    res.status(500).json({ message: 'Server error generating savings suggestions.' });
  }
};

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────

const chatWithAdvisor = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ message: 'Message cannot exceed 500 characters.' });
    }

    // ── Build rich financial context from user's actual data ─────────────────
    const userId = req.user._id;
    const [breakdown90, breakdown30, totalIncome90, totalIncome30, goals] = await Promise.all([
      getCategoryBreakdown(userId, 90),
      getCategoryBreakdown(userId, 30),
      getMonthlyIncomeSummary(userId, 90),
      getMonthlyIncomeSummary(userId, 30),
      Goal.find({ user: userId }).lean(),
    ]);

    const totalExpenses90 = breakdown90.reduce((s, c) => s + c.total, 0);
    const totalExpenses30 = breakdown30.reduce((s, c) => s + c.total, 0);
    const monthlyIncome   = req.user.monthlyIncome || (totalIncome90 / 3);
    const savingsRate     = monthlyIncome > 0
      ? (((monthlyIncome - totalExpenses30) / monthlyIncome) * 100).toFixed(1)
      : 'unknown';

    let financialContext = 'User has no transaction data yet.';
    if (breakdown90.length > 0) {
      const allCategories = breakdown90
        .map(c => `  • ${c._id}: $${c.total.toFixed(2)} over 90 days ($${(c.total/3).toFixed(2)}/month avg)`)
        .join('\n');

      const last30Summary = breakdown30.length > 0
        ? breakdown30.map(c => `  • ${c._id}: $${c.total.toFixed(2)}`).join('\n')
        : '  No expenses in last 30 days.';

      const goalsText = goals.length > 0
        ? goals.map(g => {
            const pct = Math.min(((g.currentAmount / g.targetAmount) * 100), 100).toFixed(0);
            const daysLeft = g.targetDate
              ? Math.ceil((new Date(g.targetDate) - new Date()) / 86400000)
              : null;
            return `  • ${g.name}: $${g.currentAmount.toFixed(2)} / $${g.targetAmount.toFixed(2)} (${pct}%)` +
              (daysLeft !== null ? ` — ${daysLeft > 0 ? daysLeft + ' days left' : 'overdue'}` : '');
          }).join('\n')
        : '  No savings goals set.';

      financialContext =
        `=== USER'S FINANCIAL PROFILE ===\n` +
        `Monthly income: $${monthlyIncome.toFixed(2)}\n` +
        `Savings goal: $${req.user.savingsGoal || 'not set'}/month\n` +
        `Current savings rate (last 30 days): ${savingsRate}%\n` +
        `Total expenses last 30 days: $${totalExpenses30.toFixed(2)}\n` +
        `Total expenses last 90 days: $${totalExpenses90.toFixed(2)}\n\n` +
        `EXPENSE BREAKDOWN (last 90 days):\n${allCategories}\n\n` +
        `EXPENSE BREAKDOWN (last 30 days):\n${last30Summary}\n\n` +
        `SAVINGS GOALS:\n${goalsText}\n` +
        `=================================\n\n` +
        `When answering, reference the user's ACTUAL numbers above. ` +
        `Be specific — mention their actual category names and dollar amounts. ` +
        `Do NOT give generic advice that ignores their data.`;
    }

    const marketContext = await getMarketContextForAI();

    const systemWithContext =
      SYSTEM_PROMPT +
      `\n\n${financialContext}` +
      (marketContext ? `\n\n${marketContext}` : '') +
      '\n\nAlways reference the user\'s specific numbers and categories in your response. ' +
      'End every response with: "Remember, this is for informational purposes only."';

    // Trim history to last 10 exchanges to control tokens
    const trimmedHistory = history.slice(-10);

    const messages = [
      { role: 'system', content: systemWithContext },
      ...trimmedHistory,
      { role: 'user', content: message.trim() },
    ];

    let reply;

    try {
      const completion = await getAIClient().chat.completions.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        messages,
      });
      reply = completion.choices[0].message.content.trim();
    } catch (aiError) {
      console.error('AI API error (chat):', aiError.message);
      reply =
        "Sorry, the financial assistant is temporarily unavailable. Please try again shortly.\n\n" +
        "Remember, this is for informational purposes only.";
    }

    res.json({ reply });
  } catch (error) {
    console.error('chatWithAdvisor error:', error.message);
    res.status(500).json({ message: 'Server error processing your message.' });
  }
};

module.exports = { getBudgetAdvice, getSavingsSuggestions, chatWithAdvisor };
