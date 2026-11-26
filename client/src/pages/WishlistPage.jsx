/**
 * WishlistPage Component
 * ----------------------
 * Displays products favorited by the shopper.
 * Allows quick "Move to Cart" or direct product navigation.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, Star, Check, Zap } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movedId, setMovedId] = useState(null);

  const handleMoveToCart = (product) => {
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setMovedId(product._id);
    setTimeout(() => {
      setMovedId(null);
      removeFromWishlist(product._id);
    }, 800);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Explore BuyNest's curated fashion and modern lifestyle collection. Click the heart icon on any product to save it here for later.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={clearWishlist}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Wishlist
        </button>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const originalMrp = Math.round(product.price * 1.45);
          const discountPercent = Math.round(((originalMrp - product.price) / originalMrp) * 100);
          const isMoved = movedId === product._id;

          return (
            <div
              key={product._id}
              className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <Link to={`/products/${product._id}`} className="block w-full h-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product._id)}
                  aria-label="Remove item"
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md text-slate-500 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-md transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Category & Discount */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  <span className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                    {product.category}
                  </span>
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm w-fit">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Stock badge */}
                {isOutOfStock && (
                  <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-800 mb-1">
                    <Zap className="w-3 h-3 fill-emerald-500 text-emerald-600" />
                    <span>Eligible for Free Delivery</span>
                  </div>

                  <Link
                    to={`/products/${product._id}`}
                    className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-emerald-700 transition line-clamp-1"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{originalMrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition ${
                      isMoved
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-emerald-600 text-white active:scale-95'
                    }`}
                  >
                    {isMoved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Moved to Bag!
                      </>
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> Move to Bag
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
