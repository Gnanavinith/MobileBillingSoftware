import React, { useState, useEffect, useMemo } from 'react'
import { FiFilter, FiDownload, FiEye, FiSearch } from 'react-icons/fi'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const apiBase = ''

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([])
  const [dealers, setDealers] = useState([])
  const [inventory, setInventory] = useState([])
  const [sales, setSales] = useState([])
  const [filters, setFilters] = useState({
    dealerId: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    search: ''
  })
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`${apiBase}/api/purchases`),
          fetch(`${apiBase}/api/dealers`),
        ])
        const p = await pRes.json()
        const d = await dRes.json()
        setPurchases(Array.isArray(p) ? p : [])
        setDealers(Array.isArray(d) ? d : [])
      } catch (e) {
        console.error('Failed to load purchases/dealers', e)
        setPurchases([])
        setDealers([])
      }
    }
    load()
  }, [])

  const calculateRemainingStock = () => {
    return '—'
  }

  const filteredPurchases = useMemo(() => {
    let filtered = purchases

    if (filters.dealerId) {
      filtered = filtered.filter(p => p.dealerId === filters.dealerId)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(p => p.purchaseDate >= filters.dateFrom)
    }

    if (filters.dateTo) {
      filtered = filtered.filter(p => p.purchaseDate <= filters.dateTo)
    }

    if (filters.category) {
      filtered = filtered.filter(p => 
        p.items.some(item => item.category === filters.category)
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.invoiceNumber.toLowerCase().includes(searchLower) ||
        p.items.some(item => 
          item.productName.toLowerCase().includes(searchLower) ||
          item.model.toLowerCase().includes(searchLower)
        )
      )
    }

    return filtered.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
  }, [purchases, filters])

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Purchase History Report', 14, 22)
    
    // Date range
    doc.setFontSize(10)
    const dateRange = filters.dateFrom && filters.dateTo 
      ? `${filters.dateFrom} to ${filters.dateTo}`
      : 'All Time'
    doc.text(`Date Range: ${dateRange}`, 14, 30)
    
    // Dealer filter
    if (filters.dealerId) {
      const dealer = dealers.find(d => d.id === filters.dealerId)
      doc.text(`Dealer: ${dealer ? dealer.name : 'Unknown'}`, 14, 35)
    }

    // Table data
    const tableData = []
    filteredPurchases.forEach(purchase => {
      const dealer = dealers.find(d => d.id === purchase.dealerId)
      purchase.items.forEach(item => {
        tableData.push([
          dealer ? dealer.name : 'Unknown',
          item.productName,
          item.model,
          item.category,
          item.quantity,
          calculateRemainingStock(item.productName, item.model),
          `₹${item.purchasePrice.toFixed(2)}`,
          `₹${item.sellingPrice.toFixed(2)}`,
          `₹${item.totalPrice.toFixed(2)}`,
          purchase.paymentMode,
          purchase.purchaseDate,
          purchase.invoiceNumber
        ])
      })
    })

    // Table headers
    const headers = [
      'Dealer', 'Product', 'Model', 'Category', 'Qty Purchased', 
      'Remaining Stock', 'Purchase Price', 'Selling Price', 'Total', 
      'Payment Mode', 'Date', 'Invoice'
    ]

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }
    })

    // Save the PDF
    doc.save('purchase-history.pdf')
  }

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Dealer', 'Product', 'Model', 'Category', 'Qty Purchased', 
      'Remaining Stock', 'Purchase Price', 'Selling Price', 'Total', 
      'Payment Mode', 'Date', 'Invoice', 'GST Applied', 'GST Amount', 'Grand Total'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredPurchases.map(purchase => {
        const dealer = dealers.find(d => d.id === purchase.dealerId)
        return purchase.items.map(item => [
          `"${dealer ? dealer.name : 'Unknown'}"`,
          `"${item.productName}"`,
          `"${item.model}"`,
          `"${item.category}"`,
          item.quantity,
          calculateRemainingStock(item.productName, item.model),
          item.purchasePrice.toFixed(2),
          item.sellingPrice.toFixed(2),
          item.totalPrice.toFixed(2),
          `"${purchase.paymentMode}"`,
          purchase.purchaseDate,
          `"${purchase.invoiceNumber}"`,
          purchase.gstEnabled ? 'Yes' : 'No',
          purchase.gstAmount.toFixed(2),
          purchase.grandTotal.toFixed(2)
        ].join(','))
      }).flat()
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase-history.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadItemDetails = (purchase, item) => {
    const dealer = dealers.find(d => d.id === purchase.dealerId)
    const dealerName = dealer ? dealer.name : 'Unknown'
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Purchase Item Report', 14, 18)
      doc.setFontSize(10)
      doc.text(`Dealer: ${dealerName}`, 14, 26)
      doc.text(`Date: ${purchase.purchaseDate}`, 14, 31)
      doc.text(`Invoice: ${purchase.invoiceNumber}`, 14, 36)

      const body = [
        ['Product', item.productName],
        ['Model', item.model],
        ['Category', item.category],
        ['Quantity', String(item.quantity)],
        ['Purchase Price', `₹${item.purchasePrice.toFixed(2)}`],
        ['Selling Price', `₹${item.sellingPrice.toFixed(2)}`],
        ['Line Total', `₹${item.totalPrice.toFixed(2)}`],
        ['Payment Mode', purchase.paymentMode],
      ]
      autoTable(doc, {
        startY: 42,
        head: [['Field', 'Value']],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
      })

      const safe = (s) => String(s).replace(/[^a-z0-9-_]+/gi, '_')
      const filename = `${safe(dealerName)}_${safe(purchase.purchaseDate)}.pdf`
      try {
        doc.save(filename)
      } catch {
        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      alert('Failed to generate PDF: ' + (e?.message || e))
      console.error(e)
    }
  }

  const viewPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase)
    setShowModal(true)
  }

  const getDealerName = (dealerId) => {
    const dealer = dealers.find(d => d.id === dealerId)
    return dealer ? dealer.name : 'Unknown'
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Purchase History</h1>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Dealer</label>
            <select
              value={filters.dealerId}
              onChange={(e) => setFilters({ ...filters, dealerId: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Dealers</option>
              {dealers.map(dealer => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            >
              <option value="">All Categories</option>
              <option value="Mobile">Mobile</option>
              <option value="Accessories">Accessories</option>
              <option value="Service Item">Service Item</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Product, model, invoice..."
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pl-8"
              />
              <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">
            Purchase Records ({filteredPurchases.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b">
                <th className="py-3 px-4">Dealer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Qty Purchased</th>
                <th className="py-3 px-4">Remaining Stock</th>
                <th className="py-3 px-4">Purchase Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-slate-500" colSpan={13}>
                    No purchases found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(purchase => 
                  purchase.items.map((item, itemIndex) => (
                    <tr key={`${purchase.id}-${itemIndex}`} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">{getDealerName(purchase.dealerId)}</td>
                      <td className="py-3 px-4">{item.productName}</td>
                      <td className="py-3 px-4">{item.model}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          calculateRemainingStock(item.productName, item.model) > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {calculateRemainingStock(item.productName, item.model)}
                        </span>
                      </td>
                      <td className="py-3 px-4">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{item.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{item.totalPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {purchase.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">{purchase.purchaseDate}</td>
                      <td className="py-3 px-4">{purchase.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewPurchaseDetails(purchase)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadItemDetails(purchase, item)}
                            className="text-green-600 hover:text-green-800"
                            title="Download Item PDF"
                          >
                            <FiDownload className="w-4 h-4" />
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

      {/* Purchase Details Modal */}
      {showModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Purchase Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Purchase Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Invoice:</span> {selectedPurchase.invoiceNumber}</p>
                  <p><span className="font-medium">Date:</span> {selectedPurchase.purchaseDate}</p>
                  <p><span className="font-medium">Dealer:</span> {getDealerName(selectedPurchase.dealerId)}</p>
                  <p><span className="font-medium">Payment Mode:</span> {selectedPurchase.paymentMode}</p>
                  <p><span className="font-medium">GST Applied:</span> {selectedPurchase.gstEnabled ? 'Yes' : 'No'}</p>
                  {selectedPurchase.gstEnabled && (
                    <p><span className="font-medium">GST %:</span> {selectedPurchase.gstPercentage}%</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Amount Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Subtotal:</span> ₹{selectedPurchase.totalAmount.toFixed(2)}</p>
                  {selectedPurchase.gstEnabled && (
                    <p><span className="font-medium">GST Amount:</span> ₹{selectedPurchase.gstAmount.toFixed(2)}</p>
                  )}
                  <p className="text-lg font-semibold"><span className="font-medium">Grand Total:</span> ₹{selectedPurchase.grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Products Purchased</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs uppercase border-b">
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Product</th>
                      <th className="py-2 pr-4">Model</th>
                      <th className="py-2 pr-4">Quantity</th>
                      <th className="py-2 pr-4">Purchase Price</th>
                      <th className="py-2 pr-4">Selling Price</th>
                      <th className="py-2 pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{item.category}</td>
                        <td className="py-2 pr-4">{item.productName}</td>
                        <td className="py-2 pr-4">{item.model}</td>
                        <td className="py-2 pr-4">{item.quantity}</td>
                        <td className="py-2 pr-4">₹{item.purchasePrice.toFixed(2)}</td>
                        <td className="py-2 pr-4">₹{item.sellingPrice.toFixed(2)}</td>
                        <td className="py-2 pr-4">₹{item.totalPrice.toFixed(2)}</td>
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

export default PurchaseHistory