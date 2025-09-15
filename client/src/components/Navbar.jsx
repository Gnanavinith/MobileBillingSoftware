import React, { useEffect, useState } from 'react'
import { MdAccountCircle, MdInventory, MdWarning, MdInfo } from 'react-icons/md'
import { FiBell } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [lowStock, setLowStock] = useState([])
  const [viewedItems, setViewedItems] = useState(new Set())
  const [unreadCount, setUnreadCount] = useState(0)

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
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { mounted = false; clearInterval(id) }
  }, [viewedItems])

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleNotificationClick = () => {
    navigate('/notifications')
  }
  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200 flex items-center px-6 justify-between transition-colors duration-200 print:hidden shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">MB</span>
        </div>
        <div className="font-bold text-xl tracking-wide bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MobileBill</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${
              unreadCount > 0 
                ? 'bg-red-50 hover:bg-red-100 text-red-600 shadow-sm' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
            }`}
          >
            <FiBell className={`w-5 h-5 transition-transform duration-200 ${
              unreadCount > 0 ? 'animate-pulse' : ''
            }`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] leading-none px-2 py-1 rounded-full font-semibold shadow-lg animate-bounce">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        {auth?.user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">{auth.user.role}</span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200">
              <MdAccountCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Navbar


