import { useEffect, useMemo, useState } from 'react'
import { Eye, MessageSquare, Plus, Search, TicketCheck, Trash2, X } from 'lucide-react'
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
  const [form, setForm] = useState({ title: '', description: '', status: 'open', categoryId: '', priorityId: '' })
  const headers = { Authorization: `Bearer ${token}` }
  const canWrite = ['admin', 'agent'].includes(user?.role)

  useEffect(() => {
    let cancelled = false
    const requestHeaders = { Authorization: `Bearer ${token}` }
    Promise.all([
      api.get('/tickets', { headers: requestHeaders }),
      api.get('/categories', { headers: requestHeaders }),
      api.get('/priorities', { headers: requestHeaders }),
    ]).then(([ticketResponse, categoryResponse, priorityResponse]) => {
      if (!cancelled) {
        setTickets(ticketResponse.data)
        setCategories(categoryResponse.data)
        setPriorities(priorityResponse.data)
      }
    }).catch((error) => { if (!cancelled) setNotice({ type: 'error', text: getErrorMessage(error) }) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])
  const visibleTickets = useMemo(() => tickets.filter((ticket) => JSON.stringify(ticket).toLowerCase().includes(search.toLowerCase())), [tickets, search])
  const openCreate = () => { setForm({ title: '', description: '', status: 'open', categoryId: categories[0]?._id || '', priorityId: priorities[0]?._id || '' }); setSelected(null); setFormOpen(true) }
  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), status: form.status }
      if (form.categoryId) payload.categoryId = form.categoryId
      if (form.priorityId) payload.priorityId = form.priorityId
      const response = await api.post('/tickets', payload, { headers })
      setTickets((current) => [response.data, ...current])
      setFormOpen(false)
      setNotice({ type: 'success', text: 'Ticket created successfully.' })
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }
  const updateStatus = async (ticket, status) => { try { const response = await api.put(`/tickets/${ticket._id}`, { status }, { headers }); setTickets((current) => current.map((item) => item._id === ticket._id ? response.data : item)); setSelected(response.data); setNotice({ type: 'success', text: 'Ticket status updated.' }) } catch (error) { setNotice({ type: 'error', text: getErrorMessage(error) }) } }
  const remove = async (ticket) => { if (!window.confirm('Delete this ticket?')) return; try { await api.delete(`/tickets/${ticket._id}`, { headers }); setTickets((current) => current.filter((item) => item._id !== ticket._id)); setSelected(null); setNotice({ type: 'success', text: 'Ticket deleted.' }) } catch (error) { setNotice({ type: 'error', text: getErrorMessage(error) }) } }
  const labelFor = (id, source, key) => source.find((item) => item._id === id)?.[key] || 'Unassigned'

  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">Operations / Queue</p><h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">Tickets</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#718087]">See incoming work, keep ownership clear, and move each request to resolution.</p></div>{canWrite && <button className="flex h-11 items-center gap-2 bg-[#147a76] px-4 text-xs font-extrabold text-white hover:bg-[#0c5b59]" type="button" onClick={openCreate}><Plus size={16} /> New ticket</button>}</div>{notice && <div className={`mb-6 flex justify-between border-l-2 px-4 py-3 text-sm ${notice.type === 'error' ? 'border-[#bd4b46] bg-[#fff5f4] text-[#a43e3a]' : 'border-[#147a76] bg-[#eaf6f3] text-[#0c5b59]'}`}>{notice.text}<button type="button" onClick={() => setNotice(null)} title="Dismiss"><X size={16} /></button></div>}<section className="border border-[#dce5e2] bg-white"><div className="flex flex-wrap justify-between gap-3 border-b border-[#dce5e2] px-5 py-4"><div><h2 className="text-base font-extrabold">{tickets.length} ticket{tickets.length === 1 ? '' : 's'} in queue</h2><p className="mt-1 text-xs text-[#718087]">{tickets.filter((ticket) => !['closed', 'resolved'].includes(String(ticket.status).toLowerCase())).length} need attention</p></div><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa8a8]" size={15} /><input className="h-9 w-56 border border-[#dce5e2] bg-[#f5f7f6] pl-9 pr-3 text-xs outline-none focus:border-[#147a76]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tickets" aria-label="Search tickets" /></label></div>{loading ? <div className="flex min-h-64 items-center justify-center text-sm text-[#718087]">Loading tickets...</div> : visibleTickets.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-[#718087]"><TicketCheck size={32} className="text-[#147a76]" /><strong className="text-sm text-[#17252a]">No tickets found</strong><span className="text-xs">Create a ticket to start the queue.</span></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-[#dce5e2] bg-[#f8faf9]"><th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">Request</th><th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">Category</th><th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">Status</th><th className="px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">Priority</th><th className="px-5 py-3" /></tr></thead><tbody>{visibleTickets.map((ticket) => <tr className="border-b border-[#edf1ef] hover:bg-[#fbfcfb]" key={ticket._id}><td className="max-w-[270px] px-5 py-4"><button className="truncate text-left text-sm font-bold hover:text-[#147a76]" type="button" onClick={() => setSelected(ticket)}>{ticket.title}</button><span className="mt-1 block font-mono text-[10px] text-[#9aa8a8]">#{String(ticket._id).slice(-6)}</span></td><td className="px-5 py-4 text-xs text-[#718087]">{labelFor(ticket.categoryId, categories, 'cat_name')}</td><td className="px-5 py-4"><span className="rounded-full bg-[#eaf6f3] px-2 py-1 font-mono text-[10px] uppercase text-[#0c5b59]">{ticket.status || 'open'}</span></td><td className="px-5 py-4 text-xs text-[#718087]">{labelFor(ticket.priorityId, priorities, 'p_name')}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="flex h-8 w-8 items-center justify-center text-[#147a76] hover:bg-[#eaf6f3]" type="button" onClick={() => setSelected(ticket)} title="View ticket"><Eye size={15} /></button>{user?.role === 'admin' && <button className="flex h-8 w-8 items-center justify-center text-[#bd4b46] hover:bg-[#fff5f4]" type="button" onClick={() => remove(ticket)} title="Delete ticket"><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table></div>}</section>{(formOpen || selected) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17252a]/40 p-5"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 sm:p-8">{formOpen ? <form onSubmit={save}><div className="mb-7 flex justify-between"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#147a76]">New request</p><h2 className="text-2xl font-extrabold tracking-[-0.05em]">Create ticket</h2></div><button type="button" onClick={() => setFormOpen(false)} title="Close"><X size={20} /></button></div><div className="grid gap-4"><label className="grid gap-2 text-xs font-bold">Title<input className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm font-normal outline-none focus:border-[#147a76]" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="What needs attention?" /></label><label className="grid gap-2 text-xs font-bold">Description<textarea className="min-h-28 border border-[#dce5e2] bg-[#f5f7f6] px-3 py-2 text-sm font-normal outline-none focus:border-[#147a76]" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add useful context for the team" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold">Category<select className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm font-normal" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Unassigned</option>{categories.map((category) => <option value={category._id} key={category._id}>{category.cat_name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold">Priority<select className="h-11 border border-[#dce5e2] bg-[#f5f7f6] px-3 text-sm font-normal" value={form.priorityId} onChange={(event) => setForm({ ...form, priorityId: event.target.value })}><option value="">Unassigned</option>{priorities.map((priority) => <option value={priority._id} key={priority._id}>{priority.p_name}</option>)}</select></label></div></div><div className="mt-8 flex justify-end gap-2"><button className="h-11 border border-[#dce5e2] px-4 text-xs font-bold" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="h-11 bg-[#147a76] px-5 text-xs font-extrabold text-white" type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create ticket'}</button></div></form> : <><div className="mb-7 flex justify-between"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#147a76]">Ticket detail</p><h2 className="max-w-xl text-2xl font-extrabold tracking-[-0.05em]">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} title="Close"><X size={20} /></button></div><p className="whitespace-pre-wrap text-sm leading-7 text-[#718087]">{selected.description || 'No description provided.'}</p><div className="mt-7 flex flex-wrap items-center gap-3 border-y border-[#dce5e2] py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#718087]">Status</span>{['open', 'in-progress', 'resolved', 'closed'].map((status) => <button className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${selected.status === status ? 'bg-[#147a76] text-white' : 'bg-[#f5f7f6] text-[#718087] hover:bg-[#eaf6f3]'}`} key={status} type="button" onClick={() => updateStatus(selected, status)}>{status}</button>)}</div><div className="mt-6 flex items-center gap-2 text-xs text-[#718087]"><MessageSquare size={15} /> Comments are available through the backend ticket endpoint.</div>{user?.role === 'admin' && <button className="mt-8 flex items-center gap-2 text-xs font-bold text-[#bd4b46]" type="button" onClick={() => remove(selected)}><Trash2 size={15} /> Delete ticket</button>}</>}</div></div>}</div>
}

export default TicketPage
