/**
 * AI Integration Tests
 * TC-AI-01 through TC-AI-12
 *
 * Author: Md Monsur Hossain (AI & Quality Lead)
 * COIT20273 – AI-Powered Personal Finance Advisor
 */

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongoms;
let token;
let Transaction;
let userId;

beforeAll(async () => {
  mongoms = await MongoMemoryServer.create();
  await mongoose.connect(mongoms.getUri());
  // Import app AFTER mongoose is connected — NODE_ENV=test prevents connectDB() from firing
  app         = require('../server');
  Transaction = require('../models/Transaction');

  const res = await request(app).post('/api/auth/register').send({
    name: 'AI Tester', email: 'aitester@example.com', password: 'Password1!',
  });
  token  = res.body.token;
  userId = res.body.user?._id || res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoms.stop();
});

function auth(t) { return { Authorization: `Bearer ${t}` }; }

// Seed transactions for tests that need data
async function seedTransactions() {
  const User = require('../models/User');
  const user = await User.findOne({ email: 'aitester@example.com' });
  await Transaction.deleteMany({ user: user._id });
  await Transaction.insertMany([
    { user: user._id, type: 'income',  amount: 4000, category: 'Salary',  date: new Date() },
    { user: user._id, type: 'expense', amount: 1200, category: 'Rent',    date: new Date() },
    { user: user._id, type: 'expense', amount: 300,  category: 'Food',    date: new Date() },
    { user: user._id, type: 'expense', amount: 150,  category: 'Transport', date: new Date() },
    { user: user._id, type: 'expense', amount: 80,   category: 'Entertainment', date: new Date() },
  ]);
}

// ─── TC-AI-01: budget-advice requires auth ───────────────────────────────────
test('TC-AI-01: budget-advice without auth returns 401', async () => {
  const res = await request(app).post('/api/ai/budget-advice');
  expect(res.status).toBe(401);
});

// ─── TC-AI-02: budget-advice with no transactions returns fallback ────────────
test('TC-AI-02: budget-advice with no transactions returns isAI false with advice', async () => {
  await Transaction.deleteMany({});
  const res = await request(app).post('/api/ai/budget-advice').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('advice');
  expect(res.body.isAI).toBe(false);
  expect(typeof res.body.advice).toBe('string');
});

// ─── TC-AI-03: budget-advice with transactions returns advice string ──────────
test('TC-AI-03: budget-advice with transactions returns non-empty advice', async () => {
  await seedTransactions();
  const res = await request(app).post('/api/ai/budget-advice').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('advice');
  expect(typeof res.body.advice).toBe('string');
  expect(res.body.advice.length).toBeGreaterThan(10);
  expect(res.body).toHaveProperty('isAI');
}, 35000);

// ─── TC-AI-04: savings-suggestions requires auth ─────────────────────────────
test('TC-AI-04: savings-suggestions without auth returns 401', async () => {
  const res = await request(app).post('/api/ai/savings-suggestions');
  expect(res.status).toBe(401);
});

// ─── TC-AI-05: savings-suggestions with no transactions returns fallback ──────
test('TC-AI-05: savings-suggestions with no transactions returns isAI false', async () => {
  await Transaction.deleteMany({});
  const res = await request(app).post('/api/ai/savings-suggestions').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('suggestions');
  expect(res.body.isAI).toBe(false);
});

// ─── TC-AI-06: savings-suggestions with transactions returns suggestions ──────
test('TC-AI-06: savings-suggestions with transactions returns non-empty suggestions', async () => {
  await seedTransactions();
  const res = await request(app).post('/api/ai/savings-suggestions').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('suggestions');
  expect(typeof res.body.suggestions).toBe('string');
  expect(res.body.suggestions.length).toBeGreaterThan(10);
  expect(res.body).toHaveProperty('isAI');
  expect(typeof res.body.isAI).toBe('boolean');
}, 35000);

// ─── TC-AI-07: chat requires auth ────────────────────────────────────────────
test('TC-AI-07: chat without auth returns 401', async () => {
  const res = await request(app).post('/api/ai/chat').send({ message: 'Hello' });
  expect(res.status).toBe(401);
});

// ─── TC-AI-08: chat without message body returns 400 ─────────────────────────
test('TC-AI-08: chat without message field returns 400', async () => {
  const res = await request(app).post('/api/ai/chat').set(auth(token)).send({});
  expect(res.status).toBe(400);
});

// ─── TC-AI-09: chat with whitespace-only message returns 400 ─────────────────
test('TC-AI-09: chat with whitespace-only message returns 400', async () => {
  const res = await request(app).post('/api/ai/chat').set(auth(token)).send({ message: '   ' });
  expect(res.status).toBe(400);
});

// ─── TC-AI-10: chat with message over 500 chars returns 400 ──────────────────
test('TC-AI-10: chat with message exceeding 500 chars returns 400', async () => {
  const res = await request(app)
    .post('/api/ai/chat')
    .set(auth(token))
    .send({ message: 'a'.repeat(501) });
  expect(res.status).toBe(400);
});

// ─── TC-AI-11: chat with valid message returns reply ─────────────────────────
test('TC-AI-11: chat with valid message returns reply string', async () => {
  const res = await request(app)
    .post('/api/ai/chat')
    .set(auth(token))
    .send({ message: 'How can I reduce my spending?' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('reply');
  expect(typeof res.body.reply).toBe('string');
  expect(res.body.reply.length).toBeGreaterThan(0);
}, 35000);

// ─── TC-AI-12: chat accepts history array and returns reply ──────────────────
test('TC-AI-12: chat with conversation history returns valid reply', async () => {
  const history = [
    { role: 'user',      content: 'What is my biggest expense?' },
    { role: 'assistant', content: 'Your biggest expense is Rent.' },
  ];
  const res = await request(app)
    .post('/api/ai/chat')
    .set(auth(token))
    .send({ message: 'How can I reduce it?', history });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('reply');
  expect(typeof res.body.reply).toBe('string');
}, 35000);
