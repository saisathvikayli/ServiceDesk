import { useEffect, useMemo, useState, useCallback } from 'react'
import { Eye, Plus, Search, TicketCheck, Trash2, X } from 'lucide-react'
import api, { getErrorMessage } from '../lib/api'

function TicketPage({ token, user }) {
  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [priorities, setPriorities] = useState([])
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'open',
    categoryId: '',
    priorityId: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [ticketsRes, categoriesRes, prioritiesRes] = await Promise.all([
        api.get('/tickets', { headers }),
        api.get('/categories', { headers }),
        api.get('/priorities', { headers }),
      ])
      setTickets(ticketsRes.data)
      setCategories(categoriesRes.data)
      setPriorities(prioritiesRes.data)
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const visibleTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          t.title?.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [tickets, search]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await api.post('/tickets', form, { headers: { Authorization: `Bearer ${token}` } })
      setNotice({ type: 'success', text: 'Ticket created successfully.' })
      setFormOpen(false)
      setForm({ title: '', description: '', status: 'open', categoryId: '', priorityId: '' })
      await loadData()
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return
    try {
      await api.delete(`/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setNotice({ type: 'success', text: 'Ticket deleted.' })
      if (selected?._id === id) setSelected(null)
      await loadData()
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
            Queue / Tickets
          </p>
          <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">Support Tickets</h1>
        </div>
        <button
          className="flex h-11 items-center gap-2 bg-[#147a76] px-4 text-xs font-extrabold text-white hover:bg-[#0c5b59]"
          type="button"
          onClick={() => setFormOpen(true)}
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {notice && (
        <div
          className={`mb-6 flex justify-between border-l-2 px-4 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-[#bd4b46] bg-[#fff5f4] text-[#a43e3a]'
              : 'border-[#147a76] bg-[#eaf6f3] text-[#0c5b59]'
          }`}
        >
          {notice.text}
          <button type="button" onClick={() => setNotice(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="border border-[#dce5e2] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e2] px-5 py-4">
          <h2 className="text-base font-extrabold">{tickets.length} tickets</h2>
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a8]" size={15} />
            <input
              className="h-9 w-56 border border-[#dce5e2] bg-[#f5f7f6] pl-9 pr-3 text-xs outline-none focus:border-[#147a76]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
            />
          </label>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-[#718087]">
            Loading tickets...
          </div>
        ) : visibleTickets.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-[#718087]">
            <TicketCheck size={30} className="text-[#147a76]" />
            <span className="text-sm">No tickets found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-[#dce5e2] bg-[#f8faf9] font-mono text-[10px] uppercase text-[#718087]">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-[#edf1ef] text-sm hover:bg-[#fbfcfb]">
                    <td className="px-5 py-4 font-mono text-xs text-[#9aa8a8]">
                      #{String(ticket._id).slice(-5)}
                    </td>
                    <td className="px-5 py-4 font-bold">{ticket.title}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#eaf6f3] px-2 py-1 font-mono text-[10px] uppercase text-[#0c5b59]">
                        {ticket.status || 'open'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#147a76] hover:bg-[#eaf6f3]"
                          type="button"
                          onClick={() => setSelected(ticket)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="flex h-8 w-8 items-center justify-center text-[#bd4b46] hover:bg-[#fff5f4]"
                          type="button"
                          onClick={() => handleDelete(ticket._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* New Ticket Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17252a]/40 p-5">
          <form className="w-full max-w-lg bg-white p-6 sm:p-8" onSubmit={handleSubmit}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Create Ticket</h2>
              <button type="button" onClick={() => setFormOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 text-xs font-bold">
              <label className="grid gap-1">
                Title
                <input
                  className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 font-normal outline-none focus:border-[#147a76]"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label className="grid gap-1">
                Description
                <textarea
                  className="min-h-24 border border-[#dce5e2] bg-[#f5f7f6] p-3 font-normal outline-none focus:border-[#147a76]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="grid gap-1">
                  Category
                  <select
                    className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 font-normal outline-none focus:border-[#147a76]"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.cat_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1">
                  Priority
                  <select
                    className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 font-normal outline-none focus:border-[#147a76]"
                    value={form.priorityId}
                    onChange={(e) => setForm({ ...form, priorityId: e.target.value })}
                  >
                    <option value="">Select Priority</option>
                    {priorities.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name || p.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-11 border border-[#dce5e2] px-4 text-xs font-bold"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="h-11 bg-[#147a76] px-5 text-xs font-extrabold text-white hover:bg-[#0c5b59]"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Ticket Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17252a]/40 p-5">
          <div className="w-full max-w-lg bg-white p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-[#9aa8a8]">#{String(selected._id).slice(-5)}</span>
              <button type="button" onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-extrabold">{selected.title}</h2>
            <p className="mt-3 text-sm text-[#718087]">{selected.description}</p>
            <div className="mt-6 flex justify-end">
              <button
                className="h-11 border border-[#dce5e2] px-4 text-xs font-bold"
                type="button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketPage