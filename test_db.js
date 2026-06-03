const mongoose = require('mongoose');

const uri = "mongodb+srv://dhanushree:Dhanutara7756@cluster0.b6tdbdy.mongodb.net/pcp_fa6?retryWrites=true&w=majority&appName=Cluster0";

console.log("Connecting to MongoDB...");
mongoose.connect(uri)
  .then(() => {
    console.log("Mongoose connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Mongoose connection failed:", err);
    process.exit(1);
  });
