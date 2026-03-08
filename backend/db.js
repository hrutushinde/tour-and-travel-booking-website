// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // IMPORTANT: Make sure you have a .env file with MONGODB_URI=your_connection_string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlustpro';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;