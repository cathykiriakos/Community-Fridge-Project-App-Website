import { Link } from 'react-router-dom'
import { Heart, Package, MapPin, CheckCircle } from 'lucide-react'
import { DONATE } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

export default function Donate() {
  const { pages, fridges, images } = useContent()

  return (
    <>
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-500 text-white py-20">
        <div className="section-container">
          <span className="badge-green bg-white/20 text-white border border-white/30 mb-4 block w-fit">
            Make a Difference
          </span>
          <h1 className="text-white mb-4">{pages.donateHeadline}</h1>
          <p className="text-brand-100 text-xl max-w-2xl">
            {pages.donateIntro}
          </p>
        </div>
      </section>

      <PageWithSidebar images={images.donate}>

      {/* ── DONATE OPTIONS ──────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Monetary donations */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Heart className="text-brand-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Financial Donations</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Your financial contribution goes directly to stocking fridges, covering supplies,
                and expanding our network across Oak Park and Austin Chicago. Every dollar makes an immediate impact.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {DONATE.monetaryOptions.map((opt) => (
                  <div
                    key={opt.amount}
                    className="border-2 border-brand-200 rounded-xl p-5 text-center
                               hover:border-brand-500 hover:bg-brand-50 transition-all cursor-pointer group"
                  >
                    <p className="text-3xl font-extrabold text-brand-600 mb-2 group-hover:text-brand-700">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug">{opt.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-brand-50 border-2 border-brand-300 rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-3">
                  <img
                    src="/images/coc-logo.png"
                    alt="Community of Congregations"
                    className="h-12 w-auto object-contain"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <p className="text-brand-800 font-bold text-base mb-1">
                  Donate through the Community of Congregations
                </p>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Financial donations are processed securely through our parent organization,
                  Community of Congregations.
                </p>
                <a
                  href="https://www.communityofcongregations.org/give/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
                >
                  <Heart size={18} />
                  Donate on the CoC Website
                </a>
              </div>
            </div>

            {/* Food donations */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Package className="text-brand-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Food Donations</h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Drop off food at any of our community fridge locations — no appointment needed.
                We gratefully accept:
              </p>

              <ul className="space-y-3 mb-8">
                {DONATE.foodItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={18} className="text-brand-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p className="text-yellow-800 text-sm font-semibold mb-1">
                  📋 Food Safety Guidelines
                </p>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  Please ensure all food is within its use-by date, properly sealed or packaged,
                  and labeled with the date if home-prepared.
                </p>
              </div>

              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-brand-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-700 font-semibold text-sm mb-1">Drop-Off Locations</p>
                    <p className="text-gray-600 text-sm">{pages.dropoffNote}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {fridges.length} fridge{fridges.length !== 1 ? 's' : ''} across Oak Park &amp; Austin Chicago · Open 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT REMINDER ─────────────────────────────────────────── */}
      <section className="section-py bg-neutral-50">
        <div className="section-container text-center max-w-3xl mx-auto">
          <span className="badge-green mb-4">Your Impact</span>
          <h2 className="mb-6">Every Contribution Counts</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Whether you drop off a bag of groceries or write a check, your generosity
            directly feeds neighbors in Oak Park and Austin Chicago who need it most.
            The Community Fridge Project is 100% community-powered.
          </p>
          <Link to="/contact" className="btn-primary text-base px-8 py-4">
            Get in Touch
          </Link>
        </div>
      </section>

      </PageWithSidebar>
    </>
  )
}
