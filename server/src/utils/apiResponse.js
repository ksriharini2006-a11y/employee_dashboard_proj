// server/src/utils/apiResponse.js
// Standard response shape used across the whole API (matches KT doc 3.5)

exports.success = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({ success: true, data, message });
};

exports.error = (res, statusCode, message = 'Something went wrong', errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
