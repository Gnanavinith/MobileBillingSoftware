import React from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import NewBill from './pages/Billing/NewBill'
import SecondHandMobilesBilling from './pages/Billing/SecondHandMobilesBilling'
import ManageDealers from './pages/Dealers/ManageDealers'
import DealerHistory from './pages/Dealers/DealerHistory'
import AddPurchase from './pages/Purchases/AddPurchase'
import PurchaseHistory from './pages/Purchases/PurchaseHistory'
import Mobiles from './pages/Inventory/Mobiles'
import Accessories from './pages/Inventory/Accessories'
import ServiceRequests from './pages/Services/ServiceRequests'
import ServiceHistory from './pages/Services/ServiceHistory'
import ServiceBill from './pages/Billing/ServiceBill'
import NewTransfer from './pages/Transfers/NewTransfer'
import TransferHistory from './pages/Transfers/TransferHistory'
import SalesReport from './pages/Reports/SalesReport'
import ServiceReport from './pages/Reports/ServiceReport'
import ProfitReport from './pages/Reports/ProfitReport'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Settings/Profile'
import BackupRestore from './pages/Settings/BackupRestore'
import MobilesStock from './pages/Stock/MobilesStock'
import AccessoriesStock from './pages/Stock/AccessoriesStock'
import SecondHandMobiles from './SecondHandMobile/SecondHandMobiles'
import SecondHandMobilesHistory from './SecondHandMobile/SecondHandMobilesHistory'
import Notifications from './pages/Notifications'

const RequireAuth = ({ children }) => {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

const AppShell = () => {
  const { auth } = useAuth()
  return (
    <HashRouter>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200">
        <div className="flex">
          {auth.isAuthenticated ? <Sidebar /> : null}
          <div className="flex-1">
            {auth.isAuthenticated ? <Navbar /> : null}
            <main className="p-2">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

                <Route path="/billing/new" element={<RequireAuth><NewBill /></RequireAuth>} />
                <Route path="/billing/secondhand" element={<RequireAuth><SecondHandMobilesBilling /></RequireAuth>} />

                <Route path="/dealers/manage" element={<RequireAuth><ManageDealers /></RequireAuth>} />
                <Route path="/dealers/history" element={<RequireAuth><DealerHistory /></RequireAuth>} />

                <Route path="/purchases/add" element={<RequireAuth><AddPurchase /></RequireAuth>} />
                <Route path="/purchases/history" element={<RequireAuth><PurchaseHistory /></RequireAuth>} />

                <Route path="/inventory/mobiles" element={<RequireAuth><Mobiles /></RequireAuth>} />
                <Route path="/inventory/accessories" element={<RequireAuth><Accessories /></RequireAuth>} />

                <Route path="/services/requests" element={<RequireAuth><ServiceRequests /></RequireAuth>} />
                <Route path="/services/history" element={<RequireAuth><ServiceHistory /></RequireAuth>} />
                <Route path="/services/generate-bill" element={<RequireAuth><ServiceBill /></RequireAuth>} />
                <Route path="/billing/service" element={<RequireAuth><ServiceBill /></RequireAuth>} />

                <Route path="/transfers/new" element={<RequireAuth><NewTransfer /></RequireAuth>} />
                <Route path="/transfers/history" element={<RequireAuth><TransferHistory /></RequireAuth>} />

                <Route path="/reports/sales" element={<RequireAuth><SalesReport /></RequireAuth>} />
                <Route path="/reports/service" element={<RequireAuth><ServiceReport /></RequireAuth>} />
                <Route path="/reports/profit" element={<RequireAuth><ProfitReport /></RequireAuth>} />

                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                <Route path="/settings/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/settings/backup-restore" element={<RequireAuth><BackupRestore /></RequireAuth>} />

                <Route path="/stock/mobiles" element={<RequireAuth><MobilesStock /></RequireAuth>} />
                <Route path="/stock/accessories" element={<RequireAuth><AccessoriesStock /></RequireAuth>} />

                <Route path="/secondhand/manage" element={<RequireAuth><SecondHandMobiles /></RequireAuth>} />
                <Route path="/secondhand/history" element={<RequireAuth><SecondHandMobilesHistory /></RequireAuth>} />

                <Route path="*" element={<div className="p-4">Not Found</div>} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </HashRouter>
  )
}

const App = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
)

export default App
