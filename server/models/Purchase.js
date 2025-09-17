const mongoose = require('mongoose')

const PurchaseItemSchema = new mongoose.Schema({
  category: { type: String, default: '' },
  productName: { type: String, required: true },
  productId: { type: String, default: '' },
  model: { type: String, default: '' },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  // Mobile-specific optional attributes
  color: { type: String, default: '' },
  ram: { type: String, default: '' },
  storage: { type: String, default: '' },
  imeiNumber1: { type: String, default: '' },
  imeiNumber2: { type: String, default: '' },
}, { _id: false })

const PurchaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  dealerId: { type: String, required: true, index: true },
  purchaseDate: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  paymentMode: { type: String, default: 'Cash' },
  gstEnabled: { type: Boolean, default: false },
  gstPercentage: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Received'], default: 'Pending', index: true },
  receivedAt: { type: Date },
  items: { type: [PurchaseItemSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('Purchase', PurchaseSchema)


