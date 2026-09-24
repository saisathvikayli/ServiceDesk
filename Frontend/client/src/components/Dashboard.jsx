import { useEffect, useState, useCallback } from 'react'
import { ArrowUpRight, BookOpen, Boxes, CheckCircle2, ClipboardList, HardDrive, RefreshCw, TicketCheck, Truck } from 'lucide-react'
import api, { getErrorMessage } from '../lib/api'

const cards = [
  { key: 'tickets', label: 'Open tickets', icon: ClipboardList, color: 'bg-[#eaf6f3] text-[#0c5b59]' },
  { key: 'categories', label: 'Categories', icon: Boxes, color: 'bg-[#fff8df] text-[#926e16]' },
  { key: 'assets', label: 'Tracked assets', icon: HardDrive, color: 'bg-[#eef1fb] text-[#4d5d9b]' },
  { key: 'knowledge', label: 'Knowledge articles', icon: BookOpen, color: 'bg-[#fff0ee] text-[#a43e3a]' },
]

function Dashboard({ token, onNavigate }) {
  const [data, setData] = useState({ tickets: [], categories: [], assets: [], knowledge: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [tickets, categories, assets, knowledge] = await Promise.all([
        api.get('/tickets', { headers }),
        api.get('/categories', { headers }),
        api.get('/assets', { headers }),
        api.get('/knowledge-articles'),
      ])
      setData({
        tickets: tickets.data,
        categories: categories.data,
        assets: assets.data,
        knowledge: knowledge.data,
      })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openTickets = data.tickets.filter(
    (ticket) => !['closed', 'resolved'].includes(String(ticket.status).toLowerCase())
  )
  const recentTickets = [...data.tickets].reverse().slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mb-9 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
            Operations / Overview
          </p>
          <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">
            Good morning, operator.
          </h1>
          <p className="mt-3 text-sm text-[#718087]">
            Here is what is happening across your service desk.
          </p>
        </div>
        <button
          className="hidden items-center gap-2 border border-[#dce5e2] bg-white px-3 py-2 text-xs font-bold text-[#718087] hover:border-[#147a76] hover:text-[#147a76] sm:flex"
          type="button"
          onClick={loadData}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 border-l-2 border-[#bd4b46] bg-[#fff5f4] px-4 py-3 text-sm text-[#a43e3a]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            type="button"
            className="group border border-[#dce5e2] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#147a76]"
            onClick={() => onNavigate(key === 'knowledge' ? 'knowledge-articles' : key)}
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-10 w-10 items-center justify-center ${color}`}>
                <Icon size={20} />
              </span>
              <ArrowUpRight size={18} className="text-[#a2b1b0] transition group-hover:text-[#147a76]" />
            </div>
            <p className="mt-6 font-mono text-3xl font-medium text-[#17252a]">
              {loading ? '—' : key === 'tickets' ? openTickets.length : data[key]?.length ?? 0}
            </p>
            <p className="mt-1 text-xs font-bold text-[#718087]">{label}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <section className="border border-[#dce5e2] bg-white">
          <div className="flex items-center justify-between border-b border-[#dce5e2] px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#147a76]">
                Queue health
              </p>
              <h2 className="mt-1 text-lg font-extrabold tracking-[-0.04em]">Recent tickets</h2>
            </div>
            <button
              className="text-xs font-bold text-[#147a76] hover:underline"
              type="button"
              onClick={() => onNavigate('tickets')}
            >
              View all
            </button>
          </div>

          {recentTickets.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-2 text-[#718087]">
              <TicketCheck size={30} className="text-[#147a76]" />
              <span className="text-sm">No tickets in the queue.</span>
            </div>
          ) : (
            <div>
              {recentTickets.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  className="flex w-full items-center gap-4 border-b border-[#edf1ef] px-5 py-4 text-left hover:bg-[#f8faf9]"
                  onClick={() => onNavigate('tickets')}
                >
                  <span className="font-mono text-[10px] text-[#9aa8a8]">
                    #{String(ticket._id).slice(-5)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{ticket.title}</span>
                  <span className="rounded-full bg-[#f5f7f6] px-2 py-1 font-mono text-[10px] uppercase text-[#718087]">
                    {ticket.status || 'new'}
                  </span>
                  <ArrowUpRight size={15} className="text-[#9aa8a8]" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="border border-[#dce5e2] bg-[#0c5b59] p-6 text-[#e9f5ef]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#f2c14e]">
            Quick actions
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em]">Keep work moving.</h2>
          <div className="mt-7 grid gap-2">
            <button
              className="flex items-center gap-3 bg-white/10 px-3 py-3 text-left text-xs font-bold hover:bg-white/20"
              type="button"
              onClick={() => onNavigate('tickets')}
            >
              <CheckCircle2 size={17} className="text-[#f2c14e]" /> Create a ticket
            </button>
            <button
              className="flex items-center gap-3 bg-white/10 px-3 py-3 text-left text-xs font-bold hover:bg-white/20"
              type="button"
              onClick={() => onNavigate('assets')}
            >
              <HardDrive size={17} className="text-[#f2c14e]" /> Register an asset
            </button>
            <button
              className="flex items-center gap-3 bg-white/10 px-3 py-3 text-left text-xs font-bold hover:bg-white/20"
              type="button"
              onClick={() => onNavigate('vendors')}
            >
              <Truck size={17} className="text-[#f2c14e]" /> Add a vendor
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard