const mongoose = require('mongoose')

const AccessorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  dealerId: { type: String, required: true, index: true },
  dealerName: { type: String, required: true },
  // Single productId identifies this accessory SKU (prefix like RAJ-ACC-EAR)
  productId: { type: String, required: true, unique: true, index: true },
  // Generated unique item codes for each unit sold (e.g., RAJ-ACC-EAR-0001)
  productIds: { type: [String], default: [], index: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: false, min: 0, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Accessory', AccessorySchema)


