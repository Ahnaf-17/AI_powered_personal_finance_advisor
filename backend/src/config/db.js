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
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
