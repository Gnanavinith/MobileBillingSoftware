import React, { useState, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { FiDownload, FiPrinter, FiFilter, FiSettings, FiUser, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

const ServiceReport = () => {
  const [serviceData, setServiceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    status: '',
    technician: '',
    customerName: '',
    serviceType: ''
  })

  // Sample data - in real app, this would come from API/database
  const sampleServiceData = [
    {
      serviceId: 'SRV-001234',
      dateOfRequest: '2025-01-15',
      customerName: 'Ravi Kumar',
      customerPhone: '9876543210',
      deviceName: 'iPhone 14 Pro',
      deviceModel: 'A2888',
      imei: '123456789012345',
      problemDescription: 'Screen cracked, needs replacement',
      partsUsed: [
        { partName: 'Screen Assembly', quantity: 1, cost: 15000 },
        { partName: 'Adhesive', quantity: 1, cost: 500 }
      ],
      serviceCharges: 2000,
      totalAmount: 17500,
      advancePaid: 5000,
      pendingBalance: 12500,
      serviceStatus: 'In Progress',
      technicianName: 'Amit Sharma',
      serviceStartDate: '2025-01-15',
      estimatedDeliveryDate: '2025-01-18',
      actualDeliveryDate: '',
      notes: 'Customer requested quick repair'
    },
    {
      serviceId: 'SRV-001235',
      dateOfRequest: '2025-01-14',
      customerName: 'Priya Singh',
      customerPhone: '9876543211',
      deviceName: 'Samsung Galaxy A54',
      deviceModel: 'SM-A546B',
      imei: '123456789012346',
      problemDescription: 'Battery not holding charge',
      partsUsed: [
        { partName: 'Battery', quantity: 1, cost: 3000 },
        { partName: 'Battery Adhesive', quantity: 1, cost: 200 }
      ],
      serviceCharges: 1500,
      totalAmount: 4700,
      advancePaid: 4700,
      pendingBalance: 0,
      serviceStatus: 'Completed',
      technicianName: 'Sneha Patel',
      serviceStartDate: '2025-01-14',
      estimatedDeliveryDate: '2025-01-16',
      actualDeliveryDate: '2025-01-16',
      notes: 'Battery replaced successfully'
    },
    {
      serviceId: 'SRV-001236',
      dateOfRequest: '2025-01-13',
      customerName: 'Arjun Mehta',
      customerPhone: '9876543212',
      deviceName: 'OnePlus 11',
      deviceModel: 'CPH2449',
      imei: '123456789012347',
      problemDescription: 'Software update failed, device stuck in bootloop',
      partsUsed: [],
      serviceCharges: 1000,
      totalAmount: 1000,
      advancePaid: 0,
      pendingBalance: 1000,
      serviceStatus: 'Pending',
      technicianName: 'Amit Sharma',
      serviceStartDate: '2025-01-13',
      estimatedDeliveryDate: '2025-01-15',
      actualDeliveryDate: '',
      notes: 'Software issue, no parts required'
    },
    {
      serviceId: 'SRV-001237',
      dateOfRequest: '2025-01-12',
      customerName: 'Kavya Reddy',
      customerPhone: '9876543213',
      deviceName: 'Vivo V30',
      deviceModel: 'V2318',
      imei: '123456789012348',
      problemDescription: 'Camera not working, blurry images',
      partsUsed: [
        { partName: 'Rear Camera Module', quantity: 1, cost: 8000 },
        { partName: 'Camera Lens', quantity: 1, cost: 1000 }
      ],
      serviceCharges: 2500,
      totalAmount: 11500,
      advancePaid: 11500,
      pendingBalance: 0,
      serviceStatus: 'Delivered',
      technicianName: 'Sneha Patel',
      serviceStartDate: '2025-01-12',
      estimatedDeliveryDate: '2025-01-14',
      actualDeliveryDate: '2025-01-14',
      notes: 'Camera module replaced, working perfectly'
    },
    {
      serviceId: 'SRV-001238',
      dateOfRequest: '2025-01-11',
      customerName: 'Vikram Joshi',
      customerPhone: '9876543214',
      deviceName: 'iPhone 13',
      deviceModel: 'A2487',
      imei: '123456789012349',
      problemDescription: 'Charging port damaged, not charging',
      partsUsed: [
        { partName: 'Lightning Port', quantity: 1, cost: 4000 },
        { partName: 'Charging Flex Cable', quantity: 1, cost: 2000 }
      ],
      serviceCharges: 3000,
      totalAmount: 9000,
      advancePaid: 3000,
      pendingBalance: 6000,
      serviceStatus: 'In Progress',
      technicianName: 'Amit Sharma',
      serviceStartDate: '2025-01-11',
      estimatedDeliveryDate: '2025-01-13',
      actualDeliveryDate: '',
      notes: 'Charging port replacement in progress'
    }
  ]

  useEffect(() => {
    setServiceData(sampleServiceData)
    setFilteredData(sampleServiceData)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, serviceData])

  const applyFilters = () => {
    let filtered = [...serviceData]

    // Date range filter
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dateOfRequest)
        const startDate = new Date(filters.startDate)
        const endDate = new Date(filters.endDate)
        return itemDate >= startDate && itemDate <= endDate
      })
    } else if (filters.dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(item => item.dateOfRequest === today)
    } else if (filters.dateRange === 'thisWeek') {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dateOfRequest)
        return itemDate >= startOfWeek && itemDate <= endOfWeek
      })
    } else if (filters.dateRange === 'thisMonth') {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dateOfRequest)
        return itemDate >= startOfMonth && itemDate <= endOfMonth
      })
    }

    // Other filters
    if (filters.status) {
      filtered = filtered.filter(item => item.serviceStatus === filters.status)
    }
    if (filters.technician) {
      filtered = filtered.filter(item => 
        item.technicianName.toLowerCase().includes(filters.technician.toLowerCase())
      )
    }
    if (filters.customerName) {
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      )
    }
    if (filters.serviceType) {
      filtered = filtered.filter(item => 
        item.problemDescription.toLowerCase().includes(filters.serviceType.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }

  const calculateSummary = useMemo(() => {
    const totalServices = filteredData.length
    const completedServices = filteredData.filter(item => item.serviceStatus === 'Completed' || item.serviceStatus === 'Delivered').length
    const pendingServices = filteredData.filter(item => item.serviceStatus === 'Pending' || item.serviceStatus === 'In Progress').length
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalAdvancePaid = filteredData.reduce((sum, item) => sum + item.advancePaid, 0)
    const totalPendingBalance = filteredData.reduce((sum, item) => sum + item.pendingBalance, 0)
    const totalPartsCost = filteredData.reduce((sum, item) => 
      sum + item.partsUsed.reduce((partSum, part) => partSum + (part.cost * part.quantity), 0), 0
    )
    const totalServiceCharges = filteredData.reduce((sum, item) => sum + item.serviceCharges, 0)

    return {
      totalServices,
      completedServices,
      pendingServices,
      totalRevenue,
      totalAdvancePaid,
      totalPendingBalance,
      totalPartsCost,
      totalServiceCharges
    }
  }, [filteredData])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'text-green-600 bg-green-100'
      case 'In Progress':
        return 'text-blue-600 bg-blue-100'
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Service Report', 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
    doc.text(`Total Records: ${filteredData.length}`, 20, 35)
    
    // Summary
    doc.setFontSize(14)
    doc.text('Summary', 20, 50)
    doc.setFontSize(10)
    doc.text(`Total Services: ${calculateSummary.totalServices}`, 20, 60)
    doc.text(`Completed: ${calculateSummary.completedServices}`, 20, 65)
    doc.text(`Pending: ${calculateSummary.pendingServices}`, 20, 70)
    doc.text(`Total Revenue: ${formatCurrency(calculateSummary.totalRevenue)}`, 20, 75)
    doc.text(`Total Advance Paid: ${formatCurrency(calculateSummary.totalAdvancePaid)}`, 20, 80)
    doc.text(`Pending Balance: ${formatCurrency(calculateSummary.totalPendingBalance)}`, 20, 85)

    // Table
    const tableData = filteredData.map(item => [
      item.serviceId,
      item.dateOfRequest,
      item.customerName,
      item.deviceName,
      item.problemDescription.substring(0, 30) + '...',
      item.partsUsed.length,
      formatCurrency(item.serviceCharges),
      formatCurrency(item.totalAmount),
      formatCurrency(item.advancePaid),
      formatCurrency(item.pendingBalance),
      item.serviceStatus,
      item.technicianName
    ])

    doc.autoTable({
      head: [['Service ID', 'Date', 'Customer', 'Device', 'Problem', 'Parts', 'Service Charges', 'Total', 'Advance', 'Pending', 'Status', 'Technician']],
      body: tableData,
      startY: 95,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    })

    doc.save('service-report.pdf')
  }

  const exportToExcel = () => {
    const headers = ['Service ID', 'Date of Request', 'Customer Name', 'Customer Phone', 'Device Name', 'Device Model', 'IMEI', 'Problem Description', 'Parts Used', 'Service Charges', 'Total Amount', 'Advance Paid', 'Pending Balance', 'Service Status', 'Technician Name', 'Service Start Date', 'Estimated Delivery Date', 'Actual Delivery Date', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.serviceId,
        item.dateOfRequest,
        item.customerName,
        item.customerPhone,
        item.deviceName,
        item.deviceModel,
        item.imei,
        `"${item.problemDescription}"`,
        `"${item.partsUsed.map(part => `${part.partName} (${part.quantity}x${part.cost})`).join(', ')}"`,
        item.serviceCharges,
        item.totalAmount,
        item.advancePaid,
        item.pendingBalance,
        item.serviceStatus,
        item.technicianName,
        item.serviceStartDate,
        item.estimatedDeliveryDate,
        item.actualDeliveryDate,
        `"${item.notes}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'service-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  // Chart data
  const statusData = useMemo(() => {
    const statusCounts = {}
    filteredData.forEach(item => {
      statusCounts[item.serviceStatus] = (statusCounts[item.serviceStatus] || 0) + 1
    })
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
  }, [filteredData])

  const technicianData = useMemo(() => {
    const techData = {}
    filteredData.forEach(item => {
      if (!techData[item.technicianName]) {
        techData[item.technicianName] = { technician: item.technicianName, services: 0, revenue: 0 }
      }
      techData[item.technicianName].services += 1
      techData[item.technicianName].revenue += item.totalAmount
    })
    return Object.values(techData)
  }, [filteredData])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Service Report</h1>
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
              <p className="text-sm text-slate-600">Total Services</p>
              <p className="text-2xl font-semibold">{calculateSummary.totalServices}</p>
            </div>
            <FiSettings className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{calculateSummary.completedServices}</p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{calculateSummary.pendingServices}</p>
            </div>
            <FiClock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalRevenue)}</p>
            </div>
            <FiSettings className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Advance Paid</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalAdvancePaid)}</p>
            </div>
            <FiUser className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Balance</p>
              <p className="text-2xl font-semibold text-red-600">{formatCurrency(calculateSummary.totalPendingBalance)}</p>
            </div>
            <FiXCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Parts Cost</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalPartsCost)}</p>
            </div>
            <FiSettings className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Service Charges</p>
              <p className="text-2xl font-semibold">{formatCurrency(calculateSummary.totalServiceCharges)}</p>
            </div>
            <FiSettings className="w-8 h-8 text-teal-600" />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
            <input
              type="text"
              value={filters.technician}
              onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
              placeholder="Search technician..."
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <input
              type="text"
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              placeholder="Search problem type..."
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Service Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Technician Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technicianData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technician" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="services" fill="#8884d8" name="Services Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Service Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold">Service Details ({filteredData.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parts Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Service Charges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Advance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Technician</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.serviceId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.dateOfRequest}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.customerName}</div>
                    <div className="text-slate-500">{item.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div>{item.deviceName}</div>
                    <div className="text-slate-500">{item.deviceModel}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                    <div className="truncate" title={item.problemDescription}>
                      {item.problemDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {item.partsUsed.length > 0 ? (
                      <div>
                        {item.partsUsed.map((part, idx) => (
                          <div key={idx} className="text-xs">
                            {part.partName} ({part.quantity}x)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">No parts</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.serviceCharges)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatCurrency(item.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.advancePaid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(item.pendingBalance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.serviceStatus)}`}>
                      {item.serviceStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.technicianName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ServiceReport
