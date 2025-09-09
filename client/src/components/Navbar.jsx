import React from 'react'
import { MdAccountCircle } from 'react-icons/md'

const Navbar = () => {
  return (
    <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center px-4 justify-between transition-colors duration-200 print:hidden">
      <div className="font-semibold tracking-wide text-slate-900">Dashboard</div>
      <button className="text-slate-600 hover:text-slate-900 transition-colors">
        <MdAccountCircle className="text-2xl" />
      </button>
    </header>
  )
}

export default Navbar


