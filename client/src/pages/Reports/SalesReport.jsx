import React, { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiPrinter, FiFilter, FiShoppingBag } from 'react-icons/fi'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const SalesReport = () => {
  const [salesData, setSalesData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    productName: '',
    paymentMode: '',
    salesperson: '',
    customerName: ''
  })

  // Sample data - in real app, this would come from API/database
  const sampleSalesData = [
    {
      invoiceNumber: 'INV-001234',
      date: '2025-01-15',
      time: '14:30:00',
      customerName: 'Ravi Kumar',
      customerPhone: '9876543210',
      productName: 'iPhone 14 Pro',
      productId: 'IPH14P-128',
      imei: '123456789012345',
      quantity: 1,
      sellingPrice: 85000,
      totalAmount: 85000,
      discount: 2000,
      gstAmount: 15300,
      netTotal: 98300,
      paymentMode: 'UPI',
      salesperson: 'Amit Sharma'
    },
    {
      invoiceNumber: 'INV-001235',
      date: '2025-01-15',
      time: '15:45:00',
      customerName: 'Priya Singh',
      customerPhone: '9876543211',
      productName: 'Samsung Galaxy A54',
      productId: 'SGA54-256',
      imei: '123456789012346',
      quantity: 1,
      sellingPrice: 32000,
      totalAmount: 32000,
      discount: 0,
      gstAmount: 5760,
      netTotal: 37760,
      paymentMode: 'Card',
      salesperson: 'Sneha Patel'
    },
    {
      invoiceNumber: 'INV-001236',
      date: '2025-01-14',
      time: '11:20:00',
      customerName: 'Arjun Mehta',
      customerPhone: '9876543212',
      productName: 'OnePlus 11',
      productId: 'OP11-256',
      imei: '123456789012347',
      quantity: 1,
      sellingPrice: 45000,
      totalAmount: 45000,
      discount: 1500,
      gstAmount: 7830,
      netTotal: 51330,
      paymentMode: 'Cash',
      salesperson: 'Amit Sharma'
    },
    {
      invoiceNumber: 'INV-001237',
      date: '2025-01-14',
      time: '16:10:00',
      customerName: 'Kavya Reddy',
      customerPhone: '9876543213',
      productName: 'AirPods Pro',
      productId: 'APP-2',
      imei: '',
      quantity: 2,
      sellingPrice: 18000,
      totalAmount: 36000,
      discount: 1000,
      gstAmount: 6300,
      netTotal: 41300,
      paymentMode: 'UPI',
      salesperson: 'Sneha Patel'
    },
    {
      invoiceNumber: 'INV-001238',
      date: '2025-01-13',
      time: '09:30:00',
      customerName: 'Vikram Joshi',
      customerPhone: '9876543214',
      productName: 'Vivo V30',
      productId: 'VV30-128',
      imei: '123456789012348',
      quantity: 1,
      sellingPrice: 28000,
      totalAmount: 28000,
      discount: 0,
      gstAmount: 5040,
      netTotal: 33040,
      paymentMode: 'EMI',
      salesperson: 'Amit Sharma'
    }
  ]

  useEffect(() => {
    setSalesData(sampleSalesData)
    setFilteredData(sampleSalesData)
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
      item.productName,
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
      head: [['Invoice', 'Date', 'Customer', 'Product', 'Qty', 'Price', 'Total', 'Discount', 'GST', 'Net Total', 'Payment', 'Salesperson']],
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Sales Report</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiDownload className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPrinter className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Sales</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalSales)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Quantity</p>
              <p className="text-2xl font-semibold">{calculateSummary.totalQuantity}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Discount</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalDiscount)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total GST</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalGST)}</p>
            </div>
            <FiShoppingBag className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={filters.productName}
              onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
              placeholder="Search product..."
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={filters.customerName}
              onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
              placeholder="Search customer..."
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Sales Details ({filteredData.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
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
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date} {item.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.customerName}</div>
                    <div className="text-slate-500">{item.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.productName}</div>
                    <div className="text-slate-500">{item.productId}</div>
                  </td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalesReport
