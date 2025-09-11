import React, { useState, useEffect } from 'react'
import { FiSave, FiPlus, FiTrash2, FiTruck, FiPackage } from 'react-icons/fi'

// Resolve API base: in Electron packaged app, backend is on localhost:5000; in dev use Vite proxy with empty base
const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''
const inventoryStorageKey = 'mobilebill:inventory'

const NewTransfer = () => {
  const [inventory, setInventory] = useState([])
  const [form, setForm] = useState({
    id: '',
    transferDetails: {
      fromStore: 'STORE-001',
      toStore: '',
      transferDate: new Date().toISOString().split('T')[0],
      transferTime: new Date().toTimeString().slice(0, 5),
      paymentMode: 'Cash',
      remarks: ''
    },
    products: [],
    totalAmount: 0
  })

  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  })
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

  // Free-text stores/persons

  useEffect(() => {
    // no local dummy; rely on backend lookup per product
  }, [])

  const lookupProduct = async () => {
    setLookupError('')
    const id = String(newProduct.productId || '').trim()
    if (!id) {
      setLookupError('Enter Product ID / IMEI to search')
      return
    }
    setLookupLoading(true)
    try {
      // Try accessories by productId
      const accRes = await fetch(`${apiBase}/api/accessories?productId=${encodeURIComponent(id)}`)
      const acc = await accRes.json()
      if (Array.isArray(acc) && acc.length > 0) {
        const a = acc[0]
        setNewProduct({
          ...newProduct,
          productId: a.productId,
          quantity: 1,
          unitPrice: a.unitPrice || 0,
          totalPrice: 0,
        })
        // stash in inventory cache for display if needed
        setInventory([{ id: a.productId, productName: a.productName, model: '', sku: a.productId, stock: a.quantity }])
        return
      }
      // Fallback: fetch mobiles and filter by IMEI
      const mobRes = await fetch(`${apiBase}/api/mobiles`)
      const mobiles = await mobRes.json()
      const m = Array.isArray(mobiles) ? mobiles.find(mo => mo.imeiNumber1 === id || mo.imeiNumber2 === id) : null
      if (m) {
        setNewProduct({
          ...newProduct,
          productId: id,
          quantity: 1,
          unitPrice: m.pricePerProduct || 0,
          totalPrice: 0,
        })
        setInventory([{ 
          id, 
          productName: m.mobileName, 
          model: m.modelNumber, 
          sku: id, 
          stock: m.totalQuantity,
          // Mobile features
          color: m.color || '',
          ram: m.ram || '',
          storage: m.storage || '',
          simSlot: m.simSlot || '',
          processor: m.processor || '',
          displaySize: m.displaySize || '',
          camera: m.camera || '',
          battery: m.battery || '',
          operatingSystem: m.operatingSystem || '',
          networkType: m.networkType || ''
        }])
        return
      }
      setLookupError('No product found for given ID')
    } catch (e) {
      setLookupError('Lookup failed')
    } finally {
      setLookupLoading(false)
    }
  }

  const calculateProductTotal = (quantity, unitPrice) => {
    return quantity * unitPrice
  }

  const calculateTotalAmount = (products) => {
    return products.reduce((sum, product) => sum + product.totalPrice, 0)
  }

  const addProduct = () => {
    if (!newProduct.productId || newProduct.quantity <= 0 || newProduct.unitPrice <= 0) {
      alert('Please fill all required fields for the product')
      return
    }

    const selectedProduct = inventory.find(item => item.id === newProduct.productId)
    // If not found in inventory (e.g., lookup failed), still allow manual add with entered values
    // Product details will rely on manual fields; set fallback display values
    const fallbackProduct = !selectedProduct ? { productName: newProduct.productId || 'Unknown', model: '', sku: newProduct.productId, stock: 0 } : selectedProduct

    // Check if product already exists in transfer
    const existingProductIndex = form.products.findIndex(p => p.productId === newProduct.productId)
    
    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const updatedProducts = [...form.products]
      updatedProducts[existingProductIndex].quantity += newProduct.quantity
      updatedProducts[existingProductIndex].totalPrice = calculateProductTotal(
        updatedProducts[existingProductIndex].quantity, 
        updatedProducts[existingProductIndex].unitPrice
      )
      setForm(prev => ({
        ...prev,
        products: updatedProducts,
        totalAmount: calculateTotalAmount(updatedProducts)
      }))
    } else {
      // Add new product
      const product = {
        ...newProduct,
        productName: fallbackProduct.productName,
        productModel: fallbackProduct.model,
        productSku: fallbackProduct.sku,
        totalPrice: calculateProductTotal(newProduct.quantity, newProduct.unitPrice),
        // Mobile features
        color: fallbackProduct.color || '',
        ram: fallbackProduct.ram || '',
        storage: fallbackProduct.storage || '',
        simSlot: fallbackProduct.simSlot || '',
        processor: fallbackProduct.processor || '',
        displaySize: fallbackProduct.displaySize || '',
        camera: fallbackProduct.camera || '',
        battery: fallbackProduct.battery || '',
        operatingSystem: fallbackProduct.operatingSystem || '',
        networkType: fallbackProduct.networkType || ''
      }

      const updatedProducts = [...form.products, product]
      setForm(prev => ({
        ...prev,
        products: updatedProducts,
        totalAmount: calculateTotalAmount(updatedProducts)
      }))
    }

    // Reset new product form
    setNewProduct({
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    })
  }

  const removeProduct = (index) => {
    const updatedProducts = form.products.filter((_, i) => i !== index)
    setForm(prev => ({
      ...prev,
      products: updatedProducts,
      totalAmount: calculateTotalAmount(updatedProducts)
    }))
  }

  const updateProductQuantity = (index, quantity) => {
    const updatedProducts = [...form.products]
    updatedProducts[index].quantity = quantity
    updatedProducts[index].totalPrice = calculateProductTotal(quantity, updatedProducts[index].unitPrice)
    
    setForm(prev => ({
      ...prev,
      products: updatedProducts,
      totalAmount: calculateTotalAmount(updatedProducts)
    }))
  }

  const updateProductPrice = (index, unitPrice) => {
    const updatedProducts = [...form.products]
    updatedProducts[index].unitPrice = unitPrice
    updatedProducts[index].totalPrice = calculateProductTotal(updatedProducts[index].quantity, unitPrice)
    
    setForm(prev => ({
      ...prev,
      products: updatedProducts,
      totalAmount: calculateTotalAmount(updatedProducts)
    }))
  }

  const saveTransfer = async () => {
    if (!String(form.transferDetails.fromStore || '').trim() || !String(form.transferDetails.toStore || '').trim()) {
      alert('Please select both From and To stores/persons')
      return
    }

    if (form.products.length === 0) {
      alert('Please add at least one product to transfer')
      return
    }

    if (String(form.transferDetails.fromStore).trim() === String(form.transferDetails.toStore).trim()) {
      alert('From and To stores/persons cannot be the same')
      return
    }

    try {
      const payload = {
        fromStore: String(form.transferDetails.fromStore).trim(),
        toStore: String(form.transferDetails.toStore).trim(),
        transferDate: form.transferDetails.transferDate,
        transferTime: form.transferDetails.transferTime,
        paymentMode: form.transferDetails.paymentMode,
        remarks: form.transferDetails.remarks,
        products: form.products,
      }
      const res = await fetch(`${apiBase}/api/transfers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed to save transfer')
      }
      alert('Transfer saved successfully!')
      setForm({
        id: '',
        transferDetails: {
          fromStore: 'STORE-001',
          toStore: '',
          transferDate: new Date().toISOString().split('T')[0],
          transferTime: new Date().toTimeString().slice(0, 5),
          paymentMode: 'Cash',
          remarks: ''
        },
        products: [],
        totalAmount: 0
      })
    } catch (error) {
      alert('Error saving transfer: ' + error.message)
    }
  }

  const updateInventory = (products, fromStore, toStore) => {
    try {
      const existingInventory = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      
      products.forEach(product => {
        const productIndex = existingInventory.findIndex(item => item.id === product.productId)
        if (productIndex >= 0) {
          // Deduct from source store (assuming main inventory is source)
          existingInventory[productIndex].stock -= product.quantity
          if (existingInventory[productIndex].stock < 0) {
            existingInventory[productIndex].stock = 0
          }
        }
      })

      localStorage.setItem(inventoryStorageKey, JSON.stringify(existingInventory))
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  const getStoreName = (storeText) => storeText || 'Unknown'

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">New Transfer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiTruck className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Transfer Details</h2>
            </div>
            
            <div className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Store/Person *</label>
                <input
                  type="text"
                  value={form.transferDetails.fromStore}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, fromStore: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., Main Store (Store)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Store/Person *</label>
                <input
                  type="text"
                  value={form.transferDetails.toStore}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, toStore: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., Branch Store - Delhi (Store)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Date *</label>
                <input
                  type="date"
                  value={form.transferDetails.transferDate}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, transferDate: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Time</label>
                <input
                  type="time"
                  value={form.transferDetails.transferTime}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, transferTime: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={form.transferDetails.paymentMode}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, paymentMode: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit">Credit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks / Notes</label>
                <textarea
                  value={form.transferDetails.remarks}
                  onChange={(e) => setForm({
                    ...form,
                    transferDetails: { ...form.transferDetails, remarks: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  rows={3}
                  placeholder="Additional notes about the transfer..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiPackage className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Product Details</h2>
            </div>
            
            {/* Add Product Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product ID / IMEI *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProduct.productId}
                    onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
                    className="flex-1 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                    placeholder="Enter Product ID or IMEI"
                  />
                  <button type="button" onClick={lookupProduct} disabled={lookupLoading} className="px-3 py-2 rounded-md border">
                    {lookupLoading ? 'Finding...' : 'Find'}
                  </button>
                </div>
                {lookupError ? <div className="mt-1 text-xs text-red-600">{lookupError}</div> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
                <input
                  type="number"
                  value={newProduct.unitPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product List */}
            {form.products.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-2">Products to Transfer</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 text-xs uppercase border-b">
                        <th className="py-2 pr-4">Product Name</th>
                        <th className="py-2 pr-4">Model</th>
                        <th className="py-2 pr-4">Features</th>
                        <th className="py-2 pr-4">SKU</th>
                        <th className="py-2 pr-4">Quantity</th>
                        <th className="py-2 pr-4">Unit Price</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2 pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.products.map((product, index) => (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 pr-4">{product.productName}</td>
                          <td className="py-2 pr-4">{product.productModel}</td>
                          <td className="py-2 pr-4">
                            {(product.color || product.ram || product.storage) && (
                              <div className="text-xs text-slate-600">
                                {product.color && <div>Color: {product.color}</div>}
                                {product.ram && <div>RAM: {product.ram}</div>}
                                {product.storage && <div>Storage: {product.storage}</div>}
                                {product.processor && <div>Processor: {product.processor}</div>}
                                {product.displaySize && <div>Display: {product.displaySize}</div>}
                                {product.camera && <div>Camera: {product.camera}</div>}
                                {product.battery && <div>Battery: {product.battery}</div>}
                                {product.operatingSystem && <div>OS: {product.operatingSystem}</div>}
                                {product.networkType && <div>Network: {product.networkType}</div>}
                              </div>
                            )}
                          </td>
                          <td className="py-2 pr-4">{product.productSku}</td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-16 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                              min="1"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              value={product.unitPrice}
                              onChange={(e) => updateProductPrice(index, parseFloat(e.target.value) || 0)}
                              className="w-20 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-2 pr-4">₹{product.totalPrice.toFixed(2)}</td>
                          <td className="py-2 pr-2">
                            <button
                              onClick={() => removeProduct(index)}
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

            {/* Transfer Summary */}
            {form.products.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Transfer Summary:</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>From:</span>
                    <span>{getStoreName(form.transferDetails.fromStore)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>To:</span>
                    <span>{getStoreName(form.transferDetails.toStore)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Products:</span>
                    <span>{form.products.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Quantity:</span>
                    <span>{form.products.reduce((sum, product) => sum + product.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{form.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveTransfer}
                disabled={
                  form.products.length === 0 ||
                  !String(form.transferDetails.fromStore || '').trim() ||
                  !String(form.transferDetails.toStore || '').trim()
                }
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                <span>Save Transfer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTransfer
