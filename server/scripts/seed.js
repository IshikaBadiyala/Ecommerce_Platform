/**
 * Database Seed Script (Indian E-Commerce Catalogue with Rich Variety in Every Category)
 * ---------------------------------------------------------------------------------------
 * Populates MongoDB Atlas with 24+ items across:
 * - Clothing (Women's Tops, Dresses, Kurti Sets & Men's Streetwear Hoodies, Shirts)
 * - Accessories (Women's Purses, Handbags, Crossbody Slings, Wallets, Sunglasses)
 * - Electronics (ANC Headphones, Smartwatches, Mechanical Keyboards, Speakers)
 * - Home & Lifestyle (Diffusers, Ceramic Planters, Desk Lamps, Home Decor)
 * 
 * Usage:
 *   cd server
 *   npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const sampleProducts = [
  // ==========================================
  // 1. CLOTHING (WOMEN & MEN) - 7 Products
  // ==========================================
  {
    name: "Women's Floral Ribbed Peplum Top",
    description:
      'Chic square-neck peplum top with soft floral prints, puff sleeves, and breathable cotton-rayon blend. Perfect for college, brunch, and casual outings.',
    price: 899,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=80',
    stock: 35,
    rating: 4.8,
    numReviews: 4,
    reviews: [
      {
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Beautiful floral print and breathable fabric. Got so many compliments in college!',
        createdAt: new Date('2026-10-20'),
      },
      {
        userName: 'Ananya Roy',
        rating: 5,
        comment: 'Fitting is true to size. Soft rayon material.',
        createdAt: new Date('2026-10-18'),
      },
    ],
  },
  {
    name: "Women's Elegant Olive Ribbed Knit Crop Top",
    description:
      'Trendy slim-fit ribbed top in serene olive green. Features a sweetheart neckline, stretchable fabric, and pairs effortlessly with high-waisted jeans and trousers.',
    price: 749,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    stock: 28,
    rating: 4.7,
    numReviews: 2,
    reviews: [
      {
        userName: 'Megha Gupta',
        rating: 5,
        comment: 'Super soft ribbed knit fabric. Very flattering fit!',
        createdAt: new Date('2026-10-19'),
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
    name: "Men's Heavyweight Oversized Streetwear Hoodie",
    description:
      'Premium 380 GSM fleece cotton hoodie with drop shoulders, kangaroo pouch pocket, and ribbed cuffs. Designed for cozy warmth and modern oversized streetwear aesthetics.',
    price: 1899,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    stock: 40,
    rating: 4.9,
    numReviews: 3,
    reviews: [
      {
        userName: 'Rohit Mehta',
        rating: 5,
        comment: 'Heavyweight material and super warm. The oversized drop-shoulder cut looks amazing.',
        createdAt: new Date('2026-10-21'),
      },
    ],
  },
  {
    name: "Men's Relaxed Fit Pure Linen Casual Shirt",
    description:
      'Breathable pre-washed pure European linen shirt with a mandarin collar. Naturally cooling, soft against the skin, and ideal for warm weather and festive outings.',
    price: 1499,
    category: 'Clothing',
    image:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    rating: 4.7,
    numReviews: 2,
  },
  {
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
  },

  // ==========================================
  // 2. ACCESSORIES (PURSES, BAGS & WALLETS) - 6 Products
  // ==========================================
  {
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
    reviews: [
      {
        userName: 'Divya Patel',
        rating: 5,
        comment: 'High quality vegan leather! Looks like a luxury brand bag. Gold chain adds elegance.',
        createdAt: new Date('2026-10-15'),
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },

  // ==========================================
  // 3. ELECTRONICS & GADGETS - 5 Products
  // ==========================================
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },

  // ==========================================
  // 4. HOME & LIFESTYLE - 4 Products
  // ==========================================
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[Seed Error]: MONGODB_URI is not set in server/.env');
      process.exit(1);
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database.');

    console.log('[Seed] Clearing existing collections...');
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
    const shopperPasswordHash = await bcrypt.hash('Shopper@12345', salt);

    console.log('[Seed] Creating demo accounts...');
    const adminUser = await User.create({
      name: 'Nexora Administrator',
      email: 'admin@nexora.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const shopperUser = await User.create({
      name: 'Ishika Sharma',
      email: 'shopper@nexora.com',
      passwordHash: shopperPasswordHash,
      role: 'user',
    });

    console.log(`[Seed] Created Admin User: admin@nexora.com (Password: Admin@12345)`);
    console.log(`[Seed] Created Demo Shopper: shopper@nexora.com (Password: Shopper@12345)`);

    // Assign userId to sample reviews
    const productsToInsert = sampleProducts.map((p) => {
      const pCopy = { ...p };
      if (pCopy.reviews && pCopy.reviews.length > 0) {
        pCopy.reviews = pCopy.reviews.map((r) => ({
          ...r,
          userId: shopperUser._id,
        }));
      }
      return pCopy;
    });

    console.log('[Seed] Inserting 22 Indian catalogue products across all categories...');
    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Successfully inserted ${insertedProducts.length} products!`);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! (INR ₹)');
    console.log('======================================================');
    console.log('You can now log in with either:');
    console.log('  - Admin:   email: admin@nexora.com   | password: Admin@12345');
    console.log('  - Shopper: email: shopper@nexora.com | password: Shopper@12345\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedData();
