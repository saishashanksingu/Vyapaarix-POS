require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const flushDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Flushing all data...');
    
    await User.deleteMany({});
    console.log('✅ All users deleted');
    
    await Product.deleteMany({});
    console.log('✅ All products deleted');
    
    await Sale.deleteMany({});
    console.log('✅ All sales deleted');
    
    console.log('🎉 Database flushed successfully! All data cleared.');
    console.log('🔄 Ready to test from scratch with zero data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error flushing database:', error.message);
    process.exit(1);
  }
};

flushDatabase();
