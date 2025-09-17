import React, { useEffect, useMemo, useState } from 'react'

const apiBase = 'http://localhost:5000'

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
    sellingPrice: 0,
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
      setForm({ dealerId: '', productId: '', productName: '', quantity: 1, unitPrice: 0, sellingPrice: 0 })
      setEditingId('')
      await load()
      alert('Added to Inventory')
    } catch (ex) { alert(ex.message) } finally { setSaving(false) }
  }

  const onEdit = (row) => {
    setEditingId(row.id)
    setForm({ dealerId: row.dealerId, productId: row.productId, productName: row.productName, quantity: row.quantity, unitPrice: row.unitPrice, sellingPrice: row.sellingPrice || 0 })
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

  const moveToInventory = async (row) => {
    if (!confirm(`Move ${row.productName} (${row.productId}) to Inventory?`)) return
    try {
      // Delete the record from stock update list since it's now moved to inventory
      const res = await fetch(`${apiBase}/api/accessories/${row.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}))
        throw new Error(msg.error || 'Failed to move to inventory')
      }
      await load() // Refresh the list
      alert(`${row.productName} has been moved to Inventory! You can view it in the Inventory section.`)
    } catch (ex) { 
      alert('Error moving to inventory: ' + ex.message) 
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Update Stock - Accessories</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Add Accessory</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dealer</label>
              <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all" value={form.dealerId} onChange={e=>setForm({...form, dealerId:e.target.value})}>
                <option value="">Select Dealer</option>
                {dealers.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product ID (unique)</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all" value={form.productId} onChange={e=>setForm({...form, productId:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all" value={form.productName} onChange={e=>setForm({...form, productName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all" value={form.quantity} onChange={e=>setForm({...form, quantity: parseInt(e.target.value)||0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price</label>
              <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" value={form.unitPrice} onChange={e=>setForm({...form, unitPrice: parseFloat(e.target.value)||0})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
              <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" value={form.sellingPrice} onChange={e=>setForm({...form, sellingPrice: parseFloat(e.target.value)||0})} />
            </div>
            <div className="flex gap-2">
              <button disabled={saving} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white disabled:opacity-50 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all">{saving ? 'Saving...' : (editingId ? 'Update' : 'Add to Inventory')}</button>
              {editingId ? (
                <button type="button" onClick={()=>{ setEditingId(''); setForm({ dealerId: '', productId: '', productName: '', quantity: 1, unitPrice: 0, sellingPrice: 0 }) }} className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all">Cancel</button>
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
            <input placeholder="Product ID" className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all" value={q.productId} onChange={e=>setQ({...q, productId:e.target.value})} />
            <button onClick={load} className="px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 transition-all">Filter</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 text-xs uppercase bg-gradient-to-r from-indigo-50 to-blue-50">
                  <th className="py-2 pr-4">Dealer</th>
                  <th className="py-2 pr-4">Product ID</th>
                  <th className="py-2 pr-4">Product Name</th>
                  <th className="py-2 pr-4">Item Codes</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Unit Price</th>
                  <th className="py-2 pr-4">Selling Price</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r)=> (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-2 pr-4">{r.dealerName}</td>
                    <td className="py-2 pr-4">{r.productId}</td>
                    <td className="py-2 pr-4">{r.productName}</td>
                    <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words">{Array.isArray(r.productIds) && r.productIds.length ? r.productIds.join(', ') : '-'}</td>
                    <td className="py-2 pr-4">{r.quantity}</td>
                    <td className="py-2 pr-4">{r.unitPrice}</td>
                    <td className="py-2 pr-4">{r.sellingPrice || '-'}</td>
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

export default AccessoriesStock


