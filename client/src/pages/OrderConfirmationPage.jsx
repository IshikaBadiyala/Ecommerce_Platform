/**
 * OrderConfirmationPage Component
 * ------------------------------
 * Success confirmation screen with INR (₹) receipt details and unique order reference.
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, ArrowRight, ShoppingBag, Banknote } from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (order) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await orderAPI.getOrderById(id);
        setOrder(response.data.order);
      } catch (err) {
        console.error('Failed to load order receipt:', err);
        setError(err.message || 'Unable to retrieve order confirmation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, order]);

  if (loading) {
    return <LoadingSpinner text="Retrieving confirmed order receipt..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'Unable to locate order information.'}</p>
        <Link
          to="/"
          className="inline-block bg-slate-900 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden p-6 sm:p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Order Successfully Placed!
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-2">
          Thank you for shopping with BuyNest!
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          We’ve received your order and are dispatching it for delivery. You can pay via Cash or UPI at your doorstep.
        </p>

        {/* Order Identifier Tag */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs">
          <span className="text-slate-400">Order Reference ID:</span>
          <strong className="text-slate-900 font-mono font-bold tracking-wider">
            {order.orderNumber}
          </strong>
        </div>

        {/* Details Grid */}
        <div className="mt-8 border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs">
          {/* Shipping Address */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address
            </h4>
            <p className="font-semibold text-slate-900">{order.customer.name}</p>
            <p className="text-slate-600">{order.customer.address}</p>
            <p className="text-slate-600">
              {order.customer.city} — {order.customer.postalCode}
            </p>
            <p className="text-slate-500 mt-1">Mobile: +91 {order.customer.phone}</p>
          </div>

          {/* Payment & Status */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Payment & Status
            </h4>
            <p className="text-slate-600">
              Payment Mode: <strong className="text-slate-900">{order.paymentMethod || 'Cash on Delivery (COD)'}</strong>
            </p>
            <p className="text-slate-600 mt-1 flex items-center gap-2">
              Payment Status:
              {order.isPaid || order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid' ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ PAID (Razorpay Verified)
                </span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {order.paymentStatus || 'Pending'}
                </span>
              )}
            </p>
            {order.razorpayPaymentId && (
              <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg text-[11px] mt-2 font-mono font-semibold">
                Transaction ID: {order.razorpayPaymentId}
              </p>
            )}
            {order.razorpayOrderId && (
              <p className="text-slate-500 text-[10px] mt-1 font-mono">
                Razorpay Order ID: {order.razorpayOrderId}
              </p>
            )}
            <p className="text-slate-500 mt-1">
              Placed On: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Line Items Receipt in INR */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Items Ordered
          </h4>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Total in INR */}
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-baseline text-sm font-bold text-slate-900">
            <span>Total Payable Amount (COD):</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ₹{Number(order.totalAmount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-sm"
          >
            <Package className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl text-xs transition"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationPage;
