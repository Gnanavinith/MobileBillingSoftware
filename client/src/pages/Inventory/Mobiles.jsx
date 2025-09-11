import React, { useState, useEffect, useMemo } from 'react'
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiSmartphone, FiTag, FiPackage, FiDollarSign, FiCalendar, FiDownload, FiFilter } from 'react-icons/fi'

// Resolve API base: in Electron packaged app, backend is on localhost:5000; in dev use Vite proxy with empty base
const apiBase = (typeof window !== 'undefined' && window?.process?.versions?.electron) ? 'http://localhost:5000' : ''

const Mobiles = () => {
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [search, setSearch] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState(5)
  const [searchInput, setSearchInput] = useState('')
  const [storeId, setStoreId] = useState('')
  const [storeStock, setStoreStock] = useState([])
  const [filterBrand, setFilterBrand] = useState('')
  const [filterMobile, setFilterMobile] = useState('')
  const [filterModel, setFilterModel] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterRam, setFilterRam] = useState('')
  const [filterStorage, setFilterStorage] = useState('')
  const [filterProcessor, setFilterProcessor] = useState('')
  const [brandOptions, setBrandOptions] = useState([])
  const [mobileOptions, setMobileOptions] = useState([])
  const [modelOptions, setModelOptions] = useState([])
  const [colorOptions, setColorOptions] = useState([])
  const [ramOptions, setRamOptions] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [processorOptions, setProcessorOptions] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const loadStore = async () => {
      if (!storeId) { setStoreStock([]); return }
      try {
        const res = await fetch(`${apiBase}/api/store-stock?storeId=${encodeURIComponent(storeId)}`)
        const data = await res.json()
        setStoreStock(Array.isArray(data) ? data : [])
      } catch { setStoreStock([]) }
    }
    loadStore()
  }, [storeId])

  const loadData = async () => {
    try {
      const res = await fetch(`${apiBase}/api/mobiles`)
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []
      const mapped = rows.map(r => ({
        id: r.id,
        category: 'Mobile',
        productName: r.mobileName,
        brand: r.brand || '',
        model: r.modelNumber,
        color: r.color || '',
        ram: r.ram || '',
        storage: r.storage || '',
        processor: r.processor || '',
        stock: Number(r.totalQuantity) || 0,
        purchasePrice: Number(r.pricePerProduct) || 0,
        sellingPrice: Number(r.sellingPrice ?? r.pricePerProduct) || 0,
        createdAt: r.createdAt || new Date().toISOString(),
      }))
      setInventory(mapped)
      // initial options from full dataset
      const brands = Array.from(new Set(mapped.map(x => x.brand).filter(Boolean))).sort()
      setBrandOptions(brands)
      setPurchases([])
      setSales([])
    } catch (error) {
      console.error('Error loading mobiles:', error)
      setInventory([])
    }
  }

  // Remaining stock directly from backend quantity for now

  const mobileInventory = useMemo(() => {
    const mobileItems = inventory.filter(item => item.category === 'Mobile')
      .filter(it => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        const brand = (it.brand || '').toLowerCase()
        const name = (it.productName || '').toLowerCase()
        const model = (it.model || '').toLowerCase()
        const terms = q.split(/\s+/).filter(Boolean)
        // Match all terms anywhere in brand OR name OR model
        return terms.every(t => brand.includes(t) || name.includes(t) || model.includes(t))
      })
      .filter(it => (!filterBrand || it.brand === filterBrand))
      .filter(it => (!filterMobile || it.productName === filterMobile))
      .filter(it => (!filterModel || it.model === filterModel))
      .filter(it => (!filterColor || it.color === filterColor))
      .filter(it => (!filterRam || it.ram === filterRam))
      .filter(it => (!filterStorage || it.storage === filterStorage))
      .filter(it => (!filterProcessor || it.processor === filterProcessor))
    // Group by brand+model, sum stock and compute min createdAt
    const grouped = mobileItems.reduce((map, it) => {
      const key = `${(it.brand||'').toLowerCase()}::${(it.model||'').toLowerCase()}`
      if (!map[key]) map[key] = { ...it, id: key, productName: `${it.brand ? (it.brand + ' ') : ''}${it.productName}`, imei1: '', imei2: '', stock: 0, createdAt: it.createdAt }
      map[key].stock += Number(it.stock) || 0
      if (new Date(it.createdAt) < new Date(map[key].createdAt)) map[key].createdAt = it.createdAt
      return map
    }, {})
    const arr = Object.values(grouped)
    if (!storeId) return arr.map(item => ({ ...item, remainingStock: item.stock }))
    // When a store is selected, sum quantities from StoreStock by matching productModel/name
    return arr.map(item => {
      const qty = storeStock
        .filter(s => (s.productModel || '') === item.model && (s.productName || '') === item.productName)
        .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
      return { ...item, remainingStock: qty }
    })
  }, [inventory, storeId, storeStock, search, filterBrand, filterMobile, filterModel, filterColor, filterRam, filterStorage, filterProcessor])

  // Build dependent dropdown options based on brand/mobile/model selections
  useEffect(() => {
    const items = inventory.filter(x => x.category === 'Mobile')
    const forBrand = items
    const forMobile = items.filter(x => (!filterBrand || x.brand === filterBrand))
    const forModel = forMobile.filter(x => (!filterMobile || x.productName === filterMobile))
    const forDetails = forModel.filter(x => (!filterModel || x.model === filterModel))

    const mobiles = Array.from(new Set(forMobile.map(x => x.productName).filter(Boolean))).sort()
    const models = Array.from(new Set(forModel.map(x => x.model).filter(Boolean))).sort()
    const colors = Array.from(new Set(forDetails.map(x => x.color).filter(Boolean))).sort()
    const rams = Array.from(new Set(forDetails.map(x => x.ram).filter(Boolean))).sort()
    const storages = Array.from(new Set(forDetails.map(x => x.storage).filter(Boolean))).sort()
    const processors = Array.from(new Set(forDetails.map(x => x.processor).filter(Boolean))).sort()

    setMobileOptions(mobiles)
    setModelOptions(models)
    setColorOptions(colors)
    setRamOptions(rams)
    setStorageOptions(storages)
    setProcessorOptions(processors)
  }, [inventory, filterBrand, filterMobile, filterModel])

  const filteredInventory = useMemo(() => mobileInventory, [mobileInventory])

  const downloadStatement = async (item) => {
    try {
      const res = await fetch(`${apiBase}/api/mobiles?modelNumber=${encodeURIComponent(item.model)}`)
      const data = await res.json()
      const rows = Array.isArray(data) ? data : []
      const header = ['Mobile','Model','Color','RAM','Storage','IMEI1','IMEI2','Dealer','Cost','Sell']
      const lines = [header.join(',')]
      rows.forEach(r => {
        const fields = [
          (r.mobileName||'').replaceAll(',', ' '),
          (r.modelNumber||'').replaceAll(',', ' '),
          (r.color||'').replaceAll(',', ' '),
          (r.ram||'').replaceAll(',', ' '),
          (r.storage||'').replaceAll(',', ' '),
          (r.imeiNumber1||'').replaceAll(',', ' '),
          (r.imeiNumber2||'').replaceAll(',', ' '),
          (r.dealerName||'').replaceAll(',', ' '),
          String(r.pricePerProduct??'0'),
          String(r.sellingPrice??'0'),
        ]
        lines.push(fields.join(','))
      })
      const csv = lines.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fname = `${(item.brand||'brand').replaceAll(' ','_')}-${(item.model||'model').replaceAll(' ','_')}-statement.csv`
      a.download = fname
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to download statement')
    }
  }

  const lowStockItems = filteredInventory.filter(item => item.remainingStock <= lowStockThreshold)
  const outOfStockItems = filteredInventory.filter(item => item.remainingStock <= 0)

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'bg-red-100 text-red-700', icon: FiAlertTriangle, text: 'Out of Stock' }
    if (stock <= lowStockThreshold) return { color: 'bg-yellow-100 text-yellow-700', icon: FiAlertTriangle, text: 'Low Stock' }
    return { color: 'bg-green-100 text-green-700', icon: FiCheckCircle, text: 'In Stock' }
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"><FiSmartphone className="text-slate-700" /> Mobile Inventory</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ setSearch(searchInput.trim()) } }}
              placeholder="Search by brand or mobile name..."
              className="w-72 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all px-4 py-2.5 pl-10"
            />
            <FiSearch className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          </div>
          <button
            onClick={()=>setSearch(searchInput.trim())}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 flex items-center gap-2 transition-all"
          >
            <FiSearch className="w-4 h-4" />
            <span>Find</span>
          </button>
          <button
            onClick={()=>{ setSearchInput(''); setSearch(''); setFilterMobile(''); setFilterModel(''); setFilterColor(''); setFilterRam(''); setFilterStorage('') }}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Clear Filters
          </button>
          <div className="flex items-center gap-2 text-slate-600"><FiFilter className="w-4 h-4" /><span className="text-sm">Filters:</span></div>
          <select
            value={filterBrand}
            onChange={e=>{ setFilterBrand(e.target.value); setFilterMobile(''); setFilterModel(''); setFilterColor(''); setFilterRam(''); setFilterStorage(''); setFilterProcessor('') }}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
          >
            <option value="">All Brand</option>
            {brandOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={filterMobile}
            onChange={e=>{ setFilterMobile(e.target.value); setFilterModel(''); setFilterColor(''); setFilterRam(''); setFilterStorage(''); setFilterProcessor('') }}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
          >
            <option value="">All Mobile</option>
            {mobileOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={filterModel}
            onChange={e=>{ setFilterModel(e.target.value); setFilterColor(''); setFilterRam(''); setFilterStorage(''); setFilterProcessor('') }}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
          >
            <option value="">All Model</option>
            {modelOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={filterColor}
            onChange={e=>setFilterColor(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
          >
            <option value="">All Color</option>
            {colorOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select
            value={filterRam}
            onChange={e=>setFilterRam(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
          >
            <option value="">All RAM</option>
            {ramOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterStorage}
            onChange={e=>setFilterStorage(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
          >
            <option value="">All Storage</option>
            {storageOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterProcessor}
            onChange={e=>setFilterProcessor(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
          >
            <option value="">All Processor</option>
            {processorOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Products</p>
              <p className="text-2xl font-semibold text-slate-900">{filteredInventory.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">📱</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Stock</p>
              <p className="text-2xl font-semibold text-green-600">
                {filteredInventory.filter(item => item.remainingStock > lowStockThreshold).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-2xl font-semibold text-yellow-600">{lowStockItems.length}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{outOfStockItems.length}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"><FiPackage className="text-slate-700" /> Mobile Stock Details</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 text-xs uppercase border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiTag className="w-4 h-4" /> Product Name</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiTag className="w-4 h-4" /> Brand</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiSmartphone className="w-4 h-4" /> Model/Variant</div></th>
                <th className="py-3 px-4">Remaining Stock</th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiDollarSign className="w-4 h-4" /> Purchase Price</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiDollarSign className="w-4 h-4" /> Stock Value</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiCheckCircle className="w-4 h-4" /> Status</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiCalendar className="w-4 h-4" /> Last Updated</div></th>
                <th className="py-3 px-4"><div className="flex items-center gap-1"><FiDownload className="w-4 h-4" /> Actions</div></th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td className="py-8 px-4 text-center text-slate-500" colSpan={10}>
                    No mobile products found in inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const stockStatus = getStockStatus(item.remainingStock)
                  const StockIcon = stockStatus.icon
                  const stockValue = item.remainingStock * item.purchasePrice

                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{item.productName}</td>
                      <td className="py-3 px-4">{item.brand || '-'}</td>
                      <td className="py-3 px-4">{item.model}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.remainingStock <= 0 
                            ? 'bg-red-100 text-red-700' 
                            : item.remainingStock <= lowStockThreshold
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.remainingStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="py-3 px-4">₹{stockValue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                          <StockIcon className="w-3 h-3" />
                          <span>{stockStatus.text}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={()=>downloadStatement(item)} className="px-2 py-1 text-xs rounded-md border hover:bg-slate-50 inline-flex items-center gap-1"><FiDownload className="w-3 h-3" /> Download</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            The following mobile products are running low on stock:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg p-2 border border-yellow-200">
                <p className="font-medium text-sm">{item.productName} - {item.model}</p>
                <p className="text-xs text-slate-600">Stock: {item.remainingStock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Mobiles
