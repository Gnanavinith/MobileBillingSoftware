const mongoose = require('mongoose')

const SecondHandMobileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  brand: { type: String, required: true, index: true },
  model: { type: String, required: true },
  modelNumber: { type: String, default: '' },
  imeiNumber1: { type: String, default: '', unique: true, sparse: true, index: true },
  imeiNumber2: { type: String, default: '', unique: true, sparse: true },
  
  // Condition and assessment
  condition: { 
    type: String, 
    required: true, 
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  conditionNotes: { type: String, default: '' },
  
  // Purchase details
  purchasePrice: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, default: Date.now },
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, default: '' },
  sellerAddress: { type: String, default: '' },
  
  // Customer details
  customerType: { 
    type: String, 
    required: true, 
    enum: ['individual', 'shop'],
    default: 'individual'
  },
  customerAddress: { type: String, required: true },
  idProofType: { 
    type: String, 
    required: true,
    enum: ['aadhar', 'voter', 'license', 'pan', 'passport', 'other']
  },
  idProofNumber: { type: String, required: true },
  
  // Selling details
  sellingPrice: { type: Number, required: true, min: 0 },
  profitMargin: { type: Number, default: 0 },
  
  // Status and tracking
  status: { 
    type: String, 
    required: true, 
    enum: ['available', 'sold', 'returned', 'damaged'],
    default: 'available'
  },
  saleDate: { type: Date },
  buyerName: { type: String, default: '' },
  buyerPhone: { type: String, default: '' },
  
  // Mobile specifications
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
  
  // Additional features
  accessories: { type: [String], default: [] }, // charger, box, etc.
  warranty: {
    hasWarranty: { type: Boolean, default: false },
    warrantyPeriod: { type: String, default: '' }, // 3 months, 6 months, etc.
    warrantyNotes: { type: String, default: '' }
  },
  photos: { type: [String], default: [] }, // URLs to uploaded photos
  notes: { type: String, default: '' },
  
  // Tracking
  addedBy: { type: String, default: '' }, // staff member who added
  lastUpdatedBy: { type: String, default: '' },
}, { timestamps: true })

// Pre-save middleware to calculate profit margin
SecondHandMobileSchema.pre('save', function(next) {
  if (this.purchasePrice && this.sellingPrice) {
    this.profitMargin = this.sellingPrice - this.purchasePrice
  }
  next()
})

// Index for better query performance
SecondHandMobileSchema.index({ status: 1, condition: 1 })
SecondHandMobileSchema.index({ brand: 1, model: 1 })
SecondHandMobileSchema.index({ purchaseDate: -1 })

module.exports = mongoose.model('SecondHandMobile', SecondHandMobileSchema)
