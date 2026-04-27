const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_advisor';

  // Try real MongoDB first (persistent)
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB connected (persistent): ${mongoose.connection.host}`);
    return;
  } catch (_) {
    console.log('⚠️  Real MongoDB unavailable, falling back to in-memory (data will not persist)');
  }

  // Fallback to in-memory
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoms = await MongoMemoryServer.create();
    const memUri = mongoms.getUri();
    await mongoose.connect(memUri);
    console.log('⚡ Using in-memory MongoDB (dev mode)');
    await seedDemoUser();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

async function seedDemoUser() {
  try {
    const User = require('../models/User');
    const exists = await User.findOne({ email: 'demo@finance.app' });
    if (!exists) {
      await User.create({
        name: 'Alex Johnson',
        email: 'demo@finance.app',
        password: 'Demo1234!',
        monthlyIncome: 6000,
        savingsGoal: 1000,
        currency: 'AUD',
      });
      console.log('🌱 Demo user seeded  →  demo@finance.app / Demo1234!');
    }
  } catch (err) {
    console.warn('Seed skipped:', err.message);
  }
}

module.exports = connectDB;
