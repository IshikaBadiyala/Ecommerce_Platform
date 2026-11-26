/**
 * Wishlist Model (Mongoose Schema)
 * --------------------------------
 * Manages user-specific wishlist favorites in MongoDB.
 * Each authenticated user has a single unique Wishlist document.
 */

const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Product',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function () {
  return this.products ? this.products.length : 0;
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
