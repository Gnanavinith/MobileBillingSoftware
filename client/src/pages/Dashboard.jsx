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

const KpiCard = ({ icon: Icon, title, value, sub }) => (
  <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
      {Icon ? <Icon className="text-3xl text-slate-600" /> : null}
    </div>
    {sub ? <div className="mt-2 text-xs text-slate-500">{sub}</div> : null}
  </div>
)

const Card = ({ title, children, right }) => (
  <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {right}
    </div>
    {children}
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
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* KPI Cards */}
      {error ? (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
        <KpiCard icon={MdTrendingUp} title="Total Revenue (This Month)" value={formatCurrencyInr(kpis.totalRevenueThisMonth)} sub="Last 30 days" />
        <KpiCard icon={MdShoppingBag} title="Total Sales (Mobiles + Accessories)" value={`${kpis.totalSales}`} sub="Units sold this month" />
        <KpiCard icon={MdBuild} title="Total Services" value={`${kpis.totalServices}`} sub="Tickets closed this month" />
        <KpiCard icon={MdShowChart} title="Profit Margin" value={`${kpis.profitMargin}%`} sub="Approximate" />
        <KpiCard icon={MdWarningAmber} title="Low Stock Alerts" value={`${kpis.lowStockAlerts}`} sub="Items below threshold" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <div className="xl:col-span-2">
          <Card title="Month-wise Revenue">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => formatCurrencyInr(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="Profit vs Expense">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitExpenseData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => formatCurrencyInr(v)} />
                <Legend />
                <Bar dataKey="profit" fill="#22c55e" name="Profit" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gst" fill="#8b5cf6" name="GST" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Service Summary">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serviceSummaryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="services" stroke="#06b6d4" fillOpacity={1} fill="url(#colorServices)" name="Services" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link to="/billing/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow transition-all">
            <MdAddShoppingCart className="text-lg" />
            <span>New Bill</span>
          </Link>
          <Link to="/purchases/add" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow transition-all">
            <MdPlayForWork className="text-lg" />
            <span>Add Purchase</span>
          </Link>
          <Link to="/services/requests" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow transition-all">
            <MdHomeRepairService className="text-lg" />
            <span>New Service</span>
          </Link>
          <Link to="/transfers/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow transition-all">
            <MdCompareArrows className="text-lg" />
            <span>Transfer</span>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card title="Recent Dealer Purchases">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{row.dealer}</td>
                    <td className="py-2 pr-4">{row.product}</td>
                    <td className="py-2 pr-4">{formatCurrencyInr(row.amount)}</td>
                    <td className="py-2">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent Sales Invoices">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{row.customer}</td>
                    <td className="py-2 pr-4">{row.product}</td>
                    <td className="py-2 pr-4">{formatCurrencyInr(row.amount)}</td>
                    <td className="py-2">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent Service Bills">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Ticket</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentServices.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{row.ticket}</td>
                    <td className="py-2 pr-4">{row.device}</td>
                    <td className="py-2 pr-4">{formatCurrencyInr(row.amount)}</td>
                    <td className="py-2">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard


