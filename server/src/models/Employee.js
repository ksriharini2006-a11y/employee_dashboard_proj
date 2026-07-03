// server/src/models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: [0, 'Salary cannot be negative'] },
    joiningDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Text index powers the "search" feature (name, id, email, department, designation)
employeeSchema.index({
  employeeName: 'text',
  employeeId: 'text',
  email: 'text',
  department: 'text',
  designation: 'text',
});

module.exports = mongoose.model('Employee', employeeSchema);
