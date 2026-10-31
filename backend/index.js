const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const { Order, OrderItem } = require('./models/Order');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Ensure static uploads directory exists
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration supporting environment variable whitelists
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-permissive fallback
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ELARIX E-Commerce API',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: 'connected',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend static build in production / single-host mode
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Single Page Application catch-all for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root ping fallback when frontend is not built
  app.get('/', (req, res) => {
    res.send('ELARIX API is running...');
  });
}

// Centralized 404 handler for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
  console.error('[ELARIX Server Error]', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const { autoSeedIfEmpty } = require('./scripts/initProductionDb');

sequelize
  .sync()
  .then(async () => {
    try {
      await autoSeedIfEmpty();
    } catch (seedErr) {
      console.warn('[ELARIX Init Warning]', seedErr.message);
    }

    // Flag-gated one-time production catalog migration
    // Enabled ONLY when RUN_CATALOG_MIGRATION=true is set in the environment
    if (process.env.RUN_CATALOG_MIGRATION === 'true') {
      console.log('====================================================');
      console.log('[ELARIX Migration] RUN_CATALOG_MIGRATION=true detected.');
      console.log('[ELARIX Migration] Executing catalog migration before opening server listener...');
      console.log('====================================================');
      try {
        const { updateCatalog } = require('./scripts/updateCatalog');
        await updateCatalog();
        console.log('[ELARIX Migration] Catalog migration completed successfully.');
      } catch (migrationErr) {
        const rawMsg = migrationErr?.message || String(migrationErr);
        const safeMsg = rawMsg.replace(/:\/\/[^@]*@/, '://***:***@');
        console.error('[ELARIX Migration Fatal Error] Startup aborted. Catalog migration failed:', safeMsg);
        process.exit(1);
      }
    }

    app.listen(PORT, '0.0.0.0', () => console.log(`ELARIX Server running on port ${PORT} (host: 0.0.0.0)`));
  })
  .catch((err) => {
    const rawMsg = err?.message || String(err);
    const safeMsg = rawMsg.replace(/:\/\/[^@]*@/, '://***:***@');
    console.error('Database connection failed:', safeMsg);
  });
