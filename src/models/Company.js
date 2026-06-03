const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      required: [true, 'Company ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Company Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    package: {
      type: Number,
      required: [true, 'Package is required'],
    },
    eligibleDepartments: {
      type: [String],
      required: [true, 'Eligible Departments are required'],
      default: [],
    },
    minimumCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: 0,
      max: 10,
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive Date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
