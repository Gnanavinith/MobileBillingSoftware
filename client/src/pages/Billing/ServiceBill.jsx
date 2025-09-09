import React, { useMemo, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const emptyPart = () => ({ name: '', quantity: 1, price: 0, gstPercent: 18, discountType: 'percent', discountValue: 0 })

const ServiceBill = () => {
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
  const invoiceRef = useRef(null)

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
    const cgst = partsGst / 2
    const sgst = partsGst / 2
    const grandTotal = subtotal + partsGst

    return { partsSubtotal, partsDiscounts, partsGst, labor, subtotal, cgst, sgst, grandTotal }
  }, [parts, laborCost, draftPartActive, draftPart])

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
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Service Billing</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Customer & Device</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Phone Number</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Mobile Model Name</label>
                <input value={modelName} onChange={e => setModelName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
              </div>
              <div>
                <label className="text-sm text-slate-600">IMEI Number</label>
                <input value={imei} onChange={e => setImei(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
              </div>
              <div>
                <label className="text-sm text-slate-600">ID Proof (URL)</label>
                <input value={idProofUrl} onChange={e => setIdProofUrl(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="optional" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Problem Description</label>
                <textarea value={problem} onChange={e => setProblem(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" rows={3} />
              </div>
              <div>
                <label className="text-sm text-slate-600">Mode of Payment</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Add Service Part</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Part Name</label>
                <input value={draftPart.name} onChange={e => setDraftPart({ ...draftPart, name: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="Search / type" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Quantity</label>
                  <input type="number" value={draftPart.quantity} onChange={e => setDraftPart({ ...draftPart, quantity: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Price per Part</label>
                  <input type="number" value={draftPart.price} onChange={e => setDraftPart({ ...draftPart, price: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">GST %</label>
                  <input type="number" value={draftPart.gstPercent} onChange={e => setDraftPart({ ...draftPart, gstPercent: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Discount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select value={draftPart.discountType} onChange={e => setDraftPart({ ...draftPart, discountType: e.target.value })} className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                      <option value="percent">% </option>
                      <option value="flat">Flat</option>
                    </select>
                    <input type="number" value={draftPart.discountValue} onChange={e => setDraftPart({ ...draftPart, discountValue: e.target.value })} className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={addDraftPart} className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Add Part</button>
                <button onClick={clearDraftPart} type="button" className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">Clear</button>
                <button onClick={removeLastPart} type="button" disabled={parts.length === 0} className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">Remove Last</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Parts & Charges</h2>
            {parts.length === 0 && !draftPartActive ? (
              <div className="text-sm text-slate-500">No parts added yet.</div>
            ) : (
              <div className="space-y-3">
                {draftPartActive && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{draftPart.name || 'New part'} <span className="ml-2 text-xs text-amber-700">Pending (not added)</span></div>
                      <div className="mt-1 text-sm text-slate-700">Qty: {draftPart.quantity} • Price: {draftPart.price} • GST: {draftPart.gstPercent}% • Disc: {draftPart.discountType === 'percent' ? `${draftPart.discountValue}%` : `₹${draftPart.discountValue || 0}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Line Total</div>
                      {(() => {
                        const qty = Number(draftPart.quantity) || 0
                        const price = Number(draftPart.price) || 0
                        const gross = qty * price
                        const discount = draftPart.discountType === 'percent' ? gross * ((Number(draftPart.discountValue) || 0) / 100) : (Number(draftPart.discountValue) || 0)
                        const net = Math.max(gross - discount, 0)
                        const gst = net * ((Number(draftPart.gstPercent) || 0) / 100)
                        const total = net + gst
                        return <div className="font-semibold">{total.toFixed(2)}</div>
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
                    <div key={idx} className="rounded-lg border border-slate-200 p-3 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{p.name || 'Unnamed Part'}</div>
                        <div className="mt-1 text-sm text-slate-700">Qty: {qty} • Price: {price} • GST: {p.gstPercent}% • Disc: {p.discountType === 'percent' ? `${p.discountValue}%` : `₹${p.discountValue || 0}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Line Total</div>
                        <div className="font-semibold">{total.toFixed(2)}</div>
                        <button onClick={() => removePart(idx)} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm text-slate-600">Service Charges (Labor)</label>
              <input type="number" value={laborCost} onChange={e => setLaborCost(e.target.value)} className="mt-1 w-40 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Service Bill No.</div>
            <div className="font-semibold">{serviceBillNumber}</div>
          </div>
          <div className="mt-2 text-sm text-slate-600">Date & Time</div>
          <div>{now.toLocaleString()}</div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Parts Subtotal</span><span>{calc.partsSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Parts Discounts</span><span>- {calc.partsDiscounts.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Labor</span><span>{calc.labor.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>CGST</span><span>{calc.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>{calc.sgst.toFixed(2)}</span></div>
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-semibold text-lg"><span>Total</span><span>{calc.grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={printInvoice} className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Print</button>
            <button onClick={exportPdf} className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50">Export PDF</button>
            <button className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500">Save Service Bill</button>
          </div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div ref={invoiceRef} className="hidden print:block p-6">
        <div className="text-center text-xl font-semibold">Service Invoice</div>
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
          <div>CGST: {calc.cgst.toFixed(2)} • SGST: {calc.sgst.toFixed(2)}</div>
          <div className="font-semibold text-base">Grand Total: {calc.grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default ServiceBill


