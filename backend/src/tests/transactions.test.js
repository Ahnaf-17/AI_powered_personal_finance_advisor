/**
 * Transaction Integration Tests
 * TC-TXN-01 through TC-TXN-09
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
let tokenA;   // user A
let tokenB;   // user B (different user — for isolation tests)
let txId;     // reusable transaction ID

beforeAll(async () => {
  mongoms = await MongoMemoryServer.create();
  await mongoose.connect(mongoms.getUri());
  // Import app AFTER mongoose is connected — NODE_ENV=test prevents connectDB() from firing
  app = require('../server');

  // Create two users and get their tokens
  const resA = await request(app).post('/api/auth/register').send({
    name: 'User A', email: 'usera@example.com', password: 'Password1!',
  });
  tokenA = resA.body.token;

  const resB = await request(app).post('/api/auth/register').send({
    name: 'User B', email: 'userb@example.com', password: 'Password1!',
  });
  tokenB = resB.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoms.stop();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

// ─── TC-TXN-01: Create income transaction ────────────────────────────────────
test('TC-TXN-01: create income transaction returns 201', async () => {
  const res = await request(app)
    .post('/api/transactions')
    .set(auth(tokenA))
    .send({ type: 'income', amount: 1500, category: 'Salary' });
  expect(res.status).toBe(201);
  expect(res.body.type).toBe('income');
  expect(res.body.amount).toBe(1500);
  txId = res.body._id;
});

// ─── TC-TXN-02: Create expense transaction ───────────────────────────────────
test('TC-TXN-02: create expense transaction returns 201', async () => {
  const res = await request(app)
    .post('/api/transactions')
    .set(auth(tokenA))
    .send({ type: 'expense', amount: 50, category: 'Food', description: 'Lunch' });
  expect(res.status).toBe(201);
  expect(res.body.type).toBe('expense');
  expect(res.body.category).toBe('Food');
});

// ─── TC-TXN-03: Create transaction with missing amount ───────────────────────
test('TC-TXN-03: create transaction missing amount returns 400', async () => {
  const res = await request(app)
    .post('/api/transactions')
    .set(auth(tokenA))
    .send({ type: 'expense', category: 'Food' });
  expect(res.status).toBe(400);
});

// ─── TC-TXN-04: Create transaction with negative amount ──────────────────────
test('TC-TXN-04: create transaction with negative amount returns 400', async () => {
  const res = await request(app)
    .post('/api/transactions')
    .set(auth(tokenA))
    .send({ type: 'expense', amount: -100, category: 'Food' });
  expect(res.status).toBe(400);
});

// ─── TC-TXN-05: Get all transactions returns only the user's own ──────────────
test('TC-TXN-05: get transactions returns only authenticated user\'s records', async () => {
  const res = await request(app)
    .get('/api/transactions')
    .set(auth(tokenA));
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.transactions)).toBe(true);
  res.body.transactions.forEach(tx => {
    expect(tx.user.toString()).not.toBeFalsy(); // all belong to user A's data
  });
});

// ─── TC-TXN-06: User B cannot see User A's transactions ──────────────────────
test('TC-TXN-06: user B sees empty list when user A has transactions', async () => {
  const res = await request(app)
    .get('/api/transactions')
    .set(auth(tokenB));
  expect(res.status).toBe(200);
  expect(res.body.transactions.length).toBe(0);
});

// ─── TC-TXN-07: Update own transaction ───────────────────────────────────────
test('TC-TXN-07: update own transaction returns 200 with updated data', async () => {
  const res = await request(app)
    .put(`/api/transactions/${txId}`)
    .set(auth(tokenA))
    .send({ amount: 2000, description: 'Updated salary' });
  expect(res.status).toBe(200);
  expect(res.body.amount).toBe(2000);
  expect(res.body.description).toBe('Updated salary');
});

// ─── TC-TXN-08: Delete own transaction ───────────────────────────────────────
test('TC-TXN-08: delete own transaction returns 200', async () => {
  // Create a fresh transaction to delete
  const create = await request(app)
    .post('/api/transactions')
    .set(auth(tokenA))
    .send({ type: 'expense', amount: 10, category: 'Other' });
  const deleteId = create.body._id;

  const res = await request(app)
    .delete(`/api/transactions/${deleteId}`)
    .set(auth(tokenA));
  expect(res.status).toBe(200);

  // Confirm it is gone
  const check = await request(app)
    .get(`/api/transactions/${deleteId}`)
    .set(auth(tokenA));
  expect(check.status).toBe(404);
});

// ─── TC-TXN-09: User B cannot delete User A's transaction ────────────────────
test('TC-TXN-09: user B cannot delete user A\'s transaction', async () => {
  const res = await request(app)
    .delete(`/api/transactions/${txId}`)
    .set(auth(tokenB));
  expect(res.status).toBe(404); // returns 404 because findOneAndDelete finds nothing for user B
});
