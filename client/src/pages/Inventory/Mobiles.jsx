import React, { useState, useEffect, useMemo } from 'react'
import { FiSearch, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'

const inventoryStorageKey = 'mobilebill:inventory'
const purchasesStorageKey = 'mobilebill:purchases'
const salesStorageKey = 'mobilebill:sales'

const Mobiles = () => {
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      const savedInventory = JSON.parse(localStorage.getItem(inventoryStorageKey) || '[]')
      if (savedInventory.length === 0) {
        // Add dummy inventory data
        const dummyInventory = [
          {
            id: 'PROD-001',
            category: 'Mobile',
            productName: 'Smartphone',
            model: 'Samsung Galaxy A54',
            stock: 5,
            purchasePrice: 5000,
            sellingPrice: 6500,
            createdAt: '2024-02-01T11:20:00Z'
          },
          {
            id: 'PROD-002',
            category: 'Mobile',
            productName: 'Smartphone',
            model: 'iPhone 14',
            stock: 3,
            purchasePrice: 45000,
            sellingPrice: 55000,
            createdAt: '2024-01-28T09:15:00Z'
          },
          {
            id: 'PROD-003',
            category: 'Mobile',
            productName: 'Smartphone',
            model: 'OnePlus 11R',
            stock: 8,
            purchasePrice: 35000,
            sellingPrice: 42000,
            createdAt: '2024-01-25T14:30:00Z'
          },
          {
            id: 'PROD-004',
            category: 'Mobile',
            productName: 'Smartphone',
            model: 'Redmi Note 12 Pro',
            stock: 12,
            purchasePrice: 18000,
            sellingPrice: 22000,
            createdAt: '2024-01-20T16:45:00Z'
          }
        ]
        localStorage.setItem(inventoryStorageKey, JSON.stringify(dummyInventory))
        setInventory(dummyInventory)
      } else {
        setInventory(Array.isArray(savedInventory) ? savedInventory : [])
      }

      const savedPurchases = JSON.parse(localStorage.getItem(purchasesStorageKey) || '[]')
      setPurchases(Array.isArray(savedPurchases) ? savedPurchases : [])

      const savedSales = JSON.parse(localStorage.getItem(salesStorageKey) || '[]')
      if (savedSales.length === 0) {
        // Add dummy sales data to show stock reduction
        const dummySales = [
          {
            id: 'SALE-001',
            items: [
              {
                productName: 'Smartphone',
                model: 'Samsung Galaxy A54',
                quantity: 2
              }
            ],
            createdAt: '2024-02-03T10:30:00Z'
          },
          {
            id: 'SALE-002',
            items: [
              {
                productName: 'Smartphone',
                model: 'OnePlus 11R',
                quantity: 1
              }
            ],
            createdAt: '2024-02-05T14:15:00Z'
          }
        ]
        localStorage.setItem(salesStorageKey, JSON.stringify(dummySales))
        setSales(dummySales)
      } else {
        setSales(Array.isArray(savedSales) ? savedSales : [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const calculateRemainingStock = (productName, model) => {
    // Get total purchased quantity
    const totalPurchased = purchases.reduce((sum, purchase) => {
      return sum + purchase.items.reduce((itemSum, item) => {
        if (item.productName === productName && item.model === model) {
          return itemSum + item.quantity
        }
        return itemSum
      }, 0)
    }, 0)

    // Get total sold/used quantity
    const totalSold = sales.reduce((sum, sale) => {
      return sum + (sale.items || []).reduce((itemSum, item) => {
        if (item.productName === productName && item.model === model) {
          return itemSum + item.quantity
        }
        return itemSum
      }, 0)
    }, 0)

    return totalPurchased - totalSold
  }

  const mobileInventory = useMemo(() => {
    const mobileItems = inventory.filter(item => item.category === 'Mobile')
    
    return mobileItems.map(item => ({
      ...item,
      remainingStock: calculateRemainingStock(item.productName, item.model)
    }))
  }, [inventory, purchases, sales])

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
