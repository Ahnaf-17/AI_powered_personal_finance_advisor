/**
 * AI Controller
 * Handles budget recommendations, savings suggestions, and financial chatbot.
 *
 * Author: Md Monsur Hossain (AI & Quality Lead)
 * COIT20273 – AI-Powered Personal Finance Advisor
 */

const OpenAI = require('openai');
const Transaction = require('../models/Transaction');

// Initialise AI client – configurable via environment variables
// Supports OpenAI (primary) and Groq (free dev fallback) via base_url swap
const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
});

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const MAX_TOKENS = 500;

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

    const userPrompt =
      `The user has the following expense breakdown for the last 90 days:\n${categoryText}\n\n` +
      `${incomeContext}\n` +
      `Monthly savings goal: $${savingsGoal || 'not set'}\n\n` +
      'Based on this data, provide 3–5 specific, realistic budget recommendations ' +
      'to help them improve their financial habits. Format as a numbered list.';

    let advice;
    let isAI = true;

    try {
      const completion = await aiClient.chat.completions.create({
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

    const userPrompt =
      `The user's top discretionary spending categories over 3 months:\n${categoryText}\n\n` +
      `Current savings rate: ${savingsRate}%\n` +
      `Monthly savings goal: $${req.user.savingsGoal || 'not set'}\n\n` +
      'Identify 3 realistic savings opportunities with estimated monthly saving for each. ' +
      'Be specific and practical.';

    let suggestions;
    let isAI = true;

    try {
      const completion = await aiClient.chat.completions.create({
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

    // Build financial context summary for system prompt
    const userId = req.user._id;
    const breakdown = await getCategoryBreakdown(userId, 30);
    const totalIncome = await getMonthlyIncomeSummary(userId, 30);
    const totalExpenses = breakdown.reduce((sum, c) => sum + c.total, 0);

    let financialContext = 'User has no recent transaction data.';
    if (breakdown.length > 0) {
      const topCategories = breakdown
        .slice(0, 3)
        .map((c) => `${c._id}: $${c.total.toFixed(2)}`)
        .join(', ');
      financialContext =
        `Last 30 days – Income: $${totalIncome.toFixed(2)}, ` +
        `Expenses: $${totalExpenses.toFixed(2)}, ` +
        `Top categories: ${topCategories}`;
    }

    const systemWithContext =
      SYSTEM_PROMPT +
      `\n\nUser's recent financial summary (last 30 days):\n${financialContext}` +
      '\n\nAlways end your response with: "Remember, this is for informational purposes only."';

    // Trim history to last 10 exchanges to control tokens
    const trimmedHistory = history.slice(-10);

    const messages = [
      { role: 'system', content: systemWithContext },
      ...trimmedHistory,
      { role: 'user', content: message.trim() },
    ];

    let reply;

    try {
      const completion = await aiClient.chat.completions.create({
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
