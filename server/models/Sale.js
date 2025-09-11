const mongoose = require('mongoose')

const SaleItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, default: '' },
  imei: { type: String, default: '' },
  productId: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  gstPercent: { type: Number, default: 18 },
  discountType: { type: String, default: 'percent' },
  discountValue: { type: Number, default: 0 },
  // Mobile features
  color: { type: String, default: '' },
  ram: { type: String, default: '' },
  storage: { type: String, default: '' },
  simSlot: { type: String, default: '' },
  processor: { type: String, default: '' },
  displaySize: { type: String, default: '' },
  camera: { type: String, default: '' },
  battery: { type: String, default: '' },
  operatingSystem: { type: String, default: '' },
  networkType: { type: String, default: '' },
}, { _id: false })

const SaleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  billNumber: { type: String, required: true },
  customerName: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  saleDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: 'Cash' },
  items: { type: [SaleItemSchema], default: [] },
  subTotal: { type: Number, required: true, min: 0 },
  totalDiscountOnItems: { type: Number, default: 0 },
  billLevelDiscount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Sale', SaleSchema)
