import { useState, useEffect, useContext, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { AlertTriangle, Clock, MessageSquare } from 'lucide-react'

export default function TicketPage() {
  const { user } = useContext(AuthContext)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'assigned', 'unassigned'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [commentText, setCommentText] = useState('')

  const canManageTickets = ['technician', 'manager', 'admin'].includes(user?.role)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/tickets')
      // Unwrap Axios response payload
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.tickets || raw?.data || []
      setTickets(list)
    } catch (err) {
      console.error('Failed to load tickets:', err)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTechnicians = useCallback(async () => {
    try {
      const res = await api.get('/users?role=technician')
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.users || raw?.data || []
      setTechnicians(list)
    } catch (err) {
      console.warn('Could not load technicians:', err?.message)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    if (canManageTickets) {
      fetchTechnicians()
    }
  }, [user, canManageTickets, fetchTickets, fetchTechnicians])

  const handleAssign = async (ticketId, technicianId) => {
    try {
      await api.patch(`/tickets/${ticketId}/assign`, { technicianId })
      toast.success('Ticket reassigned successfully')
      fetchTickets()
      if (selectedTicket?._id === ticketId || selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, assignedTo: technicianId }))
      }
    } catch (err) {
      console.error('Reassign error:', err)
      toast.error('Failed to reassign ticket')
    }
  }

  const handleStatusChange = async (ticketId, status) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status })
      toast.success(`Status updated to ${status}`)
      fetchTickets()
      if (selectedTicket?._id === ticketId || selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status }))
      }
    } catch (err) {
      console.error('Status change error:', err)
      toast.error('Failed to update ticket status')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedTicket) return

    const tId = selectedTicket._id || selectedTicket.id

    try {
      const res = await api.post(`/tickets/${tId}/comments`, {
        text: commentText,
        comment: commentText,
      })
      const newComment = res?.data ?? res
      toast.success('Comment added')
      setSelectedTicket((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }))
      setCommentText('')
    } catch (err) {
      console.error('Add comment error:', err)
      toast.error('Failed to post comment')
    }
  }

  const filteredTickets = tickets.filter((t) => {
    const assignedId = typeof t.assignedTo === 'object' ? t.assignedTo?._id || t.assignedTo?.id : t.assignedTo
    const currentUserId = user?._id || user?.id

    if (filter === 'assigned') return String(assignedId) === String(currentUserId)
    if (filter === 'unassigned') return !assignedId
    return true
  })

  const renderPriorityBadge = (priority) => {
    const pName = typeof priority === 'object' ? priority?.p_name || priority?.name || 'P3' : String(priority || 'P3')
    const p = pName.toUpperCase()
    if (p.includes('1') || p.includes('CRITICAL') || p.includes('HIGH')) {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-bold">P1 - High</span>
    }
    if (p.includes('2') || p.includes('MEDIUM')) {
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold">P2 - Medium</span>
    }
    return <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">P3 - Low</span>
  }

  const renderSlaStatus = (ticket) => {
    if (ticket.slaBreached || ticket.isBreached) {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
          <AlertTriangle size={12} /> SLA Breached
        </span>
      )
    }
    if (ticket.dueDate || ticket.slaDeadline) {
      const due = new Date(ticket.dueDate || ticket.slaDeadline)
      return (
        <span className="flex items-center gap-1 text-xs text-[#0c5b59] bg-[#eaf6f3] px-2 py-0.5 rounded">
          <Clock size={12} /> Due: {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    }
    return <span className="text-xs text-gray-400">SLA Active</span>
  }

  const getCategoryName = (cat) => {
    if (typeof cat === 'object') return cat?.cat_name || cat?.name || 'General'
    return cat || 'General'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#17252a]">Support Tickets</h1>
          <p className="text-sm text-[#718087]">Manage, assign, and track service requests and SLAs.</p>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex gap-2 border-b border-[#dce5e2] pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            filter === 'all' ? 'bg-[#0c5b59] text-white' : 'text-[#718087] hover:bg-[#eaf6f3]'
          }`}
        >
          All Queue ({tickets.length})
        </button>
        {canManageTickets && (
          <>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                filter === 'assigned' ? 'bg-[#0c5b59] text-white' : 'text-[#718087] hover:bg-[#eaf6f3]'
              }`}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                filter === 'unassigned' ? 'bg-[#0c5b59] text-white' : 'text-[#718087] hover:bg-[#eaf6f3]'
              }`}
            >
              Unassigned Queue
            </button>
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-[#dce5e2]">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-[#dce5e2]">No tickets found in this view.</div>
          ) : (
            filteredTickets.map((t) => {
              const ticketId = t._id || t.id
              const isSelected = selectedTicket?._id === ticketId || selectedTicket?.id === ticketId

              return (
                <div
                  key={ticketId}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 bg-white rounded-lg border cursor-pointer transition hover:border-[#0c5b59] ${
                    isSelected ? 'ring-2 ring-[#0c5b59] border-transparent' : 'border-[#dce5e2]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#17252a]">{t.title || t.subject || 'Untitled Ticket'}</h3>
                    {renderPriorityBadge(t.priority)}
                  </div>

                  <p className="text-sm text-[#718087] line-clamp-2 mb-3">{t.description || 'No description provided.'}</p>

                  <div className="flex items-center justify-between text-xs text-[#718087] border-t pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded uppercase">{t.status || 'OPEN'}</span>
                      <span>• {getCategoryName(t.category)}</span>
                    </div>
                    <div>{renderSlaStatus(t)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Selected Ticket Drawer / Details */}
        <div className="bg-white p-5 rounded-lg border border-[#dce5e2] h-fit space-y-4">
          {selectedTicket ? (
            <>
              <div className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  {renderPriorityBadge(selectedTicket.priority)}
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {String(selectedTicket._id || selectedTicket.id).slice(-6)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#17252a]">{selectedTicket.title || selectedTicket.subject}</h2>
                <p className="text-xs text-gray-500 mt-1">Status: <strong className="uppercase">{selectedTicket.status}</strong></p>
              </div>

              {/* Manager Actions */}
              {canManageTickets && (
                <div className="space-y-3 bg-[#f5f7f6] p-3 rounded-md border border-[#dce5e2]">
                  <p className="text-xs font-bold text-[#0c5b59] uppercase tracking-wider">Management Actions</p>
                  
                  {/* Reassign Ticket */}
                  <div>
                    <label className="block text-xs text-[#718087] mb-1">Assign Technician</label>
                    <select
                      onChange={(e) => handleAssign(selectedTicket._id || selectedTicket.id, e.target.value)}
                      value={typeof selectedTicket.assignedTo === 'object' ? selectedTicket.assignedTo?._id : selectedTicket.assignedTo || ''}
                      className="w-full text-xs p-2 border rounded bg-white"
                    >
                      <option value="">-- Unassigned --</option>
                      {technicians.map((tech) => (
                        <option key={tech._id || tech.id} value={tech._id || tech.id}>
                          {tech.name || tech.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Change Status */}
                  <div>
                    <label className="block text-xs text-[#718087] mb-1">Update Status</label>
                    <select
                      onChange={(e) => handleStatusChange(selectedTicket._id || selectedTicket.id, e.target.value)}
                      value={selectedTicket.status || 'open'}
                      className="w-full text-xs p-2 border rounded bg-white"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="pending">Pending Vendor</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedTicket.description || 'No description provided.'}</p>
              </div>

              {/* Comments Thread */}
              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <MessageSquare size={14} /> Activity & Comments
                </p>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {(selectedTicket.comments || []).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No comments yet.</p>
                  ) : (
                    selectedTicket.comments.map((c, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded text-xs border">
                        <p className="font-semibold text-gray-800">{c.userName || c.user?.name || 'Support Agent'}</p>
                        <p className="text-gray-600">{c.text || c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-xs p-2 border rounded"
                  />
                  <button type="submit" className="bg-[#0c5b59] text-white text-xs px-3 py-2 rounded font-semibold">
                    Post
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              Select a ticket from the queue to view full details and SLA metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}