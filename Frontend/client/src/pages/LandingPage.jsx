import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Network, ShieldCheck, Workflow } from 'lucide-react'

const CYCLE_SECONDS = 18

// a small live demo of the sla heap: a mock ticket's countdown fills up,
// then "escalates" on its own, then resets - this is the actual mechanic
// behind the app, not a decorative animation
function SlaDemoCard() {
    const [secondsLeft, setSecondsLeft] = useState(CYCLE_SECONDS)
    const [escalated, setEscalated] = useState(false)

    useEffect(() => {
        const tick = setInterval(() => {
            setSecondsLeft((current) => {
                if (current <= 1) {
                    setEscalated(true)
                    setTimeout(() => setEscalated(false), 2200)
                    return CYCLE_SECONDS
                }
                return current - 1
            })
        }, 1000)
        return () => clearInterval(tick)
    }, [])

    const elapsed = (CYCLE_SECONDS - secondsLeft) / CYCLE_SECONDS
    const stage = escalated ? 'breach' : elapsed < 0.5 ? 'ok' : elapsed < 0.8 ? 'warn' : 'danger'

    const stages = {
        ok: { bar: 'bg-[#147a76]', badge: 'bg-[#eaf6f3] text-[#0c5b59]', label: 'On track' },
        warn: { bar: 'bg-[#f2c14e]', badge: 'bg-[#fff8df] text-[#926e16]', label: 'Due soon' },
        danger: { bar: 'bg-[#bd4b46]', badge: 'bg-[#fff5f4] text-[#a43e3a]', label: 'Almost due' },
        breach: { bar: 'bg-[#bd4b46]', badge: 'bg-[#bd4b46] text-white', label: 'Escalated' },
    }
    const s = stages[stage]

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
    const ss = String(secondsLeft % 60).padStart(2, '0')

    return (
        <div className="w-full max-w-sm border border-[#dce5e2] bg-white p-6">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#9aa8a8]">#48213</span>
                <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors duration-500 ${s.badge}`}>
                    {s.label}
                </span>
            </div>
            <p className="mt-4 text-base font-bold leading-snug text-[#17252a]">
                VPN connection keeps dropping
            </p>
            <p className="mt-1 text-xs text-[#718087]">Hardware &middot; High priority</p>

            <div className="mt-6">
                <div className="flex items-baseline justify-between text-xs font-bold text-[#718087]">
                    <span>Time to SLA breach</span>
                    <span className="font-mono text-sm text-[#17252a]">{escalated ? '00:00' : `${mm}:${ss}`}</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-[#eef1ef]">
                    <div
                        className={`h-1.5 transition-all duration-1000 ${s.bar}`}
                        style={{ width: `${escalated ? 100 : elapsed * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

const features = [
    {
        icon: Workflow,
        title: 'Escalation that watches the clock',
        body: "Every ticket's due time comes from its priority. The moment one is about to breach, it escalates on its own - no one has to notice first.",
    },
    {
        icon: Network,
        title: 'Duplicates, grouped automatically',
        body: 'When one outage generates ten tickets, service/desk links them under a single root. Resolve it once, and the rest close with it.',
    },
    {
        icon: BookOpen,
        title: 'Search built for a growing queue',
        body: 'Type-ahead across every ticket title and knowledge article, so finding something stays fast no matter how large the queue gets.',
    },
]

const roles = [
    { name: 'Employee', body: 'Raise a ticket, track it, know when to expect a response.' },
    { name: 'Technician', body: 'Work an assigned, prioritized queue instead of a raw inbox.' },
    { name: 'Manager', body: 'See SLA performance and team workload without digging.' },
    { name: 'Admin', body: 'Define categories, priorities, and SLA rules once, for everyone.' },
]

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#f5f7f6] text-[#17252a]">
            <header className="flex h-[72px] items-center justify-between border-b border-[#dce5e2] bg-white px-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center bg-[#f2c14e] text-[#17252a]">
                        <ShieldCheck size={17} />
                    </span>
                    <span className="font-extrabold tracking-[-0.06em]">
                        service<span className="text-[#147a76]">/</span>desk
                    </span>
                </div>
                <button
                    className="h-10 border border-[#dce5e2] px-4 text-xs font-bold hover:border-[#147a76] hover:text-[#147a76]"
                    type="button"
                    onClick={() => navigate('/login')}
                >
                    Sign in
                </button>
            </header>

            <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:py-24">
                <div>
                    <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                        Every ticket gets a clock. Someone&rsquo;s always watching it.
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-[#718087]">
                        service/desk tracks tickets, assets, and SLAs in one place, and escalates
                        automatically the moment something&rsquo;s about to breach - so nothing
                        waits unnoticed in a queue.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <button
                            className="h-12 bg-[#147a76] px-6 text-sm font-extrabold text-white hover:bg-[#0c5b59]"
                            type="button"
                            onClick={() => navigate('/login')}
                        >
                            Get started
                        </button>
                        <a
                            className="h-12 px-6 text-sm font-bold text-[#17252a] underline decoration-[#dce5e2] decoration-2 underline-offset-4 hover:decoration-[#147a76]"
                            href="#how-it-works"
                        >
                            See how it works
                        </a>
                    </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                    <SlaDemoCard />
                </div>
            </section>

            <section id="how-it-works" className="border-y border-[#dce5e2] bg-white">
                <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
                        How it works
                    </p>
                    <div className="mt-8 grid gap-px bg-[#dce5e2] sm:grid-cols-3">
                        {features.map(({ icon: Icon, title, body }) => (
                            <div className="bg-white p-7" key={title}>
                                <span className="flex h-10 w-10 items-center justify-center bg-[#eaf6f3] text-[#147a76]">
                                    <Icon size={19} />
                                </span>
                                <h3 className="mt-5 text-base font-extrabold tracking-[-0.02em]">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#718087]">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
                    Built for the whole desk
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {roles.map(({ name, body }) => (
                        <div className="border border-[#dce5e2] p-6" key={name}>
                            <h3 className="text-sm font-extrabold">{name}</h3>
                            <p className="mt-2 text-sm leading-6 text-[#718087]">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#0c5b59] text-[#e9f5ef]">
                <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#f2c14e]">
                            Ready when you are
                        </p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                            Start your service desk.
                        </h2>
                    </div>
                    <button
                        className="h-12 shrink-0 bg-[#f2c14e] px-6 text-sm font-extrabold text-[#17252a] hover:bg-white"
                        type="button"
                        onClick={() => navigate('/login')}
                    >
                        Sign in
                    </button>
                </div>
            </section>

            <footer className="border-t border-[#dce5e2] px-5 py-8 text-xs text-[#9aa8a8] sm:px-8">
                service/desk - IT helpdesk &amp; asset management
            </footer>
        </div>
    )
}