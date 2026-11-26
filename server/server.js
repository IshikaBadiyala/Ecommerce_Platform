/**
 * Nexora E-Commerce Server
 * ------------------------
 * Main entry point for the Express.js backend.
 * 
 * Viva Concepts:
 * - Express Application Pipeline: Middlewares are executed in sequence from top to bottom.
 * - CORS (Cross-Origin Resource Sharing): Browser security feature preventing malicious cross-site requests.
 *   When credentials (cookies) are used, Access-Control-Allow-Origin cannot be '*'.
 * - Environment Variables: Keeps secrets (API keys, DB credentials) separate from codebase.
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Determine allowed origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Configure Cross-Origin Resource Sharing (CORS) with credentials enabled
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true, // Crucial: Allows sending and receiving HttpOnly cookies across origins
  })
);

// Built-in middleware for parsing incoming JSON and URL-encoded payloads
// Captures rawBody buffer for Razorpay Webhook signature verification
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middleware for parsing cookie headers and populating req.cookies
app.use(cookieParser());

// API Health Check Route
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'online',
    brand: 'BuyNest',
    database: {
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      note: isConnected
        ? 'Connected directly to MongoDB Atlas Cloud'
        : 'Running in offline fallback mode. Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access to persist directly to Atlas.',
    },
    message: 'BuyNest E-Commerce API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Custom 404 and Error handling middlewares (must be registered AFTER all routes)
app.use(notFound);
app.use(errorHandler);

// Define server listening port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[BuyNest Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[BuyNest Server] API Base: http://localhost:${PORT}/api`);
});
