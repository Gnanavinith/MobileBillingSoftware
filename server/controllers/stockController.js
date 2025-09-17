const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')
const Dealer = require('../models/Dealer')
const BrandModel = require('../models/BrandModel')
const ProductCounter = require('../models/ProductCounter')

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
    if (!b.mobileName || !b.modelNumber || !b.dealerId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (b.pricePerProduct != null && Number(b.pricePerProduct) < 0) {
      return res.status(400).json({ error: 'Invalid price' })
    }
    const dealer = await Dealer.findOne({ id: b.dealerId })
    if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
    const id = genId('MOB')
    // infer brand from BrandModel if present
    let brand = String(b.brand || '').trim()
    if (!brand) {
      try {
        const bm = await BrandModel.findOne({ $or: [{ model: b.modelNumber }, { aliases: b.modelNumber }] })
        if (bm) brand = bm.brand
      } catch {}
    }
    // normalize IMEIs: undefined when empty to respect sparse unique index
    const norm = (s) => (s && String(s).trim() ? String(s).trim() : undefined)
    const doc = await Mobile.create({
      id,
      mobileName: b.mobileName,
      brand,
      modelNumber: b.modelNumber,
      imeiNumber1: norm(b.imeiNumber1),
      imeiNumber2: norm(b.imeiNumber2),
      dealerId: dealer.id,
      dealerName: dealer.name,
      productIds: Array.isArray(b.productIds) ? b.productIds : (b.productId ? [String(b.productId).trim()] : []),
      pricePerProduct: Number(b.pricePerProduct)||0,
      sellingPrice: Number(b.sellingPrice)||Number(b.pricePerProduct)||0,
      totalQuantity: 1,
      // New mobile features
      color: b.color || '',
      ram: b.ram || '',
      storage: b.storage || '',
      simSlot: b.simSlot || '',
      processor: b.processor || '',
      displaySize: b.displaySize || '',
      camera: b.camera || '',
      battery: b.battery || '',
      operatingSystem: b.operatingSystem || '',
      networkType: b.networkType || '',
    })
    res.status(201).json(doc)
  } catch (err) {
    if (err && err.code === 11000) {
      const field = err?.keyPattern ? Object.keys(err.keyPattern)[0] : undefined
      return res.status(409).json({ error: 'Duplicate key', field, value: err?.keyValue?.[field] || err?.keyValue })
    }
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
    if (b.pricePerProduct != null && Number(b.pricePerProduct) < 0) return res.status(400).json({ error: 'Invalid price' })
    if (b.totalQuantity != null && Number(b.totalQuantity) < 0) return res.status(400).json({ error: 'Invalid quantity' })
    if (b.dealerId) {
      const dealer = await Dealer.findOne({ id: b.dealerId })
      if (!dealer) return res.status(400).json({ error: 'Dealer not found' })
      doc.dealerId = dealer.id
      doc.dealerName = dealer.name
    }
    const norm = (s) => (s && String(s).trim() ? String(s).trim() : undefined)
    const fields = ['mobileName','brand','modelNumber','pricePerProduct','sellingPrice','totalQuantity','color','ram','storage','simSlot','processor','displaySize','camera','battery','operatingSystem','networkType','productIds']
    fields.forEach(k => { if (b[k] != null) doc[k] = b[k] })
    if (b.productId) {
      if (!Array.isArray(doc.productIds)) doc.productIds = []
      const pid = String(b.productId).trim()
      if (pid && !doc.productIds.includes(pid)) doc.productIds.push(pid)
    }
    if ('imeiNumber1' in b) doc.imeiNumber1 = norm(b.imeiNumber1)
    if ('imeiNumber2' in b) doc.imeiNumber2 = norm(b.imeiNumber2)
    await doc.save()
    res.json(doc)
  } catch (err) {
    if (err && err.code === 11000) {
      const field = err?.keyPattern ? Object.keys(err.keyPattern)[0] : undefined
      return res.status(409).json({ error: 'Duplicate key', field, value: err?.keyValue?.[field] || err?.keyValue })
    }
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

// Maintenance: Normalize IMEI fields and rebuild indexes (call once)
exports.normalizeMobileImeis = async (_req, res) => {
  try {
    // Unset empty strings so sparse unique index doesn't collide on ''
    await Mobile.updateMany({ imeiNumber1: '' }, { $unset: { imeiNumber1: 1 } })
    await Mobile.updateMany({ imeiNumber2: '' }, { $unset: { imeiNumber2: 1 } })

    // Rebuild indexes (ignore if they don't exist)
    try { await Mobile.collection.dropIndex('imeiNumber1_1') } catch {}
    try { await Mobile.collection.dropIndex('imeiNumber2_1') } catch {}
    await Mobile.collection.createIndex({ imeiNumber1: 1 }, { unique: true, sparse: true })
    await Mobile.collection.createIndex({ imeiNumber2: 1 }, { unique: true, sparse: true })

    res.json({ ok: true })
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
      sellingPrice: Number(b.sellingPrice)||Number(b.unitPrice),
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
    ;['productId','productName','quantity','unitPrice','sellingPrice'].forEach(k => {
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


// Low stock combined (mobiles + accessories)
exports.listLowStock = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 20
    const [mobiles, accessories] = await Promise.all([
      Mobile.find({ totalQuantity: { $lte: threshold } }).lean(),
      Accessory.find({ quantity: { $lte: threshold } }).lean(),
    ])
    const list = [
      ...mobiles.map(m => ({
        type: 'mobile',
        id: m.id,
        name: m.mobileName,
        model: m.modelNumber,
        quantity: Number(m.totalQuantity) || 0,
      })),
      ...accessories.map(a => ({
        type: 'accessory',
        id: a.id,
        name: a.productName,
        model: a.productId,
        quantity: Number(a.quantity) || 0,
      })),
    ].sort((a, b) => a.quantity - b.quantity)
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

// Lookup by generated product ID across mobiles and accessories
exports.findByProductId = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const pid = String(id).trim().toUpperCase()
    let acc = await Accessory.findOne({ $or: [ { productIds: pid }, { productId: pid } ] }).lean()
    if (acc) {
      return res.json({
        type: 'accessory',
        productId: pid,
        prefix: acc.productId,
        name: acc.productName,
        quantity: acc.quantity,
        unitPrice: acc.unitPrice,
        sellingPrice: acc.sellingPrice,
        dealerId: acc.dealerId,
        dealerName: acc.dealerName,
      })
    }
    const mob = await Mobile.findOne({ productIds: pid }).lean()
    if (mob) {
      return res.json({
        type: 'mobile',
        productId: pid,
        name: mob.mobileName,
        model: mob.modelNumber,
        quantity: mob.totalQuantity,
        pricePerProduct: mob.pricePerProduct,
        sellingPrice: mob.sellingPrice,
        dealerId: mob.dealerId,
        dealerName: mob.dealerName,
        features: {
          color: mob.color,
          ram: mob.ram,
          storage: mob.storage,
          simSlot: mob.simSlot,
          processor: mob.processor,
          displaySize: mob.displaySize,
          camera: mob.camera,
          battery: mob.battery,
          operatingSystem: mob.operatingSystem,
          networkType: mob.networkType,
        }
      })
    }
    res.status(404).json({ error: 'Not found' })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


