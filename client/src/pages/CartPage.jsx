/**
 * CartPage Component
 * ------------------
 * Interactive shopping cart displaying line items, quantities, subtotal calculations in INR (₹),
 * and navigation to the checkout flow.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal, cartTotalCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Free shipping threshold for India: Free if >= ₹999, else ₹99 flat
  const freeShippingThreshold = 999;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal + shippingFee;
  const amountNeededForFreeShipping = freeShippingThreshold - cartSubtotal;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your shopping cart is empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
            You haven't added any products to your bag yet. Explore our trendy women's tops, hoodies, and purses!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Free Shipping Progress Alert */}
      {amountNeededForFreeShipping > 0 ? (
        <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Add items worth <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Delivery</strong>!
            </span>
          </div>
          <Link to="/" className="font-bold underline text-amber-950 hover:text-amber-800">
            Add More
          </Link>
        </div>
      ) : (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>🎉 Congratulations! You have unlocked <strong>FREE Express Delivery</strong> across India!</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have {cartTotalCount} {cartTotalCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear all items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
            >
              {/* Product Thumbnail */}
              <Link to={`/products/${item._id}`} className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center"
                />
              </Link>

              {/* Product Meta */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {item.category}
                </span>
                <Link
                  to={`/products/${item._id}`}
                  className="block text-sm font-semibold text-slate-900 hover:text-emerald-700 transition line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit Price: ₹{Number(item.price).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={item.stock && item.quantity >= item.stock}
                  className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line Item Total */}
              <div className="text-right sm:w-28">
                <span className="text-sm font-bold text-slate-900 block">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item._id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Order Summary Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Price Details</h3>

          <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Items Total ({cartTotalCount} items)</span>
              <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>
                {shippingFee === 0 ? (
                  <strong className="text-emerald-600">FREE</strong>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Option</span>
              <span className="font-semibold text-slate-900">Cash on Delivery</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-bold text-slate-900">Total Payable Amount</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/checkout');
              } else {
                navigate('/login?redirect=/checkout');
              }
            }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-95"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Safe & Secure Indian COD Checkout</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
