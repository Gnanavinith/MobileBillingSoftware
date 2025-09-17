const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/purchaseController')

router.get('/', ctrl.listPurchases)
router.post('/', ctrl.createPurchase)
router.patch('/:id/status', ctrl.updateStatus)
router.post('/:id/receive', ctrl.receivePurchase)
router.get('/:id/receive', ctrl.receivePurchase)

module.exports = router


