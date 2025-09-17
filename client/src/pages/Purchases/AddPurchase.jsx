import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'

const apiBase = ''
const generateInvoiceNumber = () => {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const ms = String(now.getTime()).slice(-5)
  return `INV-${yy}${mm}${dd}-${ms}`
}

const AddPurchase = () => {
  const [dealers, setDealers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    dealerId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: generateInvoiceNumber(),
    paymentMode: 'Cash',
    gstEnabled: false,
    gstPercentage: 18,
    totalAmount: 0,
    gstAmount: 0,
    grandTotal: 0,
    items: []
  })

  const [newItem, setNewItem] = useState({
    category: 'Mobile',
    productName: '',
    model: '',
    productId: '',
    brand: '',
    color: '',
    ram: '',
    storage: '',
    imeiNumber1: '',
    imeiNumber2: '',
    simSlot: '',
    processor: '',
    displaySize: '',
    camera: '',
    battery: '',
    operatingSystem: '',
    networkType: '',
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0,
    totalPrice: 0
  })

  const genAccessoryId = (name) => {
    const prefix = 'ACC'
    const short = (name || 'XXX').toString().trim().substring(0,3).toUpperCase() || 'XXX'
    const unique = Date.now().toString().slice(-4)
    return `${prefix}-${short}-${unique}`
  }
  const genMobileId = (brand, model) => {
    const prefix = 'MOB'
    const brandCode = (brand || 'XXX').toString().trim().substring(0,3).toUpperCase() || 'XXX'
    const modelCode = (model || '000').toString().trim().substring(0,3).toUpperCase() || '000'
    const unique = Date.now().toString().slice(-4)
    return `${prefix}-${brandCode}-${modelCode}-${unique}`
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/dealers`)
        const data = await res.json()
        setDealers(Array.isArray(data) ? data : [])
      } catch {
        setDealers([])
      }
    }
    load()
  }, [])

  const calculateItemTotal = (item) => {
    return item.quantity * item.purchasePrice
  }

  const calculateTotals = (items, gstEnabled, gstPercentage) => {
    const totalAmount = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    const gstAmount = gstEnabled ? (totalAmount * (parseFloat(gstPercentage) || 0)) / 100 : 0
    const grandTotal = totalAmount + gstAmount

    setForm(prev => ({
      ...prev,
      totalAmount,
      gstAmount,
      grandTotal
    }))
  }

  const addItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.purchasePrice <= 0) {
      alert('Please fill all required fields for the product')
      return
    }
    
    // For accessories, model is required. For mobiles, brand is required.
    if (newItem.category === 'Accessories' && !newItem.model) {
      alert('Please fill the Model/Variant field for accessories')
      return
    }
    
    if (newItem.category === 'Mobile' && !newItem.brand) {
      alert('Please fill the Brand field for mobiles')
      return
    }

    const itemTotal = calculateItemTotal(newItem)
    const item = {
      ...newItem,
      totalPrice: itemTotal
    }

    const updatedItems = [...form.items, item]
    setForm(prev => ({ ...prev, items: updatedItems }))
    calculateTotals(updatedItems, form.gstEnabled, form.gstPercentage)

    // Reset new item form
    setNewItem({
      category: 'Mobile',
      productName: '',
      model: '',
      productId: '',
      brand: '',
      color: '',
      ram: '',
      storage: '',
      imeiNumber1: '',
      imeiNumber2: '',
      simSlot: '',
      processor: '',
      displaySize: '',
      camera: '',
      battery: '',
      operatingSystem: '',
      networkType: '',
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      totalPrice: 0
    })
  }

  const removeItem = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, items: updatedItems }))
    calculateTotals(updatedItems, form.gstEnabled, form.gstPercentage)
  }

  useEffect(() => {
    // Recalculate totals when GST toggle or percentage changes
    calculateTotals(form.items, form.gstEnabled, form.gstPercentage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.gstEnabled, form.gstPercentage])


  const savePurchase = async (mode = 'pending') => {
    if (!form.dealerId) {
      alert('Please select a dealer')
      return
    }

    if (form.items.length === 0) {
      alert('Please add at least one product')
      return
    }

    try {
      const res = await fetch(`${apiBase}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg.error || 'Failed to save purchase')
      }
      const saved = await res.json()
      if (mode === 'received') {
        try {
          // Mark as received to generate Product IDs and move to stock
          const rx = await fetch(`${apiBase}/api/purchases/${encodeURIComponent(saved.id)}/receive`, { method: 'POST' })
          if (!rx.ok) {
            const msg = await rx.json().catch(()=>({}))
            throw new Error(msg?.error || 'Failed to mark as received')
          }
          alert('Purchase saved and marked Received. Product IDs generated.')
        } catch (e) {
          alert('Saved as Pending (failed to mark Received): ' + (e?.message || e))
        }
      } else {
        alert('Purchase saved as Pending.')
      }
      setForm({
        dealerId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: generateInvoiceNumber(),
        paymentMode: 'Cash',
        gstEnabled: false,
        gstPercentage: 18,
        totalAmount: 0,
        gstAmount: 0,
        grandTotal: 0,
        items: []
      })
    } catch (error) {
      alert('Error saving purchase: ' + error.message)
    }
  }

  const updateInventory = () => {}

  const selectedDealer = dealers.find(d => d.id === form.dealerId)

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Details */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Purchase Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dealer *</label>
                <select
                  value={form.dealerId}
                  onChange={(e) => setForm({ ...form, dealerId: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                  required
                >
                  <option value="">Select Dealer</option>
                  {dealers.map(dealer => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name} ({dealer.id})
                    </option>
                  ))}
                </select>
                {selectedDealer && (
                  <div className="mt-2 text-sm text-slate-700">
                    <p>Phone: {selectedDealer.phone}</p>
                    <p>GST: {selectedDealer.gst || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date *</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number (auto)</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.gstEnabled}
                    onChange={(e) => setForm({ ...form, gstEnabled: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Apply GST</span>
                </label>
                {form.gstEnabled && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">GST Percentage</label>
                    <input
                      type="number"
                      value={form.gstPercentage}
                      onChange={(e) => setForm({ ...form, gstPercentage: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Entry */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Product Entry</h2>
            
            {/* Add Product Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5"
                >
                  <option value="Mobile">Mobile</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Service Item">Service Item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newItem.productName}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewItem(prev => {
                      const next = { ...prev, productName: val }
                      const isEmpty = !val || !val.trim()
                      // Only auto-generate Product ID; do not auto-fill model/variant
                      if (prev.category === 'Accessories') {
                        next.productId = isEmpty ? '' : genAccessoryId(val)
                      } else if (prev.category === 'Mobile') {
                        next.productId = isEmpty ? '' : genMobileId(prev.brand, prev.model)
                      }
                      return next
                    })
                  }}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5"
                  placeholder="e.g., Ear Buds"
                />
              </div>

              {newItem.category === 'Mobile' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    value={newItem.brand}
                    onChange={(e) => {
                      const val = e.target.value
                      setNewItem(prev => {
                        const next = { ...prev, brand: val }
                        // Auto-generate Product ID when brand or model changes
                        next.productId = genMobileId(val, prev.model)
                        return next
                      })
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5"
                    placeholder="e.g., Vivo"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {newItem.category === 'Accessories' ? 'Product ID (unique) *' : 'Model/Variant'}
                </label>
                <input
                  type="text"
                  value={newItem.model}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewItem(prev => {
                      const next = { ...prev, model: val }
                      // Auto-generate Product ID when model changes for mobiles
                      if (prev.category === 'Mobile') {
                        next.productId = genMobileId(prev.brand, val)
                      }
                      return next
                    })
                  }}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5"
                  placeholder={newItem.category === 'Accessories' ? 'e.g., ACC-EAR-5632' : 'e.g., Y21 (optional)'}
                />
              </div>

              {/* Product ID for both categories */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product ID</label>
                <input
                  type="text"
                  value={newItem.productId}
                  onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                  className="w-full rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all px-4 py-2.5"
                  placeholder="Auto-generated; you can edit"
                />
              </div>

              {newItem.category === 'Mobile' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={newItem.color}
                      onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all px-4 py-2.5"
                      placeholder="e.g., Black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                    <input
                      type="text"
                      value={newItem.ram}
                      onChange={(e) => setNewItem({ ...newItem, ram: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 8GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Storage</label>
                    <input
                      type="text"
                      value={newItem.storage}
                      onChange={(e) => setNewItem({ ...newItem, storage: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 128GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 1</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newItem.imeiNumber1}
                      onChange={(e) => setNewItem({ ...newItem, imeiNumber1: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all px-4 py-2.5"
                      placeholder="Scan/enter IMEI 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (optional)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newItem.imeiNumber2}
                      onChange={(e) => setNewItem({ ...newItem, imeiNumber2: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all px-4 py-2.5"
                      placeholder="Scan/enter IMEI 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SIM Slot</label>
                    <input
                      type="text"
                      value={newItem.simSlot}
                      onChange={(e) => setNewItem({ ...newItem, simSlot: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all px-4 py-2.5"
                      placeholder="e.g., Dual SIM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Processor</label>
                    <input
                      type="text"
                      value={newItem.processor}
                      onChange={(e) => setNewItem({ ...newItem, processor: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all px-4 py-2.5"
                      placeholder="e.g., Snapdragon 888"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Size</label>
                    <input
                      type="text"
                      value={newItem.displaySize}
                      onChange={(e) => setNewItem({ ...newItem, displaySize: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 6.7 inches"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Camera</label>
                    <input
                      type="text"
                      value={newItem.camera}
                      onChange={(e) => setNewItem({ ...newItem, camera: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 108MP + 12MP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Battery</label>
                    <input
                      type="text"
                      value={newItem.battery}
                      onChange={(e) => setNewItem({ ...newItem, battery: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 5000mAh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Operating System</label>
                    <input
                      type="text"
                      value={newItem.operatingSystem}
                      onChange={(e) => setNewItem({ ...newItem, operatingSystem: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all px-4 py-2.5"
                      placeholder="e.g., Android 12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Network Type</label>
                    <input
                      type="text"
                      value={newItem.networkType}
                      onChange={(e) => setNewItem({ ...newItem, networkType: e.target.value })}
                      className="w-full rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all px-4 py-2.5"
                      placeholder="e.g., 5G, 4G LTE"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={newItem.quantity || ''}
                  onChange={(e) => {
                    const digits = String(e.target.value || '').replace(/\D/g, '')
                    const cleaned = digits.replace(/^0+/, '')
                    const next = cleaned ? parseInt(cleaned, 10) : 0
                    setNewItem({ ...newItem, quantity: next })
                  }}
                  className="w-full rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all px-4 py-2.5"
                  min="1"
                  placeholder="e.g., 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newItem.purchasePrice || ''}
                  onChange={(e) => {
                    const cleaned = String(e.target.value || '').replace(/^0+(?=\d)/, '')
                    setNewItem({ ...newItem, purchasePrice: parseFloat(cleaned) || 0 })
                  }}
                  className="w-full rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newItem.sellingPrice || ''}
                  onChange={(e) => {
                    const cleaned = String(e.target.value || '').replace(/^0+(?=\d)/, '')
                    setNewItem({ ...newItem, sellingPrice: parseFloat(cleaned) || 0 })
                  }}
                  className="w-full rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 1999.99"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product List */}
            {form.items.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-2">Added Products</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600 text-xs uppercase border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Product</th>
                        <th className="py-2 pr-4">Model</th>
                        <th className="py-2 pr-4">Qty</th>
                        <th className="py-2 pr-4">Purchase Price</th>
                        <th className="py-2 pr-4">Selling Price</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 pr-4">{item.category}</td>
                          <td className="py-2 pr-4">{item.productName}</td>
                          <td className="py-2 pr-4">{item.model}</td>
                          <td className="py-2 pr-4">{item.quantity}</td>
                          <td className="py-2 pr-4">₹{item.purchasePrice.toFixed(2)}</td>
                          <td className="py-2 pr-4">₹{item.sellingPrice.toFixed(2)}</td>
                          <td className="py-2 pr-4">₹{item.totalPrice.toFixed(2)}</td>
                          <td className="py-2 pr-2">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Total Summary */}
            {form.items.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{form.totalAmount.toFixed(2)}</span>
                </div>
                {form.gstEnabled && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-blue-600">GST ({form.gstPercentage}%):</span>
                    <span className="font-bold text-blue-700">₹{form.gstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span className="text-indigo-800 font-bold">Grand Total:</span>
                  <span className="text-2xl font-extrabold text-indigo-900">₹{form.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Save Buttons */}
            <div className="mt-6 flex justify-end">
              <div className="flex gap-3">
                <button
                  onClick={() => savePurchase('pending')}
                  disabled={form.items.length === 0 || !form.dealerId}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save as Pending</span>
                </button>
              <button
                  onClick={() => savePurchase('received')}
                disabled={form.items.length === 0 || !form.dealerId}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                  <span>Save & Receive</span>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPurchase
