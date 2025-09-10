const mongoose = require('mongoose')

const ServicePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productId: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  gstPercent: { type: Number, default: 18 },
  discountType: { type: String, default: 'percent' },
  discountValue: { type: Number, default: 0 },
}, { _id: false })

const ServiceInvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  serviceBillNumber: { type: String, required: true },
  customerName: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  modelName: { type: String, default: '' },
  imei: { type: String, default: '' },
  idProofUrl: { type: String, default: '' },
  problem: { type: String, default: '' },
  paymentMethod: { type: String, default: 'Cash' },
  parts: { type: [ServicePartSchema], default: [] },
  laborCost: { type: Number, default: 0 },
  partsSubtotal: { type: Number, default: 0 },
  partsDiscounts: { type: Number, default: 0 },
  partsGst: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('ServiceInvoice', ServiceInvoiceSchema)


