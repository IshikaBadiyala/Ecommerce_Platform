/**
 * Admin Promotion CLI Script
 * --------------------------
 * Easily promotes any user to 'admin' role in MongoDB Atlas.
 * 
 * Usage:
 *   cd server
 *   node scripts/makeAdmin.js user@example.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('\nUsage: node scripts/makeAdmin.js <user-email>');
  console.error('Example: node scripts/makeAdmin.js myemail@gmail.com\n');
  process.exit(1);
}

const promoteUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[Error]: MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: emailToPromote.toLowerCase().trim() });
    if (!user) {
      console.error(`\n[Error]: No user found with email "${emailToPromote}". Please register first.\n`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`\n[Success]: User "${user.name}" (${user.email}) has been granted the 'admin' role!\n`);
    process.exit(0);
  } catch (err) {
    console.error('[Error]:', err.message);
    process.exit(1);
  }
};

promoteUser();
