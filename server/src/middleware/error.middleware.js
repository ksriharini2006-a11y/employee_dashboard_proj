// server/src/middleware/error.middleware.js
// Catches every error passed via next(err) and formats a consistent response.

const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors } = err;

  // Handle known Mongoose error types so they don't leak raw stack traces
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }
  if (!(err instanceof ApiError) && !statusCode) {
    statusCode = 500;
    message = message || 'Internal server error';
  }

  console.error(err);

  res.status(statusCode || 500).json({
    success: false,
    message: message || 'Internal server error',
    errors: errors || [],
  });
};

module.exports = errorHandler;
