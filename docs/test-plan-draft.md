# Test Plan – Draft v1.0
## AI-Powered Personal Finance Advisor
**Author:** Md Monsur Hossain (AI & Quality Lead)
**Date:** 10 April 2026
**Status:** Draft – for review

---

## 1. Introduction

This test plan defines the testing strategy, scope, types, and test cases for the AI-Powered Personal Finance Advisor project (COIT20273, HT1 2026). Testing will be conducted across all development phases, with emphasis on functional correctness, security, AI output quality, and usability.

---

## 2. Test Scope

### In Scope
- User authentication (register, login, JWT validation)
- Transaction CRUD operations (create, read, update, delete)
- Dashboard data aggregation and display
- AI feature endpoints (budget advice, savings suggestions, chatbot)
- Input validation and error handling
- Basic security controls (authentication, rate limiting, injection prevention)

### Out of Scope
- Load testing / performance testing beyond basic response times
- Automated end-to-end browser testing (manual UI testing only)
- Live banking API integration (not in scope per project proposal)

---

## 3. Test Types

| Type | Description | Tool |
|------|-------------|------|
| Unit Testing | Test individual functions and controllers in isolation | Jest (Node.js) |
| Integration Testing | Test API endpoints with database interactions | Postman / Jest + Supertest |
| UI Testing | Manual testing of React components and user flows | Browser DevTools |
| AI Output Testing | Evaluate quality, scope, and safety of AI responses | Manual + checklist |
| Security Testing | Validate authentication, authorisation, and input sanitation | Postman + manual |

---

## 4. Test Environment

| Component | Details |
|-----------|---------|
| Backend | Node.js v22, Express, running on localhost:5000 |
| Database | MongoDB local instance (localhost:27017/finance_advisor_test) |
| Frontend | React + Vite, running on localhost:5173 |
| AI Provider | OpenAI GPT-3.5-turbo (test with minimal token usage) or Groq free tier |
| Test Data | Sample transaction datasets (minimum 30 transactions per test user) |

---

## 5. Test Cases – Authentication

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-AUTH-01 | Register with valid data | name, email, password | 201 Created, JWT returned | High |
| TC-AUTH-02 | Register with duplicate email | existing email | 400 Bad Request, error message | High |
| TC-AUTH-03 | Register with weak password (<6 chars) | "abc" | 400 Validation error | High |
| TC-AUTH-04 | Login with correct credentials | valid email + password | 200 OK, JWT returned | High |
| TC-AUTH-05 | Login with wrong password | valid email, wrong password | 401 Unauthorised | High |
| TC-AUTH-06 | Access protected route without token | No Authorization header | 401 Unauthorised | High |
| TC-AUTH-07 | Access protected route with expired token | Expired JWT | 401 Unauthorised | High |
| TC-AUTH-08 | SQL/NoSQL injection in login | `{"$gt":""}` in email | 400 or sanitised, no bypass | High |

---

## 6. Test Cases – Transactions

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-TXN-01 | Create income transaction | type:income, amount:1500, category:"Salary" | 201 Created, transaction returned | High |
| TC-TXN-02 | Create expense transaction | type:expense, amount:50, category:"Food" | 201 Created | High |
| TC-TXN-03 | Create transaction with missing amount | No amount field | 400 Validation error | High |
| TC-TXN-04 | Create transaction with negative amount | amount:-100 | 400 Validation error | Medium |
| TC-TXN-05 | Get all transactions for user | Valid JWT | 200, array of user's transactions only | High |
| TC-TXN-06 | User cannot see other user's transactions | Valid JWT, other user's data | 403 or empty result | High |
| TC-TXN-07 | Update transaction | Valid ID, new amount | 200, updated transaction | Medium |
| TC-TXN-08 | Delete transaction | Valid ID | 200, transaction removed | Medium |
| TC-TXN-09 | Delete transaction belonging to another user | Other user's transaction ID | 403 Forbidden | High |

---

## 7. Test Cases – Dashboard

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-DASH-01 | Get summary with transactions | Valid JWT, user has transactions | 200, totalIncome, totalExpenses, balance | High |
| TC-DASH-02 | Get summary with no transactions | Valid JWT, new user | 200, all values = 0 | High |
| TC-DASH-03 | Category breakdown accuracy | 3 food transactions ($10, $20, $30) | food total = $60 | High |
| TC-DASH-04 | Monthly trend data | 3 months of transactions | Array of 3 monthly totals | Medium |

---

## 8. Test Cases – AI Features

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-AI-01 | Budget advice with sufficient data | User with 30+ transactions | 200, 3–5 recommendations returned | High |
| TC-AI-02 | Budget advice with no transactions | New user | 200, message asking user to add transactions | High |
| TC-AI-03 | Budget advice response contains disclaimer | Any valid request | Response includes disclaimer text | High |
| TC-AI-04 | Budget advice without authentication | No JWT | 401 Unauthorised | High |
| TC-AI-05 | Savings suggestions with 3 months data | Valid user | 200, 3 suggestions with amounts | High |
| TC-AI-06 | Chatbot with finance question | "How can I reduce my food spending?" | 200, relevant response | High |
| TC-AI-07 | Chatbot with off-topic question | "Who won the cricket?" | 200, polite decline message | High |
| TC-AI-08 | Chatbot without authentication | No JWT | 401 Unauthorised | High |
| TC-AI-09 | AI response never includes investment advice | Any prompt | No stock/crypto/investment advice in response | High |
| TC-AI-10 | Rate limiting on AI endpoints | 11 requests within 1 hour | 429 Too Many Requests | Medium |
| TC-AI-11 | AI API key not exposed in client response | Any AI endpoint | No API key visible in JSON response | High |
| TC-AI-12 | Fallback when AI unavailable | Invalid/missing API key | 200, rules-based fallback returned | Medium |

---

## 9. Test Cases – Security

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TC-SEC-01 | XSS in transaction description | `<script>alert(1)</script>` | Input sanitised, no script execution | High |
| TC-SEC-02 | Rate limiting on auth endpoints | 6+ login attempts in 15 mins | 429 Too Many Requests | High |
| TC-SEC-03 | CORS enforcement | Request from unauthorised origin | CORS error / blocked | Medium |
| TC-SEC-04 | HTTP security headers present | Any response | Helmet headers present (X-Frame-Options, etc.) | Medium |
| TC-SEC-05 | Password not returned in API response | GET /api/auth/me | No password field in response | High |

---

## 10. AI Output Quality Checklist

For each AI response (budget advice, savings, chatbot), manually verify:

- [ ] Response is relevant to the user's actual spending data
- [ ] Response does not contain investment, tax, or insurance advice
- [ ] Disclaimer text is present
- [ ] Response is in plain English and understandable to non-financial users
- [ ] Response does not contain fabricated statistics or false claims
- [ ] Response is concise (under 300 words)
- [ ] Response does not reveal any user PII

---

## 11. Test Schedule

| Phase | Test Type | Week |
|-------|-----------|------|
| Phase 1 | Auth + Transaction unit/integration tests | Week 8 |
| Phase 2 | Dashboard + AI endpoint integration tests | Week 9 |
| Phase 3 | Security testing | Week 10 |
| Phase 4 | Full UI manual testing + AI quality review | Week 11 |
| Phase 5 | Regression testing before final demo | Week 12 |

---

## 12. Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 10 April 2026 | Md Monsur Hossain | Initial draft |
