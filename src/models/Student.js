const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      uppercase: true,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot be greater than 10'],
    },
    skills: {
      type: [String],
      default: [],
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation Year is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'placed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
