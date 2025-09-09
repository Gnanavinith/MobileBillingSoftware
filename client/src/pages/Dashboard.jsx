import React from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area } from 'recharts'
import { MdTrendingUp, MdShoppingBag, MdBuild, MdShowChart, MdWarningAmber, MdAddShoppingCart, MdPlayForWork, MdHomeRepairService, MdCompareArrows } from 'react-icons/md'

const monthlyRevenueData = [
  { name: 'Jan', revenue: 120000 },
  { name: 'Feb', revenue: 135000 },
  { name: 'Mar', revenue: 150000 },
  { name: 'Apr', revenue: 142000 },
  { name: 'May', revenue: 158000 },
  { name: 'Jun', revenue: 165000 },
  { name: 'Jul', revenue: 172000 },
  { name: 'Aug', revenue: 168000 },
  { name: 'Sep', revenue: 180000 },
  { name: 'Oct', revenue: 190000 },
  { name: 'Nov', revenue: 200000 },
  { name: 'Dec', revenue: 220000 },
]

const profitExpenseData = [
  { name: 'Jan', profit: 40000, gst: 6000, expenses: 25000 },
  { name: 'Feb', profit: 42000, gst: 6300, expenses: 26000 },
  { name: 'Mar', profit: 45000, gst: 6700, expenses: 27000 },
  { name: 'Apr', profit: 43000, gst: 6500, expenses: 28000 },
  { name: 'May', profit: 47000, gst: 7000, expenses: 29000 },
  { name: 'Jun', profit: 49000, gst: 7300, expenses: 30000 },
  { name: 'Jul', profit: 50000, gst: 7500, expenses: 30500 },
  { name: 'Aug', profit: 49500, gst: 7400, expenses: 30200 },
  { name: 'Sep', profit: 52000, gst: 7800, expenses: 31000 },
  { name: 'Oct', profit: 54000, gst: 8100, expenses: 32000 },
  { name: 'Nov', profit: 56000, gst: 8400, expenses: 33500 },
  { name: 'Dec', profit: 60000, gst: 9000, expenses: 35000 },
]

const serviceSummaryData = [
  { name: 'Jan', services: 45 },
  { name: 'Feb', services: 52 },
  { name: 'Mar', services: 58 },
  { name: 'Apr', services: 50 },
  { name: 'May', services: 61 },
  { name: 'Jun', services: 66 },
  { name: 'Jul', services: 72 },
  { name: 'Aug', services: 70 },
  { name: 'Sep', services: 76 },
  { name: 'Oct', services: 80 },
  { name: 'Nov', services: 83 },
  { name: 'Dec', services: 90 },
]

const recentPurchases = [
  { dealer: 'Tech Hub', product: 'iPhone 14', amount: 80000, date: '2025-01-12' },
  { dealer: 'Gadget Store', product: 'Samsung A55', amount: 42000, date: '2025-01-10' },
  { dealer: 'Mobile Mart', product: 'AirPods Pro', amount: 18000, date: '2025-01-08' },
]

const recentSales = [
  { customer: 'Ravi Kumar', product: 'Redmi Note 13', amount: 21000, date: '2025-01-12' },
  { customer: 'Anjali Sharma', product: 'Vivo V30', amount: 32000, date: '2025-01-11' },
  { customer: 'Aarav Singh', product: 'iPhone 13', amount: 52000, date: '2025-01-09' },
]

const recentServices = [
  { ticket: 'SR-1023', device: 'OnePlus 9', amount: 2500, date: '2025-01-11' },
  { ticket: 'SR-1022', device: 'iPhone 12', amount: 3200, date: '2025-01-10' },
  { ticket: 'SR-1021', device: 'Samsung S21', amount: 2900, date: '2025-01-09' },
]

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
  const totalRevenueThisMonth = 220000
  const totalSales = 320
  const totalServices = 90
  const profitMargin = 27.5
  const lowStockAlerts = 8

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
        <KpiCard icon={MdTrendingUp} title="Total Revenue (This Month)" value={formatCurrencyInr(totalRevenueThisMonth)} sub="Compared to last month: +8%" />
        <KpiCard icon={MdShoppingBag} title="Total Sales (Mobiles + Accessories)" value={`${totalSales}`} sub="Units sold this month" />
        <KpiCard icon={MdBuild} title="Total Services" value={`${totalServices}`} sub="Tickets closed this month" />
        <KpiCard icon={MdShowChart} title="Profit Margin" value={`${profitMargin}%`} sub="Net margin this month" />
        <KpiCard icon={MdWarningAmber} title="Low Stock Alerts" value={`${lowStockAlerts}`} sub="Items below threshold" />
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


