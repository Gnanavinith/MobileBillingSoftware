import React, { Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'

// Dynamic imports for code splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const NewBill = React.lazy(() => import('./pages/Billing/NewBill'))
const SecondHandMobilesBilling = React.lazy(() => import('./pages/Billing/SecondHandMobilesBilling'))
const ManageDealers = React.lazy(() => import('./pages/Dealers/ManageDealers'))
const DealerHistory = React.lazy(() => import('./pages/Dealers/DealerHistory'))
const AddPurchase = React.lazy(() => import('./pages/Purchases/AddPurchase'))
const PurchaseHistory = React.lazy(() => import('./pages/Purchases/PurchaseHistory'))
const Mobiles = React.lazy(() => import('./pages/Inventory/Mobiles'))
const Accessories = React.lazy(() => import('./pages/Inventory/Accessories'))
const ServiceRequests = React.lazy(() => import('./pages/Services/ServiceRequests'))
const ServiceHistory = React.lazy(() => import('./pages/Services/ServiceHistory'))
const ServiceBill = React.lazy(() => import('./pages/Billing/ServiceBill'))
const NewTransfer = React.lazy(() => import('./pages/Transfers/NewTransfer'))
const TransferHistory = React.lazy(() => import('./pages/Transfers/TransferHistory'))
const SalesReport = React.lazy(() => import('./pages/Reports/SalesReport'))
const ServiceReport = React.lazy(() => import('./pages/Reports/ServiceReport'))
const ProfitReport = React.lazy(() => import('./pages/Reports/ProfitReport'))
const Settings = React.lazy(() => import('./pages/Settings/Settings'))
const Profile = React.lazy(() => import('./pages/Settings/Profile'))
const BackupRestore = React.lazy(() => import('./pages/Settings/BackupRestore'))
const MobilesStock = React.lazy(() => import('./pages/Stock/MobilesStock'))
const AccessoriesStock = React.lazy(() => import('./pages/Stock/AccessoriesStock'))
const SecondHandMobiles = React.lazy(() => import('./SecondHandMobile/SecondHandMobiles'))
const SecondHandMobilesHistory = React.lazy(() => import('./SecondHandMobile/SecondHandMobilesHistory'))
const Notifications = React.lazy(() => import('./pages/Notifications'))

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-slate-600">Loading...</span>
  </div>
)

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
              <Suspense fallback={<LoadingSpinner />}>
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
              </Suspense>
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
