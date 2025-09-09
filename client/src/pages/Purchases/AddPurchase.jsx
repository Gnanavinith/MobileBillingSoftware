import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'

const generatePurchaseId = () => `PUR-${Date.now().toString().slice(-6)}`
const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-8)}`
const storageKey = 'mobilebill:purchases'
const dealersStorageKey = 'mobilebill:dealers'
const inventoryStorageKey = 'mobilebill:inventory'

const AddPurchase = () => {
  const [dealers, setDealers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    id: generatePurchaseId(),
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
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0,
    totalPrice: 0
  })

  useEffect(() => {
    // Load dealers
    try {
      const savedDealers = JSON.parse(localStorage.getItem(dealersStorageKey) || '[]')
      if (savedDealers.length === 0) {
        // Add dummy dealers if none exist
        const dummyDealers = [
          {
            id: 'DLR-001',
            name: 'Mobile World',
            phone: '+91 98765 43210',
            address: '123 Main Street, Mumbai',
            email: 'contact@mobileworld.com',
            gst: '27ABCDE1234F1Z5',
            notes: 'Primary mobile dealer'
          },
          {
            id: 'DLR-002',
            name: 'Tech Accessories Hub',
            phone: '+91 98765 43211',
            address: '456 Tech Park, Delhi',
            email: 'sales@techhub.com',
            gst: '07FGHIJ5678K2L6',
            notes: 'Accessories specialist'
          },
          {
            id: 'DLR-003',
            name: 'Gadget Zone',
            phone: '+91 98765 43212',
            address: '789 Electronics Market, Bangalore',
            email: 'info@gadgetzone.com',
            gst: '29MNOPQ9012R3S7',
            notes: 'Service items and repairs'
          }
        ]
        localStorage.setItem(dealersStorageKey, JSON.stringify(dummyDealers))
        setDealers(dummyDealers)
      } else {
        setDealers(Array.isArray(savedDealers) ? savedDealers : [])
      }
    } catch {
      setDealers([])
    }

    // Load existing products for dropdown
    try {
      const savedProducts = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      setProducts(Array.isArray(savedProducts) ? savedProducts : [])
    } catch {
      setProducts([])
    }
  }, [])

  const calculateItemTotal = (item) => {
    return item.quantity * item.purchasePrice
  }

  const calculateTotals = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    const gstAmount = form.gstEnabled ? (totalAmount * form.gstPercentage) / 100 : 0
    const grandTotal = totalAmount + gstAmount

    setForm(prev => ({
      ...prev,
      totalAmount,
      gstAmount,
      grandTotal
    }))
  }

  const addItem = () => {
    if (!newItem.productName || !newItem.model || newItem.quantity <= 0 || newItem.purchasePrice <= 0) {
      alert('Please fill all required fields for the product')
      return
    }

    const itemTotal = calculateItemTotal(newItem)
    const item = {
      ...newItem,
      totalPrice: itemTotal
    }

    const updatedItems = [...form.items, item]
    setForm(prev => ({ ...prev, items: updatedItems }))
    calculateTotals(updatedItems)

    // Reset new item form
    setNewItem({
      category: 'Mobile',
      productName: '',
      model: '',
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      totalPrice: 0
    })
  }

  const removeItem = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, items: updatedItems }))
    calculateTotals(updatedItems)
  }

  const savePurchase = () => {
    if (!form.dealerId) {
      alert('Please select a dealer')
      return
    }

    if (form.items.length === 0) {
      alert('Please add at least one product')
      return
    }

    try {
      const savedPurchases = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const newPurchase = {
        ...form,
        id: generatePurchaseId(),
        createdAt: new Date().toISOString()
      }

      const updatedPurchases = [...savedPurchases, newPurchase]
      localStorage.setItem(storageKey, JSON.stringify(updatedPurchases))

      // Update inventory
      updateInventory(newPurchase.items)

      alert('Purchase saved successfully!')
      
      // Reset form
      setForm({
        id: generatePurchaseId(),
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

  const updateInventory = (items) => {
    try {
      const existingInventory = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      
      items.forEach(item => {
        const existingProductIndex = existingInventory.findIndex(
          p => p.productName === item.productName && p.model === item.model
        )

        if (existingProductIndex >= 0) {
          // Update existing product stock
          existingInventory[existingProductIndex].stock += item.quantity
          existingInventory[existingProductIndex].purchasePrice = item.purchasePrice
          if (item.sellingPrice > 0) {
            existingInventory[existingProductIndex].sellingPrice = item.sellingPrice
          }
        } else {
          // Add new product to inventory
          existingInventory.push({
            id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            category: item.category,
            productName: item.productName,
            model: item.model,
            stock: item.quantity,
            purchasePrice: item.purchasePrice,
            sellingPrice: item.sellingPrice || 0,
            createdAt: new Date().toISOString()
          })
        }
      })

      localStorage.setItem(inventoryStorageKey, JSON.stringify(existingInventory))
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  const selectedDealer = dealers.find(d => d.id === form.dealerId)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Add Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Purchase Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dealer *</label>
                <select
                  value={form.dealerId}
                  onChange={(e) => setForm({ ...form, dealerId: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
                  <div className="mt-2 text-sm text-slate-600">
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
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode *</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
                      className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Product Entry</h2>
            
            {/* Add Product Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., Ear Buds"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model/Variant *</label>
                <input
                  type="text"
                  value={newItem.model}
                  onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., OnePlus Buds"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price *</label>
                <input
                  type="number"
                  value={newItem.purchasePrice}
                  onChange={(e) => setNewItem({ ...newItem, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                <input
                  type="number"
                  value={newItem.sellingPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <tr className="text-left text-slate-500 text-xs uppercase border-b">
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
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{form.totalAmount.toFixed(2)}</span>
                </div>
                {form.gstEnabled && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">GST ({form.gstPercentage}%):</span>
                    <span>₹{form.gstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{form.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={savePurchase}
                disabled={form.items.length === 0 || !form.dealerId}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <FiSave className="w-4 h-4" />
                <span>Save Purchase</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPurchase
