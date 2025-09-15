const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/notificationController')

// Get notifications
router.get('/', ctrl.getNotifications)

// Get unread count
router.get('/unread-count', ctrl.getUnreadCount)

// Mark notification as read
router.patch('/:id/read', ctrl.markAsRead)

// Mark all notifications as read
router.patch('/mark-all-read', ctrl.markAllAsRead)

// Create notification (admin/system use)
router.post('/', ctrl.createNotification)

// Cleanup old notifications
router.delete('/cleanup', ctrl.cleanupOldNotifications)

module.exports = router
