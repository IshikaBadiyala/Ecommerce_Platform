/**
 * Payment Routes
 * --------------
 * REST endpoints for Razorpay integration:
 * - POST /api/payment/create-order : Generate verified order & Razorpay order
 * - POST /api/payment/verify       : Verify Razorpay HMAC signature & mark PAID
 * - POST /api/payment/webhook      : Handle Razorpay server events (captured/failed)
 * - GET  /api/payment/key          : Retrieve public Razorpay Key ID
 */

const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getRazorpayKey,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/key', getRazorpayKey);

module.exports = router;
