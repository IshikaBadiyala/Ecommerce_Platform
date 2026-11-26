/**
 * Error Handling Middleware
 * -------------------------
 * Catches unhandled errors across all Express controllers and standardizes JSON responses.
 * 
 * Viva Concepts:
 * - Express Error Handling: Error middleware functions take 4 arguments: (err, req, res, next).
 * - Centralized handling prevents server crashes and eliminates duplicate try/catch boilerplate.
 */

// Handle requests to unknown routes (404)
const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // If status code is 200, default to err.statusCode or 500
  let statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;
  let message =
    err.message ||
    err.error?.description ||
    err.description ||
    (typeof err === 'string' ? err : 'Internal Server Error');

  // Handle Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found with the requested identifier';
  }

  // Handle Mongoose duplicate key error (e.g. duplicate email code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists. Please sign in or use a different ${field}.`;
  }

  // Handle Mongoose Schema Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development environment for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
