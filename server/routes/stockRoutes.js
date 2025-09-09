const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/stockController')

// Mobiles
router.post('/mobiles', ctrl.createMobile)
router.get('/mobiles', ctrl.listMobiles)
router.put('/mobiles/:id', ctrl.updateMobile)
router.delete('/mobiles/:id', ctrl.deleteMobile)

// Accessories
router.post('/accessories', ctrl.createAccessory)
router.get('/accessories', ctrl.listAccessories)
router.put('/accessories/:id', ctrl.updateAccessory)
router.delete('/accessories/:id', ctrl.deleteAccessory)

module.exports = router


