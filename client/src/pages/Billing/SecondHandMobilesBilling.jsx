import React, { useState, useEffect, useRef } from 'react'
import { MdSearch, MdShoppingCart, MdAttachMoney, MdPerson, MdPhoneAndroid, MdReceipt, MdPrint } from 'react-icons/md'

const SecondHandMobilesBilling = () => {
  const [availableMobiles, setAvailableMobiles] = useState([])
  const [selectedMobiles, setSelectedMobiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [billNumber, setBillNumber] = useState('')
  const [processingSale, setProcessingSale] = useState(false)
  const invoiceRef = useRef(null)
  const now = new Date()

  // Fetch available mobiles
  const fetchAvailableMobiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('status', 'available')
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/secondhand-mobiles?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setAvailableMobiles(result.data)
      }
    } catch (error) {
      console.error('Error fetching mobiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableMobiles()
  }, [searchTerm])

  // Generate bill number
  useEffect(() => {
    const now = new Date()
    const timestamp = now.getTime().toString().slice(-6)
    setBillNumber(`SHM-${timestamp}`)
  }, [])

  // Add mobile to cart
  const addToCart = (mobile) => {
    const existingIndex = selectedMobiles.findIndex(m => m.id === mobile.id)
    if (existingIndex >= 0) {
      const updated = [...selectedMobiles]
      updated[existingIndex].quantity += 1
      setSelectedMobiles(updated)
    } else {
      setSelectedMobiles([...selectedMobiles, { ...mobile, quantity: 1 }])
    }
  }

  // Remove mobile from cart
  const removeFromCart = (mobileId) => {
    setSelectedMobiles(selectedMobiles.filter(m => m.id !== mobileId))
  }

  // Update quantity
  const updateQuantity = (mobileId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(mobileId)
      return
    }
    
    setSelectedMobiles(selectedMobiles.map(m => 
      m.id === mobileId ? { ...m, quantity } : m
    ))
  }

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = selectedMobiles.reduce((sum, mobile) => 
      sum + (mobile.sellingPrice * mobile.quantity), 0
    )
    
    const totalItems = selectedMobiles.reduce((sum, mobile) => sum + mobile.quantity, 0)
    
    return {
      subTotal,
      totalItems,
      grandTotal: subTotal
    }
  }

  const totals = calculateTotals()

  const printInvoice = () => {
    const printContent = invoiceRef.current
    if (!printContent) return
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .text-right { text-align: right; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .font-semibold { font-weight: 600; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // Process sale
  const processSale = async () => {
    if (selectedMobiles.length === 0) {
      alert('Please select at least one mobile')
      return
    }

    if (!customerInfo.name.trim()) {
      alert('Please enter customer name')
      return
    }

    try {
      setProcessingSale(true)

      // Create sale items
      const saleItems = selectedMobiles.map(mobile => ({
        name: `${mobile.brand} ${mobile.model}`,
        model: mobile.modelNumber,
        imei: mobile.imeiNumber1,
        productId: mobile.id,
        quantity: mobile.quantity,
        price: mobile.sellingPrice,
        gstPercent: 0, // Secondhand sales typically don't have GST
        discountType: 'percent',
        discountValue: 0,
        color: mobile.color,
        ram: mobile.ram,
        storage: mobile.storage,
        simSlot: mobile.simSlot,
        processor: mobile.processor,
        displaySize: mobile.displaySize,
        camera: mobile.camera,
        battery: mobile.battery,
        operatingSystem: mobile.operatingSystem,
        networkType: mobile.networkType
      }))

      // Create sale record
      const saleData = {
        billNumber,
        customerName: customerInfo.name,
        mobileNumber: customerInfo.phone,
        paymentMethod,
        items: saleItems,
        subTotal: totals.subTotal,
        totalDiscountOnItems: 0,
        billLevelDiscount: 0,
        cgst: 0,
        sgst: 0,
        grandTotal: totals.grandTotal
      }

      const saleResponse = await fetch('/api/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      const saleResult = await saleResponse.json()

      if (!saleResult.ok) {
        throw new Error(saleResult.error || 'Failed to create sale')
      }

      // Mark mobiles as sold
      for (const mobile of selectedMobiles) {
        await fetch(`/api/secondhand-mobiles/${mobile.id}/sold`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buyerName: customerInfo.name,
            buyerPhone: customerInfo.phone,
            saleDate: new Date().toISOString()
          }),
        })
      }

      // Print invoice before resetting
      try { printInvoice() } catch {}

      // Reset form
      setSelectedMobiles([])
      setCustomerInfo({ name: '', phone: '', address: '' })
      setPaymentMethod('Cash')
      
      // Generate new bill number
      const now = new Date()
      const timestamp = now.getTime().toString().slice(-6)
      setBillNumber(`SHM-${timestamp}`)

      alert('Sale completed successfully!')
      fetchAvailableMobiles()

    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error processing sale: ' + error.message)
    } finally {
      setProcessingSale(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Second Hand Mobile Billing</h1>
          <p className="text-slate-600">Sell secondhand mobiles to customers</p>
        </div>
        <div className="text-sm text-slate-700 bg-white/70 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
          Bill Number: <span className="font-semibold text-slate-900">{billNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Mobiles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Available Mobiles</h2>
              <div className="relative w-64">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search mobiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading mobiles...</p>
              </div>
            ) : availableMobiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MdPhoneAndroid className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No available mobiles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableMobiles.map((mobile) => (
                  <div key={mobile.id} className="border-2 border-slate-200 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{mobile.brand} {mobile.model}</h3>
                        <p className="text-sm text-slate-500">{mobile.modelNumber}</p>
                        {mobile.imeiNumber1 && (
                          <p className="text-xs text-slate-400">IMEI: {mobile.imeiNumber1}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        mobile.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                        mobile.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                        mobile.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {mobile.condition}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-lg font-bold text-slate-900">{formatCurrency(mobile.sellingPrice)}</div>
                      <div className="text-sm text-slate-500">Cost: {formatCurrency(mobile.purchasePrice)}</div>
                      <div className="text-sm text-green-600">Profit: {formatCurrency(mobile.profitMargin)}</div>
                    </div>

                    <div className="text-xs text-slate-500 mb-3">
                      <div>Seller: {mobile.sellerName}</div>
                      {mobile.color && <div>Color: {mobile.color}</div>}
                      {mobile.ram && <div>RAM: {mobile.ram}</div>}
                      {mobile.storage && <div>Storage: {mobile.storage}</div>}
                    </div>

                    <button
                      onClick={() => addToCart(mobile)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <MdShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart and Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">Cart ({selectedMobiles.length})</h2>
            
            {selectedMobiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MdShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedMobiles.map((mobile) => (
                  <div key={mobile.id} className="border-2 border-slate-200 rounded-2xl p-3">
                    <div className="flex justify-between items-start mb-2">
    <div>
                        <h3 className="font-semibold text-slate-900">{mobile.brand} {mobile.model}</h3>
                        <p className="text-sm text-slate-500">{mobile.modelNumber}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(mobile.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(mobile.id, mobile.quantity - 1)}
                          className="w-7 h-7 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{mobile.quantity}</span>
                        <button
                          onClick={() => updateQuantity(mobile.id, mobile.quantity + 1)}
                          className="w-7 h-7 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{formatCurrency(mobile.sellingPrice * mobile.quantity)}</div>
                        <div className="text-sm text-slate-500">{formatCurrency(mobile.sellingPrice)} each</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(totals.subTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Items:</span>
                    <span className="font-semibold text-slate-900">{totals.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-slate-900">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>

                {/* Process Sale Button */}
                <button
                  onClick={processSale}
                  disabled={processingSale || selectedMobiles.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {processingSale ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdReceipt className="w-5 h-5" />
                      Process Sale
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={printInvoice}
                  className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <MdPrint className="w-5 h-5" /> Print Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div ref={invoiceRef} className="hidden print:block p-6">
        <div className="text-center">
          <div className="text-xl font-semibold">Second Hand Mobile Invoice</div>
        </div>
        <div className="mt-2 text-sm">Bill No: {billNumber} • {now.toLocaleString()}</div>
        <div className="mt-2 text-sm">Customer: {customerInfo.name || '-'} • {customerInfo.phone || '-'}</div>
        {customerInfo.address ? <div className="mt-1 text-sm">Address: {customerInfo.address}</div> : null}
        <table className="mt-4 w-full text-sm border-t border-b border-slate-300">
          <thead>
            <tr className="text-left">
              <th className="py-1 pr-2">Item</th>
              <th className="py-1 pr-2">Qty</th>
              <th className="py-1 pr-2">GST</th>
              <th className="py-1 pr-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {selectedMobiles.map((m, idx) => {
              const qty = Number(m.quantity) || 0
              const price = Number(m.sellingPrice) || 0
              const gross = qty * price
              const gst = 0 // secondhand: GST typically 0
              const total = gross + gst
              return (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="py-1 pr-2">
                    <div>
                      <div className="font-medium">{m.brand} {m.model}</div>
                      {m.modelNumber && <div className="text-xs text-slate-600">Model: {m.modelNumber}</div>}
                      {m.imeiNumber1 && <div className="text-xs text-slate-600">IMEI: {m.imeiNumber1}</div>}
                    </div>
                  </td>
                  <td className="py-1 pr-2">{qty}</td>
                  <td className="py-1 pr-2">{gst.toFixed(2)}</td>
                  <td className="py-1 pr-2">{total.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-2 text-right text-sm">
          <div>Subtotal: {totals.subTotal.toFixed(2)}</div>
          <div>GST Total: {0..toFixed ? (0).toFixed(2) : '0.00'}</div>
          <div className="font-semibold text-base">Grand Total: {totals.grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default SecondHandMobilesBilling
