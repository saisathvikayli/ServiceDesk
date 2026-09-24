import { useEffect, useState } from 'react'
import { Boxes, Check, LogOut, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, X } from 'lucide-react'
import api, { getErrorMessage } from '../lib/api'

const priorityLabels = { 1: 'Critical', 2: 'High', 3: 'Standard', 4: 'Low' }

function CategoryWorkspace({ token, user, onLogout }) {
  const [categories, setCategories] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [priority, setPriority] = useState('2')
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [notice, setNotice] = useState(null)

  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await api.get('/categories', { headers: { Authorization: `Bearer ${token}` } })
      setCategories(response.data)
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    api.get('/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => { if (!cancelled) setCategories(response.data) })
      .catch((error) => { if (!cancelled) setNotice({ type: 'error', text: getErrorMessage(error) }) })
    return () => { cancelled = true }
  }, [token])

  const resetForm = () => {
    setCategoryName('')
    setPriority('2')
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice(null)
    const payload = { cat_name: categoryName.trim(), default_priority: Number(priority) }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload, config)
        setNotice({ type: 'success', text: 'Category updated successfully.' })
      } else {
        await api.post('/categories', payload, config)
        setNotice({ type: 'success', text: 'Category created successfully.' })
      }
      resetForm()
      await loadCategories()
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    setLoading(true)
    try {
      await api.delete(`/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setCategories((current) => current.filter((category) => category._id !== id))
      setNotice({ type: 'success', text: 'Category deleted successfully.' })
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  const visibleCategories = categories.filter((category) => category.cat_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#17252a]">
      <header className="border-b border-[#dce5e2] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center bg-[#f2c14e] text-[#17252a]"><ShieldCheck size={17} /></div><span className="font-extrabold tracking-[-0.06em]">service<span className="text-[#147a76]">/</span>desk</span></div>
          <div className="flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{user?.name || user?.email || 'Operator'}</p><p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#718087]">{user?.role || 'user'}</p></div><button className="flex h-9 w-9 items-center justify-center border border-transparent text-[#718087] transition hover:border-[#dce5e2] hover:bg-[#f5f7f6] hover:text-[#17252a]" type="button" onClick={onLogout} title="Sign out"><LogOut size={17} /></button></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#147a76]">Catalogue / Categories</p><h1 className="text-4xl font-extrabold leading-none tracking-[-0.07em] sm:text-6xl">Ticket categories</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#718087]">Define the shared language your team uses to route, prioritise, and resolve support work.</p></div><div className="hidden font-mono text-2xl text-[#147a76] sm:block">01<span className="text-xs text-[#9aa8a8]">/04</span></div></div>
        {notice && <div className={`mb-6 flex items-center justify-between border-l-2 px-4 py-3 text-sm ${notice.type === 'error' ? 'border-[#bd4b46] bg-[#fff5f4] text-[#a43e3a]' : 'border-[#147a76] bg-[#eaf6f3] text-[#0c5b59]'}`}><span className="flex items-center gap-2">{notice.type === 'success' && <Check size={16} />}{notice.text}</span><button type="button" onClick={() => setNotice(null)} title="Dismiss"><X size={16} /></button></div>}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
          <form className="border border-[#dce5e2] bg-white p-6 sm:p-8" onSubmit={handleSubmit}><div className="mb-8 flex items-start justify-between"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#147a76]">{editingId ? 'Edit record' : 'New record'}</p><h2 className="text-xl font-extrabold tracking-[-0.04em]">{editingId ? 'Update category' : 'Add a category'}</h2></div><Boxes className="text-[#147a76]" size={23} /></div><label className="mb-2 block text-xs font-bold" htmlFor="category-name">Category name</label><input className="h-12 w-full border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm outline-none transition focus:border-[#147a76] focus:ring-4 focus:ring-[#147a76]/10" id="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required placeholder="e.g. Hardware request" /><label className="mb-2 mt-5 block text-xs font-bold" htmlFor="priority">Default priority</label><select className="h-12 w-full border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm outline-none focus:border-[#147a76] focus:ring-4 focus:ring-[#147a76]/10" id="priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="1">1 · Critical</option><option value="2">2 · High</option><option value="3">3 · Standard</option><option value="4">4 · Low</option></select><div className="mt-7 flex gap-2"><button className="flex h-11 flex-1 items-center justify-center gap-2 bg-[#147a76] px-4 text-xs font-extrabold text-white transition hover:bg-[#0c5b59] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={loading}>{editingId ? <Pencil size={15} /> : <Plus size={16} />}{loading ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}</button>{editingId && <button className="flex h-11 items-center justify-center gap-2 border border-[#dce5e2] px-3 text-xs font-bold" type="button" onClick={resetForm}><X size={15} /> Cancel</button>}</div></form>
          <section className="border border-[#dce5e2] bg-white p-6 sm:p-8"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#147a76]">Live from MongoDB</p><h2 className="text-xl font-extrabold tracking-[-0.04em]">Current categories <span className="ml-2 font-mono text-sm font-normal text-[#147a76]">{categories.length}</span></h2></div><div className="flex gap-2"><label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a8]" size={15} /><input className="h-9 w-44 border border-[#dce5e2] bg-[#f5f7f6] pl-9 pr-3 text-xs outline-none focus:border-[#147a76]" aria-label="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" /></label><button className="flex h-9 w-9 items-center justify-center bg-[#f5f7f6] text-[#147a76] transition hover:bg-[#eaf6f3] disabled:opacity-50" type="button" onClick={loadCategories} disabled={loadingCategories} title="Refresh categories"><RefreshCw size={16} /></button></div></div>{loadingCategories ? <div className="flex min-h-52 items-center justify-center text-sm text-[#718087]">Loading categories...</div> : visibleCategories.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center gap-2 border-t border-[#dce5e2] text-center text-[#718087]"><Boxes className="text-[#147a76]" size={30} /><strong className="text-sm text-[#17252a]">{search ? 'No matching categories' : 'No categories yet'}</strong><span className="text-xs">{search ? 'Try a different search term.' : 'Create the first one using the form.'}</span></div> : <div className="border-t border-[#dce5e2]">{visibleCategories.map((category, index) => <article className="flex min-h-[72px] items-center gap-3 border-b border-[#dce5e2]" key={category._id}><span className="w-7 font-mono text-[11px] text-[#9aa8a8]">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{category.cat_name}</strong><span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#718087]">Priority {category.default_priority} · {priorityLabels[category.default_priority]}</span></div><div className="flex gap-1"><button className="flex h-8 w-8 items-center justify-center text-[#147a76] hover:bg-[#eaf6f3]" type="button" onClick={() => { setEditingId(category._id); setCategoryName(category.cat_name); setPriority(String(category.default_priority)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} title="Edit category"><Pencil size={15} /></button><button className="flex h-8 w-8 items-center justify-center text-[#bd4b46] hover:bg-[#fff5f4]" type="button" onClick={() => handleDelete(category._id)} title="Delete category"><Trash2 size={15} /></button></div></article>)}</div>}</section>
        </div>
      </div>
    </main>
  )
}

export default CategoryWorkspace
