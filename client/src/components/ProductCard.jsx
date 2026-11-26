/**
 * ProductCard Component
 * ---------------------
 * Modern, high-converting product card featuring INR (₹) pricing, MRP discounts,
 * customer ratings, category badges, and animated Add-to-Cart interaction.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Eye, Star, Zap, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isFavorited = isInWishlist(product._id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock <= 0) return;

    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Realistic Indian MRP discount calculation (e.g. 35-45% off)
  const originalMrp = Math.round(product.price * 1.45);
  const discountPercent = Math.round(((originalMrp - product.price) / originalMrp) * 100);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Product Image & Badges */}
      <Link to={`/products/${product._id}`} className="relative block aspect-[4/5] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            {product.category}
          </span>
          {discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm w-fit">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button & Stock Badge on Top Right */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-20">
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isFavorited
                ? 'bg-red-50 text-red-500 scale-105'
                : 'bg-white/90 backdrop-blur-md text-slate-500 hover:text-red-500 hover:bg-white'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isFavorited ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-current'
              }`}
            />
          </button>

          {isOutOfStock ? (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Only {product.stock} left!
            </span>
          ) : null}
        </div>

        {/* Rating Floating Pill */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 text-[11px] font-bold text-slate-800">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>4.8</span>
          <span className="text-[10px] text-slate-600 font-normal">| 120+</span>
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 mb-1">
            <Zap className="w-3 h-3 fill-emerald-500 text-emerald-600" />
            <span>Fast Express Dispatch</span>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-600 line-through">
                ₹{originalMrp.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] font-medium text-emerald-800">
              Free Delivery
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-emerald-600 text-white active:scale-95'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
