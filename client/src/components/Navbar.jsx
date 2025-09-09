import React from 'react'
import { MdAccountCircle } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }
  return (
    <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center px-4 justify-between transition-colors duration-200 print:hidden">
      <div className="font-semibold tracking-wide text-slate-900">MobileBill</div>
      <div className="flex items-center gap-3">
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


