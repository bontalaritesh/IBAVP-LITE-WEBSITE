import { Outlet, Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import Nav from './Nav';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <footer className="border-t-2 border-[#101010] bg-[#101010] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 1 10 0A5 5 0 0 1 2 7Z" stroke="white" strokeWidth="1.5"/>
                <circle cx="7" cy="7" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white uppercase tracking-wider">IBVAP-Lite</span>
            <span className="text-sm text-gray-400">— Smart India Hackathon</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-400" aria-label="Footer navigation">
            <Link to="/" className="hover:text-green-400 transition-colors">Overview</Link>
            <Link to="/how-it-works" className="hover:text-green-400 transition-colors">How It Works</Link>
            <Link to="/architecture" className="hover:text-green-400 transition-colors">Architecture</Link>
            <Link to="/threat-log" className="hover:text-green-400 transition-colors">Threat Log</Link>
            <Link to="/features" className="hover:text-green-400 transition-colors">Features</Link>
            <Link to="/platform" className="hover:text-green-400 transition-colors">Command Platform</Link>
            <Link to="/get-started" className="hover:text-green-400 transition-colors">Get Started</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
