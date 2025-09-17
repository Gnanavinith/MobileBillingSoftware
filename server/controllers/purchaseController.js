const Purchase = require('../models/Purchase')
const Dealer = require('../models/Dealer')
const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')
const ProductCounter = require('../models/ProductCounter')

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

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    if (!['Pending','Received'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const purchase = await Purchase.findOne({ id })
    if (!purchase) return res.status(404).json({ error: 'Not found' })
    purchase.status = status
    if (status === 'Received') purchase.receivedAt = new Date()
    await purchase.save()
    res.json(purchase)
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}

exports.receivePurchase = async (req, res) => {
  try {
    console.log('=== RECEIVE PURCHASE DEBUG ===')
    const { id } = req.params
    console.log('Purchase ID:', id)
    const purchase = await Purchase.findOne({ id })
    if (!purchase) {
      console.log('Purchase not found')
      return res.status(404).json({ error: 'Not found' })
    }
    console.log('Purchase found:', purchase.id, 'Status:', purchase.status)
    const alreadyReceived = purchase.status === 'Received'

    // Helper: build codes
    const toCode = (str) => String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    const dealer = await Dealer.findOne({ id: purchase.dealerId })
    const dealerName = dealer ? dealer.name : 'Unknown'
    const dealerCode = toCode(dealerName).slice(0, 3)
    console.log('Dealer:', dealerName, 'DealerCode:', dealerCode)
    const getCategoryCode = (category) => {
      const c = String(category || '').toLowerCase()
      if (c === 'mobile' || c === 'mobiles') return 'MOB'
      if (c === 'accessories' || c === 'accessory') return 'ACC'
      return 'OTH'
    }
    const productCodeFromName = (name) => {
      const up = toCode(name)
      if (!up) return 'XXX'
      // Try to preserve numbers like Y21; if name starts with brand then model, pick model chunk
      return up.slice(0, 3)
    }
    const nextCounter = async (key) => {
      const doc = await ProductCounter.findOneAndUpdate(
        { key },
        { $inc: { lastCounter: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      return doc.lastCounter
    }

    // Create/update inventory records per item
    console.log('Processing', purchase.items?.length || 0, 'items')
    for (const item of (purchase.items || [])) {
      const category = (item.category || '').toLowerCase()
      const categoryCode = getCategoryCode(category)
      console.log('Processing item:', item.productName, 'Category:', category, 'Code:', categoryCode)
      if (category === 'mobile' || category === 'mobiles') {
        console.log('Processing mobile item')
        const query = {
          dealerId: purchase.dealerId,
          mobileName: item.productName || 'Mobile',
        }
        // Only add modelNumber to query if it's provided
        if (item.model && item.model.trim()) {
          query.modelNumber = item.model.trim()
        }
        console.log('Mobile query:', query)
        const existing = await Mobile.findOne(query)
        console.log('Existing mobile found:', !!existing)
        if (existing) {
          existing.totalQuantity = (Number(existing.totalQuantity)||0) + (Number(item.quantity)||0)
          if (!Array.isArray(existing.productIds)) existing.productIds = []
          // If a productId was provided on the purchase line, record it first
          if (item.productId) {
            const providedPid = String(item.productId).trim()
            if (providedPid && !existing.productIds.includes(providedPid)) existing.productIds.push(providedPid)
          }
          // Generate product IDs for each added unit
          const modelCode = productCodeFromName(item.model || item.productName)
          const key = `${dealerCode}-${categoryCode}-${modelCode}`
          const addQty = Math.max(0, Number(item.quantity) || 0)
          for (let i = 0; i < addQty; i++) {
            const counter = await nextCounter(key)
            const pid = `${dealerCode}-${categoryCode}-${modelCode}-${String(counter).padStart(4, '0')}`
            existing.productIds.push(pid)
          }
          // Update attributes if provided
          if (item.color) existing.color = item.color
          if (item.ram) existing.ram = item.ram
          if (item.storage) existing.storage = item.storage
          if (item.imeiNumber1 && !existing.imeiNumber1) existing.imeiNumber1 = String(item.imeiNumber1).trim()
          if (item.imeiNumber2 && !existing.imeiNumber2) existing.imeiNumber2 = String(item.imeiNumber2).trim()
          if (item.purchasePrice != null) existing.pricePerProduct = Number(item.purchasePrice) || 0
          if (item.sellingPrice != null) existing.sellingPrice = Number(item.sellingPrice) || Number(item.purchasePrice) || 0
          try {
            await existing.save()
          } catch (err) {
            // Handle IMEI duplicate collisions gracefully by unsetting IMEIs
            if (err && err.code === 11000) {
              existing.imeiNumber1 = undefined
              existing.imeiNumber2 = undefined
              await existing.save()
            } else {
              throw err
            }
          }
        } else {
          const payload = {
            id: `MOB-${String(Date.now())}-${Math.floor(Math.random()*1000)}`,
            mobileName: item.productName || 'Mobile',
            brand: '',
            modelNumber: item.model && item.model.trim() ? item.model.trim() : 'Unknown',
            imeiNumber1: item.imeiNumber1 && String(item.imeiNumber1).trim() ? String(item.imeiNumber1).trim() : undefined,
            imeiNumber2: item.imeiNumber2 && String(item.imeiNumber2).trim() ? String(item.imeiNumber2).trim() : undefined,
            dealerId: purchase.dealerId,
            dealerName,
            pricePerProduct: Number(item.purchasePrice) || 0,
            sellingPrice: Number(item.sellingPrice) || Number(item.purchasePrice) || 0,
            totalQuantity: Number(item.quantity) || 0,
            productIds: [],
            color: item.color || '',
            ram: item.ram || '',
            storage: item.storage || '',
            simSlot: '',
            processor: '',
            displaySize: '',
            camera: '',
            battery: '',
            operatingSystem: '',
            networkType: '',
          }
          // Include provided productId from purchase item if any
          if (item.productId) {
            const providedPid = String(item.productId).trim()
            if (providedPid) payload.productIds.push(providedPid)
          }
          // Pre-generate product IDs
          const modelCode = productCodeFromName(item.model || item.productName)
          const key = `${dealerCode}-${categoryCode}-${modelCode}`
          const addQty = Math.max(0, Number(item.quantity) || 0)
          for (let i = 0; i < addQty; i++) {
            const counter = await nextCounter(key)
            const pid = `${dealerCode}-${categoryCode}-${modelCode}-${String(counter).padStart(4, '0')}`
            payload.productIds.push(pid)
          }
          try {
            await Mobile.create(payload)
          } catch (err) {
            if (err && err.code === 11000) {
              // Retry without IMEIs if duplicates
              payload.imeiNumber1 = undefined
              payload.imeiNumber2 = undefined
              await Mobile.create(payload)
            } else {
              throw err
            }
          }
        }
      } else if (category === 'accessories' || category === 'accessory') {
        const modelCode = productCodeFromName(item.productName)
        const prefix = `${dealerCode}-${categoryCode}-${modelCode}`
        const existingAcc = await Accessory.findOne({ dealerId: purchase.dealerId, productId: prefix })
        if (existingAcc) {
          existingAcc.productName = item.productName || existingAcc.productName
          existingAcc.quantity = (Number(existingAcc.quantity)||0) + (Number(item.quantity)||0)
          if (!Array.isArray(existingAcc.productIds)) existingAcc.productIds = []
          // generate item IDs
          const addQty = Math.max(0, Number(item.quantity) || 0)
          for (let i = 0; i < addQty; i++) {
            const counter = await nextCounter(prefix)
            const pid = `${prefix}-${String(counter).padStart(4, '0')}`
            existingAcc.productIds.push(pid)
          }
          if (item.purchasePrice != null) existingAcc.unitPrice = Number(item.purchasePrice) || existingAcc.unitPrice
          if (item.sellingPrice != null) existingAcc.sellingPrice = Number(item.sellingPrice) || existingAcc.sellingPrice
          await existingAcc.save()
        } else {
          const productIds = []
          const addQty = Math.max(0, Number(item.quantity) || 0)
          for (let i = 0; i < addQty; i++) {
            const counter = await nextCounter(prefix)
            productIds.push(`${prefix}-${String(counter).padStart(4, '0')}`)
          }
          await Accessory.create({
            id: `ACC-${String(Date.now())}-${Math.floor(Math.random()*1000)}`,
            dealerId: purchase.dealerId,
            dealerName,
            productId: prefix,
            productIds,
            productName: item.productName || 'Accessory',
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.purchasePrice) || 0,
            sellingPrice: Number(item.sellingPrice) || Number(item.purchasePrice) || 0,
          })
        }
      } else {
        // ignore other categories for inventory movement
      }
    }

    purchase.status = 'Received'
    purchase.receivedAt = new Date()
    await purchase.save()
    console.log('=== RECEIVE PURCHASE SUCCESS ===')
    res.json({ ok: true, alreadyReceived })
  } catch (err) {
    console.error('=== RECEIVE PURCHASE ERROR ===')
    console.error('Error:', err)
    console.error('Stack:', err.stack)
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


