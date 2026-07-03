// server/src/utils/apiError.js
// A custom Error class so we can throw errors with an HTTP status code
// attached, and let the centralized error middleware format the response.

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = ApiError;
