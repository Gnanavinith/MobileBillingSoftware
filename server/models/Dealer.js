const mongoose = require('mongoose')

const DealerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  address: { type: String, default: '' },
  email: { type: String, default: '' },
  gst: { type: String, default: '', index: true },
  notes: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Dealer', DealerSchema)


