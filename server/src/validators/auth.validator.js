// server/src/validators/auth.validator.js
const Joi = require('joi');

exports.register = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

exports.login = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

exports.forgotPassword = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
});

exports.resetPassword = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});
