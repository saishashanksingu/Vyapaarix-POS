require('dotenv').config();
const connectDB=require("./config/db");
const express=require("express");
const cors=require("cors");
const authMiddleware = require('./middleware/auth');

const productRoutes=require("./routes/productRoutes");
const salesRoutes=require("./routes/salesRoutes");
const analyticsRoutes=require("./routes/analyticsRoutes");
const authRoutes=require("./routes/authRoutes");

const app=express();

connectDB();

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin/non-browser tools (no Origin header)
    if (!origin) return cb(null, true);

    // Allow local dev servers (Vite may shift ports)
    if (/^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return cb(null, true);

    // Allow Vercel deployed apps
    if (origin && origin.includes('vercel.app')) return cb(null, true);
    
    // Allow production domains (add your domain here)
    if (process.env.ALLOWED_ORIGINS) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      if (allowedOrigins.includes(origin)) return cb(null, true);
    }

    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api/auth",authRoutes);

// Protected routes
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/sales", authMiddleware, salesRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});

