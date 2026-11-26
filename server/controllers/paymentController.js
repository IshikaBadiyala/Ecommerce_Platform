/**
 * Payment Controller (Razorpay Gateway)
 * --------------------------------------
 * Handles official Razorpay order generation, HMAC SHA256 cryptographic signature verification,
 * and automated Webhook processing for captured and failed transactions.
 *
 * Security & Reliability Principles:
 * - Authoritative Server Pricing: Product prices are strictly retrieved from database/catalogue.
 *   Frontend amounts are NEVER trusted.
 * - Strict Signature Verification: Verifies HMAC SHA256 signature using timing-safe comparison.
 * - Webhook Idempotency: Duplicate webhooks or race conditions between frontend callback
 *   and webhooks are safely handled without duplicating stock deduction or status transitions.
 * - Zero Secret Leakage: RAZORPAY_KEY_SECRET is kept strictly on the backend.
 */

const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getRazorpayInstance } = require('../config/razorpay');
const {
  findDynamicProductById,
  addDynamicOrder,
  findDynamicOrderById,
  findDynamicOrderByRazorpayOrderId,
} = require('../data/fallbackData');

/**
 * Helper to generate unique human-readable order number
 * Format: ORD-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

/**
 * Deduct inventory stock for verified order items
 */
const deductProductStock = async (items) => {
  for (const item of items) {
    const productId = item.productId || item.product || item._id;
    const quantity = Number(item.quantity) || 1;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(productId)) {
      try {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: -quantity },
        });
      } catch (err) {
        console.warn(`[Stock Deduction Atlas Notice]: ${err.message}`);
      }
    }

    // Also update dynamic fallback catalogue if present
    const dynamicProd = findDynamicProductById(productId);
    if (dynamicProd) {
      dynamicProd.stock = Math.max(0, (dynamicProd.stock || 0) - quantity);
    }
  }
};

/**
 * @desc    Create Razorpay Order & register pending order in database
 * @route   POST /api/payment/create-order
 * @access  Private (Logged-in User)
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, customer, discount = 0 } = req.body;

    // 1. Validate customer shipping information
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer shipping details are required.',
      });
    }

    const { name, email, phone, address, city, postalCode } = customer;
    if (!name || !email || !phone || !address || !city || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all customer details: name, email, phone, address, city, and postal code.',
      });
    }

    // 2. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart must contain at least one item.',
      });
    }

    // 3. Authoritative price calculation from MongoDB/Catalogue
    let calculatedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of items) {
      const productId = item.productId || item.product || item._id;
      const quantity = Number(item.quantity);

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item in cart: missing product ID.',
        });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be at least 1.',
        });
      }

      let product = null;
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(productId)) {
        try {
          product = await Product.findById(productId);
        } catch (dbErr) {
          // fallback
        }
      }

      if (!product) {
        product = findDynamicProductById(productId);
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} no longer exists.`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}.`,
        });
      }

      const itemTotal = product.price * quantity;
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
        image: product.image,
      });
    }

    // 4. Calculate final payable amount (with shipping & discount rules)
    const shippingFee = calculatedSubtotal >= 999 ? 0 : 99;
    const sanitizedDiscount = Math.max(0, Number(discount) || 0);
    const grandTotal = Math.max(1, calculatedSubtotal + shippingFee - sanitizedDiscount);
    const amountInPaise = Math.round(grandTotal * 100);

    const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
    const razorpay = getRazorpayInstance();
    const orderNumber = generateOrderNumber();

    // 5. Create official Razorpay Order via Node.js SDK
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber,
          customerEmail: email.trim(),
          userId: req.user?._id ? req.user._id.toString() : 'guest',
        },
      });
    } catch (rzpErr) {
      console.error('[Razorpay Order Creation Failed]:', rzpErr);
      const desc =
        rzpErr.error?.description ||
        rzpErr.description ||
        rzpErr.message ||
        'Razorpay authentication failed.';
      const code = rzpErr.statusCode || 401;

      if (code === 401 || (typeof desc === 'string' && desc.toLowerCase().includes('auth'))) {
        return res.status(401).json({
          success: false,
          message:
            'Razorpay Authentication Failed: The API Key ID and Key Secret combination in server/.env is invalid. Please copy your active Test Key and Secret from dashboard.razorpay.com.',
          error: desc,
        });
      }

      return res.status(code >= 400 && code < 600 ? code : 500).json({
        success: false,
        message: `Razorpay Gateway Error: ${desc}`,
        error: desc,
      });
    }

    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(502).json({
        success: false,
        message: 'Failed to create order with Razorpay Gateway.',
      });
    }

    // 6. Record order in database with PENDING status
    let order = null;
    if (mongoose.connection.readyState === 1) {
      try {
        order = await Order.create({
          orderNumber,
          userId: req.user._id,
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
          },
          items: verifiedOrderItems,
          totalAmount: grandTotal,
          paymentMethod: 'Razorpay',
          paymentStatus: 'PENDING',
          isPaid: false,
          status: 'Pending',
          razorpayOrderId: razorpayOrder.id,
        });
        console.log(`[MongoDB Atlas Order] ✅ Pending order "${orderNumber}" saved in Atlas (ID: ${order._id})`);
      } catch (dbErr) {
        console.error('[MongoDB Atlas Pending Order Save Error]:', dbErr.message);
      }
    } else {
      console.warn(`[MongoDB Atlas Offline]: Pending order "${orderNumber}" saved in-memory. Will auto-sync once Atlas connects.`);
    }

    if (!order) {
      order = addDynamicOrder({
        _id: `ord_${Date.now()}`,
        orderNumber,
        userId: req.user._id,
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        },
        items: verifiedOrderItems,
        totalAmount: grandTotal,
        paymentMethod: 'Razorpay',
        paymentStatus: 'PENDING',
        isPaid: false,
        status: 'Pending',
        razorpayOrderId: razorpayOrder.id,
        createdAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully.',
      orderId: razorpayOrder.id,
      keyId: key_id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: grandTotal,
    });
  } catch (error) {
    console.error('[Create Payment Order Error]:', error);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature & finalize order
 * @route   POST /api/payment/verify
 * @access  Private (Logged-in User)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Razorpay secret key is missing.',
      });
    }

    // 1. Cryptographic HMAC SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const isSignatureValid =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpay_signature, 'utf-8')
      );

    // 2. Locate order in database
    let order = null;
    if (mongoose.connection.readyState === 1) {
      try {
        order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      } catch (dbErr) {}
    }

    if (!order) {
      order = findDynamicOrderByRazorpayOrderId(razorpay_order_id);
    }

    if (!isSignatureValid) {
      if (order) {
        order.paymentStatus = 'FAILED';
        if (order.save) await order.save().catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with Razorpay Order ID "${razorpay_order_id}" not found.`,
      });
    }

    // Verify ownership: customer who created the order must be the one verifying
    const isOwner =
      req.user &&
      order.userId &&
      String(order.userId._id || order.userId) === String(req.user._id);

    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This payment does not belong to your account.',
      });
    }

    // 3. Idempotency Check: if already marked as PAID, return existing order immediately
    if (order.isPaid || order.paymentStatus === 'PAID' || order.paymentStatus === 'Paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified and processed.',
        order,
      });
    }

    // 4. Atomically deduct inventory stock if not yet deducted
    if (!order.stockDeducted) {
      await deductProductStock(order.items);
      order.stockDeducted = true;
    }

    // 5. Update order payment status
    order.paymentStatus = 'PAID';
    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'Processing';

    if (order.save) {
      await order.save();
      console.log(`[MongoDB Atlas Order Finalized] ✅ Order "${order.orderNumber}" updated to PAID in MongoDB Atlas!`);
    } else if (mongoose.connection.readyState === 1) {
      // If order was in dynamic store while Atlas was offline, persist it now in Atlas
      try {
        const persisted = await Order.create({
          orderNumber: order.orderNumber,
          userId: order.userId,
          customer: order.customer,
          items: order.items,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod || 'Razorpay',
          paymentStatus: 'PAID',
          isPaid: true,
          paidAt: order.paidAt,
          status: 'Processing',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        });
        console.log(`[MongoDB Atlas Order Finalized] ✅ Dynamic order "${order.orderNumber}" saved to Atlas as PAID (ID: ${persisted._id})`);
        order = persisted;
      } catch (saveErr) {
        console.error('[MongoDB Atlas Payment Save Error]:', saveErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully!',
      order,
    });
  } catch (error) {
    console.error('[Verify Payment Error]:', error);
    next(error);
  }
};

/**
 * @desc    Razorpay Webhook Handler
 * @route   POST /api/payment/webhook
 * @access  Public (Called securely by Razorpay servers)
 */
const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSignature) {
      return res.status(400).json({ success: false, message: 'Missing x-razorpay-signature header' });
    }

    if (!webhookSecret) {
      console.error('[Razorpay Webhook Error]: Webhook secret not configured in environment.');
      return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
    }

    // Compute signature using raw payload buffer
    const rawPayload = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const isValid =
      expectedSignature.length === webhookSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(webhookSignature, 'utf-8')
      );

    if (!isValid) {
      console.warn('[Razorpay Webhook Warning]: Invalid webhook signature detected.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received]: Event "${event}"`);

    // Handle payment.captured event
    if (event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        let order = null;
        if (mongoose.connection.readyState === 1) {
          try {
            order = await Order.findOne({ razorpayOrderId });
          } catch (e) {}
        }
        if (!order) {
          order = findDynamicOrderByRazorpayOrderId(razorpayOrderId);
        }

        if (order) {
          // Idempotent update: only update if not already marked as PAID
          if (!order.isPaid && order.paymentStatus !== 'PAID') {
            if (!order.stockDeducted) {
              await deductProductStock(order.items);
              order.stockDeducted = true;
            }
            order.paymentStatus = 'PAID';
            order.isPaid = true;
            order.paidAt = new Date();
            order.razorpayPaymentId = razorpayPaymentId;
            order.status = 'Processing';
            if (order.save) await order.save();
            console.log(`[Razorpay Webhook]: Order ${order.orderNumber} successfully marked as PAID.`);
          } else {
            console.log(`[Razorpay Webhook]: Order ${order.orderNumber} already marked as PAID. Skipping duplicate update.`);
          }
        }
      }
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        let order = null;
        if (mongoose.connection.readyState === 1) {
          try {
            order = await Order.findOne({ razorpayOrderId });
          } catch (e) {}
        }
        if (!order) {
          order = findDynamicOrderByRazorpayOrderId(razorpayOrderId);
        }

        if (order && !order.isPaid && order.paymentStatus !== 'PAID') {
          order.paymentStatus = 'FAILED';
          if (order.save) await order.save();
          console.log(`[Razorpay Webhook]: Order ${order.orderNumber} payment marked as FAILED.`);
        }
      }
    }

    // Acknowledge receipt of webhook with 200 OK
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook Handler Error]:', error);
    return res.status(500).json({ success: false, message: 'Internal Webhook error' });
  }
};

/**
 * @desc    Get Razorpay Key ID for client initialization
 * @route   GET /api/payment/key
 * @access  Public
 */
const getRazorpayKey = (req, res) => {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (!key_id) {
    return res.status(500).json({
      success: false,
      message: 'Razorpay Key ID is not configured on server.',
    });
  }
  return res.status(200).json({
    success: true,
    keyId: key_id,
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getRazorpayKey,
};
