/**
 * Order Model (Mongoose Schema)
 * -----------------------------
 * Represents customer purchases on BUYNEST.
 * Includes complete lifecycle status tracking, delivery timeline,
 * return requests, and Razorpay payment details.
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    locality: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const timelineStepSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
    },
    customer: {
      type: customerSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (val) => val && val.length > 0,
        'An order must contain at least one item',
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    appliedCoupon: {
      code: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'Pending', 'Paid', 'Failed'],
      default: 'PENDING',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    stockDeducted: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        'Placed',
        'Confirmed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Returned',
        'Pending',
      ],
      default: 'Placed',
    },
    timeline: {
      type: [timelineStepSchema],
      default: function () {
        return [
          {
            status: 'Placed',
            title: 'Order Placed',
            description: 'We have received your order.',
            timestamp: new Date(),
            completed: true,
          },
          {
            status: 'Confirmed',
            title: 'Order Confirmed',
            description: 'Seller has confirmed your order.',
            timestamp: new Date(),
            completed: true,
          },
          {
            status: 'Processing',
            title: 'Processing & Packing',
            description: 'Item is being inspected and packed at fulfillment center.',
            timestamp: null,
            completed: false,
          },
          {
            status: 'Shipped',
            title: 'Shipped',
            description: 'Package handed over to BUYNEST Express Logistics.',
            timestamp: null,
            completed: false,
          },
          {
            status: 'Out for Delivery',
            title: 'Out for Delivery',
            description: 'Courier agent is on the way to your delivery address.',
            timestamp: null,
            completed: false,
          },
          {
            status: 'Delivered',
            title: 'Delivered',
            description: 'Package delivered successfully.',
            timestamp: null,
            completed: false,
          },
        ];
      },
    },
    estimatedDelivery: {
      type: Date,
      default: function () {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return d;
      },
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: function () {
        return `BN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      },
    },
    courier: {
      type: String,
      default: 'BUYNEST Express Logistics',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    returnRequest: {
      status: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'],
        default: 'None',
      },
      reason: { type: String, default: null },
      requestedAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
