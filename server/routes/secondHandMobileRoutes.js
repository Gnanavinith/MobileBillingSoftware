const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/secondHandMobileController')

// CRUD operations
router.get('/', ctrl.listSecondHandMobiles)
router.post('/', ctrl.createSecondHandMobile)
router.get('/:id', ctrl.getSecondHandMobile)
router.put('/:id', ctrl.updateSecondHandMobile)
router.delete('/:id', ctrl.deleteSecondHandMobile)

// Special operations
router.put('/:id/sold', ctrl.markAsSold)
router.get('/stats/overview', ctrl.getStatistics)

module.exports = router
