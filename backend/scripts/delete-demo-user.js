require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const EMAIL = process.argv[2] || 'demo@finance.app';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_advisor')
  .then(async () => {
    const r = await User.deleteOne({ email: EMAIL });
    console.log(`Deleted ${r.deletedCount} user(s) with email: ${EMAIL}`);
    await mongoose.disconnect();
  })
  .catch(err => { console.error(err); process.exit(1); });
