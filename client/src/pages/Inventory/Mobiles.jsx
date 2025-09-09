import React, { useState, useEffect, useMemo } from 'react'
import { FiSearch, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

// Resolve API base: in Electron packaged app, backend is on localhost:5000; in dev use Vite proxy with empty base
const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const Mobiles = () => {
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  const [storeId, setStoreId] = useState('')
  const [storeStock, setStoreStock] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const loadStore = async () => {
      if (!storeId) { setStoreStock([]); return }
      try {
        const res = await fetch(`${apiBase}/api/store-stock?storeId=${encodeURIComponent(storeId)}`)
        const data = await res.json()
        setStoreStock(Array.isArray(data) ? data : [])
      } catch { setStoreStock([]) }
    }
    loadStore()
  }, [storeId])

  const loadData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/mobiles`)
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []
      const mapped = rows.map(r => ({
        id: r.id,
        category: 'Mobile',
        productName: r.mobileName,
        model: r.modelNumber,
        stock: Number(r.totalQuantity) || 0,
        purchasePrice: Number(r.pricePerProduct) || 0,
        sellingPrice: Number(r.pricePerProduct) || 0,
        createdAt: r.createdAt || new Date().toISOString(),
      }))
      setInventory(mapped)
      setPurchases([])
      setSales([])
    } catch (error) {
      console.error('Error loading mobiles:', error)
      setInventory([])
    }
  }

  // Remaining stock directly from backend quantity for now

  const mobileInventory = useMemo(() => {
    const mobileItems = inventory.filter(item => item.category === 'Mobile')
    if (!storeId) return mobileItems.map(item => ({ ...item, remainingStock: item.stock }))
    // When a store is selected, sum quantities from StoreStock by matching productModel/name
    return mobileItems.map(item => {
      const qty = storeStock
        .filter(s => (s.productModel || '') === item.model && (s.productName || '') === item.productName)
        .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
      return { ...item, remainingStock: qty }
    })
  }, [inventory, storeId, storeStock])

  const filteredInventory = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mobileInventory
    
    return mobileInventory.filter(item =>
      item.productName.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q)
    )
  }, [mobileInventory, search])

  const lowStockItems = filteredInventory.filter(item => item.remainingStock <= lowStockThreshold)
  const outOfStockItems = filteredInventory.filter(item => item.remainingStock <= 0)

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'bg-red-100 text-red-700', icon: FiAlertTriangle, text: 'Out of Stock' }
    if (stock <= lowStockThreshold) return { color: 'bg-yellow-100 text-yellow-700', icon: FiAlertTriangle, text: 'Low Stock' }
    return { color: 'bg-green-100 text-green-700', icon: FiCheckCircle, text: 'In Stock' }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Mobile Inventory</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700">Store:</label>
            <input
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              placeholder="e.g. STORE-001 (blank = all)"
              className="w-40 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700">Low Stock Threshold:</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
              className="w-20 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              min="0"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search mobiles..."
              className="w-64 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 pl-8"
            />
            <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Products</p>
              <p className="text-2xl font-semibold text-slate-900">{filteredInventory.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">📱</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Stock</p>
              <p className="text-2xl font-semibold text-green-600">
                {filteredInventory.filter(item => item.remainingStock > lowStockThreshold).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-2xl font-semibold text-yellow-600">{lowStockItems.length}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{outOfStockItems.length}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Mobile Stock Details</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Model/Variant</th>
                <th className="py-3 px-4">Remaining Stock</th>
                <th className="py-3 px-4">Purchase Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-slate-500" colSpan={8}>
                    No mobile products found in inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const stockStatus = getStockStatus(item.remainingStock)
                  const StockIcon = stockStatus.icon
                  const stockValue = item.remainingStock * item.purchasePrice

                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{item.productName}</td>
                      <td className="py-3 px-4">{item.model}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.remainingStock <= 0 
                            ? 'bg-red-100 text-red-700' 
                            : item.remainingStock <= lowStockThreshold
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.remainingStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{item.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{stockValue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                          <StockIcon className="w-3 h-3" />
                          <span>{stockStatus.text}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            The following mobile products are running low on stock:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg p-2 border border-yellow-200">
                <p className="font-medium text-sm">{item.productName} - {item.model}</p>
                <p className="text-xs text-slate-600">Stock: {item.remainingStock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Mobiles
