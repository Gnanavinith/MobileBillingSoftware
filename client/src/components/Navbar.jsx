import React, { useEffect, useState } from 'react'
import { MdAccountCircle } from 'react-icons/md'
import { FiBell, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const [lowStock, setLowStock] = useState([])
  const [open, setOpen] = useState(false)

  const isElectron = (typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent))
  const apiBase = isElectron ? 'http://127.0.0.1:5000' : (import.meta?.env?.VITE_API_BASE || '')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/low-stock?threshold=20`)
        const data = await res.json()
        if (mounted) setLowStock(Array.isArray(data) ? data.slice(0, 20) : [])
      } catch { if (mounted) setLowStock([]) }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center px-4 justify-between transition-colors duration-200 print:hidden">
      <div className="font-semibold tracking-wide text-slate-900">MobileBill</div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={()=>setOpen(!open)} className="relative p-2 rounded-md hover:bg-slate-100">
            <FiBell className="w-5 h-5 text-slate-700" />
            {lowStock.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">{lowStock.length}</span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-lg z-50">
              <div className="px-3 py-2 border-b flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FiAlertTriangle className="text-red-600" /> Low Stock Alerts
              </div>
              <div className="max-h-80 overflow-auto">
                {lowStock.length === 0 ? (
                  <div className="p-3 text-sm text-slate-500">All stocks are healthy.</div>
                ) : lowStock.map((it, idx) => (
                  <div key={idx} className="px-3 py-2 text-sm flex items-center justify-between border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-slate-600">{it.model}</div>
                    </div>
                    <div className="text-xs font-semibold text-red-600">{it.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {auth?.user ? (
          <div className="text-sm text-slate-600"><span className="font-medium text-slate-900">{auth.user.role.toUpperCase()}</span> • {auth.user.email}</div>
        ) : null}
        <button onClick={onLogout} className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
          <MdAccountCircle className="text-2xl" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar


