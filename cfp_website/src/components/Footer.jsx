import { Link } from 'react-router-dom'
import { Heart, Mail } from 'lucide-react'
import { BRAND, NAV_LINKS } from '../config/site.config'
import { useContent } from '../hooks/useContent'

// ─── HAND-DRAWN HEART (footer) ────────────────────────────────────────────────
function FooterHeart() {
  return (
    <svg width="20" height="19" viewBox="0 0 40 38" fill="none" aria-hidden="true">
      <path
        d="M20 35 C19 34 14 30 10 26 C6 22 2 18 2 13 C2 8 5.5 4 11 4
           C14 4 17 5.5 20 9 C23 5.5 26 4 29 4 C34.5 4 38 8 38 13
           C38 18 34 22 30 26 C26 30 21 34 20 35Z"
        fill="white" stroke="white" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9"
      />
    </svg>
  )
}

export default function Footer() {
  const { fridges, pages } = useContent()
  const year = new Date().getFullYear()
  const email = pages.contactEmail || BRAND.email

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* ─── MAIN FOOTER GRID ──────────────────────────────────── */}
      <div className="section-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FooterHeart />
              </div>
              <div className="leading-none">
                <span className="block text-white font-extrabold text-lg">Community</span>
                <span className="block text-brand-400 font-extrabold text-lg -mt-0.5">Fridge Project</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {BRAND.tagline}. Neighbors feeding neighbors across Oak Park, IL
              and the Austin neighborhood of Chicago.
              Free food, always available, no questions asked.
            </p>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 mt-4 text-brand-400 hover:text-brand-300
                           text-sm font-medium transition-colors"
              >
                <Mail size={15} />
                {email}
              </a>
            )}
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Navigate
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-brand-400 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fridge Locations column — live from CMS */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              Our Fridges
            </h3>
            <ul className="space-y-2">
              {fridges.slice(0, 6).map((loc) => (
                <li key={loc.id} className="text-gray-400 text-sm">
                  📍 {loc.name}
                </li>
              ))}
              {fridges.length === 0 && (
                <li className="text-gray-500 text-sm italic">Coming soon</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── COC AFFILIATION BAR ─────────────────────────────── */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center
                        justify-center gap-3 text-xs text-gray-500">
          <a
            href="https://www.communityofcongregations.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/coc-logo.png"
              alt="Community of Congregations"
              className="h-8 w-auto object-contain opacity-70 hover:opacity-90 transition-opacity"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <span className="text-gray-500">
              A project of <span className="text-gray-400 font-medium">Community of Congregations</span>, Oak Park · River Forest
            </span>
          </a>
        </div>
      </div>

      {/* ─── BOTTOM BAR ──────────────────────────────────────── */}
      <div className="border-t border-gray-800">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-gray-500">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-brand-500 fill-brand-500" /> for Oak Park &amp; Austin Chicago neighbors
          </p>
          <Link
            to="/admin"
            className="text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="Admin portal"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
