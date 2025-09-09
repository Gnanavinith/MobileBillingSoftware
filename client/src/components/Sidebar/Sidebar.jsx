import React from 'react'
import SidebarItem from './SidebarItem'
import { MdSpaceDashboard, MdReceiptLong, MdPeople, MdShoppingCart, MdInventory2, MdBuild, MdCompareArrows, MdAssessment, MdSettings, MdSmartphone, MdHeadphones } from 'react-icons/md'

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-white border-r border-slate-200 text-slate-800 p-3 sticky top-0 transition-colors duration-200 print:hidden">
      <div className="px-2 py-3 mb-2">
        <div className="text-lg font-semibold tracking-wide">MobileBill</div>
        <div className="text-xs text-slate-400">POS & Service Manager</div>
      </div>

      <nav className="space-y-1">
        <SidebarItem label="Dashboard" icon={MdSpaceDashboard} to="/dashboard" />

        <SidebarItem label="Billing" icon={MdReceiptLong} childrenItems={[
          { label: 'New Bill / POS', to: '/billing/new' },
          { label: 'Service Billing', to: '/billing/service' },
        ]} />

        <SidebarItem label="Dealers" icon={MdPeople} childrenItems={[
          { label: 'Manage Dealers', to: '/dealers/manage' },
          { label: 'Dealer History', to: '/dealers/history' },
        ]} />

        <SidebarItem label="Purchases" icon={MdShoppingCart} childrenItems={[
          { label: 'Add Purchase', to: '/purchases/add' },
          { label: 'Purchase History', to: '/purchases/history' },
        ]} />

        <SidebarItem label="Inventory" icon={MdInventory2} childrenItems={[
          { label: 'Mobiles', to: '/inventory/mobiles', icon: MdSmartphone },
          { label: 'Accessories', to: '/inventory/accessories', icon: MdHeadphones },
        ]} />

        <SidebarItem label="Services" icon={MdBuild} childrenItems={[
          { label: 'Service Requests', to: '/services/requests' },
          { label: 'Service History', to: '/services/history' },
        ]} />

        <SidebarItem label="Transfers" icon={MdCompareArrows} childrenItems={[
          { label: 'New Transfer', to: '/transfers/new' },
          { label: 'Transfer History', to: '/transfers/history' },
        ]} />

        <SidebarItem label="Reports" icon={MdAssessment} childrenItems={[
          { label: 'Sales Report', to: '/reports/sales' },
          { label: 'Service Report', to: '/reports/service' },
          { label: 'Profit Report', to: '/reports/profit' },
        ]} />

        <SidebarItem label="Settings" icon={MdSettings} childrenItems={[
          { label: 'General Settings', to: '/settings' },
          { label: 'Profile', to: '/settings/profile' },
          { label: 'Backup / Restore', to: '/settings/backup-restore' },
        ]} />
      </nav>
    </aside>
  )
}

export default Sidebar


