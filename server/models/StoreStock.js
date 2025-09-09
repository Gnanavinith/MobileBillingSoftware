const mongoose = require('mongoose')

const StoreStockSchema = new mongoose.Schema({
  storeId: { type: String, required: true, index: true },
  productId: { type: String, required: true },
  productName: { type: String, default: '' },
  productModel: { type: String, default: '' },
  productSku: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true })

StoreStockSchema.index({ storeId: 1, productId: 1 }, { unique: true })

module.exports = mongoose.model('StoreStock', StoreStockSchema)


