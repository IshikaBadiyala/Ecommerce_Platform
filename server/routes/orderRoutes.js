/**
 * Order Routes
 * ------------
 * Endpoints for placing orders and viewing order history.
 * All order routes require authenticated user session.
 */

const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders,
} = require('../controllers/orderController');
const {
  createPaymentOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
// Razorpay payment endpoints (maintained for backwards compatibility)
router.post('/razorpay/create-order', protect, createPaymentOrder);
router.post('/razorpay/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
