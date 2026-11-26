/**
 * Direct Controller & Handler Integration Test
 * --------------------------------------------
 * Tests controllers with mock Express req, res, and next objects.
 * Runs instantly without requiring network or TCP sockets.
 */

require('dotenv').config();
const crypto = require('crypto');
const assert = require('assert');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getRazorpayKey,
} = require('../controllers/paymentController');
const {
  addDynamicOrder,
  findDynamicOrderByRazorpayOrderId,
} = require('../data/fallbackData');

function createMockReqRes({ body = {}, headers = {}, user = null, rawBody = null }) {
  const req = {
    body,
    headers,
    user,
    rawBody: rawBody || Buffer.from(JSON.stringify(body)),
  };

  let responseData = null;
  let responseStatus = 200;

  const res = {
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
  };

  return {
    req,
    res,
    getResponse: () => ({ status: responseStatus, data: responseData }),
  };
}

async function runDirectTests() {
  console.log('\n======================================================');
  console.log('  CONTROLLER DIRECT INTEGRATION TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Missing customer details in createPaymentOrder
  try {
    const { req, res, getResponse } = createMockReqRes({
      body: { items: [{ productId: 'prod_elec_001', quantity: 1 }] },
      user: { _id: 'user_test_001', role: 'customer' },
    });
    await createPaymentOrder(req, res, (err) => { throw err; });
    const response = getResponse();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.success, false);
    console.log('âœ… PASS: createPaymentOrder rejects missing customer details with 400');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Missing customer check:', err.message);
    failed++;
  }

  // 2. Empty items in createPaymentOrder
  try {
    const { req, res, getResponse } = createMockReqRes({
      body: {
        customer: {
          name: 'Rahul',
          email: 'rahul@test.com',
          phone: '9876543210',
          address: 'Main St',
          city: 'Mumbai',
          postalCode: '400001',
        },
        items: [],
      },
      user: { _id: 'user_test_001', role: 'customer' },
    });
    await createPaymentOrder(req, res, (err) => { throw err; });
    const response = getResponse();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.success, false);
    console.log('âœ… PASS: createPaymentOrder rejects empty cart with 400');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Empty cart check:', err.message);
    failed++;
  }

  // 3. Incomplete signature payload in verifyPayment
  try {
    const { req, res, getResponse } = createMockReqRes({
      body: { razorpay_order_id: 'order_123' },
      user: { _id: 'user_test_001', role: 'customer' },
    });
    await verifyPayment(req, res, (err) => { throw err; });
    const response = getResponse();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.success, false);
    console.log('âœ… PASS: verifyPayment rejects missing parameters with 400');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Incomplete verify payload:', err.message);
    failed++;
  }

  // 4. Forged signature in verifyPayment
  try {
    // Register an order in memory first
    const orderRef = addDynamicOrder({
      _id: `ord_direct_${Date.now()}`,
      orderNumber: `ORD-DIR-${Date.now().toString().slice(-4)}`,
      userId: 'user_direct_001',
      customer: {
        name: 'Neha Gupta',
        email: 'neha@test.com',
        phone: '9876543212',
        address: 'Park St',
        city: 'Kolkata',
        postalCode: '700016',
      },
      items: [{ product: 'prod_elec_001', name: 'Headphones', quantity: 1, price: 3499, image: '' }],
      totalAmount: 3499,
      paymentMethod: 'Razorpay',
      paymentStatus: 'PENDING',
      isPaid: false,
      status: 'Pending',
      razorpayOrderId: 'order_direct_forged_test',
    });

    const { req, res, getResponse } = createMockReqRes({
      body: {
        razorpay_order_id: 'order_direct_forged_test',
        razorpay_payment_id: 'pay_direct_123',
        razorpay_signature: '0'.repeat(64),
      },
      user: { _id: 'user_direct_001', role: 'customer' },
    });

    await verifyPayment(req, res, (err) => { throw err; });
    const response = getResponse();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.success, false);
    assert.strictEqual(orderRef.paymentStatus, 'FAILED', 'Order status must be updated to FAILED');
    console.log('âœ… PASS: Forged signature rejected with 400 and order status set to FAILED');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Forged signature verification:', err.message);
    failed++;
  }

  // 5. Valid signature verification
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'nexora_razorpay_secret_key_2026';
    const testRzpOrderId = 'order_direct_valid_test';
    const testRzpPaymentId = 'pay_direct_valid_456';

    const validSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${testRzpOrderId}|${testRzpPaymentId}`)
      .digest('hex');

    const validOrder = addDynamicOrder({
      _id: `ord_valid_${Date.now()}`,
      orderNumber: `ORD-VAL-${Date.now().toString().slice(-4)}`,
      userId: 'user_valid_001',
      customer: {
        name: 'Kavita Roy',
        email: 'kavita@test.com',
        phone: '9876543213',
        address: 'Ring Road',
        city: 'Pune',
        postalCode: '411001',
      },
      items: [{ product: 'prod_elec_001', name: 'Headphones', quantity: 1, price: 3499, image: '' }],
      totalAmount: 3499,
      paymentMethod: 'Razorpay',
      paymentStatus: 'PENDING',
      isPaid: false,
      status: 'Pending',
      razorpayOrderId: testRzpOrderId,
    });

    const { req, res, getResponse } = createMockReqRes({
      body: {
        razorpay_order_id: testRzpOrderId,
        razorpay_payment_id: testRzpPaymentId,
        razorpay_signature: validSig,
      },
      user: { _id: 'user_valid_001', role: 'customer' },
    });

    await verifyPayment(req, res, (err) => { throw err; });
    const response = getResponse();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.strictEqual(validOrder.paymentStatus, 'PAID');
    assert.strictEqual(validOrder.isPaid, true);
    assert.strictEqual(validOrder.razorpayPaymentId, testRzpPaymentId);
    console.log('âœ… PASS: Valid signature verified with 200 OK and order marked as PAID');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Valid signature test:', err.message);
    failed++;
  }

  // 6. Webhook missing signature header
  try {
    const { req, res, getResponse } = createMockReqRes({
      body: { event: 'payment.captured' },
      headers: {},
    });
    await handleWebhook(req, res);
    const response = getResponse();
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.data.success, false);
    console.log('âœ… PASS: Webhook missing x-razorpay-signature header returns 400');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Webhook missing header:', err.message);
    failed++;
  }

  // 7. Webhook valid signature & payment.captured event
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'nexora_razorpay_secret_key_2026';
    const whOrderId = 'order_wh_test_777';

    const whOrder = addDynamicOrder({
      _id: `ord_wh_${Date.now()}`,
      orderNumber: `ORD-WH-${Date.now().toString().slice(-4)}`,
      userId: 'user_wh_001',
      customer: {
        name: 'Sunil Verma',
        email: 'sunil@test.com',
        phone: '9876543214',
        address: 'Sector 18',
        city: 'Noida',
        postalCode: '201301',
      },
      items: [{ product: 'prod_elec_003', name: 'Keyboard', quantity: 1, price: 3199, image: '' }],
      totalAmount: 3199,
      paymentMethod: 'Razorpay',
      paymentStatus: 'PENDING',
      isPaid: false,
      status: 'Pending',
      razorpayOrderId: whOrderId,
    });

    const bodyObj = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wh_captured_888',
            order_id: whOrderId,
            amount: 319900,
            currency: 'INR',
          },
        },
      },
    };
    const rawBodyBuffer = Buffer.from(JSON.stringify(bodyObj), 'utf-8');
    const validWhSig = crypto.createHmac('sha256', webhookSecret).update(rawBodyBuffer).digest('hex');

    const { req, res, getResponse } = createMockReqRes({
      body: bodyObj,
      rawBody: rawBodyBuffer,
      headers: { 'x-razorpay-signature': validWhSig },
    });

    await handleWebhook(req, res);
    const response = getResponse();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
    assert.strictEqual(whOrder.paymentStatus, 'PAID');
    assert.strictEqual(whOrder.isPaid, true);
    assert.strictEqual(whOrder.razorpayPaymentId, 'pay_wh_captured_888');
    console.log('âœ… PASS: Webhook payment.captured verified and order updated to PAID');
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: Webhook payment.captured test:', err.message);
    failed++;
  }

  // 8. GET Razorpay Key ID
  try {
    const { req, res, getResponse } = createMockReqRes({});
    getRazorpayKey(req, res);
    const response = getResponse();
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.keyId, process.env.RAZORPAY_KEY_ID);
    console.log(`âœ… PASS: getRazorpayKey returned keyId: ${response.data.keyId}`);
    passed++;
  } catch (err) {
    console.error('â Œ FAIL: getRazorpayKey test:', err.message);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`  DIRECT CONTROLLER RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runDirectTests().catch((e) => {
  console.error('Fatal Direct Test Error:', e);
  process.exit(1);
});
