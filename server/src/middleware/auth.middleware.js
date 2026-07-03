// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
