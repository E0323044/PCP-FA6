const mongoose = require('mongoose');

// ============================================================
// UPDATE THIS SCHEMA after fetching dataset from the API
// This is a generic template — add your actual fields below
// ============================================================
const itemSchema = new mongoose.Schema(
  {
    // --- REPLACE these fields with actual dataset fields ---
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    // Add more fields based on the actual API dataset
    // Example:
    // age: { type: Number, min: 0 },
    // department: { type: String, trim: true },
    // score: { type: Number },

    // Metadata fields
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicates — update field as needed
itemSchema.index({ email: 1 }, { unique: true, sparse: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
