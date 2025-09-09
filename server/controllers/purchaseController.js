const Purchase = require('../models/Purchase')

function generatePurchaseId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `PUR-${yy}${mm}${dd}-${ms}`
}

exports.listPurchases = async (req, res) => {
  try {
    const { dealerId, from, to } = req.query
    const q = {}
    if (dealerId) q.dealerId = dealerId
    const list = await Purchase.find(q).sort({ createdAt: -1 }).lean()
    const filtered = list.filter(p => {
      if (!from && !to) return true
      const d = new Date(p.purchaseDate)
      const okFrom = from ? d >= new Date(from) : true
      const okTo = to ? d <= new Date(to) : true
      return okFrom && okTo
    })
    res.json(filtered)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.createPurchase = async (req, res) => {
  try {
    const body = req.body || {}
    if (!body.dealerId || !body.purchaseDate || !Array.isArray(body.items)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const id = generatePurchaseId()
    const invoiceNumber = body.invoiceNumber && String(body.invoiceNumber).trim() ? body.invoiceNumber : `INV-${id.slice(4)}`

    const totalAmount = (body.items || []).reduce((sum, it) => sum + (Number(it.totalPrice) || (Number(it.purchasePrice) || 0) * (Number(it.quantity) || 0)), 0)
    const gstEnabled = !!body.gstEnabled
    const gstPercentage = Number(body.gstPercentage) || 0
    const gstAmount = gstEnabled ? (totalAmount * gstPercentage) / 100 : 0
    const grandTotal = totalAmount + gstAmount

    const purchase = await Purchase.create({
      ...body,
      id,
      invoiceNumber,
      totalAmount,
      gstAmount,
      grandTotal,
      gstEnabled,
      gstPercentage,
    })
    res.status(201).json(purchase)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


