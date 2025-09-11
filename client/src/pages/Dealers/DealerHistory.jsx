import React, { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const apiBase = ''

const DealerHistory = () => {
  const [purchases, setPurchases] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          fetch(`${apiBase}/api/purchases`),
          fetch(`${apiBase}/api/dealers`),
        ])
        const p = await pRes.json()
        const d = await dRes.json()
        setPurchases(Array.isArray(p) ? p : [])
        setDealers(Array.isArray(d) ? d : [])
      } catch {
        setPurchases([])
        setDealers([])
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const fromTs = from ? new Date(from).getTime() : 0
    const toTs = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER
    return purchases.flatMap(p => {
      const dealer = dealers.find(d => d.id === p.dealerId)
      const dealerName = dealer ? dealer.name : 'Unknown'
      const ts = new Date(p.purchaseDate).getTime()
      if (ts < fromTs || ts > toTs) return []
      const dealerMatches = !ql || dealerName.toLowerCase().includes(ql) || (p.dealerId || '').toLowerCase().includes(ql)
      if (!dealerMatches) return []
      return p.items.map(it => ({
        dealerName,
        dealerId: p.dealerId,
        product: `${it.productName} ${it.model ? `(${it.model})` : ''}`.trim(),
        quantity: it.quantity,
        unitPrice: it.purchasePrice,
        gstPercent: p.gstEnabled ? p.gstPercentage : 0,
        discount: 0,
        mode: p.paymentMode,
        date: p.purchaseDate,
        invoice: p.invoiceNumber,
      }))
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

  const makeInvoicePdf = (row) => {
    const doc = new jsPDF()
    const dealerLine = `${row.dealerName} (${row.dealerId})`

    doc.setFontSize(16)
    doc.text('Dealer Purchase Invoice', 14, 18)
    doc.setFontSize(10)
    doc.text(`Dealer: ${dealerLine}`, 14, 26)
    doc.text(`Date: ${new Date(row.date).toLocaleDateString()}`, 14, 31)
    doc.text(`Invoice: ${row.invoice}`, 14, 36)

    autoTable(doc, {
      startY: 42,
      head: [['Product', 'Qty', 'Unit Price', 'GST%', 'Total']],
      body: [[row.product, String(row.quantity), String(row.unitPrice), String(row.gstPercent || 0), (Math.max(row.unitPrice * row.quantity - (row.discount || 0), 0) * (1 + (row.gstPercent || 0)/100)).toFixed(2)]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] },
    })

    const safe = (s) => String(s).replace(/[^a-z0-9-_]+/gi, '_')
    const filename = `${safe(row.dealerName)}_${safe(new Date(row.date).toLocaleDateString())}.pdf`
    return { doc, filename }
  }

  const downloadInvoice = (row) => {
    try {
      const { doc, filename } = makeInvoicePdf(row)
      doc.save(filename)
    } catch (e) {
      alert('Failed to download invoice: ' + (e?.message || e))
    }
  }

  const printInvoice = (row) => {
    try {
      const { doc } = makeInvoicePdf(row)
      doc.autoPrint()
      const url = doc.output('bloburl')
      window.open(url, '_blank')
    } catch (e) {
      alert('Failed to print invoice: ' + (e?.message || e))
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dealer History</h1>
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search dealer name / ID" className="rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all px-4 py-2.5" />
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all px-4 py-2.5" />
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold" onClick={() => { setQ(''); setFrom(''); setTo('') }}>Reset</button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-semibold" onClick={() => window.print()}>Print</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 text-xs uppercase bg-gradient-to-r from-indigo-50 to-blue-50">
                <th className="py-2 pr-4">Dealer</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Unit Price</th>
                <th className="py-2 pr-4">GST%</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Mode</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-2">Invoice</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className="py-6 pr-4 text-center text-slate-500" colSpan={9}>No records found.</td></tr>
              ) : (
                filtered.map((p, i) => {
                  const net = Math.max(p.unitPrice * p.quantity - (p.discount || 0), 0)
                  const rowGst = net * ((p.gstPercent || 0) / 100)
                  const total = net + rowGst
                  return (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-2 pr-4 text-slate-900">{p.dealerName} ({p.dealerId})</td>
                      <td className="py-2 pr-4 text-slate-900">{p.product}</td>
                      <td className="py-2 pr-4 text-slate-900">{p.quantity}</td>
                      <td className="py-2 pr-4 text-slate-900">{p.unitPrice}</td>
                      <td className="py-2 pr-4 text-slate-900">{p.gstPercent}</td>
                      <td className="py-2 pr-4 text-slate-900">{total.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-slate-900">{p.mode}</td>
                      <td className="py-2 pr-4 text-slate-900">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="py-2 pr-2 text-slate-900">{p.invoice}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <button onClick={() => printInvoice(p)} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">Print</button>
                          <button onClick={() => downloadInvoice(p)} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">Download</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border-2 border-slate-200 p-4 bg-gradient-to-br from-slate-50 to-white shadow-sm">
            <div className="text-sm font-semibold text-slate-700">Subtotal</div>
            <div className="text-2xl font-bold text-slate-900">{totals.subtotal.toFixed(2)}</div>
          </div>
          <div className="rounded-2xl border-2 border-blue-200 p-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
            <div className="text-sm font-semibold text-blue-700">GST</div>
            <div className="text-2xl font-bold text-blue-900">{totals.gst.toFixed(2)}</div>
          </div>
          <div className="rounded-2xl border-2 border-indigo-200 p-4 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
            <div className="text-sm font-semibold text-indigo-700">Total</div>
            <div className="text-2xl font-extrabold text-indigo-900">{totals.total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealerHistory


