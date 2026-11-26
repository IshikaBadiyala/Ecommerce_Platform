/**
 * Authentication Routes
 * ---------------------
 * Routes for signup, login, session check, logout, and Google sign-in.
 * Includes rate-limiting on sensitive authentication endpoints.
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  signup,
  login,
  getMe,
  logout,
  googleAuth,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter for authentication endpoints: max 15 requests per 15 minutes to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
