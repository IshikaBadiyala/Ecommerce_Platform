/**
 * MyOrdersPage Component
 * ----------------------
 * Protected view allowing customer to track their past orders with INR (₹) amounts.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Calendar, ShoppingBag, ExternalLink } from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      setLoading(true);
      try {
        const response = await orderAPI.getMyOrders();
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Unable to load orders history.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving your order history..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Order History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your previous purchases, receipt details, and shipment status
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">No Orders Placed Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            You haven't placed any orders with this account yet. When you buy items via Cash on Delivery, they will appear here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Order Reference
                    </span>
                    <strong className="text-slate-900 font-mono font-bold">
                      {order.orderNumber}
                    </strong>
                  </div>
                  <div className="hidden sm:block border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Date Placed
                    </span>
                    <span className="text-slate-700 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {order.status}
                  </span>
                  <Link
                    to={`/order-success/${order._id}`}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1"
                  >
                    View Receipt <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="border-t border-slate-100 mt-4 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>
                      Payment: <strong className="text-slate-800">{order.paymentMethod || 'Cash on Delivery (COD)'}</strong>
                    </span>
                    {order.isPaid || order.paymentStatus === 'Paid' ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        PAID
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 mr-2">Total Amount:</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
