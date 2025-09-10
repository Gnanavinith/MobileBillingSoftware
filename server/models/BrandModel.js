const mongoose = require('mongoose')

const BrandModelSchema = new mongoose.Schema({
  brand: { type: String, required: true, index: true },
  model: { type: String, required: true, unique: true, index: true },
  aliases: { type: [String], default: [] },
}, { timestamps: true })

module.exports = mongoose.model('BrandModel', BrandModelSchema)


