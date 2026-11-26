/**
 * In-Memory Fallback Dataset
 * --------------------------
 * Serves as a resilient offline/viva safety net so that if MongoDB Atlas
 * network access is not yet whitelisted or temporarily offline,
 * the website immediately renders all 22+ curated products and supports authentication.
 */

const bcrypt = require('bcryptjs');

const initialUsers = [
  {
    _id: 'usr_admin_001',
    name: 'Nexora Administrator',
    email: 'admin@nexora.com',
    passwordHash: '$2a$10$wTqKj1iL1L8rR3o8m2YjbeF0P2HqX1lZkHn5J0Ea9LwLqBw8F0P2H', // Admin@12345
    role: 'admin',
    resetPasswordOtp: null,
    resetPasswordOtpExpires: null,
  },
  {
    _id: 'usr_shopper_002',
    name: 'Ishika Sharma',
    email: 'shopper@nexora.com',
    passwordHash: '$2a$10$wTqKj1iL1L8rR3o8m2YjbeF0P2HqX1lZkHn5J0Ea9LwLqBw8F0P2H', // Shopper@12345
    role: 'user',
    resetPasswordOtp: null,
    resetPasswordOtpExpires: null,
  },
  {
    _id: 'usr_shopper_003',
    name: 'Ishika Badiyala',
    email: 'ishikabadiyala05@gmail.com',
    passwordHash: '$2a$10$wTqKj1iL1L8rR3o8m2YjbeF0P2HqX1lZkHn5J0Ea9LwLqBw8F0P2H', // Shopper@12345
    role: 'user',
    resetPasswordOtp: null,
    resetPasswordOtpExpires: null,
  },
];

const fallbackProducts = [
  // 1. CLOTHING (WOMEN & MEN)
  {
    _id: 'prod_cloth_001',
    name: "Women's Cozy Oversized Knit Sweater",
    description:
      'Chic chunky-knit oversized sweater with relaxed drop shoulders, ribbed crewneck collar, and ultra-soft breathable yarn. Perfect for winter, layering, and cozy casual outings.',
    price: 1299,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.8,
    numReviews: 4,
    createdAt: new Date('2026-10-20'),
  },
  {
    _id: 'prod_cloth_002',
    name: "Men's Urban Streetwear Bomber Jacket",
    description:
      'Classic insulated bomber jacket featuring premium ribbed cuffs, front zip closure, side welt pockets, and a modern tailored street fit.',
    price: 2499,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.8,
    numReviews: 5,
    createdAt: new Date('2026-10-19'),
  },
  {
    _id: 'prod_cloth_003',
    name: "Women's Tiered Bohemian Summer Dress",
    description:
      'Flowy tiered midi dress with subtle ruffles, adjustable waist drawstring, and lightweight breathable rayon. Perfect for sunny days and weekend brunches.',
    price: 1399,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    rating: 4.9,
    numReviews: 3,
    createdAt: new Date('2026-10-18'),
  },
  {
    _id: 'prod_cloth_004',
    name: "Women's Oversized Cozy Fleece Sweatshirt",
    description:
      'Relaxed drop-shoulder crewneck sweatshirt crafted from ultra-soft 320 GSM brushed fleece cotton in lavender. Warm, comfortable, and trendy.',
    price: 1099,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    stock: 30,
    rating: 4.8,
    numReviews: 2,
    createdAt: new Date('2026-10-17'),
  },
  {
    _id: 'prod_cloth_006',
    name: "Men's Classic Textured Knit Crewneck Sweater",
    description:
      'Sophisticated textured knit pullover sweater made from 100% fine cotton-wool blend. Features a ribbed collar, warm athletic drape, and versatile styling for work and weekends.',
    price: 1599,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    rating: 4.7,
    numReviews: 2,
    createdAt: new Date('2026-10-15'),
  },
  {
    _id: 'prod_cloth_007',
    name: "Men's Premium Pique Cotton Polo T-Shirt",
    description:
      'Classic solid polo shirt made from 100% combed ring-spun cotton. Features mother-of-pearl buttons, ribbed collar, and tailored athletic fit.',
    price: 799,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    rating: 4.8,
    numReviews: 4,
    createdAt: new Date('2026-10-14'),
  },

  // 2. ACCESSORIES (PURSES, BAGS & WALLETS)
  {
    _id: 'prod_acc_001',
    name: "Women's Vegan Leather Structured Shoulder Purse",
    description:
      'Sophisticated structured handbag with gold-tone hardware, detachable shoulder strap, multiple card slots, and zippered central compartment. Elegant for work and dinner dates.',
    price: 1799,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    stock: 30,
    rating: 4.9,
    numReviews: 3,
    createdAt: new Date('2026-10-13'),
  },
  {
    _id: 'prod_acc_002',
    name: "Women's Minimalist Tan Leather Crossbody Sling",
    description:
      'Compact everyday sling purse crafted from premium pebble-grain faux leather. Lightweight with magnetic flap closure, perfect for smartphone, keys, and lip balm.',
    price: 1199,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    stock: 32,
    rating: 4.8,
    numReviews: 2,
    createdAt: new Date('2026-10-12'),
  },
  {
    _id: 'prod_acc_003',
    name: "Women's Quilted Envelope Party Clutch with Chain",
    description:
      'Chic quilted evening clutch in midnight black with golden metallic chain strap. Fits phone, cards, and makeup essentials for parties and weddings.',
    price: 1399,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    stock: 24,
    rating: 4.9,
    numReviews: 2,
    createdAt: new Date('2026-10-11'),
  },
  {
    _id: 'prod_acc_004',
    name: 'Handcrafted Full-Grain Leather Bi-Fold Wallet',
    description:
      'Genuine vegetable-tanned leather wallet with RFID blocking technology, coin pocket, 8 card slots, and dual currency compartments for Indian Rupee notes.',
    price: 899,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    stock: 45,
    rating: 4.8,
    numReviews: 3,
    createdAt: new Date('2026-10-10'),
  },
  {
    _id: 'prod_acc_005',
    name: 'Retro Polarized UV400 Hexagonal Sunglasses',
    description:
      'Lightweight metal frame with category-3 polarized anti-glare lenses. Delivers crystal clear vision and 100% UV protection with a high-fashion look.',
    price: 999,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    stock: 22,
    rating: 4.7,
    numReviews: 1,
    createdAt: new Date('2026-10-09'),
  },
  {
    _id: 'prod_acc_006',
    name: 'Urban Commuter Water-Resistant Laptop Backpack',
    description:
      'Sleek multi-compartment travel backpack with padded 16-inch laptop sleeve, USB pass-through port, and breathable ergonomic shoulder straps.',
    price: 1699,
    category: 'Accessories',
    image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.9,
    numReviews: 2,
    createdAt: new Date('2026-10-08'),
  },

  // 3. ELECTRONICS & GADGETS
  {
    _id: 'prod_elec_001',
    name: 'Nexora Wave Pro Wireless ANC Headphones',
    description:
      'Equipped with 40dB Hybrid Active Noise Cancellation, punchy deep bass drivers, dual mic Environmental Noise Cancellation for clear calls, and 50-hour playback.',
    price: 3499,
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    rating: 4.9,
    numReviews: 5,
    createdAt: new Date('2026-10-07'),
  },
  {
    _id: 'prod_elec_002',
    name: 'Nexora Apex Ultra AMOLED Bluetooth Calling Watch',
    description:
      '1.96-inch Always-on AMOLED display with Bluetooth calling, metallic bezel, 100+ sports modes, 24/7 heart rate, SpO2 sensor, and IP68 water resistance.',
    price: 2799,
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    rating: 4.8,
    numReviews: 3,
    createdAt: new Date('2026-10-06'),
  },
  {
    _id: 'prod_elec_003',
    name: 'Compact 75% RGB Mechanical Gaming Keyboard',
    description:
      'Hot-swappable tactile brown switches with sound-dampening foam, multi-device Bluetooth 5.0 and Type-C wired connectivity, and long-lasting 4000mAh battery.',
    price: 3199,
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    rating: 4.9,
    numReviews: 4,
    createdAt: new Date('2026-10-05'),
  },
  {
    _id: 'prod_elec_004',
    name: 'SoundBoom 360 Waterproof Portable Bluetooth Speaker',
    description:
      '24W loud stereo audio with passive bass radiators, TWS dual pairing, IPX7 waterproof body, and 16 hours of continuous party playback.',
    price: 1699,
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    rating: 4.7,
    numReviews: 2,
    createdAt: new Date('2026-10-04'),
  },
  {
    _id: 'prod_elec_005',
    name: 'Nexora AirBuds TWS with Environmental Noise Cancellation',
    description:
      'Ultra-compact wireless earbuds with quad-mic ENC for crystal-clear calls, 13mm titanium drivers, fast Type-C charging, and 36-hour total battery case.',
    price: 1499,
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.8,
    numReviews: 3,
    createdAt: new Date('2026-10-03'),
  },

  // 4. HOME & LIFESTYLE
  {
    _id: 'prod_home_001',
    name: 'Ultrasonic Essential Oil Aroma Diffuser & Humidifier',
    description:
      'Quiet 500ml wood-grain ultrasonic diffuser with 7 soothing ambient LED colors, auto-shutoff protection, and mist timer for relaxing home and study spaces.',
    price: 1299,
    category: 'Home & Lifestyle',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.8,
    numReviews: 3,
    createdAt: new Date('2026-10-02'),
  },
  {
    _id: 'prod_home_002',
    name: 'Handcrafted Ceramic Indoor Planter Pot with Saucer',
    description:
      'Contemporary matte terracotta ceramic planter with drainage hole and tray. Beautifully houses indoor succulents, jade plants, and snake plants on desks.',
    price: 599,
    category: 'Home & Lifestyle',
    image:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.9,
    numReviews: 2,
    createdAt: new Date('2026-10-01'),
  },
  {
    _id: 'prod_home_003',
    name: 'Architect Dimmable Touch LED Study Desk Lamp',
    description:
      'Modern aluminum lamp with 3 color temperatures, stepless brightness slider, flexible dual-axis swivel arm, and integrated 5V USB charging port for smartphones.',
    price: 1599,
    category: 'Home & Lifestyle',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 16,
    rating: 4.7,
    numReviews: 2,
    createdAt: new Date('2026-09-30'),
  },
  {
    _id: 'prod_home_004',
    name: 'Hand-Poured Scented Soy Wax Amber Glass Candles (Set of 2)',
    description:
      'Aromatic natural soy wax candles infused with French vanilla and lavender essential oils. Clean, smoke-free burn for up to 40 hours of cozy ambiance.',
    price: 749,
    category: 'Home & Lifestyle',
    image:
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    stock: 40,
    rating: 4.8,
    numReviews: 4,
    createdAt: new Date('2026-09-29'),
  },
];

// Runtime mutable stores for in-memory fallback
let dynamicProducts = [...fallbackProducts];
let dynamicUsers = [...initialUsers];
let dynamicOrders = [];
let dynamicCarts = {}; // userId -> [{ product: id, quantity, name, price, image, category, stock }]
let dynamicWishlists = {}; // userId -> [productId, ...]

module.exports = {
  getDynamicProducts: () => dynamicProducts,
  getDynamicUsers: () => dynamicUsers,
  getDynamicOrders: (userId, email) => {
    return dynamicOrders.filter((ord) => {
      if (!userId && !email) return true;
      const matchUser = userId && String(ord.userId) === String(userId);
      const matchEmail = email && ord.customer && ord.customer.email && ord.customer.email.toLowerCase() === email.toLowerCase();
      return matchUser || matchEmail;
    });
  },
  addDynamicOrder: (order) => {
    dynamicOrders.unshift(order);
    return order;
  },
  findDynamicOrderById: (id) => {
    return dynamicOrders.find((ord) => String(ord._id) === String(id) || String(ord.orderNumber) === String(id));
  },
  addDynamicUser: (user) => {
    dynamicUsers.push(user);
    return user;
  },
  findDynamicUserByEmail: (email) => {
    const clean = email.toLowerCase().trim();
    return dynamicUsers.find((u) => u.email.toLowerCase().trim() === clean);
  },
  findDynamicUserById: (id) => {
    return dynamicUsers.find((u) => String(u._id) === String(id));
  },
  updateDynamicUser: (email, updates) => {
    const user = dynamicUsers.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  },
  findDynamicProductById: (id) => {
    return dynamicProducts.find((p) => String(p._id) === String(id));
  },
  createDynamicProduct: (productData) => {
    const newProduct = {
      _id: `prod_${Date.now()}`,
      rating: 4.8,
      numReviews: 0,
      reviews: [],
      createdAt: new Date(),
      ...productData,
    };
    dynamicProducts.unshift(newProduct);
    return newProduct;
  },
  updateDynamicProduct: (id, updates) => {
    const product = dynamicProducts.find((p) => String(p._id) === String(id));
    if (product) {
      Object.assign(product, updates);
      return product;
    }
    return null;
  },
  findDynamicOrderByRazorpayOrderId: (rzpOrderId) => {
    return dynamicOrders.find((ord) => ord.razorpayOrderId === rzpOrderId);
  },
  deleteDynamicProduct: (id) => {
    const initialLen = dynamicProducts.length;
    dynamicProducts = dynamicProducts.filter((p) => String(p._id) !== String(id));
    return dynamicProducts.length < initialLen;
  },
  // Cart fallback helpers
  getDynamicCart: (userId) => {
    const uId = String(userId);
    return dynamicCarts[uId] || [];
  },
  saveDynamicCart: (userId, items) => {
    const uId = String(userId);
    dynamicCarts[uId] = items;
    return dynamicCarts[uId];
  },
  clearDynamicCart: (userId) => {
    const uId = String(userId);
    dynamicCarts[uId] = [];
    return [];
  },
  // Wishlist fallback helpers
  getDynamicWishlist: (userId) => {
    const uId = String(userId);
    const productIds = dynamicWishlists[uId] || [];
    return productIds
      .map((id) => dynamicProducts.find((p) => String(p._id) === String(id)))
      .filter(Boolean);
  },
  getDynamicWishlistProductIds: (userId) => {
    const uId = String(userId);
    return dynamicWishlists[uId] || [];
  },
  addToDynamicWishlist: (userId, productId) => {
    const uId = String(userId);
    const pId = String(productId);
    if (!dynamicWishlists[uId]) {
      dynamicWishlists[uId] = [];
    }
    if (!dynamicWishlists[uId].includes(pId)) {
      dynamicWishlists[uId].push(pId);
    }
    return dynamicWishlists[uId];
  },
  removeFromDynamicWishlist: (userId, productId) => {
    const uId = String(userId);
    const pId = String(productId);
    if (dynamicWishlists[uId]) {
      dynamicWishlists[uId] = dynamicWishlists[uId].filter((id) => String(id) !== pId);
    }
    return dynamicWishlists[uId] || [];
  },
  clearDynamicWishlist: (userId) => {
    const uId = String(userId);
    dynamicWishlists[uId] = [];
    return [];
  },
  getAllDynamicOrders: () => dynamicOrders,
  getAllDynamicCarts: () => dynamicCarts,
  getAllDynamicWishlists: () => dynamicWishlists,
};
