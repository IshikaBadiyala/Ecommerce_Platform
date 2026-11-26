/**
 * CheckoutPage Component
 * ----------------------
 * Full-featured Payment Gateway with Razorpay Integration and Indian Payment UI.
 * Matches official Indian e-commerce checkout standards (Google Pay, UPI, Cards, Net Banking,
 * Wallets, Pay Later, EMI, and Cash on Delivery).
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderAPI, paymentAPI } from '../services/api';
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Banknote,
  CreditCard,
  Smartphone,
  Wallet,
  Clock,
  Landmark,
  Percent,
  Gift,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Coins,
  Receipt,
  Sparkles,
  RefreshCw,
  XCircle,
  Lock,
} from 'lucide-react';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Step state: 'address' or 'payment'
  const [activeStep, setActiveStep] = useState('payment');

  // Customer Delivery Information with Persistent LocalStorage
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_saved_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || user?.name || '',
          email: parsed.email || user?.email || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          city: parsed.city || '',
          postalCode: parsed.postalCode || '',
        };
      }
    } catch (e) {}
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    };
  });

  // Keep name & email synced with user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Persist address changes to localStorage automatically
  useEffect(() => {
    try {
      if (formData.name || formData.phone || formData.address) {
        localStorage.setItem('nexora_saved_address', JSON.stringify(formData));
      }
    } catch (e) {}
  }, [formData]);

  // Selected Payment Method
  // Options: 'gpay', 'upi', 'card', 'wallet', 'paylater', 'emi', 'netbanking', 'cod'
  const [selectedMethod, setSelectedMethod] = useState('gpay');

  // Accordion open/close state for other payment options
  const [expandedOption, setExpandedOption] = useState(null);

  // NexoraCash currency checkbox (from reference screenshot)
  const [useNexoraCash, setUseNexoraCash] = useState(false);
  const nexoraCashAmount = 40;

  // Gift Card code & discount
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftDiscount, setAppliedGiftDiscount] = useState(0);
  const [giftCardSuccess, setGiftCardSuccess] = useState('');
  const [giftCardError, setGiftCardError] = useState('');

  // UI and Payment states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Connecting to Razorpay Secure Gateway...');
  const [paymentFailedState, setPaymentFailedState] = useState({
    isFailed: false,
    reason: '',
    orderId: null,
    paymentId: null,
  });

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Add items to your bag before proceeding to payment.
        </p>
        <Link
          to="/"
          className="inline-block bg-slate-900 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  // Calculations
  const shippingFee = cartSubtotal >= 999 ? 0 : 99;
  const cashDiscount = useNexoraCash ? nexoraCashAmount : 0;
  const totalDiscount = cashDiscount + appliedGiftDiscount;
  const grandTotal = Math.max(1, cartSubtotal + shippingFee - totalDiscount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyGiftCard = (e) => {
    e.preventDefault();
    setGiftCardError('');
    setGiftCardSuccess('');

    const cleanCode = giftCardCode.trim().toUpperCase();
    if (!cleanCode) {
      setGiftCardError('Please enter a valid gift card or promo code.');
      return;
    }

    if (cleanCode === 'BUYNEST100' || cleanCode === 'NEXORA100' || cleanCode === 'VIVA100' || cleanCode === 'FASHION50') {
      const discount = cleanCode === 'FASHION50' ? 50 : 100;
      setAppliedGiftDiscount(discount);
      setGiftCardSuccess(`Promo code "${cleanCode}" applied! ₹${discount} deducted.`);
    } else {
      setGiftCardError('Invalid or expired gift card code. Try code: BUYNEST100');
    }
  };

  const validateShippingDetails = () => {
    const { name, email, phone, address, city, postalCode } = formData;
    if (!name || !email || !phone || !address || !city || !postalCode) {
      setErrorMessage('Please complete all delivery address and contact fields.');
      return false;
    }
    if (phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (postalCode.trim().length < 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN Code.');
      return false;
    }
    return true;
  };

  // Human-readable method name for order record
  const getMethodDisplayName = (methodKey) => {
    switch (methodKey) {
      case 'gpay':
        return 'Google Pay (Razorpay)';
      case 'upi':
        return 'UPI / Any App (Razorpay)';
      case 'card':
        return 'Credit/Debit Card (Razorpay)';
      case 'wallet':
        return 'Online Wallet (Razorpay)';
      case 'paylater':
        return 'Pay Later (Razorpay)';
      case 'emi':
        return 'EMI Payment (Razorpay)';
      case 'netbanking':
        return 'Net Banking (Razorpay)';
      case 'cod':
        return 'Cash on Delivery (COD)';
      default:
        return 'Razorpay Online';
    }
  };

  // Ensure Razorpay SDK script is loaded and ready without hanging
  const ensureRazorpayLoaded = () => {
    return new Promise((resolve) => {
      if (typeof window.Razorpay === 'function') {
        return resolve(true);
      }
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (typeof window.Razorpay === 'function') {
          clearInterval(interval);
          return resolve(true);
        }
        if (attempts >= 15) {
          clearInterval(interval);
          if (typeof window.Razorpay === 'function') {
            return resolve(true);
          }
          // Inject script if missing
          const existingScript = document.getElementById('razorpay-checkout-script');
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(typeof window.Razorpay === 'function');
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          } else {
            resolve(typeof window.Razorpay === 'function');
          }
        }
      }, 100);
    });
  };

  // Handle Order Submission
  const handleProceedPayment = async () => {
    // Prevent duplicate payment requests from rapid multi-clicking
    if (loading || paymentProcessing) return;

    setErrorMessage(null);
    setPaymentFailedState({ isFailed: false, reason: '', orderId: null, paymentId: null });

    if (!validateShippingDetails()) {
      setActiveStep('address');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    // 1. CASH ON DELIVERY (COD) HANDLER
    if (selectedMethod === 'cod') {
      try {
        const orderPayload = {
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
          },
          items: cartItems.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
          discount: totalDiscount,
          paymentMethod: 'Cash on Delivery (COD)',
        };

        const response = await orderAPI.createOrder(orderPayload);
        const createdOrder = response.data.order;

        clearCart();
        navigate(`/order-success/${createdOrder._id}`, { state: { order: createdOrder } });
      } catch (err) {
        console.error('Failed to submit COD order:', err);
        setErrorMessage(err.message || 'Failed to place COD order.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. OFFICIAL RAZORPAY STANDARD CHECKOUT HANDLER
    try {
      setPaymentProcessing(true);
      setProcessingMessage('Initialising secure Razorpay session...');

      // Ensure checkout script is loaded
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection.');
      }

      setProcessingMessage('Calculating authoritative order amount & generating order...');

      // Call backend POST /api/payment/create-order
      const createOrderRes = await paymentAPI.createOrder({
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
        },
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        discount: totalDiscount,
      });

      const { orderId, amount, currency, keyId } = createOrderRes.data;

      if (!orderId || !keyId) {
        throw new Error('Server returned incomplete payment parameters (missing Order ID or Key ID).');
      }

      setProcessingMessage('Opening official Razorpay Checkout window...');

      // Configure official Razorpay Standard Checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'BuyNest Store',
        description: `Order Payment — ${getMethodDisplayName(selectedMethod)}`,
        image: '/favicon.svg',
        order_id: orderId,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        notes: {
          customerAddress: `${formData.address.trim()}, ${formData.city.trim()} - ${formData.postalCode.trim()}`,
          selectedMethod: getMethodDisplayName(selectedMethod),
        },
        theme: {
          color: '#0f172a', // Nexora brand slate
        },
        modal: {
          backdropclose: false,
          escape: true,
          ondismiss: function () {
            setLoading(false);
            setPaymentProcessing(false);
            setPaymentFailedState({
              isFailed: true,
              reason: 'Payment window was closed or cancelled by user.',
              orderId,
            });
            setErrorMessage('Payment was cancelled. You can retry anytime by clicking "Retry Payment".');
          },
        },
        handler: async function (response) {
          // Cryptographic payment verification via POST /api/payment/verify
          try {
            setPaymentProcessing(true);
            setProcessingMessage('Verifying HMAC SHA256 cryptographic signature with bank...');

            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Clear cart ONLY after confirmed server verification
              clearCart();
              const confirmedOrder = verifyRes.data.order;
              navigate(`/order-success/${confirmedOrder._id}`, {
                state: { order: confirmedOrder, paymentId: response.razorpay_payment_id },
              });
            } else {
              throw new Error(verifyRes.data.message || 'Signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment signature verification error:', verifyErr);
            setPaymentFailedState({
              isFailed: true,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              reason: verifyErr.message || 'HMAC SHA256 signature verification rejected by server.',
            });
            setErrorMessage(verifyErr.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
            setPaymentProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (failResp) {
        setLoading(false);
        setPaymentProcessing(false);
        const reason =
          failResp.error?.description ||
          failResp.error?.reason ||
          'Payment declined by bank or card issuer.';
        setPaymentFailedState({
          isFailed: true,
          orderId: failResp.error?.metadata?.order_id || orderId,
          paymentId: failResp.error?.metadata?.payment_id,
          reason,
        });
        setErrorMessage(reason);
      });

      // Clear the overlay before displaying the Razorpay modal
      setPaymentProcessing(false);
      setLoading(false);
      setTimeout(() => {
        rzp.open();
      }, 50);
    } catch (err) {
      console.error('Razorpay Order Error:', err);
      setLoading(false);
      setPaymentProcessing(false);
      const errMsg = err.message || 'Failed to initiate Razorpay checkout.';
      setPaymentFailedState({
        isFailed: true,
        reason: errMsg,
      });
      setErrorMessage(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      
      {/* 1. TOP MYNTRA-STYLE STEP TRACKER */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="uppercase tracking-wider font-extrabold text-[11px]">PAYMENT</span>
          </button>

          {/* Stepper Dots: Bag -> Address -> Payment */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <Link to="/cart" className="flex items-center gap-1 text-emerald-600">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
              <span>Bag</span>
            </Link>
            <span className="w-6 h-0.5 bg-emerald-500"></span>

            <button
              type="button"
              onClick={() => setActiveStep('address')}
              className={`flex items-center gap-1 ${
                activeStep === 'address' ? 'text-slate-900 underline' : 'text-emerald-600'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
              <span>Address</span>
            </button>
            <span className="w-6 h-0.5 bg-emerald-500"></span>

            <button
              type="button"
              onClick={() => setActiveStep('payment')}
              className={`flex items-center gap-1 ${
                activeStep === 'payment' ? 'text-pink-600 font-extrabold' : 'text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold">●</span>
              <span>Payment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: PAYMENT OPTIONS & DELIVERY INFO (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Delivery Address Summary Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="text-xs min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 truncate">Deliver To: {formData.name || 'Set Delivery Address'}</span>
                      {formData.address && formData.phone && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-md border border-emerald-200 flex-shrink-0">
                          Saved Address
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 truncate max-w-xs sm:max-w-md">
                      {formData.address ? `${formData.address}, ${formData.city} - ${formData.postalCode} • +91 ${formData.phone}` : 'Enter your shipping address'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 'address' ? 'payment' : 'address')}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 border border-pink-200 bg-pink-50/50 hover:bg-pink-50 px-3 py-1 rounded-lg transition flex-shrink-0 cursor-pointer"
                >
                  {activeStep === 'address' ? 'Close' : 'Change Address'}
                </button>
              </div>

              {/* Collapsible Address Form */}
              {activeStep === 'address' && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Alex Johnson"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alex@example.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">10-Digit Mobile Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-r-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Street Address, Flat, Building *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Flat 402, Lotus Residency, MG Road"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">City / District *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">6-Digit PIN Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        maxLength={6}
                        placeholder="400001"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (validateShippingDetails()) {
                        try {
                          localStorage.setItem('nexora_saved_address', JSON.stringify(formData));
                        } catch (e) {}
                        setActiveStep('payment');
                        setErrorMessage(null);
                      }
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Save Address & Proceed to Payment</span>
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 1: COUPONS & BANK OFFERS (Matches Screenshot 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">Coupons & Bank Offers</span>
                <button
                  type="button"
                  onClick={() => alert('Available Offers:\n• 10% instant discount on ICICI & HDFC cards\n• ₹100 flat off with code NEXORA100\n• Free Express Shipping on orders above ₹999')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline"
                >
                  View All Offers
                </button>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                  ₹
                </div>
                <div className="text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">No recommended offers available</p>
                  <p className="text-[11px] text-slate-500">You can still explore other available coupons and bank offers.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: MYNTRA/BUYNEST CURRENCIES (Matches Screenshot 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-900 block mb-2">BuyNest Currencies</span>

              <label className="border border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>BuyNestCash</span>
                      <span className="text-[10px] font-normal text-slate-400">ⓘ</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total Active BuyNestCash: <strong className="text-slate-800">₹{nexoraCashAmount}</strong>
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={useNexoraCash}
                  onChange={(e) => setUseNexoraCash(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
              </label>
            </div>

            {/* SECTION 3: RECOMMENDED PAYMENT OPTIONS (Matches Screenshot 2 & 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-900 block">Recommended Payment Options</span>

              {/* Google Pay Item */}
              <div
                onClick={() => setSelectedMethod('gpay')}
                className={`border rounded-2xl p-4 cursor-pointer transition flex flex-col gap-3.5 ${
                  selectedMethod === 'gpay'
                    ? 'border-pink-500 bg-pink-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Google Pay Badge Icon */}
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      <span className="text-xs font-black tracking-tight text-slate-800 flex items-center">
                        <span className="text-blue-500 font-extrabold text-sm mr-0.5">G</span>Pay
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Google Pay</h4>
                      <p className="text-[10px] text-slate-500">Instant UPI via Google Pay & Razorpay Gateway</p>
                    </div>
                  </div>

                  {/* Radio indicator matching reference image */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMethod === 'gpay'
                        ? 'border-pink-600 bg-pink-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedMethod === 'gpay' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </div>

                {/* Prominent Pink Pay Now Button (matching Screenshot 2 & 3) */}
                {selectedMethod === 'gpay' && (
                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    disabled={loading}
                    className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Launching Razorpay...
                      </>
                    ) : (
                      `Pay Now — ₹${grandTotal.toLocaleString('en-IN')}`
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 4: OTHER PAYMENT OPTIONS (Matches Screenshot 2 & 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-900 block mb-1">Other Payment Options</span>

              {/* 1. UPI (Pay via any App) */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'upi' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('upi');
                    setExpandedOption(expandedOption === 'upi' ? null : 'upi');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">UPI (Pay via any App)</h4>
                      <p className="text-[10px] text-slate-400">PhonePe, Google Pay, Paytm, BHIM</p>
                    </div>
                  </div>
                  {expandedOption === 'upi' || selectedMethod === 'upi' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'upi' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      You will be redirected to Razorpay UPI modal where you can scan QR code or enter your UPI ID.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay with UPI — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Credit/Debit Card */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'card' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('card');
                    setExpandedOption(expandedOption === 'card' ? null : 'card');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Credit/Debit Card</h4>
                      <p className="text-[10px] font-semibold text-emerald-600">
                        Upto ₹2,500 discount • 6 offers available
                      </p>
                    </div>
                  </div>
                  {selectedMethod === 'card' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'card' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Razorpay supports Visa, MasterCard, RuPay, Maestro & American Express with RBI-compliant tokenization.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay with Card — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Wallets */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'wallet' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('wallet');
                    setExpandedOption(expandedOption === 'wallet' ? null : 'wallet');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-800">Wallets</h4>
                  </div>
                  {selectedMethod === 'wallet' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'wallet' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Pay using Paytm, PhonePe Wallet, Amazon Pay, or Mobikwik via Razorpay.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay with Wallet — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Pay Later */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'paylater' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('paylater');
                    setExpandedOption(expandedOption === 'paylater' ? null : 'paylater');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-800">Pay Later</h4>
                  </div>
                  {selectedMethod === 'paylater' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'paylater' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Eligible for ICICI PayLater, LazyPay & Simpl credit checkout.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Continue with Pay Later — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 5. EMI */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'emi' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('emi');
                    setExpandedOption(expandedOption === 'emi' ? null : 'emi');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Percent className="w-4 h-4 text-slate-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">EMI</h4>
                      <p className="text-[10px] font-semibold text-emerald-600">
                        Upto ₹5,000 discount • 2 offers available
                      </p>
                    </div>
                  </div>
                  {selectedMethod === 'emi' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'emi' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Credit and debit card EMI options available starting from 3 months to 24 months.
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Proceed to EMI — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 6. Net Banking */}
              <div
                className={`border rounded-xl transition overflow-hidden ${
                  selectedMethod === 'netbanking' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-200'
                }`}
              >
                <div
                  onClick={() => {
                    setSelectedMethod('netbanking');
                    setExpandedOption(expandedOption === 'netbanking' ? null : 'netbanking');
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Landmark className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-bold text-slate-800">Net Banking</h4>
                  </div>
                  {selectedMethod === 'netbanking' ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {selectedMethod === 'netbanking' && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      All major Indian banks supported (SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara).
                    </p>
                    <button
                      type="button"
                      onClick={handleProceedPayment}
                      disabled={loading}
                      className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay with Net Banking — ₹${grandTotal.toLocaleString('en-IN')}`}
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Cash on Delivery (Cash/UPI) */}
              <div
                onClick={() => setSelectedMethod('cod')}
                className={`border rounded-xl p-3.5 cursor-pointer transition flex items-center justify-between ${
                  selectedMethod === 'cod' ? 'border-pink-500 bg-pink-50/20' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-slate-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cash on Delivery (Cash/UPI)</h4>
                    <p className="text-[10px] text-slate-500">Pay cash or scan UPI upon parcel arrival</p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedMethod === 'cod' ? 'border-pink-600 bg-pink-600' : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
              </div>

              {selectedMethod === 'cod' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Placing Order...
                      </>
                    ) : (
                      `Place COD Order — ₹${grandTotal.toLocaleString('en-IN')}`
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 5: HAVE A GIFT CARD (Matches Screenshot 2) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <form onSubmit={handleApplyGiftCard} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Gift className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Have a Gift Card? Enter promo code"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>

                {giftCardSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> {giftCardSuccess}
                  </p>
                )}
                {giftCardError && (
                  <p className="text-[11px] text-red-600 font-medium">{giftCardError}</p>
                )}
              </form>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By placing the order, you agree to Nexora’s{' '}
              <span className="text-slate-600 underline">Terms of Use</span> and{' '}
              <span className="text-slate-600 underline">Privacy Policy</span>.
            </p>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: PRICE DETAILS (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
                Price Details ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items preview list */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total MRP / Subtotal</span>
                  <span className="font-medium text-slate-800">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {useNexoraCash && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>BuyNestCash Discount</span>
                    <span>-₹{cashDiscount}</span>
                  </div>
                )}

                {appliedGiftDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Gift Voucher / Promo</span>
                    <span>-₹{appliedGiftDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-600">FREE</strong>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary Pay Now Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    disabled={loading || paymentProcessing}
                    className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm tracking-wide shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || paymentProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>PAY NOW • ₹{grandTotal.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Payments Powered by Razorpay</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* PAYMENT PROCESSING OVERLAY (Loader) */}
      {/* ========================================================= */}
      {paymentProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">
              Securing Payment
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              {processingMessage}
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>256-bit SSL Bank Verification • Please do not refresh</span>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentProcessing(false);
                  setLoading(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition underline cursor-pointer"
              >
                Cancel and return to checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAYMENT FAILURE SCREEN / MODAL (with Retry Payment) */}
      {/* ========================================================= */}
      {paymentFailedState.isFailed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 text-center border-b border-red-100">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-red-950">
                Payment Incomplete or Declined
              </h3>
              <p className="text-xs text-red-700 mt-1 max-w-xs mx-auto">
                {paymentFailedState.reason || 'Your payment was not completed.'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Transaction Metadata */}
              {(paymentFailedState.orderId || paymentFailedState.paymentId) && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-1 font-mono text-slate-600">
                  {paymentFailedState.orderId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order Ref:</span>
                      <strong className="text-slate-800">{paymentFailedState.orderId}</strong>
                    </div>
                  )}
                  {paymentFailedState.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Ref:</span>
                      <strong className="text-slate-800">{paymentFailedState.paymentId}</strong>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed text-center">
                No money was deducted from your account. If amount was debited, it will be automatically refunded by your bank within 3-5 business days.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleProceedPayment}
                  disabled={loading || paymentProcessing}
                  className="w-full bg-[#ff3f6c] hover:bg-[#e0355e] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs sm:text-sm tracking-wide shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Payment — ₹{grandTotal.toLocaleString('en-IN')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentFailedState({ isFailed: false, reason: '', orderId: null, paymentId: null });
                    setActiveStep('payment');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition text-center cursor-pointer"
                >
                  Choose a Different Payment Method
                </button>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Razorpay Sandbox & Fraud Protection</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckoutPage;
