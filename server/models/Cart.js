/**
 * Cart Model (Mongoose Schema)
 * ----------------------------
 * Manages user-specific shopping cart in MongoDB.
 * Each authenticated user has a single unique Cart document.
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    name: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
    },
  },
  { _id: false, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((acc, item) => {
    const itemPrice = typeof item.price === 'number' ? item.price : (item.product?.price || 0);
    return acc + itemPrice * item.quantity;
  }, 0);
});

// Virtual for total item count
cartSchema.virtual('totalCount').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
