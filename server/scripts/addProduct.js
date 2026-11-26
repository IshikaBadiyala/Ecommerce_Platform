const mongoose = require('mongoose');
require('dotenv').config();

const addProduct = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const Product = require('../models/Product');

    const newProduct = await Product.create({
      name: "Women's Tiered Bohemian Floral Summer Dress",
      description: 'Flowy tiered midi dress with subtle ruffles, adjustable waist drawstring, and lightweight breathable rayon. Perfect for sunny days, vacations, and casual outings.',
      price: 1399,
      category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      stock: 25,
      rating: 4.9,
      numReviews: 6,
    });

    console.log('Created product in Atlas:', newProduct._id, newProduct.name);
    const clothing = await Product.find({ category: 'Clothing' }, 'name price image');
    console.log('Total Clothing items in Atlas (' + clothing.length + '):');
    console.log(JSON.stringify(clothing, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error adding product:', err);
    process.exit(1);
  }
};

addProduct();
