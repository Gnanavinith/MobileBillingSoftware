const Sale = require('../models/Sale')
const Purchase = require('../models/Purchase')
const ServiceInvoice = require('../models/ServiceInvoice')
const Mobile = require('../models/Mobile')
const Accessory = require('../models/Accessory')
const Dealer = require('../models/Dealer')

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function monthKey(d) {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

function monthNameShort(idx0) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx0]
}

exports.summary = async (_req, res) => {
  try {
    const now = new Date()
    const from12 = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const months = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: monthKey(d), name: monthNameShort(d.getMonth()) })
    }

    // Fetch data in parallel
    const [sales, purchases, services, lowMob, lowAcc] = await Promise.all([
      Sale.find({ createdAt: { $gte: from12 } }).lean(),
      Purchase.find({ createdAt: { $gte: from12 } }).lean(),
      ServiceInvoice.find({ createdAt: { $gte: from12 } }).lean(),
      Mobile.find({ totalQuantity: { $lte: 20 } }).lean(),
      Accessory.find({ quantity: { $lte: 20 } }).lean(),
    ])

    // KPI: current month
    const mStart = startOfMonth(now)
    const mEnd = endOfMonth(now)
    const salesThisMonth = sales.filter(s => new Date(s.createdAt) >= mStart && new Date(s.createdAt) <= mEnd)
    const purchasesThisMonth = purchases.filter(p => new Date(p.createdAt) >= mStart && new Date(p.createdAt) <= mEnd)
    const servicesThisMonth = services.filter(s => new Date(s.createdAt) >= mStart && new Date(s.createdAt) <= mEnd)

    const totalRevenueThisMonth = salesThisMonth.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0)
    const totalSalesUnits = salesThisMonth.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.reduce((a, it) => a + (Number(it.quantity) || 0), 0) : 0), 0)
    const totalServices = servicesThisMonth.length
    const purchaseSpendThisMonth = purchasesThisMonth.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0)
    const profitApprox = Math.max(0, totalRevenueThisMonth - purchaseSpendThisMonth)
    const profitMargin = totalRevenueThisMonth > 0 ? Math.round((profitApprox / totalRevenueThisMonth) * 1000) / 10 : 0

    const lowStockAlerts = (lowMob.length + lowAcc.length)

    // Charts: month-wise
    const revenueByMonthMap = new Map(months.map(m => [m.key, 0]))
    sales.forEach(s => {
      const d = new Date(s.createdAt)
      const key = monthKey(d)
      if (revenueByMonthMap.has(key)) {
        revenueByMonthMap.set(key, revenueByMonthMap.get(key) + (Number(s.grandTotal) || 0))
      }
    })
    const monthlyRevenueData = months.map(m => ({ name: m.name, revenue: Math.round(revenueByMonthMap.get(m.key) || 0) }))

    const profitExpenseMap = new Map(months.map(m => [m.key, { profit: 0, gst: 0, expenses: 0 }]))
    sales.forEach(s => {
      const d = new Date(s.createdAt)
      const key = monthKey(d)
      if (!profitExpenseMap.has(key)) return
      const cur = profitExpenseMap.get(key)
      const gst = (Number(s.cgst) || 0) + (Number(s.sgst) || 0)
      cur.gst += gst
      cur.profit += (Number(s.grandTotal) || 0)
    })
    purchases.forEach(p => {
      const d = new Date(p.createdAt)
      const key = monthKey(d)
      if (!profitExpenseMap.has(key)) return
      const cur = profitExpenseMap.get(key)
      cur.expenses += (Number(p.grandTotal) || 0)
    })
    const profitExpenseData = months.map(m => {
      const v = profitExpenseMap.get(m.key) || { profit: 0, gst: 0, expenses: 0 }
      const profit = Math.max(0, v.profit - v.expenses)
      return { name: m.name, profit: Math.round(profit), gst: Math.round(v.gst), expenses: Math.round(v.expenses) }
    })

    const servicesByMonthMap = new Map(months.map(m => [m.key, 0]))
    services.forEach(s => {
      const d = new Date(s.createdAt)
      const key = monthKey(d)
      if (servicesByMonthMap.has(key)) servicesByMonthMap.set(key, servicesByMonthMap.get(key) + 1)
    })
    const serviceSummaryData = months.map(m => ({ name: m.name, services: servicesByMonthMap.get(m.key) || 0 }))

    // Recent activity
    const recentPurchasesRaw = await Purchase.find().sort({ createdAt: -1 }).limit(5).lean()
    const dealerIds = [...new Set(recentPurchasesRaw.map(p => p.dealerId))]
    const dealers = await Dealer.find({ id: { $in: dealerIds } }).lean()
    const dealerMap = new Map(dealers.map(d => [d.id, d.name]))
    const recentPurchases = recentPurchasesRaw.map(p => ({
      dealer: dealerMap.get(p.dealerId) || p.dealerId,
      product: (Array.isArray(p.items) && p.items[0]?.productName) || '—',
      amount: Number(p.grandTotal) || 0,
      date: new Date(p.createdAt).toISOString().split('T')[0],
    }))

    const recentSalesDocs = await Sale.find().sort({ createdAt: -1 }).limit(5).lean()
    const recentSales = recentSalesDocs.map(s => ({
      customer: s.customerName || '—',
      product: (Array.isArray(s.items) && s.items[0]?.name) || '—',
      amount: Number(s.grandTotal) || 0,
      date: new Date(s.createdAt).toISOString().split('T')[0],
    }))

    const recentServicesDocs = await ServiceInvoice.find().sort({ createdAt: -1 }).limit(5).lean()
    const recentServices = recentServicesDocs.map(si => ({
      ticket: si.serviceBillNumber || si.id,
      device: si.modelName || '—',
      amount: Number(si.grandTotal) || 0,
      date: new Date(si.createdAt).toISOString().split('T')[0],
    }))

    res.json({
      kpis: {
        totalRevenueThisMonth: Math.round(totalRevenueThisMonth),
        totalSales: totalSalesUnits,
        totalServices,
        profitMargin,
        lowStockAlerts,
      },
      charts: {
        monthlyRevenueData,
        profitExpenseData,
        serviceSummaryData,
      },
      recent: {
        purchases: recentPurchases,
        sales: recentSales,
        services: recentServices,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: String(err?.message || err) })
  }
}


