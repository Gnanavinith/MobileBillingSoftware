import React, { useEffect, useMemo, useState } from 'react'

const apiBase = ''

const MobilesStock = () => {
  const [rows, setRows] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState({ dealerId: '', modelNumber: '' })
  const [form, setForm] = useState({
    mobileName: '',
    modelNumber: '',
    imeiNumber1: '',
    imeiNumber2: '',
    dealerId: '',
    pricePerProduct: 0,
    totalQuantity: 1,
  })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')

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

  const filtered = useMemo(() => rows, [rows])

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
      setForm({ mobileName: '', modelNumber: '', imeiNumber1: '', imeiNumber2: '', dealerId: '', pricePerProduct: 0, totalQuantity: 1 })
      setEditingId('')
      await load()
      alert('Saved')
    } catch (ex) { alert(ex.message) } finally { setSaving(false) }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({
      mobileName: row.mobileName,
      modelNumber: row.modelNumber,
      imeiNumber1: row.imeiNumber1,
      imeiNumber2: row.imeiNumber2 || '',
      dealerId: row.dealerId,
      pricePerProduct: row.pricePerProduct,
      totalQuantity: row.totalQuantity,
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Model Number</label>
              <input className="w-full rounded-md border border-slate-300" value={form.modelNumber} onChange={e=>setForm({...form, modelNumber:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 1</label>
              <input className="w-full rounded-md border border-slate-300" value={form.imeiNumber1} onChange={e=>setForm({...form, imeiNumber1:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IMEI 2 (optional)</label>
              <input className="w-full rounded-md border border-slate-300" value={form.imeiNumber2} onChange={e=>setForm({...form, imeiNumber2:e.target.value})} />
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
              <input type="number" className="w-full rounded-md border border-slate-300" value={form.totalQuantity} onChange={e=>setForm({...form, totalQuantity: parseInt(e.target.value)||0})} />
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-3 py-2 rounded-md bg-slate-900 text-white disabled:opacity-50">{saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}</button>
              {editingId ? (
                <button type="button" onClick={()=>{ setEditingId(''); setForm({ mobileName: '', modelNumber: '', imeiNumber1: '', imeiNumber2: '', dealerId: '', pricePerProduct: 0, totalQuantity: 1 }) }} className="px-3 py-2 rounded-md border">Cancel</button>
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
                  <th className="py-2 pr-4">IMEI1</th>
                  <th className="py-2 pr-4">IMEI2</th>
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r)=> (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{r.mobileName}</td>
                    <td className="py-2 pr-4">{r.modelNumber}</td>
                    <td className="py-2 pr-4">{r.imeiNumber1}</td>
                    <td className="py-2 pr-4">{r.imeiNumber2 || '-'}</td>
                    <td className="py-2 pr-4">{r.dealerName}</td>
                    <td className="py-2 pr-4">{r.pricePerProduct}</td>
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


