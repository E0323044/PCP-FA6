const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    interviewId: {
      type: String,
      required: [true, 'Interview ID is required'],
      unique: true,
      trim: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
    },
    interviewer: {
      type: String,
      required: [true, 'Interviewer name is required'],
      trim: true,
    },
    round: {
      type: String,
      required: [true, 'Round name/number is required'],
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
    },
    result: {
      type: String,
      enum: ['pending', 'pass', 'fail'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
