/**
 * Cart Routes
 * -----------
 * REST endpoints for user shopping cart operations:
 * - GET    /api/cart                : Retrieve current user's cart
 * - POST   /api/cart                : Add product to cart (or increment quantity)
 * - PUT    /api/cart/item           : Update product quantity (+ / -)
 * - DELETE /api/cart/item/:productId : Remove specific item from cart
 * - DELETE /api/cart                : Clear all items from cart
 */

const express = require('express');
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes require active JWT authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/item', updateCartQuantity);
router.delete('/item/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
