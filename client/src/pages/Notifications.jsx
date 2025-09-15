import React, { useEffect, useState } from 'react'
import { FiBell, FiCheck, FiX, FiPackage, FiSmartphone, FiHeadphones, FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Notifications = () => {
  const navigate = useNavigate()
  const [lowStock, setLowStock] = useState([])
  const [viewedItems, setViewedItems] = useState(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const isElectron = (typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent))
  const apiBase = isElectron ? 'http://127.0.0.1:5000' : (import.meta?.env?.VITE_API_BASE || '')

  // Load viewed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mobilebill:viewedNotifications')
    if (saved) {
      try {
        setViewedItems(new Set(JSON.parse(saved)))
      } catch (e) {
        console.warn('Failed to parse viewed notifications:', e)
      }
    }
  }, [])

  // Save viewed items to localStorage
  useEffect(() => {
    if (viewedItems.size > 0) {
      localStorage.setItem('mobilebill:viewedNotifications', JSON.stringify([...viewedItems]))
    }
  }, [viewedItems])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        console.log('Loading low stock data from:', `${apiBase}/api/low-stock?threshold=20`)
        const res = await fetch(`${apiBase}/api/low-stock?threshold=20`)
        const data = await res.json()
        console.log('Low stock API response:', data)
        if (mounted) {
          const stockData = Array.isArray(data) ? data.slice(0, 20) : []
          setLowStock(stockData)
          console.log('Set low stock data:', stockData)
          
          // Calculate unread count (items not in viewedItems)
          const unread = stockData.filter(item => {
            const itemKey = `${item.type}-${item.id}-${item.name}`
            return !viewedItems.has(itemKey)
          })
          setUnreadCount(unread.length)
          console.log('Unread count:', unread.length)
        }
      } catch (error) { 
        console.error('Error loading low stock data:', error)
        if (mounted) {
          setLowStock([])
          setUnreadCount(0)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { mounted = false; clearInterval(id) }
  }, [viewedItems])

  const markAsViewed = (item) => {
    const itemKey = `${item.type}-${item.id}-${item.name}`
    setViewedItems(prev => new Set([...prev, itemKey]))
  }

  const markAllAsViewed = () => {
    const allKeys = lowStock.map(item => `${item.type}-${item.id}-${item.name}`)
    setViewedItems(prev => new Set([...prev, ...allKeys]))
  }

  const getItemIcon = (type) => {
    if (type === 'mobile') return <FiSmartphone className="w-5 h-5" />
    if (type === 'accessory') return <FiHeadphones className="w-5 h-5" />
    return <FiPackage className="w-5 h-5" />
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-slate-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsViewed}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading notifications...</span>
          </div>
        ) : lowStock.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">All stocks are healthy!</h3>
            <p className="text-slate-500">No low stock alerts at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStock.map((item, idx) => {
              const itemKey = `${item.type}-${item.id}-${item.name}`
              const isViewed = viewedItems.has(itemKey)
              
              return (
                <div 
                  key={idx} 
                  className={`group relative bg-white border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                    isViewed 
                      ? 'opacity-75' 
                      : 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/30 to-white'
                  }`}
                  onClick={() => markAsViewed(item)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      isViewed 
                        ? 'bg-slate-100 text-slate-500' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {getItemIcon(item.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${
                              isViewed ? 'text-slate-600' : 'text-slate-800'
                            }`}>
                              {item.name}
                            </h3>
                            {!isViewed && (
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-slate-500 mb-3">{item.model}</p>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              item.quantity <= 5 
                                ? 'bg-red-100 text-red-700' 
                                : item.quantity <= 10 
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.quantity} left
                            </span>
                            <span className="text-sm text-slate-400">
                              {item.quantity <= 5 ? 'Critical' : item.quantity <= 10 ? 'Low' : 'Warning'}
                            </span>
                            <span className="text-sm text-slate-400 capitalize">
                              {item.type}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action button */}
                        <button 
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            isViewed 
                              ? 'opacity-0 group-hover:opacity-100 hover:bg-slate-200' 
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsViewed(item)
                          }}
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {lowStock.length > 0 && (
        <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Showing {lowStock.length} low stock items</span>
            <button 
              onClick={() => navigate('/stock/mobiles')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all stock →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
