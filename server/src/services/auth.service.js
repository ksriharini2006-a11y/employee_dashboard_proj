// server/src/services/auth.service.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');

// --- Token helpers ---------------------------------------------------

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id, tokenVersion: user.refreshTokenVersion || 0 }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
};

// --- Public service methods -------------------------------------------

exports.register = async ({ fullName, email, password }, res) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ fullName, email, password });
  const accessToken = await issueTokens(user, res);
  return { user: { id: user._id, fullName: user.fullName, email: user.email }, accessToken };
};

exports.login = async ({ email, password }, res) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = await issueTokens(user, res);
  return { user: { id: user._id, fullName: user.fullName, email: user.email }, accessToken };
};

exports.refresh = async (rawRefreshToken, res) => {
  if (!rawRefreshToken) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) throw new ApiError(401, 'Invalid or expired refresh token');

  const isValid = user.refreshTokenHash === hashToken(rawRefreshToken);
  if (!isValid) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const accessToken = await issueTokens(user, res);
  return { user: { id: user._id, fullName: user.fullName, email: user.email }, accessToken };
};

exports.logout = async (rawRefreshToken, res) => {
  if (rawRefreshToken) {
    try {
      const decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1 } });
    } catch (err) {
      // Token already invalid/expired — nothing to revoke
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

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
  user.refreshTokenHash = undefined;
  await user.save();
};