/**
 * Authentication and Authorization Middleware
 * --------------------------------------------
 * 
 * Viva Concepts:
 * - Middleware: Express functions that have access to the request object (req), response object (res),
 *   and next middleware function (next). They can execute code, make changes to req/res, end the cycle,
 *   or call next() to pass control.
 * - JWT Verification: Verifies digital signature with HMAC SHA256 using server's secret key.
 * - Role-Based Access Control (RBAC): Differentiates regular shoppers from store managers/admins.
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { findDynamicUserById } = require('../data/fallbackData');

/**
 * Protect routes: Checks for JWT in HttpOnly cookie or Authorization header.
 * Attaches verified user object to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie first (primary secure storage)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization header as fallback (Bearer <token>)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to access this resource.',
    });
  }

  try {
    // Verify JWT token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    // 1. Check MongoDB Atlas if connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-passwordHash');
      } catch (err) {
        // failover cleanly
      }
    }

    // 2. Check in-memory store if Atlas is disconnected or user is fallback admin
    if (!user) {
      const fallbackUser = findDynamicUserById(decoded.id);
      if (fallbackUser) {
        user = {
          _id: fallbackUser._id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role || decoded.role || 'user',
        };
      } else if (decoded.id && decoded.role) {
        user = {
          _id: decoded.id,
          name: decoded.name || 'Nexora User',
          email: decoded.email || '',
          role: decoded.role,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this session no longer exists.',
      });
    }

    // Attach user to request object so downstream controllers can access req.user
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication session expired or invalid. Please log in again.',
    });
  }
};

/**
 * Admin check: Verifies if authenticated user has 'admin' role.
 * Must be preceded by protect middleware.
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
};

module.exports = { protect, requireAdmin };
