const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed (non-fatal): ${error.message}`);
    console.log("Server will continue running. Please check your MONGO_URI in .env or Render variables.");
  }
};

module.exports = connectDB;
