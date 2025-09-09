const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/purchaseController')

router.get('/', ctrl.listPurchases)
router.post('/', ctrl.createPurchase)

module.exports = router


