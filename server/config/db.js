/**
 * Database Configuration & Resilient Connection
 * -----------------------------------------------
 * Connects Express application to MongoDB Atlas cloud database.
 * Includes auto-reconnection loop, event listeners, and automatic
 * synchronization of in-memory offline users and orders once Atlas connects.
 */

const mongoose = require('mongoose');

let reconnectTimer = null;
let isConnecting = false;

/**
 * Auto-sync any users, orders, carts, or wishlists created in memory while Atlas was offline
 */
const syncDynamicDataToAtlas = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const User = require('../models/User');
    const Order = require('../models/Order');
    const Cart = require('../models/Cart');
    const Wishlist = require('../models/Wishlist');
    const {
      getDynamicUsers,
      getAllDynamicOrders,
      getAllDynamicCarts,
      getAllDynamicWishlists,
    } = require('../data/fallbackData');

    // 1. Sync Dynamic Users (excluding sample seed users with dummy hashes)
    const dynamicUsers = getDynamicUsers ? getDynamicUsers() : [];
    for (const u of dynamicUsers) {
      if (u && u.email && !u.email.includes('nexora.com')) {
        try {
          const existing = await User.findOne({ email: u.email.toLowerCase().trim() });
          if (!existing) {
            await User.create({
              name: u.name,
              email: u.email.toLowerCase().trim(),
              passwordHash: u.passwordHash,
              role: u.role || 'user',
            });
            console.log(`[MongoDB Atlas Auto-Sync] ✅ Synced user to Atlas: ${u.email}`);
          }
        } catch (uErr) {
          console.warn(`[MongoDB Atlas Auto-Sync User Notice]: ${u.email} - ${uErr.message}`);
        }
      }
    }

    // 2. Sync Dynamic Orders (including Razorpay paid orders)
    const dynamicOrders = getAllDynamicOrders ? getAllDynamicOrders() : [];
    for (const ord of dynamicOrders) {
      if (ord && ord.orderNumber) {
        try {
          const existing = await Order.findOne({ orderNumber: ord.orderNumber });
          if (!existing) {
            await Order.create({
              orderNumber: ord.orderNumber,
              userId: ord.userId,
              customer: ord.customer,
              items: ord.items,
              totalAmount: ord.totalAmount,
              paymentMethod: ord.paymentMethod || 'Razorpay',
              paymentStatus: ord.paymentStatus || 'PAID',
              isPaid: ord.isPaid !== undefined ? ord.isPaid : true,
              paidAt: ord.paidAt || new Date(),
              status: ord.status || 'Processing',
              razorpayOrderId: ord.razorpayOrderId,
              razorpayPaymentId: ord.razorpayPaymentId,
              razorpaySignature: ord.razorpaySignature,
            });
            console.log(`[MongoDB Atlas Auto-Sync] ✅ Synced order to Atlas: ${ord.orderNumber}`);
          }
        } catch (oErr) {
          console.warn(`[MongoDB Atlas Auto-Sync Order Notice]: ${ord.orderNumber} - ${oErr.message}`);
        }
      }
    }
  } catch (err) {
    console.warn('[MongoDB Atlas Auto-Sync Notice]:', err.message);
  }
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState !== 1 && !isConnecting) {
      console.log('[MongoDB Atlas] Auto-retry: Reconnecting to Atlas...');
      await connectDB();
    } else if (mongoose.connection.readyState === 1) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }
  }, 7000);
};

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('abcde.mongodb.net')) {
    console.warn('[MongoDB Notice] Placeholder MongoDB URI in server/.env.');
    return;
  }

  isConnecting = true;
  try {
    console.log('[MongoDB Atlas] Connecting to MongoDB Atlas cloud database...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });

    console.log(`\n======================================================`);
    console.log(`[MongoDB Atlas] ✅ CONNECTED TO ATLAS SUCCESSFULLY!`);
    console.log(`[MongoDB Atlas] Host: ${conn.connection.host}`);
    console.log(`[MongoDB Atlas] Database: ${conn.connection.name}`);
    console.log(`======================================================\n`);

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    // Auto-sync any dynamic records into Atlas
    setTimeout(syncDynamicDataToAtlas, 1500);

  } catch (error) {
    console.warn(`\n⚠️  [MongoDB Atlas Connection Warning]: ${error.message}`);
    console.log('🛡️  [Resilient Fallback Mode Active]: Products and checkout remain operational in-memory.');
    console.log('👉 To enable permanent persistence in MongoDB Atlas:');
    console.log('   Add your IP (152.59.82.209) or 0.0.0.0/0 in MongoDB Atlas > Network Access.');
    console.log('   Auto-reconnect is active and will link as soon as access is granted.\n');

    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Atlas] ⚠️ Connection dropped. Retrying...');
  scheduleReconnect();
});

module.exports = connectDB;
module.exports.syncDynamicDataToAtlas = syncDynamicDataToAtlas;
