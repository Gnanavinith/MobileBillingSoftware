const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/dealerController')

router.get('/', ctrl.listDealers)
router.post('/', ctrl.createDealer)
router.put('/:id', ctrl.updateDealer)
router.delete('/:id', ctrl.deleteDealer)

module.exports = router


