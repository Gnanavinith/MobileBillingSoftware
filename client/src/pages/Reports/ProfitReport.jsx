import React, { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiPrinter, FiFilter, FiTrendingUp, FiDollarSign, FiPackage, FiUsers } from 'react-icons/fi'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'

const ProfitReport = () => {
  const [profitData, setProfitData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    productName: '',
    category: '',
    salesperson: ''
  })

  // Sample data - in real app, this would come from API/database
  const sampleProfitData = [
    {
      date: '2025-01-15',
      productName: 'iPhone 14 Pro',
      productId: 'IPH14P-128',
      category: 'Mobile',
      quantitySold: 1,
      purchasePrice: 75000,
      sellingPrice: 85000,
      totalSalesAmount: 85000,
      totalPurchaseCost: 75000,
      grossProfit: 10000,
      expenses: 2000,
      netProfit: 8000,
      salesperson: 'Amit Sharma',
      margin: 11.76
    },
    {
      date: '2025-01-15',
      productName: 'Samsung Galaxy A54',
      productId: 'SGA54-256',
      category: 'Mobile',
      quantitySold: 1,
      purchasePrice: 28000,
      sellingPrice: 32000,
      totalSalesAmount: 32000,
      totalPurchaseCost: 28000,
      grossProfit: 4000,
      expenses: 500,
      netProfit: 3500,
      salesperson: 'Sneha Patel',
      margin: 12.5
    },
    {
      date: '2025-01-14',
      productName: 'OnePlus 11',
      productId: 'OP11-256',
      category: 'Mobile',
      quantitySold: 1,
      purchasePrice: 40000,
      sellingPrice: 45000,
      totalSalesAmount: 45000,
      totalPurchaseCost: 40000,
      grossProfit: 5000,
      expenses: 1000,
      netProfit: 4000,
      salesperson: 'Amit Sharma',
      margin: 11.11
    },
    {
      date: '2025-01-14',
      productName: 'AirPods Pro',
      productId: 'APP-2',
      category: 'Accessories',
      quantitySold: 2,
      purchasePrice: 15000,
      sellingPrice: 18000,
      totalSalesAmount: 36000,
      totalPurchaseCost: 30000,
      grossProfit: 6000,
      expenses: 800,
      netProfit: 5200,
      salesperson: 'Sneha Patel',
      margin: 16.67
    },
    {
      date: '2025-01-13',
      productName: 'Vivo V30',
      productId: 'VV30-128',
      category: 'Mobile',
      quantitySold: 1,
      purchasePrice: 25000,
      sellingPrice: 28000,
      totalSalesAmount: 28000,
      totalPurchaseCost: 25000,
      grossProfit: 3000,
      expenses: 400,
      netProfit: 2600,
      salesperson: 'Amit Sharma',
      margin: 10.71
    }
  ]

  useEffect(() => {
    setProfitData(sampleProfitData)
    setFilteredData(sampleProfitData)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, profitData])

  const applyFilters = () => {
    let filtered = [...profitData]

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
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    if (filters.salesperson) {
      filtered = filtered.filter(item => 
        item.salesperson.toLowerCase().includes(filters.salesperson.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }

  const calculateSummary = useMemo(() => {
    const totalSalesAmount = filteredData.reduce((sum, item) => sum + item.totalSalesAmount, 0)
    const totalPurchaseCost = filteredData.reduce((sum, item) => sum + item.totalPurchaseCost, 0)
    const totalGrossProfit = filteredData.reduce((sum, item) => sum + item.grossProfit, 0)
    const totalExpenses = filteredData.reduce((sum, item) => sum + item.expenses, 0)
    const totalNetProfit = filteredData.reduce((sum, item) => sum + item.netProfit, 0)
    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantitySold, 0)
    const averageMargin = totalSalesAmount > 0 ? (totalGrossProfit / totalSalesAmount) * 100 : 0

    return {
      totalSalesAmount,
      totalPurchaseCost,
      totalGrossProfit,
      totalExpenses,
      totalNetProfit,
      totalQuantity,
      averageMargin
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
    doc.text('Profit Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
    doc.text(`Total Records: ${filteredData.length}`, 20, 35)
    
    // Summary
    doc.setFontSize(14)
    doc.text('Summary', 20, 50)
    doc.setFontSize(10)
    doc.text(`Total Sales: ${formatCurrency(calculateSummary.totalSalesAmount)}`, 20, 60)
    doc.text(`Total Purchase Cost: ${formatCurrency(calculateSummary.totalPurchaseCost)}`, 20, 65)
    doc.text(`Gross Profit: ${formatCurrency(calculateSummary.totalGrossProfit)}`, 20, 70)
    doc.text(`Total Expenses: ${formatCurrency(calculateSummary.totalExpenses)}`, 20, 75)
    doc.text(`Net Profit: ${formatCurrency(calculateSummary.totalNetProfit)}`, 20, 80)
    doc.text(`Average Margin: ${calculateSummary.averageMargin.toFixed(2)}%`, 20, 85)

    // Table
    const tableData = filteredData.map(item => [
      item.date,
      item.productName,
      item.category,
      item.quantitySold,
      formatCurrency(item.purchasePrice),
      formatCurrency(item.sellingPrice),
      formatCurrency(item.totalSalesAmount),
      formatCurrency(item.totalPurchaseCost),
      formatCurrency(item.grossProfit),
      formatCurrency(item.expenses),
      formatCurrency(item.netProfit),
      `${item.margin.toFixed(2)}%`,
      item.salesperson
    ])

    doc.autoTable({
      head: [['Date', 'Product', 'Category', 'Qty', 'Purchase Price', 'Selling Price', 'Sales Amount', 'Purchase Cost', 'Gross Profit', 'Expenses', 'Net Profit', 'Margin', 'Salesperson']],
      body: tableData,
      startY: 95,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save('profit-report.pdf')
  }

  const exportToExcel = () => {
    const headers = ['Date', 'Product Name', 'Product ID', 'Category', 'Quantity Sold', 'Purchase Price', 'Selling Price', 'Total Sales Amount', 'Total Purchase Cost', 'Gross Profit', 'Expenses', 'Net Profit', 'Margin %', 'Salesperson']
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.date,
        item.productName,
        item.productId,
        item.category,
        item.quantitySold,
        item.purchasePrice,
        item.sellingPrice,
        item.totalSalesAmount,
        item.totalPurchaseCost,
        item.grossProfit,
        item.expenses,
        item.netProfit,
        item.margin,
        item.salesperson
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profit-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  // Chart data
  const dailyProfitData = useMemo(() => {
    const dailyData = {}
    filteredData.forEach(item => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = { 
          date: item.date, 
          grossProfit: 0, 
          netProfit: 0, 
          sales: 0,
          expenses: 0
        }
      }
      dailyData[item.date].grossProfit += item.grossProfit
      dailyData[item.date].netProfit += item.netProfit
      dailyData[item.date].sales += item.totalSalesAmount
      dailyData[item.date].expenses += item.expenses
    })
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [filteredData])

  const categoryData = useMemo(() => {
    const categoryStats = {}
    filteredData.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          category: item.category,
          sales: 0,
          profit: 0,
          quantity: 0,
          margin: 0
        }
      }
      categoryStats[item.category].sales += item.totalSalesAmount
      categoryStats[item.category].profit += item.netProfit
      categoryStats[item.category].quantity += item.quantitySold
    })
    
    // Calculate margin for each category
    Object.values(categoryStats).forEach(cat => {
      cat.margin = cat.sales > 0 ? (cat.profit / cat.sales) * 100 : 0
    })
    
    return Object.values(categoryStats)
  }, [filteredData])

  const topProducts = useMemo(() => {
    const productStats = {}
    filteredData.forEach(item => {
      if (!productStats[item.productName]) {
        productStats[item.productName] = {
          product: item.productName,
          profit: 0,
          sales: 0,
          margin: 0
        }
      }
      productStats[item.productName].profit += item.netProfit
      productStats[item.productName].sales += item.totalSalesAmount
    })
    
    // Calculate margin for each product
    Object.values(productStats).forEach(prod => {
      prod.margin = prod.sales > 0 ? (prod.profit / prod.sales) * 100 : 0
    })
    
    return Object.values(productStats)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
  }, [filteredData])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profit Report</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Sales</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalSalesAmount)}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Purchase Cost</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalPurchaseCost)}</p>
            </div>
            <FiPackage className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Gross Profit</p>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(calculateSummary.totalGrossProfit)}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Net Profit</p>
              <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(calculateSummary.totalNetProfit)}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-red-600">{formatCurrency(calculateSummary.totalExpenses)}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Quantity</p>
              <p className="text-2xl font-semibold">{calculateSummary.totalQuantity}</p>
            </div>
            <FiPackage className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Average Margin</p>
              <p className="text-2xl font-semibold text-teal-600">{calculateSummary.averageMargin.toFixed(2)}%</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Profit Margin</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {calculateSummary.totalSalesAmount > 0 
                  ? ((calculateSummary.totalNetProfit / calculateSummary.totalSalesAmount) * 100).toFixed(2)
                  : 0}%
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-emerald-600" />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="Mobile">Mobile</option>
              <option value="Accessories">Accessories</option>
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
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Daily Profit Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="grossProfit" stroke="#22c55e" strokeWidth={2} name="Gross Profit" />
                <Line type="monotone" dataKey="netProfit" stroke="#3b82f6" strokeWidth={2} name="Net Profit" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Category-wise Profit</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="profit" fill="#22c55e" name="Net Profit" />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Top 5 Products by Profit</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product" type="category" width={120} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profit" fill="#22c55e" name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Profit Details ({filteredData.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purchase Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sales Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purchase Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salesperson</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.productName}</div>
                    <div className="text-slate-500">{item.productId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.quantitySold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.purchasePrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.sellingPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.totalSalesAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.totalPurchaseCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(item.grossProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(item.expenses)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{formatCurrency(item.netProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.margin.toFixed(2)}%</td>
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

export default ProfitReport
