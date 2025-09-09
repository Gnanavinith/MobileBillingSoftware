const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/transferController')

router.get('/', ctrl.listTransfers)
router.post('/', ctrl.createTransfer)
router.put('/:id', ctrl.updateTransfer)
router.delete('/:id', ctrl.deleteTransfer)

module.exports = router


