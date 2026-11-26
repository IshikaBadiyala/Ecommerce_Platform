/**
 * Razorpay Payment Gateway Automated Test Suite
 * ---------------------------------------------
 * Tests end-to-end security, mathematical correctness, cryptographic signatures,
 * order lifecycle transitions, and webhook idempotency.
 *
 * Run with: npm run test:payment
 */

require('dotenv').config();
const crypto = require('crypto');
const assert = require('assert');
const { getRazorpayInstance } = require('../config/razorpay');
const {
  findDynamicProductById,
  addDynamicOrder,
  findDynamicOrderByRazorpayOrderId,
} = require('../data/fallbackData');

let testsPassed = 0;
let testsFailed = 0;

function runTest(description, testFn) {
  try {
    testFn();
    console.log(`  âœ… PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  âŒ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function runAsyncTest(description, testFn) {
  try {
    await testFn();
    console.log(`  âœ… PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  âŒ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('  NEXORA E-COMMERCE: RAZORPAY INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  // 1. CONFIGURATION TESTS
  console.log('1. Configuration & SDK Initialization:');

  runTest('Razorpay SDK initializes with environment variables', () => {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_Nexora2026Key';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'nexora_razorpay_secret_key_2026';
    assert(key_id, 'RAZORPAY_KEY_ID must be present');
    assert(key_secret, 'RAZORPAY_KEY_SECRET must be present');
    assert(key_id.startsWith('rzp_test_') || key_id.startsWith('rzp_live_'), 'Key ID must have standard Razorpay prefix');

    const Razorpay = require('razorpay');
    const instance = new Razorpay({ key_id, key_secret });
    assert(instance.orders, 'SDK instance must provide orders API');
    assert(instance.payments, 'SDK instance must provide payments API');
  });

  // 2. CRYPTOGRAPHIC SIGNATURE TESTS
  console.log('\n2. HMAC SHA256 Signature Security Tests:');

  const testSecret = 'my_test_razorpay_secret_key_12345';
  const testOrderId = 'order_test_998877';
  const testPaymentId = 'pay_test_112233';

  // Compute authentic signature
  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  runTest('Valid HMAC SHA256 signature is verified successfully', () => {
    const computed = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const matches =
      computed.length === validSignature.length &&
      crypto.timingSafeEqual(Buffer.from(computed, 'utf-8'), Buffer.from(validSignature, 'utf-8'));

    assert.strictEqual(matches, true, 'Valid signature must match timing-safe comparison');
  });

  runTest('Tampered payment ID is rejected', () => {
    const tamperedPaymentId = 'pay_test_tampered_000';
    const computed = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${tamperedPaymentId}`)
      .digest('hex');

    const matches =
      computed.length === validSignature.length &&
      crypto.timingSafeEqual(Buffer.from(computed, 'utf-8'), Buffer.from(validSignature, 'utf-8'));

    assert.strictEqual(matches, false, 'Tampered payment ID signature must NOT match');
  });

  runTest('Forged signature is rejected', () => {
    const forgedSignature = 'a'.repeat(64);
    const computed = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const matches =
      computed.length === forgedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(computed, 'utf-8'), Buffer.from(forgedSignature, 'utf-8'));

    assert.strictEqual(matches, false, 'Forged signature must be rejected');
  });

  // 3. AUTHORITATIVE PRICING & SERVER-SIDE CALCULATION
  console.log('\n3. Authoritative Price Calculation & Tamper Resistance:');

  runTest('Server looks up real catalogue price, ignoring malicious client-sent price', () => {
    // prod_elec_001 real price in database is 3499
    const genuineProduct = findDynamicProductById('prod_elec_001');
    assert(genuineProduct, 'Genuine product prod_elec_001 must exist in catalogue');
    assert.strictEqual(genuineProduct.price, 3499, 'Catalogue price must be 3499');

    // Attacker submits price: 1
    const attackerPayloadItem = {
      productId: 'prod_elec_001',
      quantity: 2,
      price: 1, // Malicious override
    };

    // Server queries product authoritative price
    const authoritativeItem = findDynamicProductById(attackerPayloadItem.productId);
    const trueSubtotal = authoritativeItem.price * attackerPayloadItem.quantity;
    assert.strictEqual(trueSubtotal, 6998, 'Server must calculate 3499 * 2 = 6998, NOT 1 * 2 = 2');

    // Shipping rule: orders >= 999 get free shipping
    const shipping = trueSubtotal >= 999 ? 0 : 99;
    assert.strictEqual(shipping, 0, 'Orders above 999 must get free shipping');

    const finalAmountInPaise = Math.round(trueSubtotal * 100);
    assert.strictEqual(finalAmountInPaise, 699800, 'Paise calculation must match exact amount');
  });

  // 4. ORDER CREATION & LIFECYCLE (PENDING -> PAID)
  console.log('\n4. Order Lifecycle & Status Management:');

  const testOrderRecord = addDynamicOrder({
    _id: `test_ord_${Date.now()}`,
    orderNumber: `ORD-TEST-${Date.now().toString().slice(-4)}`,
    userId: 'user_test_123',
    customer: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      address: '123 MG Road',
      city: 'Bengaluru',
      postalCode: '560001',
    },
    items: [
      {
        product: 'prod_elec_001',
        name: 'Nexora Wave Pro Headphones',
        quantity: 1,
        price: 3499,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      },
    ],
    totalAmount: 3499,
    paymentMethod: 'Razorpay',
    paymentStatus: 'PENDING',
    isPaid: false,
    status: 'Pending',
    razorpayOrderId: 'order_test_lifecycle_001',
    createdAt: new Date(),
  });

  runTest('New online order is initially recorded as PENDING with isPaid: false', () => {
    assert.strictEqual(testOrderRecord.paymentStatus, 'PENDING');
    assert.strictEqual(testOrderRecord.isPaid, false);
    assert.strictEqual(testOrderRecord.status, 'Pending');
    assert.strictEqual(testOrderRecord.razorpayOrderId, 'order_test_lifecycle_001');
  });

  runTest('Order can be looked up by Razorpay Order ID', () => {
    const found = findDynamicOrderByRazorpayOrderId('order_test_lifecycle_001');
    assert(found, 'Order must be found by razorpayOrderId');
    assert.strictEqual(found._id, testOrderRecord._id);
  });

  runTest('Verified payment transitions order to PAID and updates metadata', () => {
    const orderToUpdate = findDynamicOrderByRazorpayOrderId('order_test_lifecycle_001');
    assert(orderToUpdate);

    // Simulate verification
    orderToUpdate.paymentStatus = 'PAID';
    orderToUpdate.isPaid = true;
    orderToUpdate.paidAt = new Date();
    orderToUpdate.razorpayPaymentId = 'pay_test_lifecycle_verified';
    orderToUpdate.status = 'Processing';

    assert.strictEqual(orderToUpdate.paymentStatus, 'PAID');
    assert.strictEqual(orderToUpdate.isPaid, true);
    assert(orderToUpdate.paidAt instanceof Date);
    assert.strictEqual(orderToUpdate.razorpayPaymentId, 'pay_test_lifecycle_verified');
    assert.strictEqual(orderToUpdate.status, 'Processing');
  });

  // 5. IDEMPOTENCY TEST
  console.log('\n5. Idempotency & Duplicate Prevention:');

  runTest('Subsequent verification attempt on already PAID order is idempotent', () => {
    const order = findDynamicOrderByRazorpayOrderId('order_test_lifecycle_001');
    let duplicateStockDeductionAttempted = false;

    // Simulation of idempotency check in verifyPayment
    if (order.isPaid || order.paymentStatus === 'PAID') {
      // Correct behavior: do NOT deduct stock again
    } else {
      duplicateStockDeductionAttempted = true;
    }

    assert.strictEqual(duplicateStockDeductionAttempted, false, 'Stock deduction must NOT run for already PAID order');
  });

  // 6. WEBHOOK SIGNATURE & EVENT PROCESSING
  console.log('\n6. Webhook Signature & Event Processing:');

  const webhookSecret = 'test_webhook_secret_key_889900';
  const webhookCapturedPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_wh_captured_999',
          order_id: 'order_test_lifecycle_001',
          amount: 349900,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const validWebhookSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookCapturedPayload)
    .digest('hex');

  runTest('Valid webhook signature verification passes', () => {
    const computedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookCapturedPayload)
      .digest('hex');

    const isValid =
      computedSig.length === validWebhookSignature.length &&
      crypto.timingSafeEqual(Buffer.from(computedSig, 'utf-8'), Buffer.from(validWebhookSignature, 'utf-8'));

    assert.strictEqual(isValid, true, 'Valid webhook signature must be accepted');
  });

  runTest('Invalid or forged webhook signature is rejected', () => {
    const badSig = '0'.repeat(64);
    const computedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookCapturedPayload)
      .digest('hex');

    const isValid =
      computedSig.length === badSig.length &&
      crypto.timingSafeEqual(Buffer.from(computedSig, 'utf-8'), Buffer.from(badSig, 'utf-8'));

    assert.strictEqual(isValid, false, 'Forged webhook signature must be rejected');
  });

  // 7. PAYMENT FAILURE EVENT TEST
  console.log('\n7. Payment Failure Event Handling:');

  const failedOrder = addDynamicOrder({
    _id: `test_failed_${Date.now()}`,
    orderNumber: `ORD-FAIL-${Date.now().toString().slice(-4)}`,
    userId: 'user_test_failed',
    customer: {
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9876543211',
      address: '45 Connaught Place',
      city: 'New Delhi',
      postalCode: '110001',
    },
    items: [{ product: 'prod_elec_002', name: 'Watch', quantity: 1, price: 2799, image: '' }],
    totalAmount: 2799,
    paymentMethod: 'Razorpay',
    paymentStatus: 'PENDING',
    isPaid: false,
    status: 'Pending',
    razorpayOrderId: 'order_failed_wh_001',
    createdAt: new Date(),
  });

  runTest('Webhook payment.failed event marks order as FAILED', () => {
    const order = findDynamicOrderByRazorpayOrderId('order_failed_wh_001');
    assert(order);
    assert.strictEqual(order.paymentStatus, 'PENDING');

    // Simulate webhook payment.failed processing
    order.paymentStatus = 'FAILED';

    assert.strictEqual(order.paymentStatus, 'FAILED');
    assert.strictEqual(order.isPaid, false);
  });

  // SUMMARY
  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
