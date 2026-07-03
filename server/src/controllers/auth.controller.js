// server/src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, 201, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, 200, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    // Same message regardless of whether the email exists (avoid leaking data)
    return success(res, 200, null, 'If that email is registered, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.params.token, req.body.password);
    return success(res, 200, null, 'Password has been reset successfully');
  } catch (err) {
    next(err);
  }
};
