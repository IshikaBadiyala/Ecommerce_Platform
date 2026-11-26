/**
 * Cart Controller
 * ---------------
 * Manages user-specific shopping cart persistence in MongoDB.
 * Ensures authoritative stock checks, subtotal calculations, and user isolation.
 */

const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const {
  findDynamicProductById,
  getDynamicCart,
  saveDynamicCart,
  clearDynamicCart,
} = require('../data/fallbackData');

/**
 * Format cart items for frontend consumption
 */
const formatCartItems = (cartDoc) => {
  if (!cartDoc || !cartDoc.items) {
    return { items: [], subtotal: 0, totalCount: 0 };
  }

  const items = [];
  let subtotal = 0;
  let totalCount = 0;

  for (const item of cartDoc.items) {
    const prod = item.product || {};
    const prodId = prod._id ? prod._id.toString() : (item.product ? item.product.toString() : '');
    const price = typeof prod.price === 'number' ? prod.price : (item.price || 0);
    const quantity = Number(item.quantity) || 1;
    const stock = typeof prod.stock === 'number' ? prod.stock : (item.stock || 0);

    const formattedItem = {
      _id: prodId,
      productId: prodId,
      name: prod.name || item.name || 'Unnamed Product',
      price: price,
      image: prod.image || item.image || '',
      category: prod.category || item.category || 'General',
      stock: stock,
      quantity: quantity,
    };

    items.push(formattedItem);
    subtotal += price * quantity;
    totalCount += quantity;
  }

  return { items, subtotal, totalCount };
};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1 && userId) {
      let cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      } else {
        // Clean up any items whose products were deleted from the database
        const validItems = cart.items.filter((item) => item.product !== null);
        if (validItems.length !== cart.items.length) {
          cart.items = validItems;
          await cart.save();
        }
      }

      const formatted = formatCartItems(cart);
      return res.status(200).json({
        success: true,
        cart: formatted,
      });
    }

    // In-memory fallback
    const rawItems = getDynamicCart(userId);
    const populated = rawItems.map((it) => {
      const prod = findDynamicProductById(it.productId || it.product);
      return {
        ...it,
        product: prod || it.product,
      };
    });

    const formatted = formatCartItems({ items: populated });
    return res.status(200).json({
      success: true,
      cart: formatted,
    });
  } catch (error) {
    console.error('[Get Cart Error]:', error);
    next(error);
  }
};

/**
 * @desc    Add a product to cart (or increment quantity if already present)
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    // Look up product to verify existence and stock
    let product = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(productId)) {
      try {
        product = await Product.findById(productId);
      } catch (err) {}
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

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is currently out of stock.`,
      });
    }

    if (mongoose.connection.readyState === 1 && userId) {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
      );

      if (existingItemIndex > -1) {
        // Prevent duplicate entry: update quantity instead, capped by stock
        const newQty = cart.items[existingItemIndex].quantity + qtyToAdd;
        cart.items[existingItemIndex].quantity = Math.min(newQty, product.stock);
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].stock = product.stock;
      } else {
        // Add new item
        cart.items.push({
          product: product._id,
          quantity: Math.min(qtyToAdd, product.stock),
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          stock: product.stock,
        });
      }

      await cart.save();
      await cart.populate('items.product');

      const formatted = formatCartItems(cart);
      return res.status(200).json({
        success: true,
        message: `"${product.name}" added to cart.`,
        cart: formatted,
      });
    }

    // In-memory fallback
    const rawItems = getDynamicCart(userId);
    const existingIndex = rawItems.findIndex(
      (it) => String(it.productId || it.product) === String(product._id)
    );

    if (existingIndex > -1) {
      const newQty = rawItems[existingIndex].quantity + qtyToAdd;
      rawItems[existingIndex].quantity = Math.min(newQty, product.stock);
      rawItems[existingIndex].price = product.price;
      rawItems[existingIndex].stock = product.stock;
    } else {
      rawItems.push({
        product: product,
        productId: product._id,
        quantity: Math.min(qtyToAdd, product.stock),
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
      });
    }

    saveDynamicCart(userId, rawItems);
    const formatted = formatCartItems({ items: rawItems });

    return res.status(200).json({
      success: true,
      message: `"${product.name}" added to cart.`,
      cart: formatted,
    });
  } catch (error) {
    console.error('[Add To Cart Error]:', error);
    next(error);
  }
};

/**
 * @desc    Update quantity of a specific cart item
 * @route   PUT /api/cart/item
 * @access  Private
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const newQty = Number(quantity);

    if (mongoose.connection.readyState === 1 && userId) {
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId.toString()
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart.',
        });
      }

      if (newQty <= 0) {
        // If quantity is 0 or negative, remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Look up product stock
        const product = await Product.findById(productId);
        const maxStock = product ? product.stock : 99;
        cart.items[itemIndex].quantity = Math.min(newQty, maxStock);
      }

      await cart.save();
      await cart.populate('items.product');

      const formatted = formatCartItems(cart);
      return res.status(200).json({
        success: true,
        message: 'Cart quantity updated.',
        cart: formatted,
      });
    }

    // In-memory fallback
    const rawItems = getDynamicCart(userId);
    const itemIndex = rawItems.findIndex(
      (it) => String(it.productId || it.product) === String(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.',
      });
    }

    if (newQty <= 0) {
      rawItems.splice(itemIndex, 1);
    } else {
      const product = findDynamicProductById(productId);
      const maxStock = product ? product.stock : 99;
      rawItems[itemIndex].quantity = Math.min(newQty, maxStock);
    }

    saveDynamicCart(userId, rawItems);
    const formatted = formatCartItems({ items: rawItems });

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated.',
      cart: formatted,
    });
  } catch (error) {
    console.error('[Update Cart Quantity Error]:', error);
    next(error);
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/item/:productId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
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
      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        cart.items = cart.items.filter(
          (item) => item.product.toString() !== productId.toString()
        );
        await cart.save();
        await cart.populate('items.product');
      }

      const formatted = formatCartItems(cart);
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        cart: formatted,
      });
    }

    // In-memory fallback
    const rawItems = getDynamicCart(userId);
    const updated = rawItems.filter(
      (it) => String(it.productId || it.product) !== String(productId)
    );
    saveDynamicCart(userId, updated);

    const formatted = formatCartItems({ items: updated });
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart: formatted,
    });
  } catch (error) {
    console.error('[Remove From Cart Error]:', error);
    next(error);
  }
};

/**
 * @desc    Clear all items from current user's cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1 && userId) {
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        cart: { items: [], subtotal: 0, totalCount: 0 },
      });
    }

    // In-memory fallback
    clearDynamicCart(userId);
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { items: [], subtotal: 0, totalCount: 0 },
    });
  } catch (error) {
    console.error('[Clear Cart Error]:', error);
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
