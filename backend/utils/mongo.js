const mongoose = require('mongoose');

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // clean, no extra options needed
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
