/**
 * Dashboard Integration Tests
 * TC-DASH-01 through TC-DASH-04
 *
 * Author: Shakir Uddin Ahmed (Backend / Database Lead)
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
  app         = require('../server');
  Transaction = require('../models/Transaction');

  // Register and log in a test user
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Dash Tester',
    email: 'dash@test.com',
    password: 'Test1234!',
    monthlyIncome: 5000,
  });
  token  = reg.body.token;
  userId = reg.body.user?.id || reg.body.user?._id;

  // Seed transactions for the test user
  const txs = [
    { user: userId, type: 'income',  amount: 3000, category: 'Salary',  date: new Date() },
    { user: userId, type: 'expense', amount: 500,  category: 'Food',    date: new Date() },
    { user: userId, type: 'expense', amount: 200,  category: 'Transport', date: new Date() },
    { user: userId, type: 'expense', amount: 150,  category: 'Health',  date: new Date() },
  ];
  await Transaction.insertMany(txs);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoms.stop();
});

function auth(t) { return { Authorization: `Bearer ${t}` }; }

// TC-DASH-01: Summary returns correct totals for a user with transactions
test('TC-DASH-01 summary returns income, expense and balance totals', async () => {
  const res = await request(app)
    .get('/api/transactions/summary')
    .set(auth(token));

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('totalIncome');
  expect(res.body).toHaveProperty('totalExpenses');
  expect(res.body).toHaveProperty('balance');
  expect(Number(res.body.totalIncome)).toBeGreaterThan(0);
  expect(Number(res.body.totalExpenses)).toBeGreaterThan(0);
});

// TC-DASH-02: Balance equals income minus expenses
test('TC-DASH-02 balance equals totalIncome minus totalExpenses', async () => {
  const res = await request(app)
    .get('/api/transactions/summary')
    .set(auth(token));

  expect(res.statusCode).toBe(200);
  const { totalIncome, totalExpenses, balance } = res.body;
  expect(Number(balance)).toBeCloseTo(Number(totalIncome) - Number(totalExpenses), 2);
});

// TC-DASH-03: Summary for a new user with no transactions returns zeros
test('TC-DASH-03 new user with no transactions returns zero totals', async () => {
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Empty User',
    email: 'empty@test.com',
    password: 'Test1234!',
    monthlyIncome: 0,
  });
  const emptyToken = reg.body.token;

  const res = await request(app)
    .get('/api/transactions/summary')
    .set(auth(emptyToken));

  expect(res.statusCode).toBe(200);
  expect(Number(res.body.totalIncome)).toBe(0);
  expect(Number(res.body.totalExpenses)).toBe(0);
  expect(Number(res.body.balance)).toBe(0);
});

// TC-DASH-04: Summary requires authentication
test('TC-DASH-04 summary returns 401 without auth token', async () => {
  const res = await request(app).get('/api/transactions/summary');
  expect(res.statusCode).toBe(401);
});
