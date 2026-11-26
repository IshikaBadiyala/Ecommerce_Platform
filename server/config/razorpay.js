/**
 * Razorpay Gateway Configuration
 * ------------------------------
 * Initializes the official Razorpay Node.js SDK instance using
 * merchant API credentials from environment variables.
 *
 * Security:
 * - RAZORPAY_KEY_ID: Publicly shareable with frontend for standard checkout modal.
 * - RAZORPAY_KEY_SECRET: Confidential backend-only secret key used for order creation & HMAC verification.
 */

const Razorpay = require('razorpay');

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : null;
  const key_secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : null;

  if (!key_id || !key_secret) {
    const errorMsg =
      'Razorpay credentials are not configured. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env';
    console.error(`[Razorpay Configuration Error]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

module.exports = {
  getRazorpayInstance,
};
