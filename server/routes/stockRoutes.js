const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/stockController')
const StoreStock = require('../models/StoreStock')
const saleCtrl = require('../controllers/saleController')

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

// Low stock combined
router.get('/low-stock', ctrl.listLowStock)

// Maintenance
router.post('/mobiles/normalize-imeis', ctrl.normalizeMobileImeis)

module.exports = router

// Extra endpoint: per-store stock query
router.get('/store-stock', async (req, res) => {
  try {
    const { storeId, productId } = req.query
    const q = {}
    if (storeId) q.storeId = storeId
    if (productId) q.productId = productId
    const rows = await StoreStock.find(q).lean()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
})

// Record a sale and reduce stock by IMEI or product
router.post('/sale', saleCtrl.createSale)
// List sales for reports
router.get('/sale', saleCtrl.listSales)


