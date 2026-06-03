const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    driveId: {
      type: String,
      required: [true, 'Drive ID is required'],
      unique: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Drive Title is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['on-campus', 'off-campus', 'remote'],
      default: 'on-campus',
    },
    location: {
      type: String,
      trim: true,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    rounds: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

const Drive = mongoose.model('Drive', driveSchema);

module.exports = Drive;
