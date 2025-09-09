import React, { useEffect, useMemo, useState } from 'react'

const apiBase = '' // use Vite proxy: fetch('/api/...')

const ManageDealers = () => {
  const [dealers, setDealers] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    gst: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${apiBase}/api/dealers`)
        const data = await res.json()
        setDealers(Array.isArray(data) ? data : [])
      } catch {
        setDealers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return dealers
    return dealers.filter(d =>
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      (d.gst || '').toLowerCase().includes(q)
    )
  }, [dealers, search])

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '', email: '', gst: '', notes: '' })
    setEditingId(null)
  }

  const refreshList = async () => {
    try {
      const res = await fetch(`${apiBase}/api/dealers`)
      const data = await res.json()
      setDealers(Array.isArray(data) ? data : [])
    } catch {}
  }

  const validateUnique = () => {
    const phoneExists = dealers.some(d => d.phone && d.phone === form.phone && d.id !== editingId)
    const gstExists = form.gst ? dealers.some(d => d.gst && d.gst === form.gst && d.id !== editingId) : false
    if (phoneExists) return 'Phone number already exists'
    if (gstExists) return 'GST number already exists'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const err = validateUnique()
    if (err) {
      alert(err)
      return
    }
    if (!form.name || !form.phone) {
      alert('Dealer Name and Phone are required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`${apiBase}/api/dealers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}))
          throw new Error(msg.error || 'Failed to update dealer')
        }
      } else {
        const res = await fetch(`${apiBase}/api/dealers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}))
          throw new Error(msg.error || 'Failed to create dealer')
        }
      }
      await refreshList()
      resetForm()
    } catch (ex) {
      alert(ex.message)
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (dealer) => {
    setEditingId(dealer.id)
    setForm({ ...dealer })
  }

  const onDelete = async (dealer) => {
    if (!confirm('Delete this dealer? This action cannot be undone.')) return
    try {
      const res = await fetch(`${apiBase}/api/dealers/${dealer.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg.error || 'Failed to delete dealer')
      }
      await refreshList()
      if (editingId === dealer.id) resetForm()
    } catch (ex) {
      alert(ex.message)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Manage Dealers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3">{editingId ? 'Edit Dealer' : 'Add Dealer'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-slate-600">Dealer ID</label>
              <input value={editingId || 'Auto-generated'} readOnly className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Dealer Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" required />
            </div>
            <div>
              <label className="text-sm text-slate-600">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" required />
            </div>
            <div>
              <label className="text-sm text-slate-600">Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Email (optional)</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
            </div>
            <div>
              <label className="text-sm text-slate-600">GST Number</label>
              <input value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Notes / Remarks</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" rows={3} />
            </div>
            <div className="flex gap-2">
              <button disabled={saving} type="submit" className="px-3 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : editingId ? 'Update' : 'Add Dealer'}</button>
              <button type="button" onClick={resetForm} className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50">Clear</button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Dealers</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone / GST" className="rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase">
                  <th className="py-2 pr-4">Dealer ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">GST No.</th>
                  <th className="py-2 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-3 pr-4" colSpan={6}>Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="py-3 pr-4" colSpan={6}>No dealers found.</td>
                  </tr>
                ) : (
                  filtered.map(d => (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="py-2 pr-4">{d.id}</td>
                      <td className="py-2 pr-4">{d.name}</td>
                      <td className="py-2 pr-4">{d.phone}</td>
                      <td className="py-2 pr-4">{d.address}</td>
                      <td className="py-2 pr-4">{d.gst}</td>
                      <td className="py-2 pr-2">
                        <div className="flex gap-2">
                          <button onClick={() => onEdit(d)} className="text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => onDelete(d)} className="text-red-600 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageDealers


