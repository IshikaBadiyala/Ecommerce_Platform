const mongoose = require('mongoose');
require('dotenv').config();

const updateProducts = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to Atlas successfully!');

    const Product = require('../models/Product');

    // 1. Oversized Sweater
    const r1 = await Product.updateOne(
      { _id: '6adda64d0b992eca97833788' },
      {
        $set: {
          name: "Women's Cozy Oversized Knit Sweater",
          description: 'Chic chunky-knit oversized sweater with relaxed drop shoulders, ribbed crewneck collar, and ultra-soft breathable yarn. Perfect for winter, layering, and cozy casual outings.',
          image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
          price: 1299,
        },
      }
    );
    console.log('Updated Oversized Sweater:', r1.modifiedCount);

    // 2. Stylish Jacket
    const r2 = await Product.updateOne(
      { _id: '6adda64d0b992eca97833789' },
      {
        $set: {
          name: "Men's Urban Streetwear Bomber Jacket",
          description: 'Classic insulated bomber jacket featuring premium ribbed cuffs, front zip closure, side welt pockets, and a modern tailored street fit.',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
          price: 2499,
        },
      }
    );
    console.log('Updated Bomber Jacket:', r2.modifiedCount);

    // 3. Oversized Streetwear Hoodie
    const r3 = await Product.updateOne(
      { _id: '6adda64d0b992eca9783378a' },
      {
        $set: {
          name: "Men's Heavyweight Oversized Streetwear Hoodie",
          description: 'Premium 380 GSM fleece cotton hoodie with drop shoulders, kangaroo pouch pocket, and ribbed cuffs. Designed for cozy warmth and modern oversized streetwear aesthetics.',
          image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
          price: 1899,
        },
      }
    );
    console.log('Updated Oversized Hoodie:', r3.modifiedCount);

    // 4. Men's Knit Sweater
    const r4 = await Product.updateOne(
      { _id: '6adda64d0b992eca9783378b' },
      {
        $set: {
          name: "Men's Classic Textured Knit Crewneck Sweater",
          description: 'Sophisticated textured knit pullover sweater made from 100% fine cotton-wool blend. Features a ribbed collar, warm athletic drape, and versatile styling for work and weekends.',
          image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80',
          price: 1599,
        },
      }
    );
    console.log('Updated Men\'s Sweater:', r4.modifiedCount);

    const clothing = await Product.find({ category: 'Clothing' }, 'name image price');
    console.log('\nFINAL CLOTHING PRODUCTS IN MONGODB ATLAS:');
    console.log(JSON.stringify(clothing, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
};

updateProducts();
