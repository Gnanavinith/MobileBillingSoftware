import React, { useState, useEffect } from 'react'
import { FiSave, FiPlus, FiTrash2, FiUser, FiSmartphone, FiSettings } from 'react-icons/fi'

const generateServiceId = () => `SRV-${Date.now().toString().slice(-6)}`
const storageKey = 'mobilebill:services'
const inventoryStorageKey = 'mobilebill:inventory'

const ServiceRequests = () => {
  const [inventory, setInventory] = useState([])
  const [form, setForm] = useState({
    id: generateServiceId(),
    customerDetails: {
      name: '',
      phone: '',
      address: '',
      idProof: '',
      idProofType: 'Aadhaar'
    },
    deviceDetails: {
      brand: '',
      model: '',
      imei: '',
      problemDescription: '',
      accessoriesGiven: ''
    },
    serviceDetails: {
      serviceType: 'Repair',
      estimatedCost: 0,
      advancePayment: 0,
      paymentMode: 'Cash',
      discount: 0,
      gstEnabled: true,
      gstPercentage: 18,
      serviceParts: [],
      status: 'Pending',
      assignedStaff: '',
      serviceStartDate: new Date().toISOString().split('T')[0],
      estimatedDeliveryDate: '',
      notes: ''
    },
    calculatedAmounts: {
      subtotal: 0,
      discountAmount: 0,
      gstAmount: 0,
      grandTotal: 0,
      pendingBalance: 0
    }
  })

  const [newPart, setNewPart] = useState({
    partId: '',
    quantity: 1,
    unitPrice: 0
  })

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = () => {
    try {
      const savedInventory = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      setInventory(Array.isArray(savedInventory) ? savedInventory : [])
    } catch (error) {
      console.error('Error loading inventory:', error)
    }
  }

  const calculateAmounts = () => {
    const subtotal = form.serviceDetails.estimatedCost + 
      form.serviceDetails.serviceParts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0)
    
    const discountAmount = (subtotal * form.serviceDetails.discount) / 100
    const afterDiscount = subtotal - discountAmount
    const gstAmount = form.serviceDetails.gstEnabled ? (afterDiscount * form.serviceDetails.gstPercentage) / 100 : 0
    const grandTotal = afterDiscount + gstAmount
    const pendingBalance = grandTotal - form.serviceDetails.advancePayment

    setForm(prev => ({
      ...prev,
      calculatedAmounts: {
        subtotal,
        discountAmount,
        gstAmount,
        grandTotal,
        pendingBalance
      }
    }))
  }

  useEffect(() => {
    calculateAmounts()
  }, [form.serviceDetails.estimatedCost, form.serviceDetails.serviceParts, form.serviceDetails.discount, form.serviceDetails.gstEnabled, form.serviceDetails.gstPercentage, form.serviceDetails.advancePayment])

  const addServicePart = () => {
    if (!newPart.partId || newPart.quantity <= 0 || newPart.unitPrice <= 0) {
      alert('Please fill all required fields for the service part')
      return
    }

    const selectedPart = inventory.find(item => item.id === newPart.partId)
    if (!selectedPart) {
      alert('Selected part not found in inventory')
      return
    }

    const part = {
      ...newPart,
      partName: selectedPart.productName,
      partModel: selectedPart.model,
      totalPrice: newPart.quantity * newPart.unitPrice
    }

    setForm(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        serviceParts: [...prev.serviceDetails.serviceParts, part]
      }
    }))

    setNewPart({
      partId: '',
      quantity: 1,
      unitPrice: 0
    })
  }

  const removeServicePart = (index) => {
    setForm(prev => ({
      ...prev,
      serviceDetails: {
        ...prev.serviceDetails,
        serviceParts: prev.serviceDetails.serviceParts.filter((_, i) => i !== index)
      }
    }))
  }

  const saveServiceRequest = () => {
    if (!form.customerDetails.name || !form.customerDetails.phone) {
      alert('Customer name and phone are required')
      return
    }

    if (!form.deviceDetails.brand || !form.deviceDetails.model || !form.deviceDetails.problemDescription) {
      alert('Device details and problem description are required')
      return
    }

    try {
      const savedServices = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const newService = {
        ...form,
        id: generateServiceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedServices = [...savedServices, newService]
      localStorage.setItem(storageKey, JSON.stringify(updatedServices))

      // Update inventory stock for service parts
      updateInventoryStock(form.serviceDetails.serviceParts)

      alert('Service request saved successfully!')
      
      // Reset form
      setForm({
        id: generateServiceId(),
        customerDetails: {
          name: '',
          phone: '',
          address: '',
          idProof: '',
          idProofType: 'Aadhaar'
        },
        deviceDetails: {
          brand: '',
          model: '',
          imei: '',
          problemDescription: '',
          accessoriesGiven: ''
        },
        serviceDetails: {
          serviceType: 'Repair',
          estimatedCost: 0,
          advancePayment: 0,
          paymentMode: 'Cash',
          discount: 0,
          gstEnabled: true,
          gstPercentage: 18,
          serviceParts: [],
          status: 'Pending',
          assignedStaff: '',
          serviceStartDate: new Date().toISOString().split('T')[0],
          estimatedDeliveryDate: '',
          notes: ''
        },
        calculatedAmounts: {
          subtotal: 0,
          discountAmount: 0,
          gstAmount: 0,
          grandTotal: 0,
          pendingBalance: 0
        }
      })
    } catch (error) {
      alert('Error saving service request: ' + error.message)
    }
  }

  const updateInventoryStock = (serviceParts) => {
    try {
      const existingInventory = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      
      serviceParts.forEach(part => {
        const partIndex = existingInventory.findIndex(item => item.id === part.partId)
        if (partIndex >= 0) {
          existingInventory[partIndex].stock -= part.quantity
          if (existingInventory[partIndex].stock < 0) {
            existingInventory[partIndex].stock = 0
          }
        }
      })

      localStorage.setItem(inventoryStorageKey, JSON.stringify(existingInventory))
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  const serviceParts = inventory.filter(item => item.category === 'Service Item')

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">New Service Request</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiUser className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Customer Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={form.customerDetails.name}
                  onChange={(e) => setForm({
                    ...form,
                    customerDetails: { ...form.customerDetails, name: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={form.customerDetails.phone}
                  onChange={(e) => setForm({
                    ...form,
                    customerDetails: { ...form.customerDetails, phone: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  value={form.customerDetails.address}
                  onChange={(e) => setForm({
                    ...form,
                    customerDetails: { ...form.customerDetails, address: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Type</label>
                <select
                  value={form.customerDetails.idProofType}
                  onChange={(e) => setForm({
                    ...form,
                    customerDetails: { ...form.customerDetails, idProofType: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID Proof Number</label>
                <input
                  type="text"
                  value={form.customerDetails.idProof}
                  onChange={(e) => setForm({
                    ...form,
                    customerDetails: { ...form.customerDetails, idProof: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Device Details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiSmartphone className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold">Device Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Brand *</label>
                <input
                  type="text"
                  value={form.deviceDetails.brand}
                  onChange={(e) => setForm({
                    ...form,
                    deviceDetails: { ...form.deviceDetails, brand: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., Samsung, iPhone, OnePlus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                <input
                  type="text"
                  value={form.deviceDetails.model}
                  onChange={(e) => setForm({
                    ...form,
                    deviceDetails: { ...form.deviceDetails, model: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="e.g., Galaxy A54, iPhone 14"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">IMEI Number</label>
                <input
                  type="text"
                  value={form.deviceDetails.imei}
                  onChange={(e) => setForm({
                    ...form,
                    deviceDetails: { ...form.deviceDetails, imei: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="15-digit IMEI number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Problem/Issue Description *</label>
                <textarea
                  value={form.deviceDetails.problemDescription}
                  onChange={(e) => setForm({
                    ...form,
                    deviceDetails: { ...form.deviceDetails, problemDescription: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  rows={4}
                  placeholder="Describe the problem in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Accessories Given</label>
                <textarea
                  value={form.deviceDetails.accessoriesGiven}
                  onChange={(e) => setForm({
                    ...form,
                    deviceDetails: { ...form.deviceDetails, accessoriesGiven: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  rows={2}
                  placeholder="e.g., Charger, Earphones, Case, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FiSettings className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Service Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service ID</label>
                <input
                  type="text"
                  value={form.id}
                  readOnly
                  className="w-full rounded-md border border-slate-300 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                <select
                  value={form.serviceDetails.serviceType}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, serviceType: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  value={form.serviceDetails.estimatedCost}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, estimatedCost: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Advance Payment</label>
                <input
                  type="number"
                  value={form.serviceDetails.advancePayment}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, advancePayment: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={form.serviceDetails.paymentMode}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, paymentMode: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  value={form.serviceDetails.discount}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, discount: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.serviceDetails.gstEnabled}
                    onChange={(e) => setForm({
                      ...form,
                      serviceDetails: { ...form.serviceDetails, gstEnabled: e.target.checked }
                    })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Apply GST</span>
                </label>
                {form.serviceDetails.gstEnabled && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">GST Percentage</label>
                    <input
                      type="number"
                      value={form.serviceDetails.gstPercentage}
                      onChange={(e) => setForm({
                        ...form,
                        serviceDetails: { ...form.serviceDetails, gstPercentage: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Status</label>
                <select
                  value={form.serviceDetails.status}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, status: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Staff</label>
                <input
                  type="text"
                  value={form.serviceDetails.assignedStaff}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, assignedStaff: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="Staff member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Start Date</label>
                <input
                  type="date"
                  value={form.serviceDetails.serviceStartDate}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, serviceStartDate: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  value={form.serviceDetails.estimatedDeliveryDate}
                  onChange={(e) => setForm({
                    ...form,
                    serviceDetails: { ...form.serviceDetails, estimatedDeliveryDate: e.target.value }
                  })}
                  className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Parts Section */}
      <div className="mt-6">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Service Parts Used</h2>
          
          {/* Add Service Part Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Part *</label>
              <select
                value={newPart.partId}
                onChange={(e) => {
                  const selectedPart = inventory.find(item => item.id === e.target.value)
                  setNewPart({
                    ...newPart,
                    partId: e.target.value,
                    unitPrice: selectedPart ? selectedPart.sellingPrice : 0
                  })
                }}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              >
                <option value="">Select Service Part</option>
                {serviceParts.map(part => (
                  <option key={part.id} value={part.id}>
                    {part.productName} - {part.model} (Stock: {part.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price *</label>
              <input
                type="number"
                value={newPart.unitPrice}
                onChange={(e) => setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addServicePart}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Part</span>
              </button>
            </div>
          </div>

          {/* Service Parts List */}
          {form.serviceDetails.serviceParts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Added Service Parts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 text-xs uppercase border-b">
                      <th className="py-2 pr-4">Part Name</th>
                      <th className="py-2 pr-4">Model</th>
                      <th className="py-2 pr-4">Quantity</th>
                      <th className="py-2 pr-4">Unit Price</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.serviceDetails.serviceParts.map((part, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{part.partName}</td>
                        <td className="py-2 pr-4">{part.partModel}</td>
                        <td className="py-2 pr-4">{part.quantity}</td>
                        <td className="py-2 pr-4">₹{part.unitPrice.toFixed(2)}</td>
                        <td className="py-2 pr-4">₹{part.totalPrice.toFixed(2)}</td>
                        <td className="py-2 pr-2">
                          <button
                            onClick={() => removeServicePart(index)}
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
        </div>
      </div>

      {/* Amount Summary */}
      <div className="mt-6">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Amount Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Service Cost:</span>
                <span>₹{form.serviceDetails.estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Parts Cost:</span>
                <span>₹{form.serviceDetails.serviceParts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span>₹{form.calculatedAmounts.subtotal.toFixed(2)}</span>
              </div>
              {form.serviceDetails.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Discount ({form.serviceDetails.discount}%):</span>
                  <span>-₹{form.calculatedAmounts.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {form.serviceDetails.gstEnabled && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">GST ({form.serviceDetails.gstPercentage}%):</span>
                  <span>₹{form.calculatedAmounts.gstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{form.calculatedAmounts.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Advance Paid:</span>
                <span>₹{form.serviceDetails.advancePayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Pending Balance:</span>
                <span className={form.calculatedAmounts.pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                  ₹{form.calculatedAmounts.pendingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveServiceRequest}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <FiSave className="w-4 h-4" />
          <span>Save Service Request</span>
        </button>
      </div>
    </div>
  )
}

export default ServiceRequests
