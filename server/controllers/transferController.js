const Transfer = require('../models/Transfer')

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


