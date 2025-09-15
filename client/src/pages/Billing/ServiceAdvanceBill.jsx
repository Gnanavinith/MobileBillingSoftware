import React, { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ServiceAdvanceBill = () => {
  const location = useLocation()
  const incoming = location?.state?.service

  const [receiptNo] = useState(() => `ADV-${Date.now().toString().slice(-6)}`)
  const [date] = useState(() => new Date())

  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [modelName, setModelName] = useState('')
  const [imei, setImei] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [estimatedTotal, setEstimatedTotal] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const invoiceRef = useRef(null)

  useEffect(() => {
    if (incoming) {
      setCustomerName(incoming?.customerDetails?.name || '')
      setPhoneNumber(incoming?.customerDetails?.phone || '')
      setAddress(incoming?.customerDetails?.address || '')
      setModelName(incoming?.deviceDetails?.model || '')
      setImei(incoming?.deviceDetails?.imei || '')
      setAdvanceAmount(Number(incoming?.serviceDetails?.advancePayment) || 0)
      setPaymentMode(incoming?.serviceDetails?.paymentMode || 'Cash')
      const est = Number(incoming?.calculatedAmounts?.grandTotal) || Number(incoming?.serviceDetails?.estimatedCost)||0
      setEstimatedTotal(est)
      setPendingBalance(Math.max(est - (Number(incoming?.serviceDetails?.advancePayment)||0), 0))
    }
  }, [incoming])

  const printReceipt = () => window.print()

  const businessHeader = () => {
    let biz = {}
    try {
      const raw = localStorage.getItem('mobilebill:settings')
      if (raw) biz = (JSON.parse(raw)?.businessInfo) || {}
    } catch {}
    const contact = [biz?.email, biz?.phone].filter(Boolean).join(' • ')
    return (
      <div className="text-center">
        <div className="text-xl font-semibold">{biz?.businessName || 'Advance Receipt'}</div>
        {biz?.address ? <div className="text-xs text-slate-600 mt-0.5">{biz.address}</div> : null}
        {contact ? <div className="text-xs text-slate-600 mt-0.5">{contact}</div> : null}
        {biz?.gstin ? <div className="text-xs text-slate-600 mt-0.5">GSTIN: {biz.gstin}</div> : null}
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Service Advance Receipt</h1>

      {/* Lookup existing service by ID and Phone */}
      <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-lg">
        <div className="text-lg font-semibold mb-3">Lookup Service</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Service ID</label>
            <input id="adv_lookup_id" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="SRV-XXXXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input id="adv_lookup_phone" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Customer phone" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                try {
                  const id = document.getElementById('adv_lookup_id')?.value?.trim()
                  const phone = document.getElementById('adv_lookup_phone')?.value?.trim()
                  if (!id || !phone) { alert('Enter Service ID and Phone'); return }
                  const saved = JSON.parse(localStorage.getItem('mobilebill:services') || '[]')
                  const svc = saved.find(s => String(s.id).trim() === id && String(s.customerDetails?.phone||'').trim() === phone)
                  if (!svc) { alert('Service not found'); return }
                  setCustomerName(svc.customerDetails?.name||'')
                  setPhoneNumber(svc.customerDetails?.phone||'')
                  setAddress(svc.customerDetails?.address||'')
                  setModelName(svc.deviceDetails?.model||'')
                  setImei(svc.deviceDetails?.imei||'')
                  const adv = Number(svc.serviceDetails?.advancePayment)||0
                  setAdvanceAmount(adv)
                  setPaymentMode(svc.serviceDetails?.paymentMode||'Cash')
                  const est = Number(svc.calculatedAmounts?.grandTotal)||Number(svc.serviceDetails?.estimatedCost)||0
                  setEstimatedTotal(est)
                  setPendingBalance(Math.max(est - adv, 0))
                } catch (e) { alert('Lookup failed') }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
            >
              Fetch
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Customer & Device</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Customer Name</label>
              <input value={customerName} onChange={e=>setCustomerName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Address</label>
              <input value={address} onChange={e=>setAddress(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Model</label>
              <input value={modelName} onChange={e=>setModelName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">IMEI</label>
              <input value={imei} onChange={e=>setImei(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Receipt No.</div>
            <div className="font-bold text-slate-900">{receiptNo}</div>
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-700">Date & Time</div>
          <div className="text-slate-900">{date.toLocaleString()}</div>

          {/* Only the three amounts relevant to final UI view */}
          <div className="mt-4 grid grid-cols-1 gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total Amount</span>
              <span className="text-base font-bold text-slate-900">₹{Number(estimatedTotal||0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Advance Amount</span>
              <span className="text-base font-bold text-emerald-700">₹{Number(advanceAmount||0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm font-semibold text-indigo-800">Pending Amount</span>
              <span className="text-lg font-extrabold text-indigo-800">₹{Number(pendingBalance||0).toFixed(2)}</span>
            </div>
          </div>

          {/* Inputs kept minimal under the summary */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Advance Amount</label>
              <input type="number" value={advanceAmount} onChange={e=>{const v=Number(e.target.value)||0; setAdvanceAmount(v); setPendingBalance(Math.max((Number(estimatedTotal||0))-v,0))}} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Payment Mode</label>
              <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5">
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={printReceipt} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-semibold">Print Receipt</button>
          </div>
        </div>
      </div>

      {/* Printable Receipt */}
      <div ref={invoiceRef} className="hidden print:block p-6">
        {businessHeader()}
        <div className="mt-2 text-sm">Receipt No: {receiptNo} • {date.toLocaleString()}</div>
        <div className="mt-2 text-sm">Customer: {customerName} • {phoneNumber}</div>
        <div className="mt-1 text-sm">Device: {modelName} • IMEI: {imei}</div>
        {address ? <div className="mt-1 text-sm">Address: {address}</div> : null}
        <div className="mt-4 text-sm">
          <div className="flex justify-between"><span className="font-medium">Total Amount</span><span>₹{Number(estimatedTotal||0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="font-medium">Advance Amount</span><span>₹{advanceAmount.toFixed(2)} ({paymentMode})</span></div>
          <div className="flex justify-between font-semibold border-t mt-2 pt-2"><span>Pending Amount</span><span>₹{Number(pendingBalance||0).toFixed(2)}</span></div>
        </div>
        <div className="mt-2 text-xs text-slate-500">This is an advance receipt towards service. Final bill will be issued upon delivery.</div>
      </div>
    </div>
  )
}

export default ServiceAdvanceBill
