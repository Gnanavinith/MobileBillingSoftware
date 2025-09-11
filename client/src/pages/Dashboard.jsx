import React from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts'
import { MdTrendingUp, MdShoppingBag, MdBuild, MdShowChart, MdWarningAmber, MdAddShoppingCart, MdPlayForWork, MdHomeRepairService, MdCompareArrows } from 'react-icons/md'

const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const monthlyRevenueDataDefault = []

const profitExpenseDataDefault = []

const serviceSummaryDataDefault = []

const recentPurchasesDefault = []
const recentSalesDefault = []
const recentServicesDefault = []

const formatCurrencyInr = (value) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
  } catch {
    return `₹${value}`
  }
}

const KpiCard = ({ icon: Icon, title, value, sub, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-700"
  }
  
  return (
    <div className={`rounded-2xl ${colorClasses[color]} border p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <div className="text-sm font-medium opacity-80 mb-1">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
        {Icon ? <Icon className="text-4xl opacity-80 animate-pulse" /> : null}
      </div>
      {sub ? <div className="mt-3 text-xs font-medium opacity-70">{sub}</div> : null}
    </div>
  )
}

const Card = ({ title, children, right, gradient = false }) => (
  <div className={`rounded-2xl ${gradient ? 'bg-gradient-to-br from-white to-slate-50' : 'bg-white'} border border-slate-200 p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-slate-800 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{title}</h2>
      {right}
    </div>
    <div className="animate-fade-in-up">
      {children}
    </div>
  </div>
)

const Dashboard = () => {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [kpis, setKpis] = React.useState({ totalRevenueThisMonth: 0, totalSales: 0, totalServices: 0, profitMargin: 0, lowStockAlerts: 0 })
  const [monthlyRevenueData, setMonthlyRevenueData] = React.useState(monthlyRevenueDataDefault)
  const [profitExpenseData, setProfitExpenseData] = React.useState(profitExpenseDataDefault)
  const [serviceSummaryData, setServiceSummaryData] = React.useState(serviceSummaryDataDefault)
  const [recentPurchases, setRecentPurchases] = React.useState(recentPurchasesDefault)
  const [recentSales, setRecentSales] = React.useState(recentSalesDefault)
  const [recentServices, setRecentServices] = React.useState(recentServicesDefault)

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/dashboard/summary`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load dashboard')
        if (!mounted) return
        setKpis(data?.kpis || kpis)
        setMonthlyRevenueData(data?.charts?.monthlyRevenueData || [])
        setProfitExpenseData(data?.charts?.profitExpenseData || [])
        setServiceSummaryData(data?.charts?.serviceSummaryData || [])
        setRecentPurchases(data?.recent?.purchases || [])
        setRecentSales(data?.recent?.sales || [])
        setRecentServices(data?.recent?.services || [])
        setError('')
      } catch (e) {
        setError(String(e?.message || e))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-slate-600 mb-8">Welcome to your business overview</p>
      </div>

      {/* KPI Cards */}
      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">{error}</div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        <div className="animate-slide-in-left" style={{animationDelay: '0.1s'}}>
          <KpiCard icon={MdTrendingUp} title="Total Revenue (This Month)" value={formatCurrencyInr(kpis.totalRevenueThisMonth)} sub="Last 30 days" color="green" />
        </div>
        <div className="animate-slide-in-left" style={{animationDelay: '0.2s'}}>
          <KpiCard icon={MdShoppingBag} title="Total Sales (Mobiles + Accessories)" value={`${kpis.totalSales}`} sub="Units sold this month" color="blue" />
        </div>
        <div className="animate-slide-in-left" style={{animationDelay: '0.3s'}}>
          <KpiCard icon={MdBuild} title="Total Services" value={`${kpis.totalServices}`} sub="Tickets closed this month" color="purple" />
        </div>
        <div className="animate-slide-in-left" style={{animationDelay: '0.4s'}}>
          <KpiCard icon={MdShowChart} title="Profit Margin" value={`${kpis.profitMargin}%`} sub="Approximate" color="orange" />
        </div>
        <div className="animate-slide-in-left" style={{animationDelay: '0.5s'}}>
          <KpiCard icon={MdWarningAmber} title="Low Stock Alerts" value={`${kpis.lowStockAlerts}`} sub="Items below threshold" color="red" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="xl:col-span-2 animate-slide-in-up" style={{animationDelay: '0.6s'}}>
          <Card title="📈 Month-wise Revenue" gradient={true}>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip 
                    formatter={(v) => formatCurrencyInr(v)} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} 
                    name="Revenue"
                    strokeDasharray="0"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="animate-slide-in-up" style={{animationDelay: '0.7s'}}>
          <Card title="💰 Profit vs Expense" gradient={true}>
            <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip 
                    formatter={(v) => formatCurrencyInr(v)} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="gst" fill="#8b5cf6" name="GST" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="animate-slide-in-up" style={{animationDelay: '0.8s'}}>
          <Card title="🔧 Service Summary" gradient={true}>
            <div className="h-80 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serviceSummaryData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="services" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorServices)" 
                    name="Services" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-in-up" style={{animationDelay: '0.9s'}}>
        <Card title="⚡ Quick Actions" gradient={true}>
          <div className="flex flex-wrap gap-4">
            <Link to="/billing/new" className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <MdAddShoppingCart className="text-xl group-hover:animate-bounce" />
              <span className="font-semibold">New Bill</span>
            </Link>
            <Link to="/purchases/add" className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <MdPlayForWork className="text-xl group-hover:animate-bounce" />
              <span className="font-semibold">Add Purchase</span>
            </Link>
            <Link to="/services/requests" className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <MdHomeRepairService className="text-xl group-hover:animate-bounce" />
              <span className="font-semibold">New Service</span>
            </Link>
            <Link to="/transfers/new" className="group inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <MdCompareArrows className="text-xl group-hover:animate-bounce" />
              <span className="font-semibold">Transfer</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="animate-slide-in-up" style={{animationDelay: '1.0s'}}>
          <Card title="🛒 Recent Dealer Purchases" gradient={true}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 text-xs uppercase font-semibold">
                    <th className="py-3 pr-4">Dealer</th>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium">{row.dealer}</td>
                      <td className="py-3 pr-4">{row.product}</td>
                      <td className="py-3 pr-4 font-semibold text-green-600">{formatCurrencyInr(row.amount)}</td>
                      <td className="py-3 text-slate-500">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="animate-slide-in-up" style={{animationDelay: '1.1s'}}>
          <Card title="💳 Recent Sales Invoices" gradient={true}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 text-xs uppercase font-semibold">
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium">{row.customer}</td>
                      <td className="py-3 pr-4">{row.product}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-600">{formatCurrencyInr(row.amount)}</td>
                      <td className="py-3 text-slate-500">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="animate-slide-in-up" style={{animationDelay: '1.2s'}}>
          <Card title="🔧 Recent Service Bills" gradient={true}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 text-xs uppercase font-semibold">
                    <th className="py-3 pr-4">Ticket</th>
                    <th className="py-3 pr-4">Device</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentServices.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-medium">{row.ticket}</td>
                      <td className="py-3 pr-4">{row.device}</td>
                      <td className="py-3 pr-4 font-semibold text-purple-600">{formatCurrencyInr(row.amount)}</td>
                      <td className="py-3 text-slate-500">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


