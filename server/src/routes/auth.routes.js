// server/src/routes/auth.routes.js
const router = require('express').Router();
const validate = require('../middleware/validate.middleware');
const authValidator = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);

// Forgot Password module
router.post('/forgot-password', validate(authValidator.forgotPassword), authController.forgotPassword);
router.post('/reset-password/:token', validate(authValidator.resetPassword), authController.resetPassword);

module.exports = router;
