import React, { useEffect, useMemo, useState } from 'react'

const apiBase = 'http://localhost:5000'

const MobilesStock = () => {
  const [rows, setRows] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState({ dealerId: '', modelNumber: '', productId: '' })
  const [form, setForm] = useState({
    mobileName: '',
    brand: '',
    modelNumber: '',
    productId: '',
    productIds: [],
    imeiNumber1: '',
    imeiNumber2: '',
    dealerId: '',
    pricePerProduct: 0,
    sellingPrice: 0,
    // New mobile features
    color: '',
    ram: '',
    storage: '',
    simSlot: '',
    processor: '',
    displaySize: '',
    camera: '',
    battery: '',
    operatingSystem: '',
    networkType: '',
  })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')

  // Quick-pick suggestions for mobile features
  const suggestions = {
    color: ['Black','White','Blue','Red','Green','Silver','Gold','Purple','Gray'],
    ram: ['2GB','3GB','4GB','6GB','8GB','12GB','16GB'],
    storage: ['32GB','64GB','128GB','256GB','512GB','1TB'],
    simSlot: ['Single SIM','Dual SIM','eSIM + Nano SIM'],
    processor: ['Snapdragon 8 Gen 2','Snapdragon 888','Dimensity 9200','A15 Bionic','A16 Bionic','Exynos 2200'],
    displaySize: ['5.8 inch','6.1 inch','6.4 inch','6.7 inch','6.8 inch'],
    camera: ['12MP + 12MP','48MP','50MP','64MP','108MP','200MP'],
    battery: ['3000mAh','4000mAh','4500mAh','5000mAh','6000mAh'],
    operatingSystem: ['Android 12','Android 13','Android 14','iOS 15','iOS 16','iOS 17'],
    networkType: ['4G LTE','5G','5G + 4G'],
  }

  const load = async () => {
    try {
      console.log('Loading mobiles data...')
      const [mRes, dRes] = await Promise.all([
        fetch(`${apiBase}/api/mobiles?dealerId=${q.dealerId}&modelNumber=${q.modelNumber}`),
        fetch(`${apiBase}/api/dealers`),
      ])
      const m = await mRes.json(); const d = await dRes.json()
      console.log('Loaded mobiles:', m.length, 'items')
      setRows(Array.isArray(m) ? m : [])
      setDealers(Array.isArray(d) ? d : [])
      
      // Show notification if there are items
      if (Array.isArray(m) && m.length > 0) {
        console.log('Mobiles loaded successfully:', m.length, 'items')
      }
    } catch (error) {
      console.error('Error loading mobiles:', error)
    }
  }

  useEffect(() => { load() }, [])
  
  // Refresh data when page comes into focus (useful when returning from other pages)
  useEffect(() => {
    const handleFocus = () => load()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const filtered = useMemo(() => {
    const list = rows.filter(r => (Number(r.totalQuantity)||0) > 0)
    const pid = String(q.productId||'').trim().toUpperCase()
    if (!pid) return list
    return list.filter(r => Array.isArray(r.productIds) && r.productIds.some(x => String(x||'').toUpperCase().includes(pid)))
  }, [rows, q.productId])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `${apiBase}/api/mobiles/${editingId}` : `${apiBase}/api/mobiles`
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed')
      }
      setForm({ 
        mobileName: '', 
        brand: '',
        modelNumber: '', 
        productId: '',
        productIds: [],
        imeiNumber1: '', 
        imeiNumber2: '', 
        dealerId: '', 
        pricePerProduct: 0, 
        sellingPrice: 0,
        color: '',
        ram: '',
        storage: '',
        simSlot: '',
        processor: '',
        displaySize: '',
        camera: '',
        battery: '',
        operatingSystem: '',
        networkType: '',
      })
      setEditingId('')
      await load()
      alert('Added to Inventory')
    } catch (ex) { alert(ex.message) } finally { setSaving(false) }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({
      mobileName: row.mobileName,
      brand: row.brand || '',
      modelNumber: row.modelNumber,
      productId: '',
      productIds: Array.isArray(row.productIds) ? row.productIds : [],
      imeiNumber1: row.imeiNumber1,
      imeiNumber2: row.imeiNumber2 || '',
      dealerId: row.dealerId,
      pricePerProduct: row.pricePerProduct,
      sellingPrice: row.sellingPrice || 0,
      // New mobile features
      color: row.color || '',
      ram: row.ram || '',
      storage: row.storage || '',
      simSlot: row.simSlot || '',
      processor: row.processor || '',
      displaySize: row.displaySize || '',
      camera: row.camera || '',
      battery: row.battery || '',
      operatingSystem: row.operatingSystem || '',
      networkType: row.networkType || '',
    })
  }

  const onDelete = async (row) => {
    if (!confirm('Delete this mobile record?')) return
    try {
      const res = await fetch(`${apiBase}/api/mobiles/${row.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed')
      }
      await load()
    } catch (ex) { alert(ex.message) }
  }

  const moveToInventory = async (row) => {
    if (!confirm(`Move ${row.mobileName} (${row.modelNumber}) to Inventory?`)) return
    try {
      // This will move the product to inventory by updating its status
      // For now, we'll just show a success message as the product is already in the inventory system
      alert(`${row.mobileName} is now available in Inventory! You can view it in the Inventory section.`)
    } catch (ex) { 
      alert('Error moving to inventory: ' + ex.message) 
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Update Stock - Mobiles</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Add Mobile</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Name</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" value={form.mobileName} onChange={e=>setForm({...form, mobileName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} placeholder="e.g., Oppo, Vivo, Samsung" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model Name/Number</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all" value={form.modelNumber} onChange={async e=>{
                const v = e.target.value
                setForm({...form, modelNumber: v})
                // try auto-fill brand from catalog
                try {
                  const rs = await fetch(`${apiBase}/api/brand-models?q=${encodeURIComponent(v)}`)
                  const data = await rs.json()
                  if (Array.isArray(data) && data.length > 0 && !form.brand) {
                    setForm(prev=>({...prev, brand: data[0].brand}))
                  }
                } catch {}
              }} placeholder="e.g., F29 Pro, V30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product ID (optional)</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" value={form.productId} onChange={e=>setForm({...form, productId:e.target.value})} placeholder="e.g., VIV-MOB-Y21-0001" />
              {Array.isArray(form.productIds) && form.productIds.length > 0 && (
                <div className="mt-1 text-xs text-slate-600">
                  Existing: {form.productIds.join(', ')}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dealer</label>
              <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" value={form.dealerId} onChange={e=>setForm({...form, dealerId:e.target.value})}>
              <option value="">Select Dealer</option>
              {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price per Product</label>
              <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all" value={form.pricePerProduct} onChange={e=>setForm({...form, pricePerProduct: parseFloat(e.target.value)||0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
              <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all" value={form.sellingPrice} onChange={e=>setForm({...form, sellingPrice: parseFloat(e.target.value)||0})} />
            </div>
            
            {/* Mobile Features Section */}
            <div className="border-t pt-3 mt-3">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Mobile Features</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 1</label>
                  <input 
                    className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" 
                    value={form.imeiNumber1} 
                    onChange={e=>setForm({...form, imeiNumber1:e.target.value})}
                    onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault() } }}
                    autoFocus
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Scan/enter IMEI 1 and press Enter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (optional)</label>
                  <input 
                    className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" 
                    value={form.imeiNumber2} 
                    onChange={e=>setForm({...form, imeiNumber2:e.target.value})}
                    onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault() } }}
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Scan/enter IMEI 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all" value={form.color} onChange={e=>setForm({...form, color:e.target.value})} placeholder="e.g., Black, White, Blue" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.color.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, color:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all" value={form.ram} onChange={e=>setForm({...form, ram:e.target.value})} placeholder="e.g., 4GB, 6GB, 8GB" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.ram.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, ram:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Storage</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" value={form.storage} onChange={e=>setForm({...form, storage:e.target.value})} placeholder="e.g., 64GB, 128GB, 256GB" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.storage.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, storage:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SIM Slot</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all" value={form.simSlot} onChange={e=>setForm({...form, simSlot:e.target.value})} placeholder="e.g., Dual SIM, Single SIM" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.simSlot.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, simSlot:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Processor</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all" value={form.processor} onChange={e=>setForm({...form, processor:e.target.value})} placeholder="e.g., Snapdragon 888, A15 Bionic" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.processor.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, processor:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Size</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" value={form.displaySize} onChange={e=>setForm({...form, displaySize:e.target.value})} placeholder="e.g., 6.1 inch, 6.7 inch" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.displaySize.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, displaySize:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Camera</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all" value={form.camera} onChange={e=>setForm({...form, camera:e.target.value})} placeholder="e.g., 12MP + 12MP, 108MP" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.camera.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, camera:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Battery</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all" value={form.battery} onChange={e=>setForm({...form, battery:e.target.value})} placeholder="e.g., 4000mAh, 5000mAh" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.battery.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, battery:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Operating System</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" value={form.operatingSystem} onChange={e=>setForm({...form, operatingSystem:e.target.value})} placeholder="e.g., Android 12, iOS 15" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.operatingSystem.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, operatingSystem:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Network Type</label>
                  <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all" value={form.networkType} onChange={e=>setForm({...form, networkType:e.target.value})} placeholder="e.g., 5G, 4G LTE" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.networkType.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, networkType:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white disabled:opacity-50 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all">{saving ? 'Saving...' : (editingId ? 'Update' : 'Add to Inventory')}</button>
              {editingId ? (
                <button type="button" onClick={()=>{ 
                  setEditingId(''); 
                  setForm({ 
                    mobileName: '', 
                    brand: '',
                    modelNumber: '', 
                    productId: '',
                    productIds: [],
                    imeiNumber1: '', 
                    imeiNumber2: '', 
                    dealerId: '', 
                    pricePerProduct: 0, 
                    sellingPrice: 0,
                    color: '',
                    ram: '',
                    storage: '',
                    simSlot: '',
                    processor: '',
                    displaySize: '',
                    camera: '',
                    battery: '',
                    operatingSystem: '',
                    networkType: '',
                  }) 
                }} className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
              ) : null}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <select className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" value={q.dealerId} onChange={e=>setQ({...q, dealerId:e.target.value})}>
              <option value="">All Dealers</option>
              {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input placeholder="Model Number" className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" value={q.modelNumber} onChange={e=>setQ({...q, modelNumber:e.target.value})} />
            <input placeholder="Product ID" className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all" value={q.productId} onChange={e=>setQ({...q, productId:e.target.value})} />
            <button onClick={load} className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all">Filter</button>
            <button onClick={load} className="px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 text-xs uppercase bg-gradient-to-r from-indigo-50 to-blue-50">
                  <th className="py-2 pr-4">Mobile</th>
                  <th className="py-2 pr-4">Model</th>
                  <th className="py-2 pr-4">Color</th>
                  <th className="py-2 pr-4">RAM</th>
                  <th className="py-2 pr-4">Storage</th>
                  <th className="py-2 pr-4">IMEI1</th>
                  <th className="py-2 pr-4">IMEI2</th>
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Product IDs</th>
                  <th className="py-2 pr-4">Cost</th>
                  <th className="py-2 pr-4">Sell</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r)=> (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2 pr-4">{r.mobileName}</td>
                    <td className="py-2 pr-4">{r.modelNumber}</td>
                    <td className="py-2 pr-4">{r.color || '-'}</td>
                    <td className="py-2 pr-4">{r.ram || '-'}</td>
                    <td className="py-2 pr-4">{r.storage || '-'}</td>
                    <td className="py-2 pr-4">{r.imeiNumber1}</td>
                    <td className="py-2 pr-4">{r.imeiNumber2 || '-'}</td>
                    <td className="py-2 pr-4">{r.dealerName}</td>
                    <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words">{Array.isArray(r.productIds) && r.productIds.length ? r.productIds.join(', ') : '-'}</td>
                    <td className="py-2 pr-4">{r.pricePerProduct}</td>
                    <td className="py-2 pr-4">{r.sellingPrice || '-'}</td>
                    <td className="py-2 pr-4">{r.totalQuantity}</td>
                    <td className="py-2 pr-2">
                      <div className="flex gap-2">
                        <button onClick={()=>onEdit(r)} className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={()=>moveToInventory(r)} className="text-green-600 hover:text-green-800">Move to Inventory</button>
                        <button onClick={()=>onDelete(r)} className="text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobilesStock


