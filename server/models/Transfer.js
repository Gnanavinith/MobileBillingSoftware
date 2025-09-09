const mongoose = require('mongoose')

const TransferProductSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productModel: { type: String, default: '' },
  productSku: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false })

const TransferSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fromStore: { type: String, required: true },
  toStore: { type: String, required: true },
  transferDate: { type: String, required: true },
  transferTime: { type: String, default: '' },
  paymentMode: { type: String, default: 'Cash' },
  remarks: { type: String, default: '' },
  products: { type: [TransferProductSchema], default: [] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'Completed' },
}, { timestamps: true })

module.exports = mongoose.model('Transfer', TransferSchema)


