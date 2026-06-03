require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    let documentCount = 0;
    try {
      const Student = require('./models/Student');
      const Company = require('./models/Company');
      const Drive = require('./models/Drive');
      const Application = require('./models/Application');
      const Interview = require('./models/Interview');
      if (isConnected) {
        documentCount = await Student.countDocuments() + 
                        await Company.countDocuments() + 
                        await Drive.countDocuments() + 
                        await Application.countDocuments() + 
                        await Interview.countDocuments();
      }
    } catch (e) {
      // models not registered yet or connection closed
    }
    res.status(200).json({
      success: true,
      database: isConnected ? "connected" : "disconnected",
      documentCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
