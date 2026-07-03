// server/src/validators/employee.validator.js
const Joi = require('joi');

// Reusable rules
const phoneRule = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .messages({ 'string.pattern.base': 'Phone number must contain exactly 10 digits' });

const salaryRule = Joi.number()
  .positive()
  .messages({ 'number.base': 'Salary must be a number', 'number.positive': 'Salary must be greater than 0' });

exports.create = Joi.object({
  employeeName: Joi.string().trim().min(2).max(100).required(),
  employeeId: Joi.string().trim().required(),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phoneNumber: phoneRule.required(),
  department: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  salary: salaryRule.required(),
  joiningDate: Joi.date().required().messages({ 'date.base': 'Joining date must be a valid date' }),
});

// Update allows partial fields but each provided field is still validated
exports.update = Joi.object({
  employeeName: Joi.string().trim().min(2).max(100),
  employeeId: Joi.string().trim(),
  email: Joi.string().trim().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phoneNumber: phoneRule,
  department: Joi.string().trim(),
  designation: Joi.string().trim(),
  salary: salaryRule,
  joiningDate: Joi.date().messages({ 'date.base': 'Joining date must be a valid date' }),
}).min(1);

// Query params for GET /employees (search, filter, date filter, pagination)
exports.listQuery = Joi.object({
  search: Joi.string().trim().allow(''),
  department: Joi.string().trim().allow(''),
  designation: Joi.string().trim().allow(''),
  joiningDateFrom: Joi.date().allow(''),
  joiningDateTo: Joi.date().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
