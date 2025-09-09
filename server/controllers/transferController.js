const Transfer = require('../models/Transfer')
const StoreStock = require('../models/StoreStock')
const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')

function genTransferId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `TRF-${yy}${mm}${dd}-${ms}`
}

exports.listTransfers = async (req, res) => {
  try {
    const list = await Transfer.find().sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.createTransfer = async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.fromStore || !b.toStore || !Array.isArray(b.products) || b.products.length === 0 || !b.transferDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (b.fromStore === b.toStore) return res.status(400).json({ error: 'From and To cannot be the same' })
    const id = genTransferId()
    const totalAmount = (b.products || []).reduce((s, p) => s + (Number(p.totalPrice) || (Number(p.quantity)||0)*(Number(p.unitPrice)||0)), 0)
    const doc = await Transfer.create({
      id,
      fromStore: b.fromStore,
      toStore: b.toStore,
      transferDate: b.transferDate,
      transferTime: b.transferTime || '',
      paymentMode: b.paymentMode || 'Cash',
      remarks: b.remarks || '',
      products: b.products,
      totalAmount,
      status: 'Completed',
    })

    // Apply stock adjustments per product
    for (const p of b.products) {
      const qty = Number(p.quantity) || 0
      if (qty <= 0) continue
      // decrement from source
      const from = await StoreStock.findOneAndUpdate(
        { storeId: b.fromStore, productId: p.productId },
        { $inc: { quantity: -qty }, $setOnInsert: { productName: p.productName, productModel: p.productModel, productSku: p.productSku } },
        { upsert: true, new: true }
      )
      // prevent negative
      if (from.quantity < 0) {
        from.quantity = 0
        await from.save()
      }
      // increment at destination
      await StoreStock.findOneAndUpdate(
        { storeId: b.toStore, productId: p.productId },
        { $inc: { quantity: qty }, $setOnInsert: { productName: p.productName, productModel: p.productModel, productSku: p.productSku } },
        { upsert: true, new: true }
      )

      // Since there's only one tracked store (our shop), also reduce global inventory counts
      // Accessories: match by productId field
      try {
        const acc = await Accessory.findOne({ productId: p.productId })
        if (acc) {
          acc.quantity = Math.max(0, (Number(acc.quantity) || 0) - qty)
          await acc.save()
          continue
        }
      } catch {}

      // Mobiles: try match by IMEI1/IMEI2 == productId; fallback to model number
      try {
        let mob = await Mobile.findOne({ $or: [ { imeiNumber1: p.productId }, { imeiNumber2: p.productId } ] })
        if (!mob && p.productModel) {
          mob = await Mobile.findOne({ modelNumber: p.productModel })
        }
        if (mob) {
          mob.totalQuantity = Math.max(0, (Number(mob.totalQuantity) || 0) - qty)
          await mob.save()
        }
      } catch {}
    }
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.updateTransfer = async (req, res) => {
  try {
    const { id } = req.params
    const b = req.body || {}
    const doc = await Transfer.findOne({ id })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    if (b.fromStore && b.toStore && b.fromStore === b.toStore) return res.status(400).json({ error: 'From and To cannot be the same' })
    ;['fromStore','toStore','transferDate','transferTime','paymentMode','remarks','status'].forEach(k => {
      if (b[k] != null) doc[k] = b[k]
    })
    if (Array.isArray(b.products)) {
      doc.products = b.products
      doc.totalAmount = b.products.reduce((s, p) => s + (Number(p.totalPrice) || (Number(p.quantity)||0)*(Number(p.unitPrice)||0)), 0)
    }
    await doc.save()
    res.json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params
    const r = await Transfer.deleteOne({ id })
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


