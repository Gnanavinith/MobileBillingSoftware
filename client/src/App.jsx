import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar'

import Dashboard from './pages/Dashboard'
import NewBill from './pages/Billing/NewBill'
import ServiceBill from './pages/Billing/ServiceBill'
import ManageDealers from './pages/Dealers/ManageDealers'
import DealerHistory from './pages/Dealers/DealerHistory'
import AddPurchase from './pages/Purchases/AddPurchase'
import PurchaseHistory from './pages/Purchases/PurchaseHistory'
import Mobiles from './pages/Inventory/Mobiles'
import Accessories from './pages/Inventory/Accessories'
import ServiceRequests from './pages/Services/ServiceRequests'
import ServiceHistory from './pages/Services/ServiceHistory'
import NewTransfer from './pages/Transfers/NewTransfer'
import TransferHistory from './pages/Transfers/TransferHistory'
import SalesReport from './pages/Reports/SalesReport'
import ServiceReport from './pages/Reports/ServiceReport'
import ProfitReport from './pages/Reports/ProfitReport'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Settings/Profile'
import BackupRestore from './pages/Settings/BackupRestore'

const App = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Navbar />
            <main className="p-2">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/billing/new" element={<NewBill />} />
                <Route path="/billing/service" element={<ServiceBill />} />

                <Route path="/dealers/manage" element={<ManageDealers />} />
                <Route path="/dealers/history" element={<DealerHistory />} />

                <Route path="/purchases/add" element={<AddPurchase />} />
                <Route path="/purchases/history" element={<PurchaseHistory />} />

                <Route path="/inventory/mobiles" element={<Mobiles />} />
                <Route path="/inventory/accessories" element={<Accessories />} />

                <Route path="/services/requests" element={<ServiceRequests />} />
                <Route path="/services/history" element={<ServiceHistory />} />

                <Route path="/transfers/new" element={<NewTransfer />} />
                <Route path="/transfers/history" element={<TransferHistory />} />

                <Route path="/reports/sales" element={<SalesReport />} />
                <Route path="/reports/service" element={<ServiceReport />} />
                <Route path="/reports/profit" element={<ProfitReport />} />

                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route path="/settings/backup-restore" element={<BackupRestore />} />

                <Route path="*" element={<div className="p-4">Not Found</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
