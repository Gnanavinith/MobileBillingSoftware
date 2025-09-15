const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['low_stock', 'service_reminder', 'payment_due', 'system_alert']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  userId: {
    type: String,
    default: 'system' // For system-wide notifications
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ type: 1, isRead: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
