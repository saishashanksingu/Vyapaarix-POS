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

// Log environment on startup
console.log("🚀 Starting Supermarket Backend Server...");
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || 5000}`);

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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(503).json({
      message: "Database connection unavailable",
      error: error.message,
    });
  }
};

// Public routes
app.use("/api/auth", ensureDatabase, authRoutes);

// Protected routes
app.use("/api/products", ensureDatabase, authMiddleware, productRoutes);
app.use("/api/sales", ensureDatabase, authMiddleware, salesRoutes);
app.use("/api/analytics", ensureDatabase, authMiddleware, analyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB: ${process.env.DATABASE_URL ? 'Railway Plugin' : (process.env.MONGODB_URI ? 'Custom URI' : 'Local')}`);
  });
}

module.exports = app;
