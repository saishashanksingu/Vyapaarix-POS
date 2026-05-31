require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Store = require('./models/Store');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const bcrypt = require('bcryptjs');
const { roundMoney } = require('./utils/units');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Store.deleteMany();
  await Product.deleteMany();
  await Sale.deleteMany();

  const store = await Store.create({
    name: 'Demo Supermarket',
    cashierInviteCode: 'DEMO2026'
  });

  // Sample Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@supermarket.com',
    password: hashedPassword,
    role: 'Admin',
    store: store._id
  });
  store.owner = admin._id;
  await store.save();
  console.log('✅ Admin created: admin@supermarket.com / admin123');

  // Sample Cashier
  const hashedCashier = await bcrypt.hash('cashier123', 10);
  await User.create({
    name: 'Cashier User',
    email: 'cashier@supermarket.com',
    password: hashedCashier,
    role: 'Cashier',
    store: store._id,
    createdBy: admin._id
  });

  // Sample Products
  const products = [
    { name: 'Milk 1L', barcode: '1234567890123', price: 50, stockQuantity: 100, unit: 'liter' },
    { name: 'Bread', barcode: '2345678901234', price: 30, stockQuantity: 50, unit: 'piece' },
    { name: 'Eggs 6pc', barcode: '3456789012345', price: 80, stockQuantity: 20, unit: 'box' },
    { name: 'Rice 5kg', barcode: '4567890123456', price: 300, stockQuantity: 10, unit: 'kg' },
    { name: 'Apple', barcode: '5678901234567', price: 80, stockQuantity: 25.5, unit: 'kg' },
    { name: 'Tomatoes', barcode: '6789012345678', price: 40, stockQuantity: 15.2, unit: 'kg' },
    { name: 'Cooking Oil 500ml', barcode: '7890123456789', price: 120, stockQuantity: 30.5, unit: 'liter' },
    { name: 'Sugar', barcode: '8901234567890', price: 45, stockQuantity: 20.75, unit: 'kg' }
  ];
  const insertedProducts = await Product.insertMany(products.map((product) => ({
    ...product,
    store: store._id
  })));
  console.log('✅ 8 products seeded');

  // Sample Sale
  const saleItems = insertedProducts.slice(0, 3).map(p => {
    const quantity = ['piece', 'box', 'pack'].includes(p.unit) ? 2 : 1.5;
    const lineTotal = roundMoney(p.price * quantity);
    return {
      productId: p._id,
      name: p.name,
      quantity,
      unit: p.unit || 'piece',
      price: p.price,
      lineTotal
    };
  });
  await Sale.create({
    items: saleItems,
    totalAmount: saleItems.reduce((sum, item) => roundMoney(sum + item.lineTotal), 0),
    store: store._id,
    cashier: admin._id
  });
  console.log('✅ Sample sales seeded');

  console.log('🎉 Seeding complete! Login with admin@supermarket.com / admin123');
  console.log('Cashier invite code: DEMO2026');
  process.exit(0);
};

seedData().catch(console.error);
