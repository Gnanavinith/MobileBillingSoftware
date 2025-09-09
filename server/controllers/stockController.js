const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')
const Dealer = require('../models/Dealer')

function genId(prefix) {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `${prefix}-${yy}${mm}${dd}-${ms}`
}

// Mobiles
exports.createMobile = async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.mobileName || !b.modelNumber || !b.imeiNumber1 || !b.dealerId || !b.pricePerProduct || !b.totalQuantity) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (Number(b.pricePerProduct) <= 0 || Number(b.totalQuantity) <= 0) {
      return res.status(400).json({ error: 'Price and quantity must be > 0' })
    }
    const dealer = await Dealer.findOne({ id: b.dealerId })
    if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
    const id = genId('MOB')
    const doc = await Mobile.create({
      id,
      mobileName: b.mobileName,
      modelNumber: b.modelNumber,
      imeiNumber1: b.imeiNumber1,
      imeiNumber2: b.imeiNumber2 || '',
      dealerId: dealer.id,
      dealerName: dealer.name,
      pricePerProduct: Number(b.pricePerProduct),
      totalQuantity: Number(b.totalQuantity),
    })
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.listMobiles = async (req, res) => {
  try {
    const { dealerId, modelNumber } = req.query
    const q = {}
    if (dealerId) q.dealerId = dealerId
    if (modelNumber) q.modelNumber = modelNumber
    const rows = await Mobile.find(q).sort({ createdAt: -1 }).lean()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.updateMobile = async (req, res) => {
  try {
    const { id } = req.params
    const b = req.body || {}
    const doc = await Mobile.findOne({ id })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    if (b.pricePerProduct != null && Number(b.pricePerProduct) <= 0) return res.status(400).json({ error: 'Invalid price' })
    if (b.totalQuantity != null && Number(b.totalQuantity) < 0) return res.status(400).json({ error: 'Invalid quantity' })
    if (b.dealerId) {
      const dealer = await Dealer.findOne({ id: b.dealerId })
      if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
      doc.dealerId = dealer.id
      doc.dealerName = dealer.name
    }
    ;['mobileName','modelNumber','imeiNumber1','imeiNumber2','pricePerProduct','totalQuantity'].forEach(k => {
      if (b[k] != null) doc[k] = b[k]
    })
    await doc.save()
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.deleteMobile = async (req, res) => {
  try {
    const { id } = req.params
    const r = await Mobile.deleteOne({ id })
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

// Accessories
exports.createAccessory = async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.productId || !b.productName || !b.dealerId || !b.quantity || !b.unitPrice) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (Number(b.quantity) <= 0 || Number(b.unitPrice) <= 0) {
      return res.status(400).json({ error: 'Price and quantity must be > 0' })
    }
    const dealer = await Dealer.findOne({ id: b.dealerId })
    if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
    const id = genId('ACC')
    const doc = await Accessory.create({
      id,
      dealerId: dealer.id,
      dealerName: dealer.name,
      productId: b.productId,
      productName: b.productName,
      quantity: Number(b.quantity),
      unitPrice: Number(b.unitPrice),
    })
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.listAccessories = async (req, res) => {
  try {
    const { dealerId, productId } = req.query
    const q = {}
    if (dealerId) q.dealerId = dealerId
    if (productId) q.productId = productId
    const rows = await Accessory.find(q).sort({ createdAt: -1 }).lean()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.updateAccessory = async (req, res) => {
  try {
    const { id } = req.params
    const b = req.body || {}
    const doc = await Accessory.findOne({ id })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    if (b.quantity != null && Number(b.quantity) < 0) return res.status(400).json({ error: 'Invalid quantity' })
    if (b.unitPrice != null && Number(b.unitPrice) <= 0) return res.status(400).json({ error: 'Invalid price' })
    if (b.dealerId) {
      const dealer = await Dealer.findOne({ id: b.dealerId })
      if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
      doc.dealerId = dealer.id
      doc.dealerName = dealer.name
    }
    ;['productId','productName','quantity','unitPrice'].forEach(k => {
      if (b[k] != null) doc[k] = b[k]
    })
    await doc.save()
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params
    const r = await Accessory.deleteOne({ id })
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


