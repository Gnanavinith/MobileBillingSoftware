import React, { useState, useEffect } from 'react'
import { MdSearch, MdFilterList, MdPhoneAndroid, MdAttachMoney, MdPerson, MdCalendarToday, MdReceipt } from 'react-icons/md'

const SecondHandMobilesHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [stats, setStats] = useState(null)

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)
      
      const response = await fetch(`/api/secondhand-mobiles?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/secondhand-mobiles/stats/overview')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [searchTerm, statusFilter, dateFilter])

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
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Second Hand Mobiles History</h1>
          <p className="text-slate-600">Track all secondhand mobile transactions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdPhoneAndroid className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mobiles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalMobiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdReceipt className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.availableMobiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdAttachMoney className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.totalInvestment)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MdAttachMoney className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overview.totalProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Search</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by brand, model, seller..."
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setDateFilter('')
              }}
              className="w-full bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 flex items-center justify-center gap-2"
            >
              <MdFilterList className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <MdPhoneAndroid className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Financials</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sale Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{transaction.brand} {transaction.model}</div>
                        <div className="text-sm text-slate-500">{transaction.modelNumber}</div>
                        {transaction.imeiNumber1 && (
                          <div className="text-xs text-slate-400">IMEI: {transaction.imeiNumber1}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-slate-900">{transaction.sellerName}</div>
                        {transaction.sellerPhone && (
                          <div className="text-sm text-slate-500">{transaction.sellerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeColor(transaction.condition)}`}>
                        {transaction.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-slate-900">Selling: {formatCurrency(transaction.sellingPrice)}</div>
                        <div className="text-sm text-slate-500">Cost: {formatCurrency(transaction.purchasePrice)}</div>
                        <div className={`text-sm font-medium ${transaction.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Profit: {formatCurrency(transaction.profitMargin)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(transaction.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {transaction.saleDate ? new Date(transaction.saleDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Condition Statistics */}
      {stats && stats.byCondition && stats.byCondition.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">Statistics by Condition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.byCondition.map((condition) => (
              <div key={condition._id} className="p-4 border-2 border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeColor(condition._id)}`}>
                    {condition._id}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{condition.count}</span>
                </div>
                <div className="text-sm text-slate-700">
                  <div>Avg Cost: {formatCurrency(condition.avgPurchasePrice)}</div>
                  <div>Avg Price: {formatCurrency(condition.avgSellingPrice)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SecondHandMobilesHistory
