import { useState } from 'react'
import { BarChart3, BookOpen, Boxes, ChevronRight, ClipboardList, Gauge, HardDrive, LogOut, Menu, Network, PanelLeftClose, PanelLeftOpen, Settings2, ShieldCheck, Truck, X } from 'lucide-react'

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3 },
  { id: 'tickets', label: 'Tickets', icon: ClipboardList },
  { id: 'categories', label: 'Categories', icon: Boxes, admin: true },
  { id: 'priorities', label: 'Priorities', icon: Gauge, admin: true },
  { id: 'sla-policies', label: 'SLA policies', icon: Network, admin: true },
  { id: 'assets', label: 'Assets', icon: HardDrive, admin: true },
  { id: 'vendors', label: 'Vendors', icon: Truck, admin: true },
  { id: 'knowledge-articles', label: 'Knowledge base', icon: BookOpen },
]

function AppShell({ user, activePage, onNavigate, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const canAdmin = ['admin'].includes(user?.role)
  const visibleNavigation = navigation.filter((item) => !item.admin || canAdmin)

  const navigate = (page) => {
    onNavigate(page)
    setMobileOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#17252a]">
      {mobileOpen && <button className="fixed inset-0 z-30 bg-[#17252a]/35 lg:hidden" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#dce5e2] bg-[#0c5b59] text-white transition-all duration-200 ${collapsed ? 'w-[76px]' : 'w-[252px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5"><button className="flex items-center gap-3" type="button" onClick={() => navigate('dashboard')}><span className="flex h-8 w-8 items-center justify-center bg-[#f2c14e] text-[#17252a]"><ShieldCheck size={17} /></span>{!collapsed && <span className="font-extrabold tracking-[-0.06em]">service<span className="text-[#f2c14e]">/</span>desk</span>}</button><button className="text-[#a9ccc5] lg:hidden" type="button" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">{!collapsed && <p className="px-3 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8bbdb5]">Workspace</p>}{visibleNavigation.map(({ id, label, icon: Icon }) => <button className={`group flex w-full items-center gap-3 px-3 py-3 text-left text-sm transition ${activePage === id ? 'bg-white/12 font-bold text-white' : 'text-[#b8d5d0] hover:bg-white/8 hover:text-white'} ${collapsed ? 'justify-center' : ''}`} key={id} type="button" onClick={() => navigate(id)} title={collapsed ? label : undefined}><Icon size={18} className={activePage === id ? 'text-[#f2c14e]' : 'text-[#8bbdb5]'} />{!collapsed && <span>{label}</span>}{!collapsed && activePage === id && <ChevronRight className="ml-auto text-[#f2c14e]" size={15} />}</button>)}</nav>
        <div className="border-t border-white/10 p-3"><button className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-[#b8d5d0] hover:bg-white/8 hover:text-white ${collapsed ? 'justify-center' : ''}`} type="button" onClick={() => navigate('profile')} title={collapsed ? 'Profile' : undefined}><Settings2 size={18} />{!collapsed && <span>Account settings</span>}</button><button className={`mt-1 flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-[#b8d5d0] hover:bg-white/8 hover:text-white ${collapsed ? 'justify-center' : ''}`} type="button" onClick={onLogout} title={collapsed ? 'Sign out' : undefined}><LogOut size={18} />{!collapsed && <span>Sign out</span>}</button></div>
      </aside>
      <div className={`min-h-screen transition-all duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[252px]'}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#dce5e2] bg-white/90 px-5 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><button className="text-[#718087] lg:hidden" type="button" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><button className="hidden text-[#718087] lg:block" type="button" onClick={() => setCollapsed((current) => !current)} title="Toggle navigation">{collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}</button><div className="flex items-center gap-2 text-sm text-[#718087]"><span className="hidden sm:inline">Service desk</span><ChevronRight size={14} /><strong className="text-[#17252a]">{navigation.find((item) => item.id === activePage)?.label || 'Account settings'}</strong></div></div><div className="flex items-center gap-3"><span className="hidden text-right sm:block"><strong className="block text-xs">{user?.name || user?.email}</strong><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#718087]">{user?.role}</span></span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf6f3] font-bold text-[#0c5b59]">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span></div></header>
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
