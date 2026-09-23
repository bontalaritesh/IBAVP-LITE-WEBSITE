import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';

const links = [
  { to: '/', label: 'Overview' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/threat-log', label: 'Threat Log' },
  { to: '/features', label: 'Features & Roadmap' },
  { to: '/platform', label: 'Command Platform' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-[#f2f2ee]/95 backdrop-blur-sm shadow-sm' : 'bg-[#f2f2ee]/90 backdrop-blur-sm'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="IBVAP-Lite home">
          <div className="w-7 h-7 bg-green-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7a5 5 0 1 1 10 0A5 5 0 0 1 2 7Z" stroke="white" strokeWidth="1.5"/>
              <circle cx="7" cy="7" r="1.5" fill="white"/>
              <path d="M7 2v1.5M7 10.5V12M2 7h1.5M10.5 7H12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-[#101010] text-sm tracking-[0.1em] uppercase">IBVAP-Lite</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-green-700 bg-black/5'
                    : 'text-[#333] hover:text-black hover:bg-black/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/get-started"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black text-sm font-bold uppercase tracking-wider transition-colors"
            aria-label="Get started with IBVAP-Lite"
          >
            Get Started
          </Link>

          <button
            className="md:hidden p-1.5 text-[#101010] hover:bg-black/5 transition-colors"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {open ? (
                <path d="M4 4l12 12M4 16L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              ) : (
                <>
                  <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-black/15 bg-[#f2f2ee] px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm font-medium ${
                  isActive ? 'text-green-700 bg-black/5' : 'text-[#333] hover:text-black hover:bg-black/5'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/get-started"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-white bg-green-500 hover:bg-green-600 text-center mt-2"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
