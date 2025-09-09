import React, { useEffect, useMemo, useState } from 'react'

const apiBase = ''

const AccessoriesStock = () => {
  const [rows, setRows] = useState([])
  const [dealers, setDealers] = useState([])
  const [q, setQ] = useState({ dealerId: '', productId: '' })
  const [form, setForm] = useState({
    dealerId: '',
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
  })
  const [editingId, setEditingId] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [aRes, dRes] = await Promise.all([
      fetch(`${apiBase}/api/accessories?dealerId=${q.dealerId}&productId=${q.productId}`),
      fetch(`${apiBase}/api/dealers`),
    ])
    const a = await aRes.json(); const d = await dRes.json()
    setRows(Array.isArray(a) ? a : [])
    setDealers(Array.isArray(d) ? d : [])
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => rows, [rows])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingId ? `${apiBase}/api/accessories/${editingId}` : `${apiBase}/api/accessories`
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed')
      }
      setForm({ dealerId: '', productId: '', productName: '', quantity: 1, unitPrice: 0 })
      setEditingId('')
      await load()
      alert('Saved')
    } catch (ex) { alert(ex.message) } finally { setSaving(false) }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({ dealerId: row.dealerId, productId: row.productId, productName: row.productName, quantity: row.quantity, unitPrice: row.unitPrice })
  }

  const onDelete = async (row) => {
    if (!confirm('Delete this accessory record?')) return
    try {
      const res = await fetch(`${apiBase}/api/accessories/${row.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed')
      }
      await load()
    } catch (ex) { alert(ex.message) }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Update Stock - Accessories</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3">Add Accessory</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dealer</label>
              <select className="w-full rounded-md border border-slate-300" value={form.dealerId} onChange={e=>setForm({...form, dealerId:e.target.value})}>
                <option value="">Select Dealer</option>
                {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product ID (unique)</label>
              <input className="w-full rounded-md border border-slate-300" value={form.productId} onChange={e=>setForm({...form, productId:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input className="w-full rounded-md border border-slate-300" value={form.productName} onChange={e=>setForm({...form, productName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input type="number" className="w-full rounded-md border border-slate-300" value={form.quantity} onChange={e=>setForm({...form, quantity: parseInt(e.target.value)||0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
              <input type="number" className="w-full rounded-md border border-slate-300" value={form.unitPrice} onChange={e=>setForm({...form, unitPrice: parseFloat(e.target.value)||0})} />
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-3 py-2 rounded-md bg-slate-900 text-white disabled:opacity-50">{saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}</button>
              {editingId ? (
                <button type="button" onClick={()=>{ setEditingId(''); setForm({ dealerId: '', productId: '', productName: '', quantity: 1, unitPrice: 0 }) }} className="px-3 py-2 rounded-md border">Cancel</button>
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
            <input placeholder="Product ID" className="rounded-md border border-slate-300" value={q.productId} onChange={e=>setQ({...q, productId:e.target.value})} />
            <button onClick={load} className="px-3 py-2 rounded-md border">Filter</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Product ID</th>
                  <th className="py-2 pr-4">Product Name</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Unit Price</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r)=> (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4">{r.dealerName}</td>
                    <td className="py-2 pr-4">{r.productId}</td>
                    <td className="py-2 pr-4">{r.productName}</td>
                    <td className="py-2 pr-4">{r.quantity}</td>
                    <td className="py-2 pr-4">{r.unitPrice}</td>
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

export default AccessoriesStock


