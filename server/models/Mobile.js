const mongoose = require('mongoose')

const MobileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mobileName: { type: String, required: true },
  brand: { type: String, default: '', index: true },
  modelNumber: { type: String, required: true },
  imeiNumber1: { type: String, default: undefined, unique: true, sparse: true, index: true },
  imeiNumber2: { type: String, default: undefined, unique: true, sparse: true },
  dealerId: { type: String, required: true, index: true },
  dealerName: { type: String, required: true },
  // Generated unique item codes used for billing (e.g., VIV-MOB-Y21-0001)
  productIds: { type: [String], default: [], index: true },
  pricePerProduct: { type: Number, required: false, min: 0, default: 0 },
  sellingPrice: { type: Number, required: false, min: 0, default: 0 },
  totalQuantity: { type: Number, required: true, min: 0, default: 1 },
  // Feature fields
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
}, { timestamps: true })

module.exports = mongoose.model('Mobile', MobileSchema)


