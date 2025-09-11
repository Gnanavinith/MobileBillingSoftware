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
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/mobilebill'
mongoose.connect(MONGO_URL).then(() => {
  console.log('MongoDB connected')
}).catch(err => {
  console.error('MongoDB connection error:', err)
})

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
