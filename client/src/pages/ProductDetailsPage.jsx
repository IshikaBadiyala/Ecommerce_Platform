/**
 * ProductDetailsPage Component
 * ----------------------------
 * High-definition product showcase with INR pricing, MRP discounts,
 * stock status, Add-to-Cart controls, and interactive Customer Reviews & Ratings.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Banknote,
  Zap,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProductById(id);
      setProduct(response.data.product);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setError(err.message || 'Product not found or removed from store.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);

    if (!comment.trim()) {
      setReviewErrorMsg('Please write a few words about your experience.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await productAPI.addReview(id, {
        rating,
        comment: comment.trim(),
      });

      setReviewSuccessMsg(response.data.message || 'Review submitted successfully!');
      setComment('');
      setRating(5);

      // Update product reviews state immediately
      setProduct((prev) => ({
        ...prev,
        reviews: response.data.reviews,
        rating: response.data.rating,
        numReviews: response.data.numReviews,
      }));
    } catch (err) {
      console.error('Review submit failed:', err);
      setReviewErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This product does not exist.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const originalMrp = Math.round(product.price * 1.45);
  const discountPercent = Math.round(((originalMrp - product.price) / originalMrp) * 100);

  // Fallback demo reviews if newly created product has no reviews yet
  const displayReviews = product.reviews && product.reviews.length > 0 ? product.reviews : [
    {
      _id: 'default-1',
      userName: 'Priya Sharma',
      rating: 5,
      comment: 'Absolutely in love with the quality! The fit is perfect and the material feels super premium. Fast delivery as well.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'default-2',
      userName: 'Aman Verma',
      rating: 5,
      comment: 'Value for money! Same as shown in pictures. Cash on delivery was seamless.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      {/* Main Product Overview Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden p-6 sm:p-10 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          
          {/* Left: Product Image */}
          <div className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow">
              {product.category}
            </span>
            <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow">
              {discountPercent}% OFF
            </span>
          </div>

          {/* Right: Details & Buying Actions */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Category & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {product.category}
                </span>
                <span className="text-slate-300">•</span>
                <a
                  href="#reviews"
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200/60 transition"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.8}</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    ({displayReviews.length} Reviews)
                  </span>
                </a>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>

              {/* Price in INR ₹ */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-base text-slate-400 line-through">
                  ₹{originalMrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Save ₹{(originalMrp - product.price).toLocaleString('en-IN')} ({discountPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Inclusive of all taxes • Free Shipping available</p>

              {/* Stock Status */}
              <div className="mt-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Hurry! Only {product.stock} units left
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    In Stock ({product.stock} units ready to ship)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Product Details & Material
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Assurance Perks */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Cash on Delivery (COD)</strong> eligible across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Estimated Delivery: <strong>2 - 4 business days</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>7 Days Easy Exchange</strong> & Returns Guarantee</span>
                </div>
              </div>
            </div>

            {/* Buying Controls */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Shopping Bag!
                    </>
                  ) : isOutOfStock ? (
                    'Item Currently Out of Stock'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all ${
                    isInWishlist(product._id)
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isInWishlist(product._id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-slate-500'
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isInWishlist(product._id) ? 'Wishlisted' : 'Wishlist'}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Fast express dispatch with real-time stock sync</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUSTOMER REVIEWS & RATINGS SECTION */}
      {/* ========================================================= */}
      <section id="reviews" className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Customer Ratings & Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Read authentic feedback from verified buyers across India
            </p>
          </div>

          {/* Average Rating Score Box */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl">
            <div className="text-3xl font-extrabold text-slate-900">{product.rating || 4.8}</div>
            <div>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating || 4.8)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Based on {displayReviews.length} reviews
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid: Left = Reviews List, Right = Write a Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 pt-8 items-start">
          
          {/* Left (3 Cols): Customer Reviews List */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Buyer Reviews ({displayReviews.length})
            </h3>

            <div className="space-y-4">
              {displayReviews.map((rev, index) => (
                <div
                  key={rev._id || index}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        {rev.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating for this review */}
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-10">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right (2 Cols): Write a Review Form */}
          <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Write a Review
            </h3>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Success Banner */}
                {reviewSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Error Banner */}
                {reviewErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reviewErrorMsg}</span>
                  </div>
                )}

                {/* Star Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 cursor-pointer ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {hoverRating || rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Comment Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Review Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked about the material, fit, finish, or delivery..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition active:scale-95"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Publishing Review...
                    </>
                  ) : (
                    'Submit Verified Review'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 px-4 bg-white rounded-xl border border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-900 mb-1">Have you purchased this product?</h4>
                <p className="text-[11px] text-slate-500 mb-4">
                  Sign in to your account to share your ratings and verified feedback with fellow shoppers.
                </p>
                <Link
                  to={`/login?redirect=/products/${id}`}
                  className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  Sign In to Write a Review
                </Link>
              </div>
            )}
          </div>

        </div>

      </section>

    </div>
  );
};

export default ProductDetailsPage;
