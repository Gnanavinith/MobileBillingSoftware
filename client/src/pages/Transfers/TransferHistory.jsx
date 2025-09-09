import React, { useState, useEffect, useMemo } from 'react'
import { FiFilter, FiDownload, FiEye, FiSearch, FiPrinter } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const storageKey = 'mobilebill:transfers'

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    fromStore: '',
    toStore: ''
  })
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Mock stores/persons for demonstration
  const stores = [
    { id: 'STORE-001', name: 'Main Store', type: 'Store' },
    { id: 'STORE-002', name: 'Branch Store - Mumbai', type: 'Store' },
    { id: 'STORE-003', name: 'Branch Store - Delhi', type: 'Store' },
    { id: 'PERSON-001', name: 'John Doe (Sales Rep)', type: 'Person' },
    { id: 'PERSON-002', name: 'Jane Smith (Field Rep)', type: 'Person' },
    { id: 'PERSON-003', name: 'Mike Johnson (Service Tech)', type: 'Person' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const savedTransfers = JSON.parse(localStorage.getItem(storageKey) || '[]')
      if (savedTransfers.length === 0) {
        // Add dummy transfer data if none exist
        const dummyTransfers = [
          {
            id: 'TRF-001',
            transferDetails: {
              fromStore: 'STORE-001',
              toStore: 'STORE-002',
              transferDate: '2024-01-15',
              transferTime: '10:30',
              paymentMode: 'Cash',
              remarks: 'Regular stock transfer to Mumbai branch'
            },
            products: [
              {
                productId: 'PROD-002',
                productName: 'Ear Buds',
                productModel: 'OnePlus Buds Z2',
                productSku: 'OP-BUDS-002',
                quantity: 10,
                unitPrice: 1200,
                totalPrice: 12000
              },
              {
                productId: 'PROD-003',
                productName: 'Mobile Cover',
                productModel: 'Redmi Note 12 Pro',
                productSku: 'RM-COVER-003',
                quantity: 5,
                unitPrice: 1500,
                totalPrice: 7500
              }
            ],
            totalAmount: 19500,
            status: 'Completed',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 'TRF-002',
            transferDetails: {
              fromStore: 'STORE-001',
              toStore: 'PERSON-001',
              transferDate: '2024-01-20',
              transferTime: '14:15',
              paymentMode: 'UPI',
              remarks: 'Field sales inventory for John Doe'
            },
            products: [
              {
                productId: 'PROD-001',
                productName: 'Smartphone',
                productModel: 'Samsung Galaxy A54',
                productSku: 'SAM-A54-001',
                quantity: 2,
                unitPrice: 6500,
                totalPrice: 13000
              }
            ],
            totalAmount: 13000,
            status: 'Completed',
            createdAt: '2024-01-20T14:15:00Z',
            updatedAt: '2024-01-20T14:15:00Z'
          },
          {
            id: 'TRF-003',
            transferDetails: {
              fromStore: 'STORE-002',
              toStore: 'STORE-003',
              transferDate: '2024-01-25',
              transferTime: '09:45',
              paymentMode: 'Bank',
              remarks: 'Inter-branch transfer for Delhi store'
            },
            products: [
              {
                productId: 'PROD-004',
                productName: 'Screen Protector',
                productModel: 'Tempered Glass Universal',
                productSku: 'SP-UNIV-004',
                quantity: 20,
                unitPrice: 400,
                totalPrice: 8000
              },
              {
                productId: 'PROD-005',
                productName: 'Charger',
                productModel: 'Samsung Fast Charger',
                productSku: 'SAM-CHG-005',
                quantity: 3,
                unitPrice: 1500,
                totalPrice: 4500
              }
            ],
            totalAmount: 12500,
            status: 'Pending',
            createdAt: '2024-01-25T09:45:00Z',
            updatedAt: '2024-01-25T09:45:00Z'
          },
          {
            id: 'TRF-004',
            transferDetails: {
              fromStore: 'STORE-001',
              toStore: 'PERSON-002',
              transferDate: '2024-02-01',
              transferTime: '16:20',
              paymentMode: 'Credit',
              remarks: 'Service technician inventory for Jane Smith'
            },
            products: [
              {
                productId: 'PROD-004',
                productName: 'Screen Protector',
                productModel: 'Tempered Glass Universal',
                productSku: 'SP-UNIV-004',
                quantity: 15,
                unitPrice: 400,
                totalPrice: 6000
              }
            ],
            totalAmount: 6000,
            status: 'Cancelled',
            createdAt: '2024-02-01T16:20:00Z',
            updatedAt: '2024-02-01T16:20:00Z'
          }
        ]
        localStorage.setItem(storageKey, JSON.stringify(dummyTransfers))
        setTransfers(dummyTransfers)
      } else {
        setTransfers(Array.isArray(savedTransfers) ? savedTransfers : [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const filteredTransfers = useMemo(() => {
    let filtered = transfers

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    if (filters.fromStore) {
      filtered = filtered.filter(t => t.transferDetails.fromStore === filters.fromStore)
    }

    if (filters.toStore) {
      filtered = filtered.filter(t => t.transferDetails.toStore === filters.toStore)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.transferDetails.transferDate >= filters.dateFrom)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => t.transferDetails.transferDate <= filters.dateTo)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchLower) ||
        t.products.some(p => 
          p.productName.toLowerCase().includes(searchLower) ||
          p.productModel.toLowerCase().includes(searchLower) ||
          p.productSku.toLowerCase().includes(searchLower)
        ) ||
        t.transferDetails.remarks.toLowerCase().includes(searchLower)
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [transfers, filters])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId)
    return store ? store.name : 'Unknown'
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Transfer History Report', 14, 22)
    
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
    filteredTransfers.forEach(transfer => {
      transfer.products.forEach((product, index) => {
        tableData.push([
          transfer.id,
          getStoreName(transfer.transferDetails.fromStore),
          getStoreName(transfer.transferDetails.toStore),
          product.productName,
          product.productSku,
          product.quantity,
          `₹${product.unitPrice.toFixed(2)}`,
          `₹${product.totalPrice.toFixed(2)}`,
          transfer.transferDetails.paymentMode,
          transfer.transferDetails.transferDate,
          transfer.status
        ])
      })
    })

    // Table headers
    const headers = [
      'Transfer ID', 'From Store', 'To Store', 'Product Name', 'SKU', 
      'Quantity', 'Unit Price', 'Total', 'Payment Mode', 'Date', 'Status'
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
    doc.save('transfer-history.pdf')
  }

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Transfer ID', 'From Store', 'To Store', 'Product Name', 'Product Model', 'SKU', 
      'Quantity', 'Unit Price', 'Total', 'Payment Mode', 'Transfer Date', 'Transfer Time', 
      'Status', 'Remarks', 'Total Amount'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredTransfers.map(transfer => 
        transfer.products.map(product => [
          `"${transfer.id}"`,
          `"${getStoreName(transfer.transferDetails.fromStore)}"`,
          `"${getStoreName(transfer.transferDetails.toStore)}"`,
          `"${product.productName}"`,
          `"${product.productModel}"`,
          `"${product.productSku}"`,
          product.quantity,
          product.unitPrice.toFixed(2),
          product.totalPrice.toFixed(2),
          `"${transfer.transferDetails.paymentMode}"`,
          transfer.transferDetails.transferDate,
          transfer.transferDetails.transferTime,
          `"${transfer.status}"`,
          `"${transfer.transferDetails.remarks || 'N/A'}"`,
          transfer.totalAmount.toFixed(2)
        ].join(','))
      ).flat()
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transfer-history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateTransferInvoice = (transfer) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('TRANSFER INVOICE', 14, 22)
    
    // Transfer ID and Date
    doc.setFontSize(12)
    doc.text(`Transfer ID: ${transfer.id}`, 14, 35)
    doc.text(`Date: ${transfer.transferDetails.transferDate}`, 14, 42)
    doc.text(`Time: ${transfer.transferDetails.transferTime}`, 14, 49)
    
    // Transfer Details
    doc.setFontSize(14)
    doc.text('Transfer Details:', 14, 65)
    doc.setFontSize(10)
    doc.text(`From: ${getStoreName(transfer.transferDetails.fromStore)}`, 14, 75)
    doc.text(`To: ${getStoreName(transfer.transferDetails.toStore)}`, 14, 82)
    doc.text(`Payment Mode: ${transfer.transferDetails.paymentMode}`, 14, 89)
    doc.text(`Status: ${transfer.status}`, 14, 96)
    
    if (transfer.transferDetails.remarks) {
      doc.text(`Remarks: ${transfer.transferDetails.remarks}`, 14, 103)
    }
    
    // Products Table
    doc.setFontSize(14)
    doc.text('Products Transferred:', 14, 120)
    
    const tableData = transfer.products.map(product => [
      product.productName,
      product.productModel,
      product.productSku,
      product.quantity,
      `₹${product.unitPrice.toFixed(2)}`,
      `₹${product.totalPrice.toFixed(2)}`
    ])
    
    const headers = ['Product Name', 'Model', 'SKU', 'Quantity', 'Unit Price', 'Total']
    
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 130,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }
    })
    
    // Total Amount
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text(`Total Amount: ₹${transfer.totalAmount.toFixed(2)}`, 14, finalY)
    
    // Save the PDF
    doc.save(`transfer-invoice-${transfer.id}.pdf`)
  }

  const viewTransferDetails = (transfer) => {
    setSelectedTransfer(transfer)
    setShowModal(true)
  }

  const updateTransferStatus = (transferId, newStatus) => {
    const updatedTransfers = transfers.map(transfer => 
      transfer.id === transferId 
        ? { ...transfer, status: newStatus, updatedAt: new Date().toISOString() }
        : transfer
    )
    setTransfers(updatedTransfers)
    localStorage.setItem(storageKey, JSON.stringify(updatedTransfers))
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Transfer History</h1>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Store</label>
            <select
              value={filters.fromStore}
              onChange={(e) => setFilters({ ...filters, fromStore: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Store</label>
            <select
              value={filters.toStore}
              onChange={(e) => setFilters({ ...filters, toStore: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
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
                placeholder="Transfer ID, product, remarks..."
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pl-8"
              />
              <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">
            Transfer Records ({filteredTransfers.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b">
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">From Store</th>
                <th className="py-3 px-4">To Store</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-slate-500" colSpan={12}>
                    No transfer records found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => 
                  transfer.products.map((product, productIndex) => (
                    <tr key={`${transfer.id}-${productIndex}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{transfer.id}</td>
                      <td className="py-3 px-4">{getStoreName(transfer.transferDetails.fromStore)}</td>
                      <td className="py-3 px-4">{getStoreName(transfer.transferDetails.toStore)}</td>
                      <td className="py-3 px-4">{product.productName}</td>
                      <td className="py-3 px-4">{product.productSku}</td>
                      <td className="py-3 px-4">{product.quantity}</td>
                      <td className="py-3 px-4">₹{product.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{product.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                          {transfer.transferDetails.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{transfer.transferDetails.transferDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewTransferDetails(transfer)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateTransferInvoice(transfer)}
                            className="text-green-600 hover:text-green-800"
                            title="Generate Invoice"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>
                          <select
                            value={transfer.status}
                            onChange={(e) => updateTransferStatus(transfer.id, e.target.value)}
                            className="text-xs border border-slate-300 rounded px-1 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Details Modal */}
      {showModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transfer Details - {selectedTransfer.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Transfer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Transfer ID:</span> {selectedTransfer.id}</p>
                  <p><span className="font-medium">From:</span> {getStoreName(selectedTransfer.transferDetails.fromStore)}</p>
                  <p><span className="font-medium">To:</span> {getStoreName(selectedTransfer.transferDetails.toStore)}</p>
                  <p><span className="font-medium">Date:</span> {selectedTransfer.transferDetails.transferDate}</p>
                  <p><span className="font-medium">Time:</span> {selectedTransfer.transferDetails.transferTime}</p>
                  <p><span className="font-medium">Payment Mode:</span> {selectedTransfer.transferDetails.paymentMode}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                      {selectedTransfer.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Remarks:</span> {selectedTransfer.transferDetails.remarks || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Amount Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total Products:</span> {selectedTransfer.products.length}</p>
                  <p><span className="font-medium">Total Quantity:</span> {selectedTransfer.products.reduce((sum, product) => sum + product.quantity, 0)}</p>
                  <p className="text-lg font-semibold"><span className="font-medium">Total Amount:</span> ₹{selectedTransfer.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Products Transferred</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs uppercase border-b">
                      <th className="py-2 pr-4">Product Name</th>
                      <th className="py-2 pr-4">Model</th>
                      <th className="py-2 pr-4">SKU</th>
                      <th className="py-2 pr-4">Quantity</th>
                      <th className="py-2 pr-4">Unit Price</th>
                      <th className="py-2 pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransfer.products.map((product, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{product.productName}</td>
                        <td className="py-2 pr-4">{product.productModel}</td>
                        <td className="py-2 pr-4">{product.productSku}</td>
                        <td className="py-2 pr-4">{product.quantity}</td>
                        <td className="py-2 pr-4">₹{product.unitPrice.toFixed(2)}</td>
                        <td className="py-2 pr-4">₹{product.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransferHistory
       