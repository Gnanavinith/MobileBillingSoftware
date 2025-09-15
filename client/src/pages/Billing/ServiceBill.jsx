import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const emptyPart = () => ({ name: '', productId: '', quantity: 1, price: 0, gstPercent: 18, discountType: 'percent', discountValue: 0 })

const ServiceBill = () => {
  const location = useLocation()
  const incoming = location?.state?.service
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [modelName, setModelName] = useState('')
  const [imei, setImei] = useState('')
  const [idProofUrl, setIdProofUrl] = useState('')
  const [problem, setProblem] = useState('')
  const [laborCost, setLaborCost] = useState(0)
  const [parts, setParts] = useState([])
  const [draftPart, setDraftPart] = useState(emptyPart())
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [serviceBillNumber] = useState(() => `SRV-${Date.now().toString().slice(-6)}`)
  const [serviceIdLookup, setServiceIdLookup] = useState('')
  const [phoneLookup, setPhoneLookup] = useState('')
  const [advancePaid, setAdvancePaid] = useState(0)
  const [billDiscountPercent, setBillDiscountPercent] = useState(0)
  const [billGstPercent, setBillGstPercent] = useState(0)
  const invoiceRef = useRef(null)

  // Prefill from service request if provided
  useEffect(() => {
    if (incoming) {
      setCustomerName(incoming?.customerDetails?.name || '')
      setPhoneNumber(incoming?.customerDetails?.phone || '')
      setAddress(incoming?.customerDetails?.address || '')
      setModelName(incoming?.deviceDetails?.model || '')
      setImei(incoming?.deviceDetails?.imei || '')
      setProblem(incoming?.deviceDetails?.problemDescription || '')
      const partsFromRequest = Array.isArray(incoming?.serviceDetails?.serviceParts)
        ? incoming.serviceDetails.serviceParts.map(p => ({
            name: p.partName || '',
            productId: p.partId || '',
            quantity: Number(p.quantity) || 1,
            price: Number(p.unitPrice) || 0,
            gstPercent: Number(incoming?.serviceDetails?.gstPercentage) || 18,
            discountType: 'percent',
            discountValue: Number(incoming?.serviceDetails?.discount) || 0,
          }))
        : []
      setParts(partsFromRequest)
      setLaborCost(Number(incoming?.serviceDetails?.estimatedCost) || 0)
      setPaymentMethod(incoming?.serviceDetails?.paymentMode || 'Cash')
    }
  }, [incoming])

  const removePart = (index) => setParts(prev => prev.filter((_, i) => i !== index))
  const addDraftPart = () => {
    const qty = Number(draftPart.quantity) || 0
    const price = Number(draftPart.price) || 0
    if (!draftPart.name || qty <= 0 || price < 0) return
    setParts(prev => [...prev, { ...draftPart }])
    setDraftPart(emptyPart())
  }
  const clearDraftPart = () => setDraftPart(emptyPart())
  const removeLastPart = () => setParts(prev => prev.slice(0, -1))

  const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

  const lookupPartByProductId = async () => {
    const id = String(draftPart.productId || '').trim()
    if (!id) return
    try {
      const res = await fetch(`${apiBase}/api/accessories?productId=${encodeURIComponent(id)}`)
      const data = await res.json()
      const row = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!row) { alert('No accessory found for this Product ID'); return }
      setDraftPart(prev => ({
        ...prev,
        name: row.productName || prev.name,
        price: Number(row.sellingPrice ?? row.unitPrice) || prev.price,
      }))
    } catch (e) {
      alert('Failed to fetch accessory')
    }
  }

  const draftPartActive = useMemo(() => {
    const qty = Number(draftPart.quantity) || 0
    const price = Number(draftPart.price) || 0
    return qty > 0 && price > 0
  }, [draftPart])

  const calc = useMemo(() => {
    const partsForCalc = draftPartActive ? [...parts, draftPart] : parts
    let partsSubtotal = 0
    let partsDiscounts = 0
    let partsGst = 0

    partsForCalc.forEach(p => {
      const qty = Number(p.quantity) || 0
      const price = Number(p.price) || 0
      const gross = qty * price
      let discount = 0
      if (p.discountType === 'percent') discount = gross * ((Number(p.discountValue) || 0) / 100)
      if (p.discountType === 'flat') discount = Number(p.discountValue) || 0
      const net = Math.max(gross - discount, 0)
      const gst = net * ((Number(p.gstPercent) || 0) / 100)
      partsSubtotal += net
      partsDiscounts += discount
      partsGst += gst
    })

    const labor = Number(laborCost) || 0
    const subtotal = partsSubtotal + labor

    // Bill-level discount (on top of line discounts)
    const billLevelDiscount = Math.max(0, (Number(billDiscountPercent) || 0) * subtotal / 100)
    const afterBillDiscount = Math.max(subtotal - billLevelDiscount, 0)

    // GST: either per-part (default) or bill-level override
    const gstOverride = Number(billGstPercent) || 0
    const gstTotal = gstOverride > 0 ? (afterBillDiscount * gstOverride / 100) : partsGst
    const cgst = gstTotal / 2
    const sgst = gstTotal / 2
    const grandTotal = afterBillDiscount + gstTotal

    return { partsSubtotal, partsDiscounts, partsGst, labor, subtotal, billLevelDiscount, afterBillDiscount, gstTotal, cgst, sgst, grandTotal }
  }, [parts, laborCost, draftPartActive, draftPart, billDiscountPercent, billGstPercent])

  const printInvoice = () => window.print()

  const exportPdf = async () => {
    const element = invoiceRef.current
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgProps = pdf.getImageProperties(imgData)
    const imgWidth = pageWidth
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight - pageHeight
      while (heightLeft > 0) {
        pdf.addPage()
        position = heightLeft * -1
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }
    pdf.save(`${serviceBillNumber}.pdf`)
  }

  const now = new Date()

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="print:hidden">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Service Billing</h1>

      {/* Lookup existing service by ID and Phone */}
      <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-lg">
        <div className="text-lg font-semibold mb-3">Lookup Service</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Service ID</label>
            <input value={serviceIdLookup} onChange={e=>setServiceIdLookup(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="SRV-XXXXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input value={phoneLookup} onChange={e=>setPhoneLookup(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Customer phone" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                try {
                  const saved = JSON.parse(localStorage.getItem('mobilebill:services') || '[]')
                  const svc = saved.find(s => String(s.id).trim() === String(serviceIdLookup).trim() && String(s.customerDetails?.phone||'').trim() === String(phoneLookup).trim())
                  if (!svc) { alert('Service not found'); return }
                  setCustomerName(svc.customerDetails?.name||'')
                  setPhoneNumber(svc.customerDetails?.phone||'')
                  setAddress(svc.customerDetails?.address||'')
                  setModelName(svc.deviceDetails?.model||'')
                  setImei(svc.deviceDetails?.imei||'')
                  setProblem(svc.deviceDetails?.problemDescription||'')
                  const partsFromRequest = Array.isArray(svc?.serviceDetails?.serviceParts)
                    ? svc.serviceDetails.serviceParts.map(p => ({
                        name: p.partName || '',
                        productId: p.partId || '',
                        quantity: Number(p.quantity) || 1,
                        price: Number(p.unitPrice) || 0,
                        gstPercent: Number(svc?.serviceDetails?.gstPercentage) || 18,
                        discountType: 'percent',
                        discountValue: Number(svc?.serviceDetails?.discount) || 0,
                      }))
                    : []
                  setParts(partsFromRequest)
                  setLaborCost(Number(svc?.serviceDetails?.estimatedCost) || 0)
                  setPaymentMethod(svc?.serviceDetails?.paymentMode || 'Cash')
                  const adv = Number(svc?.serviceDetails?.advancePayment)||0
                  setAdvancePaid(adv)
                } catch (e) { alert('Lookup failed') }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
            >
              Fetch
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Customer & Device</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Mobile Model Name</label>
                <input value={modelName} onChange={e => setModelName(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">IMEI Number</label>
                <input value={imei} onChange={e => setImei(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">ID Proof (URL)</label>
                <input value={idProofUrl} onChange={e => setIdProofUrl(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" placeholder="optional" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Problem Description</label>
                <textarea value={problem} onChange={e => setProblem(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" rows={3} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Mode of Payment</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Add Service Part</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Product ID</label>
                <div className="mt-1 flex gap-2">
                  <input value={draftPart.productId} onChange={e => setDraftPart({ ...draftPart, productId: e.target.value })} className="flex-1 rounded-xl border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all px-4 py-2.5" placeholder="Enter Product ID to auto-fill" />
                  <button type="button" onClick={lookupPartByProductId} disabled={!draftPart.productId} className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">Find</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Part Name</label>
                <input value={draftPart.name} onChange={e => setDraftPart({ ...draftPart, name: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all px-4 py-2.5" placeholder="Search / type" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Quantity</label>
                  <input type="number" value={draftPart.quantity} onChange={e => setDraftPart({ ...draftPart, quantity: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Price per Part</label>
                  <input type="number" value={draftPart.price} onChange={e => setDraftPart({ ...draftPart, price: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">GST %</label>
                  <input type="number" value={draftPart.gstPercent} onChange={e => setDraftPart({ ...draftPart, gstPercent: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Discount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select value={draftPart.discountType} onChange={e => setDraftPart({ ...draftPart, discountType: e.target.value })} className="rounded-xl border-2 border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all px-3 py-2">
                      <option value="percent">% </option>
                      <option value="flat">Flat</option>
                    </select>
                    <input type="number" value={draftPart.discountValue} onChange={e => setDraftPart({ ...draftPart, discountValue: e.target.value })} className="w-full rounded-xl border-2 border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={addDraftPart} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-semibold">Add Part</button>
                <button onClick={clearDraftPart} type="button" className="px-6 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold">Clear</button>
                <button onClick={removeLastPart} type="button" disabled={parts.length === 0} className="px-6 py-2.5 rounded-xl border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold">Remove Last</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Parts & Charges</h2>
            {parts.length === 0 && !draftPartActive ? (
              <div className="text-sm text-slate-500 text-center py-8">No parts added yet.</div>
            ) : (
              <div className="space-y-3">
                {draftPartActive && (
                  <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 flex items-start justify-between shadow-sm">
                    <div>
                      <div className="font-semibold text-amber-800">{draftPart.name || 'New part'} <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Pending</span></div>
                      <div className="mt-1 text-sm text-amber-800">Qty: {draftPart.quantity} • Price: {draftPart.price} • GST: {draftPart.gstPercent}% • Disc: {draftPart.discountType === 'percent' ? `${draftPart.discountValue}%` : `₹${draftPart.discountValue || 0}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-700">Line Total</div>
                      {(() => {
                        const qty = Number(draftPart.quantity) || 0
                        const price = Number(draftPart.price) || 0
                        const gross = qty * price
                        const discount = draftPart.discountType === 'percent' ? gross * ((Number(draftPart.discountValue) || 0) / 100) : (Number(draftPart.discountValue) || 0)
                        const net = Math.max(gross - discount, 0)
                        const gst = net * ((Number(draftPart.gstPercent) || 0) / 100)
                        const total = net + gst
                        return <div className="font-bold text-amber-800">{total.toFixed(2)}</div>
                      })()}
                    </div>
                  </div>
                )}
                {parts.map((p, idx) => {
                  const qty = Number(p.quantity) || 0
                  const price = Number(p.price) || 0
                  const gross = qty * price
                  let discount = 0
                  if (p.discountType === 'percent') discount = gross * ((Number(p.discountValue) || 0) / 100)
                  if (p.discountType === 'flat') discount = Number(p.discountValue) || 0
                  const net = Math.max(gross - discount, 0)
                  const gst = net * ((Number(p.gstPercent) || 0) / 100)
                  const total = net + gst
                  return (
                    <div key={idx} className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-green-800">{p.name || 'Unnamed Part'}</div>
                        <div className="text-xs text-green-700">Product ID: {p.productId || '-'}</div>
                        <div className="mt-1 text-sm text-green-800">Qty: {qty} • Price: {price} • GST: {p.gstPercent}% • Disc: {p.discountType === 'percent' ? `${p.discountValue}%` : `₹${p.discountValue || 0}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-700">Line Total</div>
                        <div className="font-bold text-green-800">{total.toFixed(2)}</div>
                        <button onClick={() => removePart(idx)} className="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors">Remove</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">Service Charges (Labor)</label>
              <input type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} className="mt-1 w-52 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all px-4 py-2.5" />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Bill Discount (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={billDiscountPercent} onChange={e=>setBillDiscountPercent(Number(e.target.value)||0)} className="mt-1 w-52 rounded-xl border-2 border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all px-4 py-2.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Bill GST Override (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={billGstPercent} onChange={e=>setBillGstPercent(Number(e.target.value)||0)} className="mt-1 w-52 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all px-4 py-2.5" />
                <div className="text-xs text-slate-500 mt-1">Leave 0 to use line-item GST.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Service Bill No.</div>
            <div className="font-bold text-slate-900">{serviceBillNumber}</div>
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-700">Date & Time</div>
          <div className="text-slate-900">{now.toLocaleString()}</div>

          <div className="mt-4 space-y-2 text-sm bg-white rounded-xl p-4">
            <div className="flex justify-between"><span className="font-semibold text-slate-700">Parts Subtotal</span><span className="font-bold text-slate-900">{calc.partsSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-rose-600">Parts Discounts</span><span className="font-bold text-rose-600">- {calc.partsDiscounts.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-700">Labor</span><span className="font-bold text-slate-900">{calc.labor.toFixed(2)}</span></div>
            {billDiscountPercent > 0 ? (
              <div className="flex justify-between"><span className="font-semibold text-rose-700">Bill Discount ({billDiscountPercent}%)</span><span className="font-bold text-rose-700">- {calc.billLevelDiscount.toFixed(2)}</span></div>
            ) : null}
            <div className="flex justify-between"><span className="font-semibold text-blue-600">CGST</span><span className="font-bold text-blue-600">{calc.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-blue-600">SGST</span><span className="font-bold text-blue-600">{calc.sgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-indigo-700">GST Total</span><span className="font-bold text-indigo-700">{calc.gstTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-700">Total Amount</span><span className="font-bold text-slate-900">{calc.afterBillDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-700">Total Payment</span><span className="font-bold text-slate-900">{calc.grandTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-emerald-700">Advance Paid</span><span className="font-bold text-emerald-700">-{advancePaid.toFixed(2)}</span></div>
            <div className="pt-3 mt-3 border-t-2 border-indigo-200 flex justify-between items-center text-lg"><span className="font-bold text-indigo-800">Balance</span><span className="font-extrabold text-indigo-800">{Math.max(calc.grandTotal - advancePaid, 0).toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={printInvoice} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-semibold">Print</button>
            <button onClick={exportPdf} className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold">Export PDF</button>
            <button onClick={async ()=>{
              try{
                // Mandatory fields validation
                const nameOk = String(customerName||'').trim().length>0
                const phoneOk = String(phoneNumber||'').trim().length>0
                const addrOk = String(address||'').trim().length>0
                const modelOk = String(modelName||'').trim().length>0
                const imeiOk = String(imei||'').trim().length>0
                const probOk = String(problem||'').trim().length>0
                if(!(nameOk && phoneOk && addrOk && modelOk && imeiOk && probOk)){
                  alert('Please fill all required fields: Customer Name, Phone Number, Address, Mobile Model Name, IMEI Number, and Problem Description.')
                  return
                }
                const payload = {
                  serviceBillNumber,
                  customerName, phoneNumber, address,
                  modelName, imei, idProofUrl, problem,
                  paymentMethod,
                  parts,
                  laborCost: Number(laborCost)||0,
                  partsSubtotal: Number(calc.partsSubtotal)||0,
                  partsDiscounts: Number(calc.partsDiscounts)||0,
                  partsGst: Number(calc.partsGst)||0,
                  cgst: Number(calc.cgst)||0,
                  sgst: Number(calc.sgst)||0,
                  grandTotal: Number(calc.grandTotal)||0,
                }
                const res = await fetch(`${apiBase}/api/service-invoices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                if(!res.ok){ const m = await res.json().catch(()=>({})); throw new Error(m.error||'Failed to save') }
                alert('Service invoice saved')
              }catch(ex){ alert(ex.message) }
            }} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all font-semibold">Save Service Bill</button>
          </div>
        </div>
      </div>
      </div>

      {/* Printable Invoice */}
      <div ref={invoiceRef} className="hidden print:block p-6">
        {/* Business Info Header */}
        {(() => {
          let biz = {}
          try {
            const raw = localStorage.getItem('mobilebill:settings')
            if (raw) {
              const parsed = JSON.parse(raw)
              biz = parsed?.businessInfo || {}
            }
          } catch {}
          const contactLine = [biz?.email, biz?.phone].filter(Boolean).join(' • ')
          return (
            <div className="text-center">
              <div className="text-xl font-semibold">{biz?.businessName || 'Service Invoice'}</div>
              {biz?.address ? <div className="text-xs text-slate-600 mt-0.5">{biz.address}</div> : null}
              {contactLine ? <div className="text-xs text-slate-600 mt-0.5">{contactLine}</div> : null}
              {biz?.gstin ? <div className="text-xs text-slate-600 mt-0.5">GSTIN: {biz.gstin}</div> : null}
            </div>
          )
        })()}
        <div className="mt-2 text-sm">Bill No: {serviceBillNumber} • {now.toLocaleString()}</div>
        <div className="mt-2 text-sm">Customer: {customerName} • {phoneNumber}</div>
        <div className="mt-1 text-sm">Device: {modelName} • IMEI: {imei}</div>
        {address ? <div className="mt-1 text-sm">Address: {address}</div> : null}
        {problem ? <div className="mt-1 text-sm">Problem: {problem}</div> : null}
        <table className="mt-4 w-full text-sm border-t border-b border-slate-300">
          <thead>
            <tr className="text-left">
              <th className="py-1 pr-2">Part</th>
              <th className="py-1 pr-2">Qty</th>
              <th className="py-1 pr-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {(draftPartActive ? [...parts, draftPart] : parts).map((p, idx) => {
              const qty = Number(p.quantity) || 0
              const price = Number(p.price) || 0
              const gross = qty * price
              let discount = 0
              if (p.discountType === 'percent') discount = gross * ((Number(p.discountValue) || 0) / 100)
              if (p.discountType === 'flat') discount = Number(p.discountValue) || 0
              const net = Math.max(gross - discount, 0)
              const gst = net * ((Number(p.gstPercent) || 0) / 100)
              const total = net + gst
              return (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="py-1 pr-2">{p.name}</td>
                  <td className="py-1 pr-2">{qty} (quantity)</td>
                  <td className="py-1 pr-2">{total.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-2 text-right text-sm">
          <div>Parts Subtotal: {calc.partsSubtotal.toFixed(2)}</div>
          <div>Labor: {calc.labor.toFixed(2)}</div>
          {billDiscountPercent > 0 ? <div>Bill Discount ({billDiscountPercent}%): -{calc.billLevelDiscount.toFixed(2)}</div> : null}
          <div>CGST: {calc.cgst.toFixed(2)} • SGST: {calc.sgst.toFixed(2)}</div>
          <div>GST Total: {calc.gstTotal.toFixed(2)}</div>
          <div>Total Amount: {calc.afterBillDiscount.toFixed(2)}</div>
          <div className="font-semibold text-base">Total Payment: {calc.grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default ServiceBill


