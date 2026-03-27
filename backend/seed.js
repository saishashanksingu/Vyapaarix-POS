require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Product.deleteMany();
  await Sale.deleteMany();

  // Sample Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@supermarket.com',
    password: hashedPassword,
    role: 'Admin'
  });
  console.log('✅ Admin created: admin@supermarket.com / admin123');

  // Sample Cashier
  const hashedCashier = await bcrypt.hash('cashier123', 10);
  await User.create({
    name: 'Cashier User',
    email: 'cashier@supermarket.com',
    password: hashedCashier,
    role: 'Cashier'
  });

  // Sample Products
  const products = [
    { name: 'Milk 1L', barcode: '1234567890123', price: 50, stockQuantity: 100 },
    { name: 'Bread', barcode: '2345678901234', price: 30, stockQuantity: 50 },
    { name: 'Eggs 6pc', barcode: '3456789012345', price: 80, stockQuantity: 20 },
    { name: 'Rice 5kg', barcode: '4567890123456', price: 300, stockQuantity: 10 },
    { name: 'Apple 1kg', barcode: '5678901234567', price: 150, stockQuantity: 30 },
  ];
  await Product.insertMany(products);
  console.log('✅ 5 products seeded');

  // Sample Sale
  const saleItems = products.slice(0, 3).map(p => ({
    productId: p._id,
    name: p.name,
    quantity: 2,
    price: p.price
  }));
  await Sale.create({ items: saleItems, totalAmount: 260 }); // 50*2 + 30*2 + 80*2 = 260
  console.log('✅ Sample sales seeded');

  console.log('🎉 Seeding complete! Login with admin@supermarket.com / admin123');
  process.exit(0);
};

seedData().catch(console.error);
