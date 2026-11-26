/**
 * Product Routes
 * --------------
 * Public browsing routes, protected review submission, and admin CRUD routes.
 */

const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for all visitors
router.get('/', getProducts);
router.get('/:id', getProductById);

// Review routes (Submit & Delete)
router.post('/:id/reviews', protect, createProductReview);
router.delete('/:productId/reviews/:reviewId', protect, deleteProductReview);

// Protected routes reserved strictly for store administrators
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
