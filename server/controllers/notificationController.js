const Notification = require('../models/Notification')

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { userId = 'system', unreadOnly = false } = req.query
    const query = { userId }
    
    if (unreadOnly === 'true') {
      query.isRead = false
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const { userId = 'system' } = req.body
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    )
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    
    res.json({ success: true, notification })
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId = 'system' } = req.body
    
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    )
    
    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount 
    })
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, data, userId = 'system' } = req.body
    
    const notification = new Notification({
      type,
      title,
      message,
      data,
      userId
    })
    
    await notification.save()
    res.status(201).json(notification)
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId = 'system' } = req.query
    
    const count = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    })
    
    res.json({ unreadCount: count })
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Delete old notifications (cleanup)
exports.cleanupOldNotifications = async (req, res) => {
  try {
    const daysOld = Number(req.query.days) || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    })
    
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    })
  } catch (err) {
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}
