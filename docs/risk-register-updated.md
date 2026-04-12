# Updated Risk Register
## AI-Powered Personal Finance Advisor
**Author:** Md Monsur Hossain (AI & Quality Lead)
**Version:** 1.2 (updated from Project Proposal v1.0)
**Date:** 10 April 2026

---

## Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|----|------|-----------|--------|----------|-----------|-------|--------|
| R-01 | API cost or quota limits exceed budget | Medium | High | High | Use Groq free tier for development; switch to OpenAI only for demo; set max 500 token limit; rate-limit all AI endpoints (10 req/user/hr) | Md Monsur Hossain | **Active – mitigated** |
| R-02 | Team schedule conflicts due to other unit deadlines | Medium | Medium | Medium | Weekly WhatsApp stand-up every Sunday; shared GitHub project board; rotating leadership per project proposal | All members | Active |
| R-03 | Feature scope becomes too large | High | High | Critical | Strict MVP scope: auth, transactions, dashboard, 3 AI features only; defer analytics extras | Ahnaf Ahmed | Active |
| R-04 | Poor quality or biased AI outputs | Medium | Medium | Medium | Structured prompts with explicit constraints; manual AI output review checklist; disclaimer on all outputs | Md Monsur Hossain | **Active – mitigated** |
| R-05 | Security or privacy concerns with financial data | Medium | High | High | JWT authentication; bcrypt password hashing; Helmet security headers; no PII sent to AI provider; input sanitisation | Shakir Uddin Ahmed | Active |
| R-06 | MongoDB connection issues in deployed/demo environment | Low | High | Medium | Use MongoDB Atlas as backup; maintain local fallback; document connection string setup | Shakir Uddin Ahmed | Active |
| R-07 | React state management complexity (auth + transactions) | Low | Medium | Low | Use React Context API (simple, no Redux needed for this scope) | Ahnaf Ahmed | Active |
| R-08 | AI provider API changes or deprecation | Low | High | Medium | Abstract AI calls behind a service layer; provider configurable via .env variable | Md Monsur Hossain | Active |
| R-09 | Insufficient sample data for meaningful AI recommendations | Medium | Medium | Medium | Create seed script with 3 months of realistic sample transactions per test user | Md Monsur Hossain | **New – added Week 5** |
| R-10 | Team member unavailability during Week 12 demo | Low | High | Medium | Ensure full codebase is documented; all members have local running environment by Week 11 | Ahnaf Ahmed | **New – added Week 6** |

---

## Changes from Proposal Version

The following risks were added or updated since the original Project Proposal (30 March 2026):

| Change | Risk ID | Reason |
|--------|---------|--------|
| Added | R-09 | Identified during Week 5 AI requirements analysis – AI features need sufficient data to work meaningfully |
| Added | R-10 | Identified during Week 6 planning – demo preparation risk not covered in original proposal |
| Updated | R-01 | Expanded mitigation after AI API research – Groq identified as viable free fallback |
| Updated | R-04 | Expanded mitigation – AI output checklist created (see test plan) |
