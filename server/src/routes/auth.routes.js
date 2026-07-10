// server/src/routes/auth.routes.js
const router = require('express').Router();
const validate = require('../middleware/validate.middleware');
const authValidator = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, validate(authValidator.register), authController.register);
router.post('/login', authLimiter, validate(authValidator.login), authController.login);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(authValidator.forgotPassword),
  authController.forgotPassword
);
router.post('/reset-password/:token', validate(authValidator.resetPassword), authController.resetPassword);

module.exports = router;