import React, { useMemo, useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const emptyItem = () => ({ name: '', imei: '', quantity: 1, price: 0, gstPercent: 18, discountType: 'percent', discountValue: 0 })

const NewBill = () => {
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [items, setItems] = useState([])
  const [draftItem, setDraftItem] = useState(emptyItem())
  const [billDiscountType, setBillDiscountType] = useState('none') // none|percent|flat
  const [billDiscountValue, setBillDiscountValue] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [billNumber] = useState(() => `INV-${Date.now().toString().slice(-6)}`)
  const invoiceRef = useRef(null)

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index))
  const addDraftItem = () => {
    const qty = Number(draftItem.quantity) || 0
    const price = Number(draftItem.price) || 0
    if (!draftItem.name || qty <= 0 || price < 0) return
    setItems(prev => [...prev, { ...draftItem }])
    setDraftItem(emptyItem())
  }
  const clearDraftItem = () => setDraftItem(emptyItem())
  const removeLastItem = () => setItems(prev => prev.slice(0, -1))

  const draftItemActive = useMemo(() => {
    const qty = Number(draftItem.quantity) || 0
    const price = Number(draftItem.price) || 0
    return qty > 0 && price > 0
  }, [draftItem])

  const calc = useMemo(() => {
    const itemsForCalc = draftItemActive ? [...items, draftItem] : items
    let subTotal = 0
    let totalDiscountOnItems = 0
    let totalGst = 0

    itemsForCalc.forEach(it => {
      const qty = Number(it.quantity) || 0
      const price = Number(it.price) || 0
      const rowGross = qty * price
      let rowDiscount = 0
      if (it.discountType === 'percent') {
        rowDiscount = rowGross * ((Number(it.discountValue) || 0) / 100)
      } else if (it.discountType === 'flat') {
        rowDiscount = Number(it.discountValue) || 0
      }
      const rowNet = Math.max(rowGross - rowDiscount, 0)
      const rowGst = rowNet * ((Number(it.gstPercent) || 0) / 100)
      subTotal += rowNet
      totalDiscountOnItems += rowDiscount
      totalGst += rowGst
    })

    let billLevelDiscount = 0
    if (billDiscountType === 'percent') billLevelDiscount = subTotal * ((Number(billDiscountValue) || 0) / 100)
    if (billDiscountType === 'flat') billLevelDiscount = Number(billDiscountValue) || 0

    const taxableAfterBillDiscount = Math.max(subTotal - billLevelDiscount, 0)
    const gstOnTaxable = taxableAfterBillDiscount * 0 // GST already per-item; keep 0 to avoid double

    const cgst = totalGst / 2
    const sgst = totalGst / 2
    const grandTotal = taxableAfterBillDiscount + totalGst + gstOnTaxable

    return {
      subTotal,
      totalDiscountOnItems,
      billLevelDiscount,
      totalGst,
      cgst,
      sgst,
      grandTotal,
    }
  }, [items, billDiscountType, billDiscountValue, draftItemActive, draftItem])

  const printInvoice = () => {
    window.print()
  }

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
    pdf.save(`${billNumber}.pdf`)
  }

  const now = new Date()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">New Bill / POS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & Bill Details */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Customer & Bill Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="Walk-in" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Mobile Number</label>
                <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="98765 43210" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                  <option>EMI</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Bill Discount</label>
                <select value={billDiscountType} onChange={e => setBillDiscountType(e.target.value)} className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                  <option value="none">None</option>
                  <option value="percent">% </option>
                  <option value="flat">Flat</option>
                </select>
                {billDiscountType !== 'none' && (
                  <input type="number" value={billDiscountValue} onChange={e => setBillDiscountValue(e.target.value)} className="w-28 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Add Product */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Add Product</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Product Name</label>
                <input value={draftItem.name} onChange={e => setDraftItem({ ...draftItem, name: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="Search / type" />
              </div>
              <div>
                <label className="text-sm text-slate-600">IMEI Number</label>
                <input value={draftItem.imei} onChange={e => setDraftItem({ ...draftItem, imei: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Quantity</label>
                  <input type="number" value={draftItem.quantity} onChange={e => setDraftItem({ ...draftItem, quantity: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Price per Unit</label>
                  <input type="number" value={draftItem.price} onChange={e => setDraftItem({ ...draftItem, price: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">GST %</label>
                  <input type="number" value={draftItem.gstPercent} onChange={e => setDraftItem({ ...draftItem, gstPercent: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Discount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select value={draftItem.discountType} onChange={e => setDraftItem({ ...draftItem, discountType: e.target.value })} className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                      <option value="percent">% </option>
                      <option value="flat">Flat</option>
                    </select>
                    <input type="number" value={draftItem.discountValue} onChange={e => setDraftItem({ ...draftItem, discountValue: e.target.value })} className="w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={addDraftItem} className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Add to Bill</button>
                <button onClick={clearDraftItem} type="button" className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">Clear</button>
                <button onClick={removeLastItem} type="button" disabled={items.length === 0} className="px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">Remove Last</button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Items</h2>
            {items.length === 0 && !draftItemActive ? (
              <div className="text-sm text-slate-500">No items added yet.</div>
            ) : (
              <div className="space-y-3">
                {draftItemActive && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{draftItem.name || 'New item'} <span className="ml-2 text-xs text-amber-700">Pending (not added)</span></div>
                      <div className="text-xs text-slate-500">IMEI: {draftItem.imei || '-'}</div>
                      <div className="mt-1 text-sm text-slate-700">Qty: {draftItem.quantity} • Price: {draftItem.price} • GST: {draftItem.gstPercent}% • Disc: {draftItem.discountType === 'percent' ? `${draftItem.discountValue}%` : `₹${draftItem.discountValue || 0}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Line Total</div>
                      {(() => {
                        const qty = Number(draftItem.quantity) || 0
                        const price = Number(draftItem.price) || 0
                        const gross = qty * price
                        const discount = draftItem.discountType === 'percent' ? gross * ((Number(draftItem.discountValue) || 0) / 100) : (Number(draftItem.discountValue) || 0)
                        const net = Math.max(gross - discount, 0)
                        const gst = net * ((Number(draftItem.gstPercent) || 0) / 100)
                        const total = net + gst
                        return <div className="font-semibold">{total.toFixed(2)}</div>
                      })()}
                    </div>
                  </div>
                )}
                {items.map((it, idx) => {
                  const qty = Number(it.quantity) || 0
                  const price = Number(it.price) || 0
                  const gross = qty * price
                  let discount = 0
                  if (it.discountType === 'percent') discount = gross * ((Number(it.discountValue) || 0) / 100)
                  if (it.discountType === 'flat') discount = Number(it.discountValue) || 0
                  const net = Math.max(gross - discount, 0)
                  const gst = net * ((Number(it.gstPercent) || 0) / 100)
                  const total = net + gst
                  return (
                    <div key={idx} className="rounded-lg border border-slate-200 p-3 flex items-start justify-between">
                      <div>
                        <div className="font-medium">{it.name || 'Unnamed Item'}</div>
                        <div className="text-xs text-slate-500">IMEI: {it.imei || '-'}</div>
                        <div className="mt-1 text-sm text-slate-700">Qty: {qty} • Price: {price} • GST: {it.gstPercent}% • Disc: {it.discountType === 'percent' ? `${it.discountValue}%` : `₹${it.discountValue || 0}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Line Total</div>
                        <div className="font-semibold">{total.toFixed(2)}</div>
                        <button onClick={() => removeItem(idx)} className="mt-2 text-xs text-red-600 hover:underline">Remove</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Bill No.</div>
            <div className="font-semibold">{billNumber}</div>
          </div>
          <div className="mt-2 text-sm text-slate-600">Date & Time</div>
          <div>{now.toLocaleString()}</div>

          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{calc.subTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Item Discounts</span><span>- {calc.totalDiscountOnItems.toFixed(2)}</span></div>
            {calc.billLevelDiscount > 0 && (
              <div className="flex justify-between"><span>Bill Discount</span><span>- {calc.billLevelDiscount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between"><span>CGST</span><span>{calc.cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>{calc.sgst.toFixed(2)}</span></div>
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-semibold text-lg"><span>Total</span><span>{calc.grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={printInvoice} className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800">Print</button>
            <button onClick={exportPdf} className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50">Export PDF</button>
            <button onClick={async ()=>{
              try {
                const payload = { items: items.map(it=>({ name: it.name, model: it.model, imei: it.imei, productId: it.productId, quantity: Number(it.quantity)||0 })) }
                const res = await fetch(`${apiBase}/api/sale`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                if(!res.ok){ const m = await res.json().catch(()=>({})); throw new Error(m.error||'Failed to save') }
                alert('Sale recorded and stock updated')
              } catch(ex){ alert(ex.message) }
            }} className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500">Checkout & Save</button>
          </div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div ref={invoiceRef} className="hidden print:block p-6">
        <div className="text-center text-xl font-semibold">Invoice</div>
        <div className="mt-2 text-sm">Bill No: {billNumber} • {now.toLocaleString()}</div>
        <div className="mt-2 text-sm">Customer: {customerName || 'Walk-in'} • {mobileNumber}</div>
        <table className="mt-4 w-full text-sm border-t border-b border-slate-300">
          <thead>
            <tr className="text-left">
              <th className="py-1 pr-2">Item</th>
              <th className="py-1 pr-2">Qty</th>
              <th className="py-1 pr-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {(draftItemActive ? [...items, draftItem] : items).map((it, idx) => {
              const qty = Number(it.quantity) || 0
              const price = Number(it.price) || 0
              const gross = qty * price
              let discount = 0
              if (it.discountType === 'percent') discount = gross * ((Number(it.discountValue) || 0) / 100)
              if (it.discountType === 'flat') discount = Number(it.discountValue) || 0
              const net = Math.max(gross - discount, 0)
              const gst = net * ((Number(it.gstPercent) || 0) / 100)
              const total = net + gst
              return (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="py-1 pr-2">{it.name && String(it.name).trim() ? it.name : 'Item'}</td>
                  <td className="py-1 pr-2">{qty} (quantity)</td>
                  <td className="py-1 pr-2">{total.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-2 text-right text-sm">
          <div>Subtotal: {calc.subTotal.toFixed(2)}</div>
          <div>CGST: {calc.cgst.toFixed(2)} • SGST: {calc.sgst.toFixed(2)}</div>
          {calc.billLevelDiscount > 0 && <div>Bill Discount: -{calc.billLevelDiscount.toFixed(2)}</div>}
          <div className="font-semibold text-base">Grand Total: {calc.grandTotal.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default NewBill


