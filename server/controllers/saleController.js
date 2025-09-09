const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')

exports.createSale = async (req, res) => {
  try {
    const b = req.body || {}
    const items = Array.isArray(b.items) ? b.items : []
    if (items.length === 0) return res.status(400).json({ error: 'No items to sell' })

    for (const it of items) {
      const qty = Math.max(0, Number(it.quantity) || 0)
      if (qty <= 0) continue
      const imei = String(it.imei || '').trim()

      // Try mobile by IMEI first
      let updated = false
      if (imei) {
        try {
          const mob = await Mobile.findOne({ $or: [{ imeiNumber1: imei }, { imeiNumber2: imei }] })
          if (mob) {
            mob.totalQuantity = Math.max(0, (Number(mob.totalQuantity) || 0) - qty)
            await mob.save()
            updated = true
          }
        } catch {}
      }

      if (updated) continue

      // Accessory by productId (if provided as imei/name field), else by productName
      try {
        let acc = null
        if (it.productId) acc = await Accessory.findOne({ productId: it.productId })
        if (!acc && it.name) acc = await Accessory.findOne({ productName: it.name })
        if (acc) {
          acc.quantity = Math.max(0, (Number(acc.quantity) || 0) - qty)
          await acc.save()
          continue
        }
      } catch {}

      // Mobile by model as last fallback
      try {
        if (it.model) {
          const mob = await Mobile.findOne({ modelNumber: it.model })
          if (mob) {
            mob.totalQuantity = Math.max(0, (Number(mob.totalQuantity) || 0) - qty)
            await mob.save()
          }
        }
      } catch {}
    }

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


