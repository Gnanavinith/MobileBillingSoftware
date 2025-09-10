const BrandModel = require('../models/BrandModel')

exports.list = async (req, res) => {
  try {
    const { brand, q } = req.query
    const filter = {}
    if (brand) filter.brand = brand
    if (q) filter.$or = [ { model: new RegExp(q, 'i') }, { aliases: new RegExp(q, 'i') } ]
    const rows = await BrandModel.find(filter).sort({ brand: 1, model: 1 }).lean()
    res.json(rows)
  } catch (err) { res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) }) }
}

exports.create = async (req, res) => {
  try {
    const { brand, model, aliases } = req.body || {}
    if (!brand || !model) return res.status(400).json({ error: 'brand and model are required' })
    const doc = await BrandModel.create({ brand, model, aliases: Array.isArray(aliases) ? aliases : [] })
    res.status(201).json(doc)
  } catch (err) { res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) }) }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const b = req.body || {}
    const doc = await BrandModel.findById(id)
    if (!doc) return res.status(404).json({ error: 'Not found' })
    ;['brand','model','aliases'].forEach(k => { if (b[k] != null) doc[k] = b[k] })
    await doc.save()
    res.json(doc)
  } catch (err) { res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) }) }
}

exports.delete = async (req, res) => {
  try {
    const { id } = req.params
    const r = await BrandModel.findByIdAndDelete(id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) }) }
}


