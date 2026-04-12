/**
 * Seed script — populates the database with realistic demo data.
 * Usage:  node scripts/seed.js
 *         node scripts/seed.js --email user@example.com --password Secret123!
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose  = require('mongoose');
const User        = require('../src/models/User');
const Transaction = require('../src/models/Transaction');
const Goal        = require('../src/models/Goal');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const getArg  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const EMAIL   = getArg('--email')    || 'demo@finance.app';
const PASS    = getArg('--password') || 'Demo1234!';
const NAME    = getArg('--name')     || 'Alex Johnson';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand   = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(rand(7,22), rand(0,59), 0, 0); return d; };

// ─── Data templates ──────────────────────────────────────────────────────────
const EXPENSES = [
  { category:'Food',          range:[8, 65],   descs:['Grocery run','Coffee & pastry','Dinner out','Lunch takeaway','Supermarket'] },
  { category:'Transport',     range:[4, 55],   descs:['Uber ride','Bus pass','Petrol fill-up','Parking','Taxi'] },
  { category:'Shopping',      range:[20, 200], descs:['Clothes','Amazon order','Shoes','Electronics','Gifts'] },
  { category:'Entertainment', range:[10, 90],  descs:['Netflix','Cinema tickets','Spotify','Gaming','Concert'] },
  { category:'Health',        range:[15, 120], descs:['Pharmacy','Gym membership','Doctor visit','Vitamins','Dentist'] },
  { category:'Utilities',     range:[30, 180], descs:['Electricity bill','Internet plan','Water bill','Phone plan','Gas bill'] },
  { category:'Rent',          range:[900,1800],descs:['Weekly rent','Bond payment'] },
  { category:'Other',         range:[5, 80],   descs:['Haircut','Donation','Miscellaneous','Stationery','Books'] },
];

const INCOMES = [
  { category:'Salary',    range:[2800,3200], descs:['Fortnightly salary','Salary direct debit'] },
  { category:'Freelance', range:[200, 900],  descs:['Client project','Consulting fee','Design work','Code review'] },
  { category:'Other',     range:[30, 300],   descs:['Cashback reward','Tax refund','Birthday gift','Sold item'] },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_advisor';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB:', mongoose.connection.host);

  // ── User ────────────────────────────────────────────────────────────────────
  let user = await User.findOne({ email: EMAIL });
  if (user) {
    console.log(`👤 User already exists (${EMAIL}), wiping their data for fresh seed...`);
    await Transaction.deleteMany({ user: user._id });
    await Goal.deleteMany({ user: user._id });
  } else {
    // Pass plain password — the User model pre('save') hook hashes it
    user = await User.create({
      name: NAME, email: EMAIL, password: PASS,
      monthlyIncome: 6000, savingsGoal: 1000, currency: 'AUD',
    });
    console.log(`👤 Created user: ${EMAIL}`);
  }

  // ── Transactions (90 days) ───────────────────────────────────────────────────
  const txDocs = [];

  // Fortnightly salary × 6
  for (let i = 0; i < 6; i++) {
    txDocs.push({ user: user._id, type:'income', amount: rand(2900,3100), category:'Salary', description:'Fortnightly salary', date: daysAgo(i * 14) });
  }

  // Random expenses spread over last 90 days
  for (let day = 0; day <= 90; day++) {
    const txPerDay = Math.random() < 0.65 ? rand(1, 3) : 0; // ~65% of days have spending
    for (let t = 0; t < txPerDay; t++) {
      const tpl = pick(EXPENSES.filter(e => e.category !== 'Rent')); // rent handled separately
      txDocs.push({
        user: user._id, type:'expense',
        amount: rand(tpl.range[0], tpl.range[1]),
        category: tpl.category,
        description: pick(tpl.descs),
        date: daysAgo(day),
      });
    }
  }

  // Monthly rent × 3
  for (let i = 0; i < 3; i++) {
    txDocs.push({ user: user._id, type:'expense', amount: 1350, category:'Rent', description:'Monthly rent', date: daysAgo(i * 30 + 1) });
  }

  // Freelance income × 4
  for (let i = 0; i < 4; i++) {
    const tpl = INCOMES[1];
    txDocs.push({
      user: user._id, type:'income',
      amount: rand(tpl.range[0], tpl.range[1]),
      category: tpl.category,
      description: pick(tpl.descs),
      date: daysAgo(Math.floor(Math.random() * 80)),
    });
  }

  // Other income × 3
  for (let i = 0; i < 3; i++) {
    const tpl = INCOMES[2];
    txDocs.push({
      user: user._id, type:'income',
      amount: rand(tpl.range[0], tpl.range[1]),
      category: tpl.category,
      description: pick(tpl.descs),
      date: daysAgo(Math.floor(Math.random() * 60)),
    });
  }

  await Transaction.insertMany(txDocs);
  console.log(`💳 Inserted ${txDocs.length} transactions`);

  // ── Goals ────────────────────────────────────────────────────────────────────
  const goalDocs = [
    { user: user._id, name:'Emergency Fund',      targetAmount: 5000,  currentAmount: 2800, targetDate: new Date('2026-12-31') },
    { user: user._id, name:'Holiday to Japan',    targetAmount: 4500,  currentAmount: 1250, targetDate: new Date('2026-09-15') },
    { user: user._id, name:'New Laptop',          targetAmount: 2200,  currentAmount: 2200, isCompleted: true },
    { user: user._id, name:'Car Deposit',         targetAmount: 10000, currentAmount: 3400, targetDate: new Date('2027-06-01') },
    { user: user._id, name:'Investment Portfolio', targetAmount: 8000, currentAmount: 5500, targetDate: new Date('2027-01-01') },
  ];
  await Goal.insertMany(goalDocs);
  console.log(`🎯 Inserted ${goalDocs.length} goals`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASS}`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
