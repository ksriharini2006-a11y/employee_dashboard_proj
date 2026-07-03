// server/src/services/auth.service.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '7d',
  });

exports.register = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ fullName, email, password });
  const token = signToken(user);
  return { user: { id: user._id, fullName: user.fullName, email: user.email }, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const token = signToken(user);
  return { user: { id: user._id, fullName: user.fullName, email: user.email }, token };
};

// Step 1 of Forgot Password: generate token, email a reset link.
// Always resolves the same way whether or not the email exists, so we
// don't leak which emails are registered.
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // silently no-op

  const rawToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your Employee Management System password',
    html: `
      <p>Hi ${user.fullName},</p>
      <p>You requested a password reset. Click the link below to set a new password.
      This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

// Step 2 of Forgot Password: verify token, set new password.
exports.resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) throw new ApiError(400, 'Reset link is invalid or has expired');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
