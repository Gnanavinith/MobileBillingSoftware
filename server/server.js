const path = require('path')
const fs = require('fs')

// Log startup info
console.log('=== Server Starting ===')
console.log('Current directory:', __dirname)
console.log('Process args:', process.argv)
console.log('Node version:', process.version)

// Try to load .env
const envPath = path.join(__dirname, '.env')
console.log('Looking for .env at:', envPath)
if (fs.existsSync(envPath)) {
  console.log('.env file found, loading...')
  require('dotenv').config({ path: envPath })
} else {
  console.log('.env file NOT found, using defaults')
}

console.log('Environment variables:')
console.log('- MONGO_URL:', process.env.MONGO_URL || 'NOT SET')
console.log('- PORT:', process.env.PORT || 'NOT SET')
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dealerRoutes = require("./routes/dealerRoutes");
const authRoutes = require("./routes/authRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const stockRoutes = require("./routes/stockRoutes");
const brandModelRoutes = require("./routes/brandModelRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const serviceInvoiceRoutes = require("./routes/serviceInvoiceRoutes");
const transferRoutes = require("./routes/transferRoutes");
const secondHandMobileRoutes = require("./routes/secondHandMobileRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// Mongo connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mobilebill'
console.log('Attempting MongoDB connection to:', MONGO_URL)
mongoose.connect(MONGO_URL, {
  family: 4, // Force IPv4
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('✅ MongoDB connected successfully')
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message)
  console.error('Full error:', err)
})

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Simple health check with DB status
app.get('/api/health', (_req, res) => {
  const state = mongoose.connection?.readyState
  // 1 = connected, 2 = connecting
  res.json({ up: true, dbState: state })
})

app.use('/api/auth', authRoutes)
// Routes
app.use('/api/dealers', dealerRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api', stockRoutes)
app.use('/api/brand-models', brandModelRoutes)
app.use('/api/service-invoices', serviceInvoiceRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/secondhand-mobiles', secondHandMobileRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: "Internal Server Error", details: String(err?.message || err) })
})

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
console.log('Starting server on port:', PORT)
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`)
  console.log('=== Server Ready ===')
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err.message)
  if (err.code === 'EADDRINUSE') {
    console.error('Port', PORT, 'is already in use. Try a different port.')
  }
})
