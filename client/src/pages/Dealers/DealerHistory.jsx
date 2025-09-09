import React, { useEffect, useMemo, useState } from 'react'

const purchasesKey = 'mobilebill:dealerPurchases'
const dealersKey = 'mobilebill:dealers'

const DealerHistory = () => {
  const [purchases, setPurchases] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(purchasesKey) || '[]')
      setPurchases(Array.isArray(saved) ? saved : [])
    } catch { setPurchases([]) }
    try {
      const savedDealers = JSON.parse(localStorage.getItem(dealersKey) || '[]')
      setDealers(Array.isArray(savedDealers) ? savedDealers : [])
    } catch { setDealers([]) }
  }, [])

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const fromTs = from ? new Date(from).getTime() : 0
    const toTs = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER
    return purchases.filter(p => {
      const ts = new Date(p.date).getTime()
      const matchesQ = !ql || p.dealerName.toLowerCase().includes(ql) || p.dealerId.toLowerCase().includes(ql)
      return ts >= fromTs && ts <= toTs && matchesQ
    })
  }, [purchases, q, from, to])

  const totals = useMemo(() => {
    let subtotal = 0
    let gst = 0
    let total = 0
    filtered.forEach(p => {
      subtotal += p.unitPrice * p.quantity
      const net = Math.max(subtotal - (p.discount || 0), 0)
      const rowGst = net * ((p.gstPercent || 0) / 100)
      gst += rowGst
      total += net + rowGst
    })
    return { subtotal, gst, total }
  }, [filtered])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dealer History</h1>
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dealer name / ID" className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50" onClick={() => { setQ(''); setFrom(''); setTo('') }}>Reset</button>
            <button className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase">
                <th className="py-2 pr-4">Dealer</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Unit Price</th>
                <th className="py-2 pr-4">GST%</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Mode</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-2">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className="py-3 pr-4" colSpan={9}>No records found.</td></tr>
              ) : (
                filtered.map((p, i) => {
                  const net = Math.max(p.unitPrice * p.quantity - (p.discount || 0), 0)
                  const rowGst = net * ((p.gstPercent || 0) / 100)
                  const total = net + rowGst
                  return (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2 pr-4">{p.dealerName} ({p.dealerId})</td>
                      <td className="py-2 pr-4">{p.product}</td>
                      <td className="py-2 pr-4">{p.quantity}</td>
                      <td className="py-2 pr-4">{p.unitPrice}</td>
                      <td className="py-2 pr-4">{p.gstPercent}</td>
                      <td className="py-2 pr-4">{total.toFixed(2)}</td>
                      <td className="py-2 pr-4">{p.mode}</td>
                      <td className="py-2 pr-4">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="py-2 pr-2"><button className="text-blue-600 hover:underline">View</button></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm text-slate-600">Subtotal</div>
            <div className="text-lg font-semibold">{totals.subtotal.toFixed(2)}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm text-slate-600">GST</div>
            <div className="text-lg font-semibold">{totals.gst.toFixed(2)}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="text-sm text-slate-600">Total</div>
            <div className="text-lg font-semibold">{totals.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealerHistory


