import React, { useState, useEffect, useMemo } from 'react'
import { FiFilter, FiDownload, FiEye, FiSearch, FiPrinter } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const storageKey = 'mobilebill:services'

const ServiceHistory = () => {
  const [services, setServices] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    serviceType: ''
  })
  const [selectedService, setSelectedService] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const savedServices = JSON.parse(localStorage.getItem(storageKey) || '[]')
      if (savedServices.length === 0) {
        // Add dummy service data if none exist
        const dummyServices = [
          {
            id: 'SRV-001',
            customerDetails: {
              name: 'Rajesh Kumar',
              phone: '+91 98765 43210',
              address: '123 MG Road, Mumbai',
              idProof: '1234 5678 9012',
              idProofType: 'Aadhaar'
            },
            deviceDetails: {
              brand: 'Samsung',
              model: 'Galaxy A54',
              imei: '123456789012345',
              problemDescription: 'Screen not working, touch unresponsive',
              accessoriesGiven: 'Charger, Case'
            },
            serviceDetails: {
              serviceType: 'Screen Replacement',
              estimatedCost: 5000,
              advancePayment: 2000,
              paymentMode: 'UPI',
              discount: 5,
              gstEnabled: true,
              gstPercentage: 18,
              serviceParts: [
                {
                  partId: 'PROD-004',
                  partName: 'Screen Protector',
                  partModel: 'Tempered Glass Universal',
                  quantity: 1,
                  unitPrice: 400,
                  totalPrice: 400
                }
              ],
              status: 'Completed',
              assignedStaff: 'John Doe',
              serviceStartDate: '2024-01-15',
              estimatedDeliveryDate: '2024-01-18',
              notes: 'Screen replaced successfully'
            },
            calculatedAmounts: {
              subtotal: 5400,
              discountAmount: 270,
              gstAmount: 923.4,
              grandTotal: 6053.4,
              pendingBalance: 4053.4
            },
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-18T16:45:00Z'
          },
          {
            id: 'SRV-002',
            customerDetails: {
              name: 'Priya Sharma',
              phone: '+91 98765 43211',
              address: '456 Park Street, Delhi',
              idProof: 'ABCD1234EFGH',
              idProofType: 'PAN'
            },
            deviceDetails: {
              brand: 'iPhone',
              model: 'iPhone 14',
              imei: '987654321098765',
              problemDescription: 'Battery draining fast, needs replacement',
              accessoriesGiven: 'Earphones, Charger'
            },
            serviceDetails: {
              serviceType: 'Battery Replacement',
              estimatedCost: 8000,
              advancePayment: 3000,
              paymentMode: 'Card',
              discount: 0,
              gstEnabled: true,
              gstPercentage: 18,
              serviceParts: [],
              status: 'In Progress',
              assignedStaff: 'Mike Smith',
              serviceStartDate: '2024-01-20',
              estimatedDeliveryDate: '2024-01-22',
              notes: 'Battery ordered, waiting for delivery'
            },
            calculatedAmounts: {
              subtotal: 8000,
              discountAmount: 0,
              gstAmount: 1440,
              grandTotal: 9440,
              pendingBalance: 6440
            },
            createdAt: '2024-01-20T14:15:00Z',
            updatedAt: '2024-01-20T14:15:00Z'
          },
          {
            id: 'SRV-003',
            customerDetails: {
              name: 'Amit Patel',
              phone: '+91 98765 43212',
              address: '789 Tech Park, Bangalore',
              idProof: 'DL123456789',
              idProofType: 'Driving License'
            },
            deviceDetails: {
              brand: 'OnePlus',
              model: '11R',
              imei: '555666777888999',
              problemDescription: 'Software issues, phone keeps restarting',
              accessoriesGiven: 'Charger only'
            },
            serviceDetails: {
              serviceType: 'Software Update',
              estimatedCost: 1500,
              advancePayment: 1500,
              paymentMode: 'Cash',
              discount: 10,
              gstEnabled: true,
              gstPercentage: 18,
              serviceParts: [],
              status: 'Delivered',
              assignedStaff: 'Sarah Wilson',
              serviceStartDate: '2024-01-25',
              estimatedDeliveryDate: '2024-01-26',
              notes: 'Software updated, phone working fine'
            },
            calculatedAmounts: {
              subtotal: 1500,
              discountAmount: 150,
              gstAmount: 243,
              grandTotal: 1593,
              pendingBalance: 93
            },
            createdAt: '2024-01-25T09:45:00Z',
            updatedAt: '2024-01-26T11:30:00Z'
          }
        ]
        localStorage.setItem(storageKey, JSON.stringify(dummyServices))
        setServices(dummyServices)
      } else {
        setServices(Array.isArray(savedServices) ? savedServices : [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const filteredServices = useMemo(() => {
    let filtered = services

    if (filters.status) {
      filtered = filtered.filter(s => s.serviceDetails.status === filters.status)
    }

    if (filters.serviceType) {
      filtered = filtered.filter(s => s.serviceDetails.serviceType === filters.serviceType)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(s => s.serviceDetails.serviceStartDate >= filters.dateFrom)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(s => s.serviceDetails.serviceStartDate <= filters.dateTo)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(s => 
        s.id.toLowerCase().includes(searchLower) ||
        s.customerDetails.name.toLowerCase().includes(searchLower) ||
        s.customerDetails.phone.toLowerCase().includes(searchLower) ||
        s.deviceDetails.brand.toLowerCase().includes(searchLower) ||
        s.deviceDetails.model.toLowerCase().includes(searchLower) ||
        s.deviceDetails.problemDescription.toLowerCase().includes(searchLower)
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [services, filters])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'In Progress': return 'bg-blue-100 text-blue-700'
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Delivered': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Service History Report', 14, 22)
    
    // Date range
    doc.setFontSize(10)
    const dateRange = filters.dateFrom && filters.dateTo 
      ? `${filters.dateFrom} to ${filters.dateTo}`
      : 'All Time'
    doc.text(`Date Range: ${dateRange}`, 14, 30)
    
    // Status filter
    if (filters.status) {
      doc.text(`Status: ${filters.status}`, 14, 35)
    }

    // Table data
    const tableData = []
    filteredServices.forEach(service => {
      tableData.push([
        service.id,
        service.customerDetails.name,
        service.customerDetails.phone,
        `${service.deviceDetails.brand} ${service.deviceDetails.model}`,
        service.serviceDetails.serviceType,
        service.serviceDetails.status,
        `₹${service.calculatedAmounts.grandTotal.toFixed(2)}`,
        `₹${service.calculatedAmounts.pendingBalance.toFixed(2)}`,
        service.serviceDetails.serviceStartDate,
        service.serviceDetails.estimatedDeliveryDate || 'N/A',
        service.serviceDetails.assignedStaff || 'N/A'
      ])
    })

    // Table headers
    const headers = [
      'Service ID', 'Client Name', 'Phone', 'Device', 'Service Type', 
      'Status', 'Total Amount', 'Pending Balance', 'Start Date', 
      'Delivery Date', 'Assigned Staff'
    ]

    // Generate table
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }
    })

    // Save the PDF
    doc.save('service-history.pdf')
  }

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Service ID', 'Client Name', 'Phone', 'Address', 'ID Proof', 'Device Brand', 
      'Device Model', 'IMEI', 'Problem Description', 'Service Type', 'Status', 
      'Total Amount', 'Advance Paid', 'Pending Balance', 'Start Date', 
      'Delivery Date', 'Assigned Staff', 'Notes'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredServices.map(service => [
        `"${service.id}"`,
        `"${service.customerDetails.name}"`,
        `"${service.customerDetails.phone}"`,
        `"${service.customerDetails.address}"`,
        `"${service.customerDetails.idProof}"`,
        `"${service.deviceDetails.brand}"`,
        `"${service.deviceDetails.model}"`,
        `"${service.deviceDetails.imei}"`,
        `"${service.deviceDetails.problemDescription}"`,
        `"${service.serviceDetails.serviceType}"`,
        `"${service.serviceDetails.status}"`,
        service.calculatedAmounts.grandTotal.toFixed(2),
        service.serviceDetails.advancePayment.toFixed(2),
        service.calculatedAmounts.pendingBalance.toFixed(2),
        service.serviceDetails.serviceStartDate,
        service.serviceDetails.estimatedDeliveryDate || 'N/A',
        `"${service.serviceDetails.assignedStaff || 'N/A'}"`,
        `"${service.serviceDetails.notes || 'N/A'}"`
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'service-history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateInvoice = (service) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('SERVICE INVOICE', 14, 22)
    
    // Service ID and Date
    doc.setFontSize(12)
    doc.text(`Service ID: ${service.id}`, 14, 35)
    doc.text(`Date: ${service.serviceDetails.serviceStartDate}`, 14, 42)
    
    // Customer Details
    doc.setFontSize(14)
    doc.text('Customer Details:', 14, 55)
    doc.setFontSize(10)
    doc.text(`Name: ${service.customerDetails.name}`, 14, 65)
    doc.text(`Phone: ${service.customerDetails.phone}`, 14, 72)
    doc.text(`Address: ${service.customerDetails.address}`, 14, 79)
    
    // Device Details
    doc.setFontSize(14)
    doc.text('Device Details:', 14, 95)
    doc.setFontSize(10)
    doc.text(`Brand: ${service.deviceDetails.brand}`, 14, 105)
    doc.text(`Model: ${service.deviceDetails.model}`, 14, 112)
    doc.text(`IMEI: ${service.deviceDetails.imei}`, 14, 119)
    doc.text(`Problem: ${service.deviceDetails.problemDescription}`, 14, 126)
    
    // Service Details
    doc.setFontSize(14)
    doc.text('Service Details:', 14, 140)
    doc.setFontSize(10)
    doc.text(`Service Type: ${service.serviceDetails.serviceType}`, 14, 150)
    doc.text(`Status: ${service.serviceDetails.status}`, 14, 157)
    doc.text(`Assigned Staff: ${service.serviceDetails.assignedStaff}`, 14, 164)
    
    // Amount Details
    doc.setFontSize(14)
    doc.text('Amount Details:', 14, 180)
    doc.setFontSize(10)
    doc.text(`Service Cost: ₹${service.serviceDetails.estimatedCost.toFixed(2)}`, 14, 190)
    doc.text(`Parts Cost: ₹${service.serviceDetails.serviceParts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)}`, 14, 197)
    doc.text(`Subtotal: ₹${service.calculatedAmounts.subtotal.toFixed(2)}`, 14, 204)
    if (service.serviceDetails.discount > 0) {
      doc.text(`Discount (${service.serviceDetails.discount}%): -₹${service.calculatedAmounts.discountAmount.toFixed(2)}`, 14, 211)
    }
    if (service.serviceDetails.gstEnabled) {
      doc.text(`GST (${service.serviceDetails.gstPercentage}%): ₹${service.calculatedAmounts.gstAmount.toFixed(2)}`, 14, 218)
    }
    doc.setFontSize(12)
    doc.text(`Grand Total: ₹${service.calculatedAmounts.grandTotal.toFixed(2)}`, 14, 225)
    doc.text(`Advance Paid: ₹${service.serviceDetails.advancePayment.toFixed(2)}`, 14, 232)
    doc.text(`Pending Balance: ₹${service.calculatedAmounts.pendingBalance.toFixed(2)}`, 14, 239)
    
    // Save the PDF
    doc.save(`service-invoice-${service.id}.pdf`)
  }

  const viewServiceDetails = (service) => {
    setSelectedService(service)
    setShowModal(true)
  }

  const updateServiceStatus = (serviceId, newStatus) => {
    const updatedServices = services.map(service => 
      service.id === serviceId 
        ? { ...service, serviceDetails: { ...service.serviceDetails, status: newStatus }, updatedAt: new Date().toISOString() }
        : service
    )
    setServices(updatedServices)
    localStorage.setItem(storageKey, JSON.stringify(updatedServices))
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Service History</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter className="w-4 h-4" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Types</option>
              <option value="Repair">Repair</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Warranty">Warranty</option>
              <option value="Software Update">Software Update</option>
              <option value="Screen Replacement">Screen Replacement</option>
              <option value="Battery Replacement">Battery Replacement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Service ID, name, phone, device..."
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pl-8"
              />
              <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Service History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">
            Service Records ({filteredServices.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b">
                <th className="py-3 px-4">Service ID</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Pending Balance</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-slate-500" colSpan={12}>
                    No service records found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{service.id}</td>
                    <td className="py-3 px-4">{service.customerDetails.name}</td>
                    <td className="py-3 px-4">{service.customerDetails.phone}</td>
                    <td className="py-3 px-4">
                      {service.deviceDetails.brand} {service.deviceDetails.model}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                        {service.serviceDetails.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.serviceDetails.status)}`}>
                        {service.serviceDetails.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">₹{service.calculatedAmounts.grandTotal.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={service.calculatedAmounts.pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                        ₹{service.calculatedAmounts.pendingBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{service.serviceDetails.serviceStartDate}</td>
                    <td className="py-3 px-4">{service.serviceDetails.estimatedDeliveryDate || 'N/A'}</td>
                    <td className="py-3 px-4">{service.serviceDetails.assignedStaff || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewServiceDetails(service)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateInvoice(service)}
                          className="text-green-600 hover:text-green-800"
                          title="Generate Invoice"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                        <select
                          value={service.serviceDetails.status}
                          onChange={(e) => updateServiceStatus(service.id, e.target.value)}
                          className="text-xs border border-slate-300 rounded px-1 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Service Details - {selectedService.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedService.customerDetails.name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedService.customerDetails.phone}</p>
                  <p><span className="font-medium">Address:</span> {selectedService.customerDetails.address}</p>
                  <p><span className="font-medium">ID Proof:</span> {selectedService.customerDetails.idProofType} - {selectedService.customerDetails.idProof}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Device Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Brand:</span> {selectedService.deviceDetails.brand}</p>
                  <p><span className="font-medium">Model:</span> {selectedService.deviceDetails.model}</p>
                  <p><span className="font-medium">IMEI:</span> {selectedService.deviceDetails.imei}</p>
                  <p><span className="font-medium">Problem:</span> {selectedService.deviceDetails.problemDescription}</p>
                  <p><span className="font-medium">Accessories:</span> {selectedService.deviceDetails.accessoriesGiven}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Service Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Type:</span> {selectedService.serviceDetails.serviceType}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedService.serviceDetails.status)}`}>
                      {selectedService.serviceDetails.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Staff:</span> {selectedService.serviceDetails.assignedStaff}</p>
                  <p><span className="font-medium">Start Date:</span> {selectedService.serviceDetails.serviceStartDate}</p>
                  <p><span className="font-medium">Delivery Date:</span> {selectedService.serviceDetails.estimatedDeliveryDate || 'N/A'}</p>
                  <p><span className="font-medium">Notes:</span> {selectedService.serviceDetails.notes || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Amount Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Service Cost:</span> ₹{selectedService.serviceDetails.estimatedCost.toFixed(2)}</p>
                  <p><span className="font-medium">Parts Cost:</span> ₹{selectedService.serviceDetails.serviceParts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)}</p>
                  <p><span className="font-medium">Subtotal:</span> ₹{selectedService.calculatedAmounts.subtotal.toFixed(2)}</p>
                  {selectedService.serviceDetails.discount > 0 && (
                    <p><span className="font-medium">Discount:</span> -₹{selectedService.calculatedAmounts.discountAmount.toFixed(2)}</p>
                  )}
                  {selectedService.serviceDetails.gstEnabled && (
                    <p><span className="font-medium">GST:</span> ₹{selectedService.calculatedAmounts.gstAmount.toFixed(2)}</p>
                  )}
                  <p className="text-lg font-semibold"><span className="font-medium">Grand Total:</span> ₹{selectedService.calculatedAmounts.grandTotal.toFixed(2)}</p>
                  <p><span className="font-medium">Advance Paid:</span> ₹{selectedService.serviceDetails.advancePayment.toFixed(2)}</p>
                  <p className="text-lg font-semibold"><span className="font-medium">Pending Balance:</span> ₹{selectedService.calculatedAmounts.pendingBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {selectedService.serviceDetails.serviceParts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Service Parts Used</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 text-xs uppercase border-b">
                        <th className="py-2 pr-4">Part Name</th>
                        <th className="py-2 pr-4">Model</th>
                        <th className="py-2 pr-4">Quantity</th>
                        <th className="py-2 pr-4">Unit Price</th>
                        <th className="py-2 pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedService.serviceDetails.serviceParts.map((part, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 pr-4">{part.partName}</td>
                          <td className="py-2 pr-4">{part.partModel}</td>
                          <td className="py-2 pr-4">{part.quantity}</td>
                          <td className="py-2 pr-4">₹{part.unitPrice.toFixed(2)}</td>
                          <td className="py-2 pr-4">₹{part.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceHistory
