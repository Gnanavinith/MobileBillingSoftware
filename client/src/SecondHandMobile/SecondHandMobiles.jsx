import React, { useState, useEffect } from 'react'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdPhoneAndroid, MdAttachMoney, MdPerson, MdCalendarToday } from 'react-icons/md'

const SecondHandMobiles = () => {
  const [mobiles, setMobiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMobile, setEditingMobile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    modelNumber: '',
    imeiNumber1: '',
    imeiNumber2: '',
    condition: 'good',
    conditionNotes: '',
    purchasePrice: '',
    sellingPrice: '',
    sellerName: '',
    sellerPhone: '',
    sellerAddress: '',
    color: '',
    ram: '',
    storage: '',
    simSlot: '',
    processor: '',
    displaySize: '',
    camera: '',
    battery: '',
    operatingSystem: '',
    networkType: '',
    accessories: [],
    warranty: {
      hasWarranty: false,
      warrantyPeriod: '',
      warrantyNotes: ''
    },
    notes: ''
  })

  // Fetch mobiles
  const fetchMobiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (conditionFilter) params.append('condition', conditionFilter)
      
      const response = await fetch(`/api/secondhand-mobiles?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setMobiles(result.data)
      }
    } catch (error) {
      console.error('Error fetching mobiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMobiles()
  }, [searchTerm, statusFilter, conditionFilter])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingMobile ? `/api/secondhand-mobiles/${editingMobile.id}` : '/api/secondhand-mobiles'
      const method = editingMobile ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowAddModal(false)
        setShowEditModal(false)
        setEditingMobile(null)
        resetForm()
        fetchMobiles()
      } else {
        alert(result.error || 'Error saving mobile')
      }
    } catch (error) {
      console.error('Error saving mobile:', error)
      alert('Error saving mobile')
    }
  }

  // Handle edit
  const handleEdit = (mobile) => {
    setEditingMobile(mobile)
    setFormData({
      ...mobile,
      purchasePrice: mobile.purchasePrice.toString(),
      sellingPrice: mobile.sellingPrice.toString(),
      accessories: mobile.accessories || [],
      warranty: mobile.warranty || { hasWarranty: false, warrantyPeriod: '', warrantyNotes: '' }
    })
    setShowEditModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mobile?')) return
    
    try {
      const response = await fetch(`/api/secondhand-mobiles/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        fetchMobiles()
      } else {
        alert(result.error || 'Error deleting mobile')
      }
    } catch (error) {
      console.error('Error deleting mobile:', error)
      alert('Error deleting mobile')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      modelNumber: '',
      imeiNumber1: '',
      imeiNumber2: '',
      condition: 'good',
      conditionNotes: '',
      purchasePrice: '',
      sellingPrice: '',
      sellerName: '',
      sellerPhone: '',
      sellerAddress: '',
      color: '',
      ram: '',
      storage: '',
      simSlot: '',
      processor: '',
      displaySize: '',
      camera: '',
      battery: '',
      operatingSystem: '',
      networkType: '',
      accessories: [],
      warranty: {
        hasWarranty: false,
        warrantyPeriod: '',
        warrantyNotes: ''
      },
      notes: ''
    })
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'sold': return 'bg-blue-100 text-blue-800'
      case 'returned': return 'bg-yellow-100 text-yellow-800'
      case 'damaged': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get condition badge color
  const getConditionBadgeColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Second Hand Mobiles</h1>
          <p className="text-slate-600">Manage your secondhand mobile inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <MdAdd className="w-5 h-5" />
          Add Mobile
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Search</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by brand, model, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="returned">Returned</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            >
              <option value="">All Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setConditionFilter('')
              }}
              className="w-full bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2"
            >
              <MdFilterList className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Mobile List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading mobiles...</p>
          </div>
        ) : mobiles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <MdPhoneAndroid className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No secondhand mobiles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prices</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {mobiles.map((mobile) => (
                  <tr key={mobile.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{mobile.brand} {mobile.model}</div>
                        <div className="text-sm text-slate-500">{mobile.modelNumber}</div>
                        {mobile.imeiNumber1 && (
                          <div className="text-xs text-slate-400">IMEI: {mobile.imeiNumber1}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{mobile.sellerName}</div>
                        {mobile.sellerPhone && (
                          <div className="text-sm text-gray-500">{mobile.sellerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeColor(mobile.condition)}`}>
                        {mobile.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-slate-900">₹{mobile.sellingPrice}</div>
                        <div className="text-sm text-slate-500">Cost: ₹{mobile.purchasePrice}</div>
                        <div className="text-sm text-green-600">Profit: ₹{mobile.profitMargin}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(mobile.status)}`}>
                        {mobile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(mobile.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(mobile)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(mobile.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingMobile ? 'Edit Mobile' : 'Add New Mobile'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setEditingMobile(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* IMEI Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 1</label>
                  <input
                    type="text"
                    value={formData.imeiNumber1}
                    onChange={(e) => setFormData({ ...formData, imeiNumber1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IMEI 2</label>
                  <input
                    type="text"
                    value={formData.imeiNumber2}
                    onChange={(e) => setFormData({ ...formData, imeiNumber2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Condition and Prices */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                  <select
                    required
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Seller Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Phone</label>
                  <input
                    type="tel"
                    value={formData.sellerPhone}
                    onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Size</label>
                  <input
                    type="text"
                    value={formData.displaySize}
                    onChange={(e) => setFormData({ ...formData, displaySize: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
                <textarea
                  value={formData.conditionNotes}
                  onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Warranty */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Warranty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.warranty.hasWarranty}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        warranty: { ...formData.warranty, hasWarranty: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Has Warranty</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
                    <input
                      type="text"
                      value={formData.warranty.warrantyPeriod}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        warranty: { ...formData.warranty, warrantyPeriod: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Notes</label>
                    <input
                      type="text"
                      value={formData.warranty.warrantyNotes}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        warranty: { ...formData.warranty, warrantyNotes: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                    setEditingMobile(null)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMobile ? 'Update Mobile' : 'Add Mobile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecondHandMobiles
