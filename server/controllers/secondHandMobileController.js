const SecondHandMobile = require('../models/SecondHandMobile')

function genSecondHandMobileId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `SHM-${yy}${mm}${dd}-${ms}`
}

// Create a new secondhand mobile
exports.createSecondHandMobile = async (req, res) => {
  try {
    const data = req.body || {}
    
    // Validate required fields
    if (!data.brand || !data.model || !data.purchasePrice || !data.sellingPrice || !data.sellerName) {
      return res.status(400).json({ 
        error: 'Missing required fields: brand, model, purchasePrice, sellingPrice, sellerName' 
      })
    }

    // Check for duplicate IMEI if provided
    if (data.imeiNumber1) {
      const existing = await SecondHandMobile.findOne({ 
        $or: [{ imeiNumber1: data.imeiNumber1 }, { imeiNumber2: data.imeiNumber1 }] 
      })
      if (existing) {
        return res.status(400).json({ error: 'IMEI number already exists' })
      }
    }

    if (data.imeiNumber2) {
      const existing = await SecondHandMobile.findOne({ 
        $or: [{ imeiNumber1: data.imeiNumber2 }, { imeiNumber2: data.imeiNumber2 }] 
      })
      if (existing) {
        return res.status(400).json({ error: 'IMEI number already exists' })
      }
    }

    const secondHandMobile = await SecondHandMobile.create({
      id: genSecondHandMobileId(),
      brand: data.brand,
      model: data.model,
      modelNumber: data.modelNumber || '',
      imeiNumber1: data.imeiNumber1 || '',
      imeiNumber2: data.imeiNumber2 || '',
      condition: data.condition || 'good',
      conditionNotes: data.conditionNotes || '',
      purchasePrice: Number(data.purchasePrice),
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
      sellerName: data.sellerName,
      sellerPhone: data.sellerPhone || '',
      sellerAddress: data.sellerAddress || '',
      sellingPrice: Number(data.sellingPrice),
      color: data.color || '',
      ram: data.ram || '',
      storage: data.storage || '',
      simSlot: data.simSlot || '',
      processor: data.processor || '',
      displaySize: data.displaySize || '',
      camera: data.camera || '',
      battery: data.battery || '',
      operatingSystem: data.operatingSystem || '',
      networkType: data.networkType || '',
      accessories: Array.isArray(data.accessories) ? data.accessories : [],
      warranty: {
        hasWarranty: data.warranty?.hasWarranty || false,
        warrantyPeriod: data.warranty?.warrantyPeriod || '',
        warrantyNotes: data.warranty?.warrantyNotes || ''
      },
      photos: Array.isArray(data.photos) ? data.photos : [],
      notes: data.notes || '',
      addedBy: data.addedBy || '',
      status: 'available'
    })

    res.status(201).json({ 
      success: true, 
      data: secondHandMobile,
      message: 'Secondhand mobile added successfully' 
    })
  } catch (err) {
    console.error('Error creating secondhand mobile:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Get all secondhand mobiles with filtering
exports.listSecondHandMobiles = async (req, res) => {
  try {
    const { 
      status, 
      condition, 
      brand, 
      minPrice, 
      maxPrice, 
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}
    
    if (status) query.status = status
    if (condition) query.condition = condition
    if (brand) query.brand = new RegExp(brand, 'i')
    
    if (minPrice || maxPrice) {
      query.sellingPrice = {}
      if (minPrice) query.sellingPrice.$gte = Number(minPrice)
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice)
    }

    if (search) {
      query.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { sellerName: new RegExp(search, 'i') },
        { imeiNumber1: new RegExp(search, 'i') },
        { imeiNumber2: new RegExp(search, 'i') }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)

    const [mobiles, total] = await Promise.all([
      SecondHandMobile.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SecondHandMobile.countDocuments(query)
    ])

    res.json({
      success: true,
      data: mobiles,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    })
  } catch (err) {
    console.error('Error listing secondhand mobiles:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Get single secondhand mobile by ID
exports.getSecondHandMobile = async (req, res) => {
  try {
    const { id } = req.params
    
    const mobile = await SecondHandMobile.findOne({ id })
    if (!mobile) {
      return res.status(404).json({ error: 'Secondhand mobile not found' })
    }

    res.json({ success: true, data: mobile })
  } catch (err) {
    console.error('Error getting secondhand mobile:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Update secondhand mobile
exports.updateSecondHandMobile = async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body || {}

    const mobile = await SecondHandMobile.findOne({ id })
    if (!mobile) {
      return res.status(404).json({ error: 'Secondhand mobile not found' })
    }

    // Check for duplicate IMEI if provided
    if (data.imeiNumber1 && data.imeiNumber1 !== mobile.imeiNumber1) {
      const existing = await SecondHandMobile.findOne({ 
        $or: [{ imeiNumber1: data.imeiNumber1 }, { imeiNumber2: data.imeiNumber1 }],
        id: { $ne: id }
      })
      if (existing) {
        return res.status(400).json({ error: 'IMEI number already exists' })
      }
    }

    if (data.imeiNumber2 && data.imeiNumber2 !== mobile.imeiNumber2) {
      const existing = await SecondHandMobile.findOne({ 
        $or: [{ imeiNumber1: data.imeiNumber2 }, { imeiNumber2: data.imeiNumber2 }],
        id: { $ne: id }
      })
      if (existing) {
        return res.status(400).json({ error: 'IMEI number already exists' })
      }
    }

    // Update fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        mobile[key] = data[key]
      }
    })

    mobile.lastUpdatedBy = data.lastUpdatedBy || ''
    await mobile.save()

    res.json({ 
      success: true, 
      data: mobile,
      message: 'Secondhand mobile updated successfully' 
    })
  } catch (err) {
    console.error('Error updating secondhand mobile:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Delete secondhand mobile
exports.deleteSecondHandMobile = async (req, res) => {
  try {
    const { id } = req.params

    const mobile = await SecondHandMobile.findOne({ id })
    if (!mobile) {
      return res.status(404).json({ error: 'Secondhand mobile not found' })
    }

    // Prevent deletion if mobile is sold
    if (mobile.status === 'sold') {
      return res.status(400).json({ 
        error: 'Cannot delete sold mobile. Please mark as returned instead.' 
      })
    }

    await SecondHandMobile.deleteOne({ id })

    res.json({ 
      success: true, 
      message: 'Secondhand mobile deleted successfully' 
    })
  } catch (err) {
    console.error('Error deleting secondhand mobile:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Mark mobile as sold
exports.markAsSold = async (req, res) => {
  try {
    const { id } = req.params
    const { buyerName, buyerPhone, saleDate } = req.body

    const mobile = await SecondHandMobile.findOne({ id })
    if (!mobile) {
      return res.status(404).json({ error: 'Secondhand mobile not found' })
    }

    if (mobile.status !== 'available') {
      return res.status(400).json({ 
        error: 'Mobile is not available for sale' 
      })
    }

    mobile.status = 'sold'
    mobile.buyerName = buyerName || ''
    mobile.buyerPhone = buyerPhone || ''
    mobile.saleDate = saleDate ? new Date(saleDate) : new Date()

    await mobile.save()

    res.json({ 
      success: true, 
      data: mobile,
      message: 'Mobile marked as sold successfully' 
    })
  } catch (err) {
    console.error('Error marking mobile as sold:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await SecondHandMobile.aggregate([
      {
        $group: {
          _id: null,
          totalMobiles: { $sum: 1 },
          availableMobiles: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldMobiles: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          totalInvestment: { $sum: '$purchasePrice' },
          totalValue: { $sum: '$sellingPrice' },
          totalProfit: { $sum: '$profitMargin' }
        }
      }
    ])

    const conditionStats = await SecondHandMobile.aggregate([
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
          avgPurchasePrice: { $avg: '$purchasePrice' },
          avgSellingPrice: { $avg: '$sellingPrice' }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalMobiles: 0,
          availableMobiles: 0,
          soldMobiles: 0,
          totalInvestment: 0,
          totalValue: 0,
          totalProfit: 0
        },
        byCondition: conditionStats
      }
    })
  } catch (err) {
    console.error('Error getting statistics:', err)
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: String(err?.message || err) 
    })
  }
}
