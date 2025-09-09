import React, { useState, useEffect, useMemo } from 'react'
import { FiFilter, FiDownload, FiEye, FiSearch, FiPrinter } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Resolve API base: in Electron packaged app, backend is on localhost:5000; in dev use Vite proxy with empty base
const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

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

  const loadData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/transfers`)
      const data = await res.json()
      setTransfers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading transfers:', error)
      setTransfers([])
    }
  }

  const filteredTransfers = useMemo(() => {
    let filtered = transfers

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    if (filters.fromStore) {
      filtered = filtered.filter(t => fromOf(t) === filters.fromStore)
    }

    if (filters.toStore) {
      filtered = filtered.filter(t => toOf(t) === filters.toStore)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => dateOf(t) >= filters.dateFrom)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => dateOf(t) <= filters.dateTo)
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
        remarksOf(t).toLowerCase().includes(searchLower)
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

  const getStoreName = (storeText) => storeText || 'Unknown'

  // Support both shapes: old (transferDetails.*) and backend (root-level fields)
  const fromOf = (t) => t?.transferDetails?.fromStore ?? t?.fromStore ?? ''
  const toOf = (t) => t?.transferDetails?.toStore ?? t?.toStore ?? ''
  const dateOf = (t) => t?.transferDetails?.transferDate ?? t?.transferDate ?? ''
  const timeOf = (t) => t?.transferDetails?.transferTime ?? t?.transferTime ?? ''
  const payModeOf = (t) => t?.transferDetails?.paymentMode ?? t?.paymentMode ?? ''
  const remarksOf = (t) => t?.transferDetails?.remarks ?? t?.remarks ?? ''

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
          getStoreName(fromOf(transfer)),
          getStoreName(toOf(transfer)),
          product.productName,
          product.productSku,
          product.quantity,
          `₹${product.unitPrice.toFixed(2)}`,
          `₹${product.totalPrice.toFixed(2)}`,
          payModeOf(transfer),
          dateOf(transfer),
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
          `"${getStoreName(fromOf(transfer))}"`,
          `"${getStoreName(toOf(transfer))}"`,
          `"${product.productName}"`,
          `"${product.productModel}"`,
          `"${product.productSku}"`,
          product.quantity,
          product.unitPrice.toFixed(2),
          product.totalPrice.toFixed(2),
          `"${payModeOf(transfer)}"`,
          dateOf(transfer),
          timeOf(transfer),
          `"${transfer.status}"`,
          `"${remarksOf(transfer) || 'N/A'}"`,
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
    doc.text(`Date: ${dateOf(transfer)}`, 14, 42)
    doc.text(`Time: ${timeOf(transfer)}`, 14, 49)
    
    // Transfer Details
    doc.setFontSize(14)
    doc.text('Transfer Details:', 14, 65)
    doc.setFontSize(10)
    doc.text(`From: ${getStoreName(fromOf(transfer))}`, 14, 75)
    doc.text(`To: ${getStoreName(toOf(transfer))}`, 14, 82)
    doc.text(`Payment Mode: ${payModeOf(transfer)}`, 14, 89)
    doc.text(`Status: ${transfer.status}`, 14, 96)
    
    if (remarksOf(transfer)) {
      doc.text(`Remarks: ${remarksOf(transfer)}`, 14, 103)
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

  const updateTransferStatus = async (transferId, newStatus) => {
    try {
      const res = await fetch(`${apiBase}/api/transfers/${transferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      await loadData()
    } catch (err) {
      console.error('Status update failed:', err)
      alert('Failed to update status')
    }
  }

  const editTransfer = async (transfer) => {
    const current = transfer?.status || ''
    const next = window.prompt('Update status to (Completed / Pending / Cancelled):', current)
    if (!next) return
    const normalized = next.trim()
    if (!['Completed','Pending','Cancelled'].includes(normalized)) {
      alert('Invalid status')
      return
    }
    await updateTransferStatus(transfer.id, normalized)
  }

  const deleteTransfer = async (transfer) => {
    if (!window.confirm(`Delete transfer ${transfer.id}? This cannot be undone.`)) return
    try {
      const res = await fetch(`${apiBase}/api/transfers/${transfer.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete transfer')
    }
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
                      <td className="py-3 px-4">{getStoreName(fromOf(transfer))}</td>
                      <td className="py-3 px-4">{getStoreName(toOf(transfer))}</td>
                      <td className="py-3 px-4">{product.productName}</td>
                      <td className="py-3 px-4">{product.productSku}</td>
                      <td className="py-3 px-4">{product.quantity}</td>
                      <td className="py-3 px-4">₹{product.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{product.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                          {payModeOf(transfer)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{dateOf(transfer)}</td>
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
                          <button
                            onClick={() => editTransfer(transfer)}
                            className="text-slate-700 hover:text-slate-900"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransfer(transfer)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            Delete
                          </button>
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
                  <p><span className="font-medium">From:</span> {getStoreName(fromOf(selectedTransfer))}</p>
                  <p><span className="font-medium">To:</span> {getStoreName(toOf(selectedTransfer))}</p>
                  <p><span className="font-medium">Date:</span> {dateOf(selectedTransfer)}</p>
                  <p><span className="font-medium">Time:</span> {timeOf(selectedTransfer)}</p>
                  <p><span className="font-medium">Payment Mode:</span> {payModeOf(selectedTransfer)}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTransfer.status)}`}>
                      {selectedTransfer.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Remarks:</span> {remarksOf(selectedTransfer) || 'N/A'}</p>
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
       