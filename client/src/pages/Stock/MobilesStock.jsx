import React, { useEffect, useMemo, useState } from 'react'

const apiBase = ''

const MobilesStock = () => {
  const [rows, setRows] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState({ dealerId: '', modelNumber: '' })
  const [form, setForm] = useState({
    mobileName: '',
    brand: '',
    modelNumber: '',
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
    const [mRes, dRes] = await Promise.all([
      fetch(`${apiBase}/api/mobiles?dealerId=${q.dealerId}&modelNumber=${q.modelNumber}`),
      fetch(`${apiBase}/api/dealers`),
    ])
    const m = await mRes.json(); const d = await dRes.json()
    setRows(Array.isArray(m) ? m : [])
    setDealers(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => rows.filter(r => (Number(r.totalQuantity)||0) > 0), [rows])

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
      alert('Saved')
    } catch (ex) { alert(ex.message) } finally { setSaving(false) }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({
      mobileName: row.mobileName,
      brand: row.brand || '',
      modelNumber: row.modelNumber,
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Update Stock - Mobiles</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Add Mobile</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Name</label>
              <input className="w-full rounded-md border border-slate-300" value={form.mobileName} onChange={e=>setForm({...form, mobileName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input className="w-full rounded-md border border-slate-300" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} placeholder="e.g., Oppo, Vivo, Samsung" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model Name/Number</label>
              <input className="w-full rounded-md border border-slate-300" value={form.modelNumber} onChange={async e=>{
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Dealer</label>
              <select className="w-full rounded-md border border-slate-300" value={form.dealerId} onChange={e=>setForm({...form, dealerId:e.target.value})}>
              <option value="">Select Dealer</option>
              {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price per Product</label>
              <input type="number" className="w-full rounded-md border border-slate-300" value={form.pricePerProduct} onChange={e=>setForm({...form, pricePerProduct: parseFloat(e.target.value)||0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
              <input type="number" className="w-full rounded-md border border-slate-300" value={form.sellingPrice} onChange={e=>setForm({...form, sellingPrice: parseFloat(e.target.value)||0})} />
            </div>
            
            {/* Mobile Features Section */}
            <div className="border-t pt-3 mt-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Mobile Features</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 1</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.imeiNumber1} onChange={e=>setForm({...form, imeiNumber1:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (optional)</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.imeiNumber2} onChange={e=>setForm({...form, imeiNumber2:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.color} onChange={e=>setForm({...form, color:e.target.value})} placeholder="e.g., Black, White, Blue" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.color.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, color:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.ram} onChange={e=>setForm({...form, ram:e.target.value})} placeholder="e.g., 4GB, 6GB, 8GB" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.ram.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, ram:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Storage</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.storage} onChange={e=>setForm({...form, storage:e.target.value})} placeholder="e.g., 64GB, 128GB, 256GB" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.storage.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, storage:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SIM Slot</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.simSlot} onChange={e=>setForm({...form, simSlot:e.target.value})} placeholder="e.g., Dual SIM, Single SIM" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.simSlot.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, simSlot:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Processor</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.processor} onChange={e=>setForm({...form, processor:e.target.value})} placeholder="e.g., Snapdragon 888, A15 Bionic" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.processor.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, processor:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Display Size</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.displaySize} onChange={e=>setForm({...form, displaySize:e.target.value})} placeholder="e.g., 6.1 inch, 6.7 inch" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.displaySize.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, displaySize:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Camera</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.camera} onChange={e=>setForm({...form, camera:e.target.value})} placeholder="e.g., 12MP + 12MP, 108MP" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.camera.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, camera:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Battery</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.battery} onChange={e=>setForm({...form, battery:e.target.value})} placeholder="e.g., 4000mAh, 5000mAh" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.battery.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, battery:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Operating System</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.operatingSystem} onChange={e=>setForm({...form, operatingSystem:e.target.value})} placeholder="e.g., Android 12, iOS 15" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.operatingSystem.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, operatingSystem:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Network Type</label>
                  <input className="w-full rounded-md border border-slate-300" value={form.networkType} onChange={e=>setForm({...form, networkType:e.target.value})} placeholder="e.g., 5G, 4G LTE" />
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suggestions.networkType.map(v => (
                      <button key={v} type="button" onClick={()=>setForm({...form, networkType:v})} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50">{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-3 py-2 rounded-md bg-slate-900 text-white disabled:opacity-50">{saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}</button>
              {editingId ? (
                <button type="button" onClick={()=>{ 
                  setEditingId(''); 
                  setForm({ 
                    mobileName: '', 
                    brand: '',
                    modelNumber: '', 
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
                }} className="px-3 py-2 rounded-md border">Cancel</button>
              ) : null}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <select className="rounded-md border border-slate-300" value={q.dealerId} onChange={e=>setQ({...q, dealerId:e.target.value})}>
              <option value="">All Dealers</option>
              {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input placeholder="Model Number" className="rounded-md border border-slate-300" value={q.modelNumber} onChange={e=>setQ({...q, modelNumber:e.target.value})} />
            <button onClick={load} className="px-3 py-2 rounded-md border">Filter</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Mobile</th>
                  <th className="py-2 pr-4">Model</th>
                  <th className="py-2 pr-4">Color</th>
                  <th className="py-2 pr-4">RAM</th>
                  <th className="py-2 pr-4">Storage</th>
                  <th className="py-2 pr-4">IMEI1</th>
                  <th className="py-2 pr-4">IMEI2</th>
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Cost</th>
                  <th className="py-2 pr-4">Sell</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r)=> (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{r.mobileName}</td>
                    <td className="py-2 pr-4">{r.modelNumber}</td>
                    <td className="py-2 pr-4">{r.color || '-'}</td>
                    <td className="py-2 pr-4">{r.ram || '-'}</td>
                    <td className="py-2 pr-4">{r.storage || '-'}</td>
                    <td className="py-2 pr-4">{r.imeiNumber1}</td>
                    <td className="py-2 pr-4">{r.imeiNumber2 || '-'}</td>
                    <td className="py-2 pr-4">{r.dealerName}</td>
                    <td className="py-2 pr-4">{r.pricePerProduct}</td>
                    <td className="py-2 pr-4">{r.sellingPrice || '-'}</td>
                    <td className="py-2 pr-4">{r.totalQuantity}</td>
                    <td className="py-2 pr-2">
                      <div className="flex gap-2">
                        <button onClick={()=>onEdit(r)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={()=>onDelete(r)} className="text-red-600 hover:underline">Delete</button>
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


