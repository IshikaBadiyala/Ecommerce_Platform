/**
 * Wishlist Controller
 * -------------------
 * Manages user-specific wishlist persistence in MongoDB.
 * Ensures user isolation and prevents duplicate favorites.
 */

const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const {
  findDynamicProductById,
  getDynamicWishlist,
  getDynamicWishlistProductIds,
  addToDynamicWishlist,
  removeFromDynamicWishlist,
  clearDynamicWishlist,
} = require('../data/fallbackData');

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1 && userId) {
      let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
      } else {
        // Filter out any products that have been deleted
        const validProducts = wishlist.products.filter((p) => p !== null);
        if (validProducts.length !== wishlist.products.length) {
          wishlist.products = validProducts.map((p) => p._id);
          await wishlist.save();
          await wishlist.populate('products');
        }
      }

      return res.status(200).json({
        success: true,
        wishlist: {
          products: wishlist.products || [],
          itemCount: wishlist.products ? wishlist.products.length : 0,
        },
      });
    }

    // In-memory fallback
    const products = getDynamicWishlist(userId);
    return res.status(200).json({
      success: true,
      wishlist: {
        products,
        itemCount: products.length,
      },
    });
  } catch (error) {
    console.error('[Get Wishlist Error]:', error);
    next(error);
  }
};

/**
 * @desc    Add a product to current user's wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    // Verify product exists
    let product = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(productId)) {
      try {
        product = await Product.findById(productId);
      } catch (e) {}
    }
    if (!product) {
      product = findDynamicProductById(productId);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or has been removed from store.',
      });
    }

    if (mongoose.connection.readyState === 1 && userId) {
      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      // Prevent duplicate wishlist entries
      const alreadyInWishlist = wishlist.products.some(
        (p) => p.toString() === productId.toString()
      );

      if (!alreadyInWishlist) {
        wishlist.products.push(productId);
        await wishlist.save();
      }

      await wishlist.populate('products');

      return res.status(200).json({
        success: true,
        message: `"${product.name}" added to wishlist.`,
        wishlist: {
          products: wishlist.products || [],
          itemCount: wishlist.products ? wishlist.products.length : 0,
        },
      });
    }

    // In-memory fallback
    addToDynamicWishlist(userId, productId);
    const products = getDynamicWishlist(userId);

    return res.status(200).json({
      success: true,
      message: `"${product.name}" added to wishlist.`,
      wishlist: {
        products,
        itemCount: products.length,
      },
    });
  } catch (error) {
    console.error('[Add To Wishlist Error]:', error);
    next(error);
  }
};

/**
 * @desc    Remove a product from current user's wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    if (mongoose.connection.readyState === 1 && userId) {
      const wishlist = await Wishlist.findOne({ user: userId });

      if (wishlist) {
        wishlist.products = wishlist.products.filter(
          (p) => p.toString() !== productId.toString()
        );
        await wishlist.save();
        await wishlist.populate('products');
      }

      const products = wishlist ? wishlist.products : [];
      return res.status(200).json({
        success: true,
        message: 'Product removed from wishlist.',
        wishlist: {
          products: products || [],
          itemCount: products ? products.length : 0,
        },
      });
    }

    // In-memory fallback
    removeFromDynamicWishlist(userId, productId);
    const products = getDynamicWishlist(userId);

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
      wishlist: {
        products,
        itemCount: products.length,
      },
    });
  } catch (error) {
    console.error('[Remove From Wishlist Error]:', error);
    next(error);
  }
};

/**
 * @desc    Toggle a product in current user's wishlist
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    // Verify product exists
    let product = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(productId)) {
      try {
        product = await Product.findById(productId);
      } catch (e) {}
    }
    if (!product) {
      product = findDynamicProductById(productId);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (mongoose.connection.readyState === 1 && userId) {
      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      const exists = wishlist.products.some(
        (p) => p.toString() === productId.toString()
      );

      let action = 'added';
      if (exists) {
        wishlist.products = wishlist.products.filter(
          (p) => p.toString() !== productId.toString()
        );
        action = 'removed';
      } else {
        wishlist.products.push(productId);
      }

      await wishlist.save();
      await wishlist.populate('products');

      return res.status(200).json({
        success: true,
        action,
        message:
          action === 'added'
            ? `"${product.name}" added to wishlist.`
            : `"${product.name}" removed from wishlist.`,
        wishlist: {
          products: wishlist.products || [],
          itemCount: wishlist.products ? wishlist.products.length : 0,
        },
      });
    }

    // In-memory fallback
    const currentIds = getDynamicWishlistProductIds(userId);
    const exists = currentIds.some((id) => String(id) === String(productId));

    let action = 'added';
    if (exists) {
      removeFromDynamicWishlist(userId, productId);
      action = 'removed';
    } else {
      addToDynamicWishlist(userId, productId);
    }

    const products = getDynamicWishlist(userId);
    return res.status(200).json({
      success: true,
      action,
      message:
        action === 'added'
          ? `"${product.name}" added to wishlist.`
          : `"${product.name}" removed from wishlist.`,
      wishlist: {
        products,
        itemCount: products.length,
      },
    });
  } catch (error) {
    console.error('[Toggle Wishlist Error]:', error);
    next(error);
  }
};

/**
 * @desc    Clear all items from current user's wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1 && userId) {
      const wishlist = await Wishlist.findOne({ user: userId });
      if (wishlist) {
        wishlist.products = [];
        await wishlist.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully.',
        wishlist: { products: [], itemCount: 0 },
      });
    }

    // In-memory fallback
    clearDynamicWishlist(userId);
    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully.',
      wishlist: { products: [], itemCount: 0 },
    });
  } catch (error) {
    console.error('[Clear Wishlist Error]:', error);
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
};
