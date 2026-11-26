/**
 * Express HTTP Endpoint Integration Test
 * --------------------------------------
 * Tests POST /api/payment/create-order, POST /api/payment/verify, and POST /api/payment/webhook
 */

require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const assert = require('assert');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Setup mini test express server replicating server.js middleware & routes
const app = express();
app.use(
  express.json({
    limit: '1mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const paymentRoutes = require('../routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

// Error handler
const { notFound, errorHandler } = require('../middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const TEST_PORT = 5099;
const server = http.createServer(app);

// Helper for making requests
function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (payload && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runEndpointTests() {
  await new Promise((resolve) => server.listen(TEST_PORT, '127.0.0.1', resolve));
  console.log(`\nTest HTTP Server listening on port ${TEST_PORT}\n`);

  let passed = 0;
  let failed = 0;

  const testUserToken = jwt.sign(
    { id: 'user_mock_001', role: 'customer' },
    process.env.JWT_SECRET || 'nexora_super_secret_jwt_passphrase_viva_exam_2026',
    { expiresIn: '1h' }
  );

  // TEST 1: Unauthenticated create-order must return 401
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/create-order',
      body: { items: [{ productId: 'prod_elec_001', quantity: 1 }] },
    });
    assert.strictEqual(res.status, 401, 'Unauthenticated request must return 401');
    console.log('âœ… PASS: Unauthenticated POST /api/payment/create-order returns 401');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Unauthenticated create-order check:', err.message);
    failed++;
  }

  // TEST 2: Missing customer details returns 400
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/create-order',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: { items: [{ productId: 'prod_elec_001', quantity: 1 }] },
    });
    assert.strictEqual(res.status, 400, 'Missing customer details must return 400');
    console.log('âœ… PASS: Missing customer details returns 400 Bad Request');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Missing customer validation:', err.message);
    failed++;
  }

  // TEST 3: Verification with missing signature fields returns 400
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/verify',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: { razorpay_order_id: 'order_123' },
    });
    assert.strictEqual(res.status, 400, 'Missing signature fields must return 400');
    console.log('âœ… PASS: Incomplete payment verify payload returns 400 Bad Request');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Incomplete verify payload:', err.message);
    failed++;
  }

  // TEST 4: Verification with forged signature returns 400
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/verify',
      headers: { Authorization: `Bearer ${testUserToken}` },
      body: {
        razorpay_order_id: 'order_test_lifecycle_001',
        razorpay_payment_id: 'pay_test_forged',
        razorpay_signature: '0'.repeat(64),
      },
    });
    assert.strictEqual(res.status, 400, 'Forged signature must return 400');
    assert.strictEqual(res.body.success, false);
    console.log('âœ… PASS: Forged signature rejected with 400 Bad Request');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Forged signature check:', err.message);
    failed++;
  }

  // TEST 5: Webhook without signature header returns 400
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/webhook',
      body: { event: 'payment.captured' },
    });
    assert.strictEqual(res.status, 400, 'Missing webhook signature header must return 400');
    console.log('âœ… PASS: Webhook without x-razorpay-signature header returns 400');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Webhook header check:', err.message);
    failed++;
  }

  // TEST 6: Webhook with forged signature header returns 400
  try {
    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/webhook',
      headers: { 'x-razorpay-signature': '0'.repeat(64) },
      body: { event: 'payment.captured' },
    });
    assert.strictEqual(res.status, 400, 'Forged webhook signature must return 400');
    console.log('âœ… PASS: Webhook with invalid signature returns 400 Bad Request');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Webhook invalid signature:', err.message);
    failed++;
  }

  // TEST 7: Webhook with authentic HMAC SHA256 signature returns 200 OK
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const webhookBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_captured_http_01',
            order_id: 'order_test_lifecycle_001',
            amount: 349900,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookBody)
      .digest('hex');

    const res = await makeRequest({
      method: 'POST',
      path: '/api/payment/webhook',
      headers: { 'x-razorpay-signature': signature },
      body: webhookBody,
    });
    assert.strictEqual(res.status, 200, 'Valid webhook must return 200 OK');
    assert.strictEqual(res.body.status, 'ok');
    console.log('âœ… PASS: Valid webhook event accepted with 200 OK { status: "ok" }');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Valid webhook test:', err.message);
    failed++;
  }

  // TEST 8: GET /api/payment/key returns public Key ID
  try {
    const res = await makeRequest({
      method: 'GET',
      path: '/api/payment/key',
    });
    assert.strictEqual(res.status, 200);
    assert(res.body.keyId, 'Must return keyId');
    assert.strictEqual(res.body.keyId, process.env.RAZORPAY_KEY_ID);
    console.log(`âœ… PASS: GET /api/payment/key returns public key: ${res.body.keyId}`);
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: GET /api/payment/key:', err.message);
    failed++;
  }

  server.close();
  console.log(`\nHTTP Integration Results: ${passed} PASSED, ${failed} FAILED\n`);
  if (failed > 0) process.exit(1);
}

runEndpointTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
