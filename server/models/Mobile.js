const mongoose = require('mongoose')

const MobileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mobileName: { type: String, required: true },
  modelNumber: { type: String, required: true },
  imeiNumber1: { type: String, required: true, unique: true, index: true },
  imeiNumber2: { type: String, default: '', unique: true, sparse: true },
  dealerId: { type: String, required: true, index: true },
  dealerName: { type: String, required: true },
  pricePerProduct: { type: Number, required: true, min: 0 },
  totalQuantity: { type: Number, required: true, min: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Mobile', MobileSchema)


