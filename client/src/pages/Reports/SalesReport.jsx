import React, { useState, useEffect, useMemo } from 'react'
import { FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiPrinter, FiFilter, FiShoppingBag } from 'react-icons/fi'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const SalesReport = () => {
  const [salesData, setSalesData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    invoiceNumber: '',
    productName: '',
    paymentMode: '',
    salesperson: '',
    customerName: ''
  })

  // Load real data
  useEffect(() => {
    const load = async () => {
      try {
        const [saleRes, mobRes] = await Promise.all([
          fetch(`${apiBase}/api/sale`),
          fetch(`${apiBase}/api/mobiles`)
        ])
        const saleData = await saleRes.json()
        const mobileData = await mobRes.json()
        const rows = Array.isArray(saleData) ? saleData : []
        const mobiles = Array.isArray(mobileData) ? mobileData : []
        const byModel = new Map()
        const byImei = new Map()
        mobiles.forEach(m => {
          byModel.set(String(m.modelNumber||'').toLowerCase(), m)
          if (m.imeiNumber1) byImei.set(String(m.imeiNumber1), m)
          if (m.imeiNumber2) byImei.set(String(m.imeiNumber2), m)
        })
        const enriched = rows.map(r => {
          let { color, ram, storage, processor, displaySize, camera, battery, operatingSystem, networkType } = r
          if (!color && !ram && !storage) {
            let src = null
            if (r.imei && byImei.has(String(r.imei))) src = byImei.get(String(r.imei))
            else if (r.model) src = byModel.get(String(r.model||'').toLowerCase())
            if (src) {
              color = src.color || color
              ram = src.ram || ram
              storage = src.storage || storage
              processor = src.processor || processor
              displaySize = src.displaySize || displaySize
              camera = src.camera || camera
              battery = src.battery || battery
              operatingSystem = src.operatingSystem || operatingSystem
              networkType = src.networkType || networkType
            }
          }
          return { ...r, color, ram, storage, processor, displaySize, camera, battery, operatingSystem, networkType }
        })
        setSalesData(enriched)
        setFilteredData(enriched)
      } catch (e) {
        setSalesData([])
        setFilteredData([])
      }
    }
    load()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, salesData])

  const applyFilters = () => {
    let filtered = [...salesData]

    // Date range filter
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)
        return itemDate >= startDate && itemDate <= endDate
      })
    } else if (filters.dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(item => item.date === today)
    } else if (filters.dateRange === 'thisWeek') {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= startOfWeek && itemDate <= endOfWeek
      })
    } else if (filters.dateRange === 'thisMonth') {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        return itemDate >= startOfMonth && itemDate <= endOfMonth
      })
    }

    // Other filters
    if (filters.invoiceNumber) {
      const q = filters.invoiceNumber.trim().toLowerCase()
      filtered = filtered.filter(item => String(item.invoiceNumber||'').toLowerCase().includes(q))
    }
    if (filters.productName) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(filters.productName.toLowerCase())
      )
    }
    if (filters.paymentMode) {
      filtered = filtered.filter(item => item.paymentMode === filters.paymentMode)
    }
    if (filters.salesperson) {
      filtered = filtered.filter(item => 
        item.salesperson.toLowerCase().includes(filters.salesperson.toLowerCase())
      )
    }
    if (filters.customerName) {
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }

  const calculateSummary = useMemo(() => {
    const totalSales = filteredData.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0)
    const totalDiscount = filteredData.reduce((sum, item) => sum + item.discount, 0)
    const totalGST = filteredData.reduce((sum, item) => sum + item.gstAmount, 0)
    const netTotal = filteredData.reduce((sum, item) => sum + item.netTotal, 0)

    return {
      totalSales,
      totalQuantity,
      totalDiscount,
      totalGST,
      netTotal
    }
  }, [filteredData])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Sales Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
    doc.text(`Total Records: ${filteredData.length}`, 20, 35)
    
    // Summary
    doc.setFontSize(14)
    doc.text('Summary', 20, 50)
    doc.setFontSize(10)
    doc.text(`Total Sales: ${formatCurrency(calculateSummary.totalSales)}`, 20, 60)
    doc.text(`Total Quantity: ${calculateSummary.totalQuantity}`, 20, 65)
    doc.text(`Total Discount: ${formatCurrency(calculateSummary.totalDiscount)}`, 20, 70)
    doc.text(`Total GST: ${formatCurrency(calculateSummary.totalGST)}`, 20, 75)
    doc.text(`Net Total: ${formatCurrency(calculateSummary.netTotal)}`, 20, 80)

    // Table
    const tableData = filteredData.map(item => [
      item.invoiceNumber,
      item.date,
      item.customerName,
      `${item.productName}${item.model?` (${item.model})`:''}`,
      `${[item.color,item.ram,item.storage].filter(Boolean).join(' • ')}`,
      item.imei || '-',
      item.quantity,
      formatCurrency(item.sellingPrice),
      formatCurrency(item.totalAmount),
      formatCurrency(item.discount),
      formatCurrency(item.gstAmount),
      formatCurrency(item.netTotal),
      item.paymentMode,
      item.salesperson
    ])

    doc.autoTable({
      head: [['Invoice', 'Date', 'Customer', 'Product (Model)', 'Specs', 'IMEI', 'Qty', 'Price', 'Total', 'Discount', 'GST', 'Net Total', 'Payment', 'Salesperson']],
      body: tableData,
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save('sales-report.pdf')
  }

  const exportToExcel = () => {
    // Simple CSV export for now
    const headers = ['Invoice Number', 'Date', 'Time', 'Customer Name', 'Customer Phone', 'Product Name', 'Product ID', 'IMEI', 'Quantity', 'Selling Price', 'Total Amount', 'Discount', 'GST Amount', 'Net Total', 'Payment Mode', 'Salesperson']
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.invoiceNumber,
        item.date,
        item.time,
        item.customerName,
        item.customerPhone,
        item.productName,
        item.productId,
        item.imei,
        item.quantity,
        item.sellingPrice,
        item.totalAmount,
        item.discount,
        item.gstAmount,
        item.netTotal,
        item.paymentMode,
        item.salesperson
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  // Chart data
  const dailySalesData = useMemo(() => {
    const dailyData = {}
    filteredData.forEach(item => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = { date: item.date, sales: 0, count: 0 }
      }
      dailyData[item.date].sales += item.netTotal
      dailyData[item.date].count += 1
    })
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [filteredData])

  const paymentModeData = useMemo(() => {
    const paymentData = {}
    filteredData.forEach(item => {
      paymentData[item.paymentMode] = (paymentData[item.paymentMode] || 0) + item.netTotal
    })
    return Object.entries(paymentData).map(([mode, amount]) => ({ mode, amount }))
  }, [filteredData])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sales Report</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
          >
            <FiDownload className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
          >
            <FiPrinter className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Sales</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalSales)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Quantity</p>
              <p className="text-2xl font-semibold">{calculateSummary.totalQuantity}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Discount</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalDiscount)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total GST</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalGST)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Net Total</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.netTotal)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice #</label>
            <input
              type="text"
              value={filters.invoiceNumber}
              onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
              placeholder="Search invoice id..."
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={filters.productName}
              onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
              placeholder="Search product..."
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="EMI">EMI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Salesperson</label>
            <input
              type="text"
              value={filters.salesperson}
              onChange={(e) => setFilters({ ...filters, salesperson: e.target.value })}
              placeholder="Search salesperson..."
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
              placeholder="Search customer..."
              className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales Amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold mb-4">Payment Mode Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ mode, percent }) => `${mode} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Sales Details ({filteredData.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product (Model)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Specs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IMEI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">GST</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salesperson</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.map((item, index) => (
                <React.Fragment key={index}>
                <tr className="hover:bg-slate-50">
                  <td className="px-3 py-4 text-sm">
                    <button onClick={()=> setExpandedRow(expandedRow === index ? null : index)} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">
                      {expandedRow === index ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date} {item.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.customerName}</div>
                    <div className="text-slate-500">{item.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.productName}{item.model ? ` (${item.model})` : ''}</div>
                    <div className="text-slate-500">{item.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{[item.color,item.ram,item.storage].filter(Boolean).join(' • ') || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.imei || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.sellingPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.discount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.gstAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatCurrency(item.netTotal)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.paymentMode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.salesperson}</td>
                </tr>
                {expandedRow === index ? (
                  <tr className="bg-slate-50">
                    <td></td>
                    <td colSpan={14} className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-start gap-3">
                        <FiInfo className="mt-1 text-slate-500" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 w-full">
                          <div><span className="text-slate-500">Processor:</span> {item.processor || '-'}</div>
                          <div><span className="text-slate-500">Display:</span> {item.displaySize || '-'}</div>
                          <div><span className="text-slate-500">Camera:</span> {item.camera || '-'}</div>
                          <div><span className="text-slate-500">Battery:</span> {item.battery || '-'}</div>
                          <div><span className="text-slate-500">OS:</span> {item.operatingSystem || '-'}</div>
                          <div><span className="text-slate-500">Network:</span> {item.networkType || '-'}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
