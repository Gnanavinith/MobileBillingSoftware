const Dealer = require('../models/Dealer')

function generateDealerId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `DLR-${yy}${mm}${dd}-${ms}`
}

exports.listDealers = async (req, res) => {
  try {
    const dealers = await Dealer.find().sort({ createdAt: -1 }).lean()
    res.json(dealers)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.createDealer = async (req, res) => {
  try {
    const { name, phone, address = '', email = '', gst = '', notes = '' } = req.body || {}
    if (!name || !phone) return res.status(400).json({ error: 'Dealer name and phone are required' })
    if (await Dealer.exists({ phone })) return res.status(409).json({ error: 'Phone number already exists' })
    if (gst && await Dealer.exists({ gst })) return res.status(409).json({ error: 'GST number already exists' })
    const id = generateDealerId()
    const dealer = await Dealer.create({ id, name, phone, address, email, gst, notes })
    res.status(201).json(dealer)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.updateDealer = async (req, res) => {
  try {
    const { id } = req.params
    const { name, phone, address = '', email = '', gst = '', notes = '' } = req.body || {}
    const existing = await Dealer.findOne({ id })
    if (!existing) return res.status(404).json({ error: 'Dealer not found' })
    if (!name || !phone) return res.status(400).json({ error: 'Dealer name and phone are required' })
    if (await Dealer.exists({ id: { $ne: id }, phone })) return res.status(409).json({ error: 'Phone number already exists' })
    if (gst && await Dealer.exists({ id: { $ne: id }, gst })) return res.status(409).json({ error: 'GST number already exists' })
    existing.name = name
    existing.phone = phone
    existing.address = address
    existing.email = email
    existing.gst = gst
    existing.notes = notes
    await existing.save()
    res.json(existing)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.deleteDealer = async (req, res) => {
  try {
    const { id } = req.params
    const result = await Dealer.deleteOne({ id })
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Dealer not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


