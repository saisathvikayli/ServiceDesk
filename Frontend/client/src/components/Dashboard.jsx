import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Laptop, RefreshCw, TicketCheck, Folder, HardDrive } from 'lucide-react'
import api, { getErrorMessage } from '../lib/api'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/analytics/dashboard')
      console.log('Analytics API Response:', res.data) // Debug log in F12 Console
      setStats(res.data)
      setError(null)
    } catch (err) {
      console.error('Analytics Fetch Error:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#718087]">
        Loading dashboard metrics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="border-l-2 border-[#bd4b46] bg-[#fff5f4] p-4 text-sm text-[#a43e3a]">
          {error}
        </div>
      </div>
    )
  }

  // Support both top-level keys and nested 'summary' object
  const data = stats?.summary || stats || {}
  const openTickets = data.openTickets ?? data.open ?? 0
  const inProgressTickets = data.inProgressTickets ?? data.inProgress ?? 0
  const resolvedTickets = data.resolvedTickets ?? data.resolved ?? 0
  const escalatedTickets = data.escalatedTickets ?? data.escalated ?? 0
  const totalAssets = data.totalAssets ?? data.assets ?? 0

  const assetFaults = Array.isArray(stats?.assetFaults)
    ? stats.assetFaults
    : Array.isArray(data.assetFaults)
    ? data.assetFaults
    : []

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
            OPERATIONS / OVERVIEW
          </p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17252a] sm:text-4xl">
            Good morning, operator.
          </h1>
          <p className="mt-1 text-xs text-[#718087]">Here is what is happening across your service desk.</p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="flex h-9 items-center gap-2 border border-[#dce5e2] bg-white px-3 text-xs font-bold hover:bg-[#f5f7f6]"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* SLA Warning Banner */}
      {escalatedTickets > 0 && (
        <div className="mb-6 flex items-center gap-3 border-l-4 border-[#bd4b46] bg-[#fff5f4] p-4 text-xs text-[#a43e3a]">
          <AlertTriangle size={18} className="shrink-0 text-[#bd4b46]" />
          <div>
            <span className="font-bold">{escalatedTickets} ticket(s) breached SLA limits</span>
            <span className="ml-1 text-[#718087]">— requires immediate technician intervention.</span>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="border border-[#dce5e2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#718087]">
            <span className="font-mono text-[10px] uppercase">Open Tickets</span>
            <TicketCheck size={18} className="text-[#147a76]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#17252a]">{openTickets}</p>
        </div>

        <div className="border border-[#dce5e2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#718087]">
            <span className="font-mono text-[10px] uppercase">In Progress</span>
            <Folder size={18} className="text-[#0c5b59]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#0c5b59]">{inProgressTickets}</p>
        </div>

        <div className="border border-[#dce5e2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#718087]">
            <span className="font-mono text-[10px] uppercase">Resolved</span>
            <TicketCheck size={18} className="text-[#2b7a4b]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#2b7a4b]">{resolvedTickets}</p>
        </div>

        <div className="border border-[#bd4b46]/30 bg-[#fff5f4] p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#a43e3a]">
            <span className="font-mono text-[10px] uppercase font-bold">SLA Escalated</span>
            <AlertTriangle size={18} className="text-[#bd4b46]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#a43e3a]">{escalatedTickets}</p>
        </div>

        <div className="border border-[#dce5e2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#718087]">
            <span className="font-mono text-[10px] uppercase">Tracked Assets</span>
            <HardDrive size={18} className="text-[#147a76]" />
          </div>
          <p className="mt-3 text-3xl font-black text-[#17252a]">{totalAssets}</p>
        </div>
      </div>

      {/* Hardware Incident Breakdown Panel */}
      <div className="border border-[#dce5e2] bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#17252a]">
          <Laptop size={18} className="text-[#147a76]" /> Top Assets with Recurring Incidents
        </h2>

        {assetFaults.length === 0 ? (
          <p className="py-4 text-xs text-[#718087]">No hardware incident records found.</p>
        ) : (
          <div className="divide-y divide-[#edf1ef]">
            {assetFaults.map((item, index) => (
              <div key={item.assetId || index} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <p className="font-bold text-[#17252a]">{item.name}</p>
                  <p className="font-mono text-[10px] text-[#718087]">S/N: {item.serialNumber || 'N/A'}</p>
                </div>
                <span className="rounded border border-[#bd4b46]/20 bg-[#fff5f4] px-2.5 py-1 font-mono text-[11px] font-bold text-[#a43e3a]">
                  {item.count} incident{item.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard