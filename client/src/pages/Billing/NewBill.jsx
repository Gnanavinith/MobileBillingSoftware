import React, { useMemo, useState, useRef } from 'react'
import { MdShoppingCart, MdPerson, MdPhoneAndroid, MdPayment, MdDiscount, MdInventory2, MdSearch, MdAdd, MdClear, MdDelete, MdArrowBack, MdListAlt, MdSchedule, MdReceiptLong, MdCalendarToday, MdAttachMoney, MdShowChart, MdCardGiftcard, MdPrint, MdFileDownload, MdCheckCircle } from 'react-icons/md'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const emptyItem = () => ({ 
  type: 'Mobile', // 'Mobile' | 'Accessory'
  name: '', 
  imei: '', 
  productId: '',
  quantity: 1, 
  price: 0, 
  gstPercent: 18, 
  discountType: 'percent', 
  discountValue: 0,
  // Mobile features
  model: '',
  color: '',
  ram: '',
  storage: '',
  simSlot: '',
  processor: '',
  displaySize: '',
  camera: '',
  battery: '',
  operatingSystem: '',
  networkType: ''
})

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
  const [lookupLoading, setLookupLoading] = useState(false)

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index))

  // Fetch available stock for a given item (mobile by IMEI/model or accessory by productId/name)
  const getAvailableStock = async (it) => {
    try {
      // Try mobiles first
      const mobRes = await fetch(`${apiBase}/api/mobiles`)
      const mobiles = await mobRes.json()
      const imei = String(it.imei || '').trim()
      if (imei) {
        const mobByImei = Array.isArray(mobiles) ? mobiles.find(m => m.imeiNumber1 === imei || m.imeiNumber2 === imei) : null
        if (mobByImei) return Number(mobByImei.totalQuantity) || 0
      }
      if (it.model) {
        const mobByModel = Array.isArray(mobiles) ? mobiles.find(m => m.modelNumber === it.model) : null
        if (mobByModel) return Number(mobByModel.totalQuantity) || 0
      }
      // Accessories by productId or name
      let accessories = []
      try {
        const accRes = await fetch(`${apiBase}/api/accessories`)
        accessories = await accRes.json()
      } catch {}
      if (it.productId) {
        const accById = Array.isArray(accessories) ? accessories.find(a => a.productId === it.productId) : null
        if (accById) return Number(accById.quantity) || 0
      }
      if (it.name) {
        const accByName = Array.isArray(accessories) ? accessories.find(a => a.productName === it.name) : null
        if (accByName) return Number(accByName.quantity) || 0
      }
    } catch {}
    return 0
  }

  // Calculate already planned quantity for same item in current bill
  const getPlannedQuantityInBill = (it) => {
    const imei = String(it.imei || '').trim()
    if (imei) {
      return items.reduce((s, x) => s + ((String(x.imei || '').trim() === imei) ? (Number(x.quantity) || 0) : 0), 0)
    }
    if (it.productId) {
      return items.reduce((s, x) => s + ((x.productId === it.productId) ? (Number(x.quantity) || 0) : 0), 0)
    }
    if (it.model) {
      return items.reduce((s, x) => s + ((x.model === it.model) ? (Number(x.quantity) || 0) : 0), 0)
    }
    if (it.name) {
      return items.reduce((s, x) => s + ((x.name === it.name) ? (Number(x.quantity) || 0) : 0), 0)
    }
    return 0
  }

  const addDraftItem = async () => {
    const qty = Number(draftItem.quantity) || 0
    const price = Number(draftItem.price) || 0
    if (!draftItem.name || qty <= 0 || price < 0) return
    // Validate against available stock
    const available = await getAvailableStock(draftItem)
    const alreadyPlanned = getPlannedQuantityInBill(draftItem)
    if (available > 0 && qty + alreadyPlanned > available) {
      alert(`Insufficient stock. Available: ${available}. Already in bill: ${alreadyPlanned}. Requested add: ${qty}.`)
      return
    }
    setItems(prev => [...prev, { ...draftItem }])
    setDraftItem(emptyItem())
  }
  const clearDraftItem = () => setDraftItem(emptyItem())
  const removeLastItem = () => setItems(prev => prev.slice(0, -1))

  const lookupByImeiOrProduct = async () => {
    // Branch on type
    if (draftItem.type === 'Accessory') {
      const pid = String(draftItem.productId || '').trim()
      if (!pid) return
      setLookupLoading(true)
      try {
        const accRes = await fetch(`${apiBase}/api/accessories?productId=${encodeURIComponent(pid)}`)
        const accessories = await accRes.json()
        const accessory = Array.isArray(accessories) ? accessories.find(a => a.productId === pid) : null
        if (accessory) {
          setDraftItem(prev => ({
            ...prev,
            name: accessory.productName || prev.name,
            price: Number(accessory.sellingPrice ?? accessory.unitPrice) || prev.price,
          }))
          return
        }
        alert('No accessory found with this Product ID')
      } catch (e) {
        alert('Failed to lookup accessory')
      } finally { setLookupLoading(false) }
      return
    }

    const imei = String(draftItem.imei || '').trim()
    if (!imei) return
    setLookupLoading(true)
    try {
      // Try mobile by IMEI first
      const mobRes = await fetch(`${apiBase}/api/mobiles`)
      const mobiles = await mobRes.json()
      const mobile = Array.isArray(mobiles) ? mobiles.find(m => m.imeiNumber1 === imei || m.imeiNumber2 === imei) : null
      if (mobile) {
        setDraftItem(prev => ({
          ...prev,
          name: mobile.mobileName || prev.name,
          price: Number((mobile.sellingPrice ?? mobile.pricePerProduct)) || prev.price,
          imei: imei,
          model: mobile.modelNumber || prev.model,
          color: mobile.color || prev.color,
          ram: mobile.ram || prev.ram,
          storage: mobile.storage || prev.storage,
          simSlot: mobile.simSlot || prev.simSlot,
          processor: mobile.processor || prev.processor,
          displaySize: mobile.displaySize || prev.displaySize,
          camera: mobile.camera || prev.camera,
          battery: mobile.battery || prev.battery,
          operatingSystem: mobile.operatingSystem || prev.operatingSystem,
          networkType: mobile.networkType || prev.networkType
        }))
        return
      }
      alert('No mobile found with this IMEI')
    } catch (error) {
      console.error('Lookup failed:', error)
      alert('Failed to lookup product details')
    } finally {
      setLookupLoading(false)
    }
  }

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
    const printContent = invoiceRef.current
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-semibold { font-weight: bold; }
            .text-xl { font-size: 1.25rem; }
            .text-sm { font-size: 0.875rem; }
            .text-base { font-size: 1rem; }
            .border-t { border-top: 1px solid #ddd; }
            .border-b { border-bottom: 1px solid #ddd; }
            .border-slate-300 { border-color: #cbd5e1; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .pr-2 { padding-right: 0.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .p-6 { padding: 1.5rem; }
            .w-full { width: 100%; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
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
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"><MdShoppingCart /> New Bill / POS</h1>
        <p className="text-slate-600 mb-8">Create and manage customer invoices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Bill Details */}
          <div className="animate-slide-in-left rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2"><MdPerson /> Customer & Bill Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdPerson /> Customer Name</label>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" placeholder="Walk-in Customer" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdPhoneAndroid /> Mobile Number</label>
                <input value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" placeholder="98765 43210" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdPayment /> Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm">
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                  <option>EMI</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MdDiscount /> Bill Discount</label>
                <select value={billDiscountType} onChange={e => setBillDiscountType(e.target.value)} className="rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 px-3 py-2 bg-white shadow-sm">
                  <option value="none">None</option>
                  <option value="percent">% Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
                {billDiscountType !== 'none' && (
                  <input type="number" value={billDiscountValue} onChange={e => setBillDiscountValue(e.target.value)} className="w-32 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 px-3 py-2 bg-white shadow-sm" placeholder="0" />
                )}
              </div>
            </div>
          </div>

          {/* Add Product */}
          <div className="animate-slide-in-left rounded-2xl bg-gradient-to-br from-white to-green-50 border border-green-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2"><MdInventory2 /> Add Product</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdPhoneAndroid /> Item Type</label>
                <select value={draftItem.type} onChange={e=>setDraftItem({ ...draftItem, type: e.target.value })} className="w-full rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm">
                  <option value="Mobile">Mobile</option>
                  <option value="Accessory">Accessory</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Product Name</label>
                <input value={draftItem.name} onChange={e => setDraftItem({ ...draftItem, name: e.target.value })} className="w-full rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" placeholder="Search / type product name" />
              </div>
              {draftItem.type === 'Mobile' ? (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdSearch /> IMEI Number</label>
                  <div className="flex gap-3">
                    <input 
                      value={draftItem.imei} 
                      onChange={e => setDraftItem({ ...draftItem, imei: e.target.value })} 
                      onBlur={lookupByImeiOrProduct}
                      onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); lookupByImeiOrProduct(); } }}
                      autoFocus
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" 
                      placeholder="Enter/Scan IMEI and press Enter" 
                    />
                    <button 
                      type="button"
                      onClick={lookupByImeiOrProduct}
                      disabled={lookupLoading || !draftItem.imei}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold"
                    >
                      <span className="flex items-center gap-2">{lookupLoading ? 'Finding...' : (<><MdSearch /> Find</>)}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdSearch /> Product ID</label>
                  <div className="flex gap-3">
                    <input 
                      value={draftItem.productId} 
                      onChange={e => setDraftItem({ ...draftItem, productId: e.target.value })} 
                      onBlur={lookupByImeiOrProduct}
                      className="flex-1 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" 
                      placeholder="Enter Product ID to auto-fill details" 
                    />
                    <button 
                      type="button"
                      onClick={lookupByImeiOrProduct}
                      disabled={lookupLoading || !draftItem.productId}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold"
                    >
                      <span className="flex items-center gap-2">{lookupLoading ? 'Finding...' : (<><MdSearch /> Find</>)}</span>
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Quantity</label>
                  <input type="number" value={draftItem.quantity} onChange={e => setDraftItem({ ...draftItem, quantity: e.target.value })} className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdAttachMoney /> Selling Price</label>
                  <input type="number" value={draftItem.price} onChange={e => setDraftItem({ ...draftItem, price: e.target.value })} className="w-full rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdShowChart /> GST %</label>
                  <input type="number" value={draftItem.gstPercent} onChange={e => setDraftItem({ ...draftItem, gstPercent: e.target.value })} className="w-full rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 px-4 py-3 bg-white shadow-sm" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2"><MdDiscount /> Discount</label>
                  <div className="flex items-center gap-2">
                    <select value={draftItem.discountType} onChange={e => setDraftItem({ ...draftItem, discountType: e.target.value })} className="rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 px-3 py-2 bg-white shadow-sm">
                      <option value="percent">% Percentage</option>
                      <option value="flat">₹ Flat</option>
                    </select>
                    <input type="number" value={draftItem.discountValue} onChange={e => setDraftItem({ ...draftItem, discountValue: e.target.value })} className="w-24 rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 px-3 py-2 bg-white shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={addDraftItem} className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold flex items-center gap-2">
                  <MdAdd /> Add to Bill
                </button>
                <button onClick={clearDraftItem} type="button" className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center gap-2">
                  <MdClear /> Clear
                </button>
                <button onClick={removeLastItem} type="button" disabled={items.length === 0} className="px-6 py-3 rounded-xl border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-2">
                  <MdArrowBack /> Remove Last
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="animate-slide-in-left rounded-2xl bg-gradient-to-br from-white to-purple-50 border border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent flex items-center gap-2"><MdListAlt /> Items</h2>
            {items.length === 0 && !draftItemActive ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-6xl mb-4 flex justify-center"><MdInventory2 className="w-16 h-16" /></div>
                <div className="text-lg font-medium">No items added yet</div>
                <div className="text-sm">Start adding products to create your bill</div>
              </div>
            ) : (
              <div className="space-y-4">
                {draftItemActive && (
                  <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 flex items-start justify-between shadow-lg animate-pulse">
                    <div>
                      <div className="font-semibold text-amber-800 flex items-center gap-2">{draftItem.name || 'New item'} <span className="ml-2 text-sm bg-amber-200 text-amber-800 px-2 py-1 rounded-full inline-flex items-center gap-1"><MdSchedule /> Pending</span></div>
                      <div className="text-sm text-amber-700 mt-1">IMEI: {draftItem.imei || '-'}</div>
                      <div className="mt-2 text-sm text-amber-800 font-medium">Qty: {draftItem.quantity} • Price: ₹{draftItem.price} • GST: {draftItem.gstPercent}% • Disc: {draftItem.discountType === 'percent' ? `${draftItem.discountValue}%` : `₹${draftItem.discountValue || 0}`}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-amber-700">Line Total</div>
                      {(() => {
                        const qty = Number(draftItem.quantity) || 0
                        const price = Number(draftItem.price) || 0
                        const gross = qty * price
                        const discount = draftItem.discountType === 'percent' ? gross * ((Number(draftItem.discountValue) || 0) / 100) : (Number(draftItem.discountValue) || 0)
                        const net = Math.max(gross - discount, 0)
                        const gst = net * ((Number(draftItem.gstPercent) || 0) / 100)
                        const total = net + gst
                        return <div className="font-bold text-lg text-amber-800">₹{total.toFixed(2)}</div>
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
                    <div key={idx} className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-start justify-between shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div>
                        <div className="font-semibold text-green-800">{it.name || 'Unnamed Item'}</div>
                        <div className="text-sm text-green-700 mt-1">IMEI: {it.imei || '-'}</div>
                        <div className="mt-2 text-sm text-green-800 font-medium">Qty: {qty} • Price: ₹{price} • GST: {it.gstPercent}% • Disc: {it.discountType === 'percent' ? `${it.discountValue}%` : `₹${it.discountValue || 0}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-700">Line Total</div>
                        <div className="font-bold text-lg text-green-800">₹{total.toFixed(2)}</div>
                        <button onClick={() => removeItem(idx)} className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors duration-200 font-semibold inline-flex items-center gap-1">
                          <MdDelete /> Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="animate-slide-in-up rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-indigo-700 inline-flex items-center gap-2"><MdReceiptLong /> Bill No.</div>
            <div className="font-bold text-lg text-indigo-800">{billNumber}</div>
          </div>
          <div className="mb-2 text-sm font-semibold text-indigo-700 inline-flex items-center gap-2"><MdCalendarToday /> Date & Time</div>
          <div className="text-indigo-800 font-medium">{now.toLocaleString()}</div>

          <div className="mt-6 space-y-3 text-sm bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-700 inline-flex items-center gap-2"><MdAttachMoney /> Subtotal</span>
              <span className="font-bold text-gray-800">₹{calc.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-red-600 inline-flex items-center gap-2"><MdDiscount /> Item Discounts</span>
              <span className="font-bold text-red-600">- ₹{calc.totalDiscountOnItems.toFixed(2)}</span>
            </div>
            {calc.billLevelDiscount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-orange-600 inline-flex items-center gap-2"><MdCardGiftcard /> Bill Discount</span>
                <span className="font-bold text-orange-600">- ₹{calc.billLevelDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-blue-600 inline-flex items-center gap-2"><MdShowChart /> CGST</span>
              <span className="font-bold text-blue-600">₹{calc.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-blue-600 inline-flex items-center gap-2"><MdShowChart /> SGST</span>
              <span className="font-bold text-blue-600">₹{calc.sgst.toFixed(2)}</span>
            </div>
            <div className="pt-3 mt-3 border-t-2 border-indigo-300 flex justify-between items-center">
              <span className="text-lg font-bold text-indigo-800 inline-flex items-center gap-2"><MdCheckCircle /> Grand Total</span>
              <span className="text-2xl font-bold text-indigo-800">₹{calc.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button onClick={printInvoice} className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold inline-flex items-center gap-2">
              <MdPrint /> Print Invoice
            </button>
            <button onClick={exportPdf} className="px-6 py-3 rounded-xl border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-semibold inline-flex items-center gap-2">
              <MdFileDownload /> Export PDF
            </button>
            <button onClick={async ()=>{
              try {
                // Mandatory Customer & Bill Details validation
                const nameOk = String(customerName || '').trim().length > 0
                const phoneOk = String(mobileNumber || '').trim().length > 0
                const payOk = String(paymentMethod || '').trim().length > 0
                if (!nameOk || !phoneOk || !payOk) {
                  alert('Please fill Customer Name, Mobile Number and Payment Method before checkout.')
                  return
                }
                // Validate each item against available stock before checkout
                for (const it of items) {
                  const available = await getAvailableStock(it)
                  const requested = Number(it.quantity) || 0
                  if (available > 0 && requested > available) {
                    alert(`Cannot checkout. Item: ${it.name || it.productId || it.model}. Requested: ${requested}. Available: ${available}.`)
                    return
                  }
                }
                const payload = { 
                  billNumber,
                  customerName,
                  mobileNumber,
                  paymentMethod,
                  billLevelDiscount: calc.billLevelDiscount,
                  items: items.map(it=>({ 
                    name: it.name, 
                    model: it.model, 
                    imei: it.imei, 
                    productId: it.productId, 
                    quantity: Number(it.quantity)||0,
                    price: Number(it.price)||0,
                    gstPercent: Number(it.gstPercent)||18,
                    discountType: it.discountType||'percent',
                    discountValue: Number(it.discountValue)||0,
                    // Mobile features
                    color: it.color||'',
                    ram: it.ram||'',
                    storage: it.storage||'',
                    simSlot: it.simSlot||'',
                    processor: it.processor||'',
                    displaySize: it.displaySize||'',
                    camera: it.camera||'',
                    battery: it.battery||'',
                    operatingSystem: it.operatingSystem||'',
                    networkType: it.networkType||''
                  })) 
                }
                const res = await fetch(`${apiBase}/api/sale`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                if(!res.ok){ const m = await res.json().catch(()=>({})); throw new Error(m.error||'Failed to save') }
                // After successful sale, fetch low stock and show a concise popup related to sold items only
                try {
                  const lowRes = await fetch(`${apiBase}/api/low-stock?threshold=20`)
                  const low = await lowRes.json()
                  const lowList = Array.isArray(low) ? low : []
                  const soldModels = new Set(items.map(it => String(it.model || '').trim()).filter(Boolean))
                  const soldProducts = new Set(items.map(it => String(it.productId || '').trim()).filter(Boolean))
                  const soldNames = new Set(items.map(it => String(it.name || '').trim()).filter(Boolean))
                  const related = lowList.filter(it => soldModels.has(String(it.model||'')) || soldProducts.has(String(it.model||'')) || soldNames.has(String(it.name||'')))
                  if (related.length > 0) {
                    const uniq = new Map()
                    related.forEach(it => {
                      const key = `${it.type||'item'}:${it.name}:${it.model}`
                      if (!uniq.has(key)) uniq.set(key, it)
                    })
                    const msg = Array.from(uniq.values()).map(it => `${it.name}${it.model?` (${it.model})`:''} -> ${it.quantity}`).join('\n')
                    alert(`Sale recorded and stock updated.\n\nLow stock for sold items (<=20):\n${msg}`)
                  } else {
                    alert('Sale recorded and stock updated')
                  }
                } catch {
                  alert('Sale recorded and stock updated')
                }
              } catch(ex){ alert(ex.message) }
            }} className="px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-bold text-lg inline-flex items-center gap-2">
              <MdCheckCircle /> Checkout & Save
            </button>
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
              <div className="text-xl font-semibold">{biz?.businessName || 'Invoice'}</div>
              {biz?.address ? <div className="text-xs text-slate-600 mt-0.5">{biz.address}</div> : null}
              {contactLine ? <div className="text-xs text-slate-600 mt-0.5">{contactLine}</div> : null}
              {biz?.gstin ? <div className="text-xs text-slate-600 mt-0.5">GSTIN: {biz.gstin}</div> : null}
            </div>
          )
        })()}
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
              // Check if this is a mobile with features
              const hasMobileFeatures = it.color || it.ram || it.storage || it.processor || it.displaySize || it.camera || it.battery || it.operatingSystem || it.networkType
              
              return (
                <tr key={idx} className="border-t border-slate-200">
                  <td className="py-1 pr-2">
                    <div>
                      <div className="font-medium">{it.name && String(it.name).trim() ? it.name : 'Item'}</div>
                      {it.model && <div className="text-xs text-slate-600">Model: {it.model}</div>}
                      {it.imei && <div className="text-xs text-slate-600">IMEI: {it.imei}</div>}
                      {hasMobileFeatures && (
                        <div className="text-xs text-slate-600 mt-1">
                          {it.color && <span>Color: {it.color} • </span>}
                          {it.ram && <span>RAM: {it.ram} • </span>}
                          {it.storage && <span>Storage: {it.storage} • </span>}
                          {it.processor && <span>Processor: {it.processor} • </span>}
                          {it.displaySize && <span>Display: {it.displaySize} • </span>}
                          {it.camera && <span>Camera: {it.camera} • </span>}
                          {it.battery && <span>Battery: {it.battery} • </span>}
                          {it.operatingSystem && <span>OS: {it.operatingSystem} • </span>}
                          {it.networkType && <span>Network: {it.networkType}</span>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-1 pr-2">{qty}</td>
                  <td className="py-1 pr-2">₹{total.toFixed(2)}</td>
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


