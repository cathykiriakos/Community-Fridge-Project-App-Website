import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { BRAND, NAV_LINKS } from '../config/site.config'

// ─── FRIDGE ICON LOGO ─────────────────────────────────────────────────────────
function FridgeIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Fridge body */}
      <rect x="2" y="1" width="20" height="26" rx="3" fill="white" opacity="0.93" />
      {/* Freezer / main compartment divider */}
      <line x1="2" y1="10" x2="22" y2="10" stroke="rgba(59,170,53,0.35)" strokeWidth="1.5" />
      {/* Freezer handle */}
      <line x1="6.5" y1="4.5" x2="6.5" y2="8" stroke="rgba(59,170,53,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* Main compartment handle */}
      <line x1="6.5" y1="14" x2="6.5" y2="21" stroke="rgba(59,170,53,0.55)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-500 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ─── LOGO ─────────────────────────────────────────── */}
          <Link
            to="/"
            onClick={closeMobile}
            className="flex items-center gap-3 group"
            aria-label={`${BRAND.name} — Home`}
          >
            <div className="w-11 h-11 bg-brand-500 rounded-xl flex items-center justify-center
                            group-hover:bg-brand-600 transition-colors duration-200 flex-shrink-0
                            shadow-sm overflow-hidden">
              <FridgeIcon size={36} />
            </div>
            <div className="leading-none">
              <span className="block text-brand-600 font-extrabold text-lg md:text-xl tracking-tight">
                Community
              </span>
              <span className="block text-gray-800 font-extrabold text-lg md:text-xl tracking-tight -mt-0.5">
                Fridge Project
              </span>
            </div>
          </Link>

          {/* ─── DESKTOP NAV ──────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/volunteer" className="ml-3 btn-primary text-sm px-5 py-2">
              Volunteer 🖐️
            </Link>
          </nav>

          {/* ─── MOBILE TOGGLE ────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ─── MOBILE NAV ───────────────────────────────────── */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-gray-100 py-4 space-y-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 px-4">
              <Link to="/volunteer" onClick={closeMobile} className="btn-primary w-full text-center">
                Volunteer 🖐️
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
