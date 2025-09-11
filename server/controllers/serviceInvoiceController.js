const ServiceInvoice = require('../models/ServiceInvoice')

function genId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `SRV-${yy}${mm}${dd}-${ms}`
}

exports.create = async (req, res) => {
  try {
    const b = req.body || {}
    const id = genId()
    const doc = await ServiceInvoice.create({ id, ...b })
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.list = async (_req, res) => {
  try {
    const rows = await ServiceInvoice.find().sort({ createdAt: -1 }).lean()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


