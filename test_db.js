require('dotenv').config();
const mongoose = require('mongoose');

console.log("Connecting to MongoDB with URI from .env...");
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Mongoose connection failed:", err.message);
    process.exit(1);
  });
