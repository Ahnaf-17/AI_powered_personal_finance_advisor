# AI Workflow Design
## AI-Powered Personal Finance Advisor
**Author:** Md Monsur Hossain (AI & Quality Lead)
**Date:** 7 April 2026

---

## 1. Overview

The AI subsystem consists of three intelligent features:
1. **Budget Recommendation Engine** – analyses spending history and generates tailored budget guidelines
2. **Savings Suggestions Engine** – identifies discretionary spending patterns and recommends realistic savings opportunities
3. **Financial Chatbot** – answers natural-language finance questions within a defined, scoped advice domain

---

## 2. AI Workflow Diagram

```
+------------------+        +----------------------+        +------------------+
|   User (Browser) |        |   Backend API        |        |   AI Provider    |
|  (React Frontend)|        |  (Node.js/Express)   |        |  (OpenAI / Groq) |
+------------------+        +----------------------+        +------------------+
         |                            |                               |
         |  POST /api/ai/budget-advice|                               |
         |--------------------------->|                               |
         |                            |  1. Fetch user transactions   |
         |                            |     from MongoDB              |
         |                            |  2. Aggregate by category     |
         |                            |  3. Build structured prompt   |
         |                            |------------------------------>|
         |                            |                               |
         |                            |  4. Receive AI response       |
         |                            |<------------------------------|
         |                            |  5. Parse & sanitise output   |
         |  JSON: budget advice       |  6. Add disclaimer label      |
         |<---------------------------|                               |
         |                            |                               |
         |  POST /api/ai/savings      |                               |
         |--------------------------->|                               |
         |                            |  1. Fetch recurring expenses  |
         |                            |  2. Compare with user goals   |
         |                            |  3. Build savings prompt      |
         |                            |------------------------------>|
         |                            |  4. Receive AI response       |
         |                            |<------------------------------|
         |  JSON: savings tips        |                               |
         |<---------------------------|                               |
         |                            |                               |
         |  POST /api/ai/chat         |                               |
         |  {message, history}        |                               |
         |--------------------------->|                               |
         |                            |  1. Validate message scope    |
         |                            |  2. Prepend system prompt     |
         |                            |  3. Append chat history       |
         |                            |------------------------------>|
         |                            |  4. Stream / receive reply    |
         |                            |<------------------------------|
         |  JSON: {reply}             |  5. Filter off-topic content  |
         |<---------------------------|                               |
```

---

## 3. Prompt Engineering Strategy

### 3.1 System Prompt (all AI features)
All AI requests include a system-level constraint to ensure safe, scoped output:

```
You are a helpful personal finance assistant for a budgeting application.
Your role is to provide supportive, data-driven financial guidance based
only on the transaction data provided. You must:
- Never provide licensed financial advice or investment recommendations
- Base all advice strictly on the user's provided spending data
- Present all suggestions as informational guidance, not directives
- Keep responses concise and actionable (under 300 words)
- If asked about topics outside personal budgeting (e.g. stock picks,
  tax law, insurance products), politely decline and redirect
```

### 3.2 Budget Recommendation Prompt Template
```
The user has the following monthly spending summary:
{category_breakdown}

Their stated monthly income is: {monthly_income}
Their savings goal is: {savings_goal}

Based on this data, provide 3–5 specific, realistic budget recommendations
to help them improve their financial habits. Format as a numbered list.
Present this as supportive guidance, not certified financial advice.
```

### 3.3 Savings Suggestions Prompt Template
```
The user's top discretionary spending categories over the last 3 months are:
{discretionary_expense_summary}

Their current monthly savings rate is: {savings_rate}%
Their savings goal is: {savings_goal_amount} per month.

Identify 3 realistic savings opportunities with estimated monthly savings
for each. Be specific and practical. Label this as decision-support
information, not formal financial advice.
```

### 3.4 Chatbot System Prompt
```
You are a friendly, helpful financial assistant integrated into a personal
finance management application. You can help users understand their spending
patterns, explain budgeting concepts, and give general money management tips.

You have access to the user's recent financial summary:
{user_financial_summary}

Constraints:
- Do not provide investment advice, tax advice, or insurance recommendations
- Do not recommend specific financial products or institutions
- If a question is outside budgeting/spending topics, say:
  "That's outside what I can help with here — I focus on budgeting and
   spending management."
- Always stay within general budgeting guidance and avoid presenting advice as licensed financial advice
```

---

## 4. Data Flow for Budget Recommendation

```
1. Authenticated request arrives at POST /api/ai/budget-advice
2. Middleware: verifyToken() validates JWT
3. Controller:
   a. Query MongoDB: last 90 days of transactions for user
   b. Aggregate by category (sum amounts)
   c. Retrieve user's income and savings goal from User model
   d. Build prompt using template above
   e. Call OpenAI/Groq API with system + user prompt
   f. Parse response text
   g. Append disclaimer: "This is AI-generated guidance for informational
      purposes only and does not constitute certified financial advice."
   h. Return JSON response
4. Frontend displays budget and savings responses with the disclaimer visible
```

---

## 5. Constraints and Safety Measures

| Risk | Mitigation |
|------|-----------|
| AI produces financial advice beyond scope | System prompt explicitly constrains output; budget and savings endpoints append a server-side disclaimer |
| Token cost overruns | Max token limit set (500 tokens per response); rate limiting on AI endpoints |
| Biased/inaccurate recommendations | Outputs labelled as "informational guidance only"; user owns final decision |
| Sensitive data sent to AI | Only aggregated category totals sent — no raw transaction descriptions, no PII |
| API unavailability | Fallback to rules-based recommendations (pre-defined budget percentages) |

---

## 6. Technology Decision

After evaluating three AI providers:

| Provider | Cost | Quality | Latency | Decision |
|----------|------|---------|---------|----------|
| OpenAI GPT-3.5-turbo | Low (~$0.002/1K tokens) | High | Medium | **Primary** |
| Groq Llama3-8b | Free tier | Good | Very fast | Fallback/dev |
| Google Gemini Flash | Free tier | Good | Medium | Alternative |

**Selected:** OpenAI GPT-3.5-turbo as primary with Groq as free development fallback, configurable via `.env`.
