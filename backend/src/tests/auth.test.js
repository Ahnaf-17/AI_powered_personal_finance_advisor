/**
 * Auth Integration Tests
 * TC-AUTH-01 through TC-AUTH-08
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
let User;

beforeAll(async () => {
  mongoms = await MongoMemoryServer.create();
  await mongoose.connect(mongoms.getUri());
  // Import app AFTER mongoose is connected — NODE_ENV=test prevents connectDB() from firing
  app  = require('../server');
  User = require('../models/User');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoms.stop();
});

afterEach(async () => {
  // Wipe users between tests for isolation
  await User.deleteMany({});
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const VALID_USER = {
  name:     'Test User',
  email:    'test@example.com',
  password: 'SecurePass1!',
};

async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...VALID_USER, ...overrides });
}

async function loginUser(email = VALID_USER.email, password = VALID_USER.password) {
  return request(app)
    .post('/api/auth/login')
    .send({ email, password });
}

// ─── TC-AUTH-01: Register with valid data ────────────────────────────────────
test('TC-AUTH-01: register with valid data returns 201 and JWT', async () => {
  const res = await registerUser();
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('token');
  expect(res.body.email).toBe(VALID_USER.email);
  expect(res.body).not.toHaveProperty('password');
});

// ─── TC-AUTH-02: Register with duplicate email ───────────────────────────────
test('TC-AUTH-02: register with duplicate email returns 400', async () => {
  await registerUser();
  const res = await registerUser();
  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/already exists/i);
});

// ─── TC-AUTH-03: Register with weak password ────────────────────────────────
test('TC-AUTH-03: register with short password returns 400', async () => {
  const res = await registerUser({ password: 'abc' });
  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/password/i);
});

// ─── TC-AUTH-04: Login with correct credentials ──────────────────────────────
test('TC-AUTH-04: login with correct credentials returns 200 and JWT', async () => {
  await registerUser();
  const res = await loginUser();
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.email).toBe(VALID_USER.email);
});

// ─── TC-AUTH-05: Login with wrong password ───────────────────────────────────
test('TC-AUTH-05: login with wrong password returns 401', async () => {
  await registerUser();
  const res = await loginUser(VALID_USER.email, 'wrongpassword');
  expect(res.status).toBe(401);
  expect(res.body.message).toMatch(/invalid/i);
});

// ─── TC-AUTH-06: Access protected route without token ────────────────────────
test('TC-AUTH-06: access protected route without token returns 401', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.status).toBe(401);
});

// ─── TC-AUTH-07: Access protected route with invalid/expired token ───────────
test('TC-AUTH-07: access protected route with invalid token returns 401', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer totally.invalid.token');
  expect(res.status).toBe(401);
});

// ─── TC-AUTH-08: NoSQL injection in login ────────────────────────────────────
test('TC-AUTH-08: NoSQL injection in login is rejected or returns 400/401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: { $gt: '' }, password: { $gt: '' } });
  // Must not return 200 (i.e. must not bypass auth); string validation now returns 400
  expect([400, 401]).toContain(res.status);
});
