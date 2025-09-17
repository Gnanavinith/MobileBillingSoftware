const mongoose = require('mongoose')

// Tracks the last used counter per DealerCode-CategoryCode-ProductCode
// key format: <DEALER>-<CAT>-<PROD>
const ProductCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  lastCounter: { type: Number, required: true, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('ProductCounter', ProductCounterSchema)


