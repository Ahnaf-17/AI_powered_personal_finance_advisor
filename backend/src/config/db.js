const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri === 'mongodb://localhost:27017/finance_advisor') {
      // No real MongoDB — spin up an in-memory instance for local dev
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoms = await MongoMemoryServer.create();
      uri = mongoms.getUri();
      console.log('⚡ Using in-memory MongoDB (dev mode)');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
