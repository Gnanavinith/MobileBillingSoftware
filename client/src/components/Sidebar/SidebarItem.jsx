import React, { useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IoChevronDown, IoChevronForward } from 'react-icons/io5'

const linkBaseClasses = 'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150'
const childLinkBaseClasses = 'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150'

const activeClasses = 'bg-gradient-to-r from-indigo-100 to-blue-100 text-slate-900 shadow'
const inactiveClasses = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'

const SidebarItem = ({ label, icon: Icon, to, childrenItems = [] }) => {
  const location = useLocation()
  const hasChildren = childrenItems.length > 0

  const isAnyChildActive = useMemo(() => {
    if (!hasChildren) return false
    return childrenItems.some(ci => location.pathname === ci.to)
  }, [hasChildren, childrenItems, location.pathname])

  const [open, setOpen] = useState(isAnyChildActive)

  const Header = (
    <button
      type="button"
      onClick={() => hasChildren && setOpen(o => !o)}
      className={`${linkBaseClasses} w-full justify-between text-left ${inactiveClasses}`}
    >
      <span className="flex items-center gap-3">
        {Icon ? <Icon className="text-xl text-slate-700" /> : null}
        <span className="font-medium">{label}</span>
      </span>
      {hasChildren ? (
        open ? <IoChevronDown className="text-lg text-slate-600" /> : <IoChevronForward className="text-lg text-slate-600" />
      ) : null}
    </button>
  )

  return (
    <div className="mb-1">
      {hasChildren ? (
        <div>
          {Header}
          <div className={`${open ? 'block' : 'hidden'} mt-1 ml-2 border-l-2 border-indigo-100 pl-3`}>
            {childrenItems.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) => `${childLinkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                end
              >
                {child.icon ? <child.icon className="text-base text-slate-700" /> : <span className="w-4" />}
                <span>{child.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ) : to ? (
        <NavLink
          to={to}
          className={({ isActive }) => `${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          end
        >
          {Icon ? <Icon className="text-xl text-slate-700" /> : null}
          <span className="font-medium">{label}</span>
        </NavLink>
      ) : (
        Header
      )}
    </div>
  )
}

export default SidebarItem


