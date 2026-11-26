/**
 * Wishlist Routes
 * ---------------
 * REST endpoints for user wishlist operations:
 * - GET    /api/wishlist            : Retrieve current user's saved wishlist items
 * - POST   /api/wishlist            : Add product to wishlist
 * - POST   /api/wishlist/toggle     : Toggle product in/out of wishlist
 * - DELETE /api/wishlist/:productId : Remove specific item from wishlist
 * - DELETE /api/wishlist            : Clear all wishlist items
 */

const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All wishlist routes require active JWT authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;
