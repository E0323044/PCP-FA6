const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: [true, 'Application ID is required'],
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: [true, 'Drive reference is required'],
    },
    currentRound: {
      type: String,
      default: 'Aptitude Test',
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'selected', 'rejected'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only apply to a drive once (index)
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
