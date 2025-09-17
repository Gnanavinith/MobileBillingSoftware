const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')
const Sale = require('../models/Sale')

function genSaleId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `SAL-${yy}${mm}${dd}-${ms}`
}

exports.createSale = async (req, res) => {
  try {
    const b = req.body || {}
    const items = Array.isArray(b.items) ? b.items : []
    if (items.length === 0) return res.status(400).json({ error: 'No items to sell' })

    // Calculate totals
    let subTotal = 0
    let totalDiscountOnItems = 0
    let totalGst = 0

    items.forEach(it => {
      const qty = Number(it.quantity) || 0
      const price = Number(it.price) || 0
      const gross = qty * price
      let discount = 0
      if (it.discountType === 'percent') discount = gross * ((Number(it.discountValue) || 0) / 100)
      if (it.discountType === 'flat') discount = Number(it.discountValue) || 0
      const net = Math.max(gross - discount, 0)
      const gst = net * ((Number(it.gstPercent) || 0) / 100)
      subTotal += gross
      totalDiscountOnItems += discount
      totalGst += gst
    })

    const cgst = totalGst / 2
    const sgst = totalGst / 2
    const grandTotal = subTotal - totalDiscountOnItems + totalGst

    // Create sale record
    const saleId = genSaleId()
    const sale = await Sale.create({
      id: saleId,
      billNumber: b.billNumber || `INV-${Date.now().toString().slice(-6)}`,
      customerName: b.customerName || '',
      mobileNumber: b.mobileNumber || '',
      paymentMethod: b.paymentMethod || 'Cash',
      items: items,
      subTotal,
      totalDiscountOnItems,
      billLevelDiscount: Number(b.billLevelDiscount) || 0,
      cgst,
      sgst,
      grandTotal: grandTotal - (Number(b.billLevelDiscount) || 0)
    })

    // Update stock
    for (const it of items) {
      const qty = Math.max(0, Number(it.quantity) || 0)
      if (qty <= 0) continue
      const imei = String(it.imei || '').trim()
      const productId = String(it.productId || '').trim()

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

      // Try by generated productId for mobiles or accessories
      if (productId) {
        let adjusted = false
        // Accessories keep prefix in productId field and all item codes in productIds[]
        try {
          const acc = await Accessory.findOne({ $or: [ { productIds: productId }, { productId: productId } ] })
          if (acc) {
            const dec = Math.min(qty, Number(acc.quantity) || 0)
            acc.quantity = Math.max(0, (Number(acc.quantity) || 0) - dec)
            // Remove consumed codes
            if (acc.productIds && acc.productIds.length > 0) {
              const toRemove = acc.productIds.indexOf(productId)
              if (toRemove >= 0) acc.productIds.splice(toRemove, 1)
            }
            await acc.save()
            adjusted = true
          }
        } catch {}
        if (adjusted) continue

        // Mobiles store codes in productIds[] on the model document
        try {
          const mob = await Mobile.findOne({ productIds: productId })
          if (mob) {
            const dec = Math.min(qty, Number(mob.totalQuantity) || 0)
            mob.totalQuantity = Math.max(0, (Number(mob.totalQuantity) || 0) - dec)
            const idx = mob.productIds.indexOf(productId)
            if (idx >= 0) mob.productIds.splice(idx, 1)
            await mob.save()
            continue
          }
        } catch {}
      }

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

    res.json({ ok: true, saleId: sale.id })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

// List sales flattened to line-items for reporting
exports.listSales = async (_req, res) => {
  try {
    const Sale = require('../models/Sale')
    const rows = await Sale.find().sort({ createdAt: -1 }).lean()
    const flat = []
    rows.forEach(sale => {
      const when = new Date(sale.createdAt || Date.now())
      const date = when.toISOString().split('T')[0]
      const time = when.toTimeString().slice(0,8)
      ;(sale.items || []).forEach(it => {
        flat.push({
          invoiceNumber: sale.billNumber,
          date,
          time,
          customerName: sale.customerName || '',
          customerPhone: sale.mobileNumber || '',
          productName: it.name || '',
          productId: it.productId || '',
          imei: it.imei || '',
          model: it.model || '',
          color: it.color || '',
          ram: it.ram || '',
          storage: it.storage || '',
          simSlot: it.simSlot || '',
          processor: it.processor || '',
          displaySize: it.displaySize || '',
          camera: it.camera || '',
          battery: it.battery || '',
          operatingSystem: it.operatingSystem || '',
          networkType: it.networkType || '',
          quantity: Number(it.quantity)||0,
          sellingPrice: Number(it.price)||0,
          totalAmount: Number(it.quantity||0) * Number(it.price||0),
          discount: it.discountType === 'percent' ? ((Number(it.quantity||0)*Number(it.price||0)) * ((Number(it.discountValue)||0)/100)) : (Number(it.discountValue)||0),
          gstAmount: (()=>{ const gross=(Number(it.quantity||0)*Number(it.price||0)); const d=it.discountType==='percent'? gross*((Number(it.discountValue)||0)/100):(Number(it.discountValue)||0); const net=Math.max(gross-d,0); return net*((Number(it.gstPercent)||0)/100) })(),
          netTotal: (()=>{ const gross=(Number(it.quantity||0)*Number(it.price||0)); const d=it.discountType==='percent'? gross*((Number(it.discountValue)||0)/100):(Number(it.discountValue)||0); const net=Math.max(gross-d,0); const gst=net*((Number(it.gstPercent)||0)/100); return net+gst })(),
          paymentMode: sale.paymentMethod || 'Cash',
          salesperson: '',
        })
      })
    })
    res.json(flat)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


