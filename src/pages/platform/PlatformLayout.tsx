import { NavLink, Outlet, Link } from 'react-router';
import { useState } from 'react';

const NAV = [
  {
    group: 'Operations',
    items: [
      { to: '/platform', label: 'Command Center', end: true, icon: 'grid' },
      { to: '/platform/surveillance', label: 'Live Surveillance', icon: 'camera' },
      { to: '/platform/incidents', label: 'Incidents', icon: 'alert' },
      { to: '/platform/map', label: 'Border Map', icon: 'map' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { to: '/platform/tracking', label: 'Target Tracking', icon: 'target' },
      { to: '/platform/reconstruction', label: 'Reconstruction', icon: 'route' },
    ],
  },
  {
    group: 'Evidence',
    items: [
      { to: '/platform/evidence', label: 'Evidence Vault', icon: 'lock' },
      { to: '/platform/clips', label: 'Evidence Clips', icon: 'film' },
    ],
  },
  {
    group: 'Oversight',
    items: [
      { to: '/platform/analytics', label: 'Analytics', icon: 'chart' },
      { to: '/platform/system', label: 'System Status', icon: 'cpu' },
      { to: '/platform/reports', label: 'Reports', icon: 'doc' },
      { to: '/platform/settings', label: 'Settings', icon: 'gear' },
    ],
  },
] as const;

function Icon({ name, className = 'w-4 h-4' }: { name: string; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (name) {
    case 'grid': return <svg className={className} viewBox="0 0 24 24" {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case 'camera': return <svg className={className} viewBox="0 0 24 24" {...common}><path d="M3 7h13v10H3z"/><path d="M16 10l5-3v10l-5-3"/></svg>;
    case 'alert': return <svg className={className} viewBox="0 0 24 24" {...common}><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>;
    case 'map': return <svg className={className} viewBox="0 0 24 24" {...common}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>;
    case 'target': return <svg className={className} viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>;
    case 'route': return <svg className={className} viewBox="0 0 24 24" {...common}><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8 19h6a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h6" style={{ display: 'none' }}/><path d="M8.5 19H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5"/></svg>;
    case 'lock': return <svg className={className} viewBox="0 0 24 24" {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case 'film': return <svg className={className} viewBox="0 0 24 24" {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>;
    case 'chart': return <svg className={className} viewBox="0 0 24 24" {...common}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>;
    case 'cpu': return <svg className={className} viewBox="0 0 24 24" {...common}><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>;
    case 'doc': return <svg className={className} viewBox="0 0 24 24" {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6M9 13h6M9 17h6"/></svg>;
    case 'gear': return <svg className={className} viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>;
    default: return null;
  }
}

export default function PlatformLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2f2ee] flex flex-col">
      {/* Platform top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#101010] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 hover:bg-white/10 rounded-md"
            onClick={() => setOpen(!open)}
            aria-label="Toggle platform menu"
            aria-expanded={open}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2" aria-label="Back to IBVAP-Lite website">
            <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 1 10 0A5 5 0 0 1 2 7Z" stroke="white" strokeWidth="1.5" />
                <circle cx="7" cy="7" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-[0.1em] uppercase">IBVAP-Lite</span>
          </Link>
          <span className="text-[#9CA3AF] text-xs hidden sm:inline">/ Command Platform</span>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-amber-400/40 bg-amber-400/10 text-amber-300 font-mono text-[9px] font-bold tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            SIMULATED ENVIRONMENT
          </span>
        </div>
      </div>

      <div className="flex-1 flex pt-12">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-12 bottom-0 lg:top-12 lg:h-[calc(100vh-3rem)] z-40 w-60 shrink-0 bg-white border-r border-[#E5E7EB] overflow-y-auto transition-transform lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Platform navigation"
        >
          <nav className="p-3 space-y-4">
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-widest px-2 mb-1.5">{g.group}</div>
                <div className="space-y-0.5">
                  {g.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={'end' in item && item.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive ? 'bg-green-500/15 text-green-700' : 'text-[#4B5563] hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon name={item.icon} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="p-3 border-t border-[#E5E7EB]">
            <Link to="/" className="block px-2.5 py-2 rounded-lg text-xs font-semibold text-[#4B5563] hover:bg-gray-50 transition-colors">
              ← Back to main site
            </Link>
          </div>
        </aside>

        {open && <div className="fixed inset-0 top-12 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
