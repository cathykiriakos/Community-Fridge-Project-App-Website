import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Users, DollarSign, MapPin } from 'lucide-react'
import { HOME } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const { pages, images, fridges, partners } = useContent()

  const stats = [
    { value: pages.stat0, label: pages.stat0Label, anchor: '#fridges' },
    { value: pages.stat1, label: pages.stat1Label, anchor: null },
    { value: pages.stat3, label: pages.stat3Label, anchor: null },
  ]

  return (
    <>
      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <section aria-label="Hero banner" className="relative overflow-hidden">
        {/* Full-width banner image */}
        <div className="w-full bg-[#e3e956] overflow-hidden leading-none">
          <img
            src="/images/cfp-banner.png"
            alt="Community Fridge Project — Neighbors Feeding Neighbors"
            className="w-full h-auto block"
          />
        </div>

        {/* CTA strip below banner */}
        <div className="bg-brand-600 py-6">
          <div className="section-container flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-white/70 text-sm font-medium block mb-1">
                Oak Park, IL &amp; Austin Chicago · Free for Everyone
              </span>
              <p className="text-white text-lg font-semibold hidden md:block">
                {pages.heroSub}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={HOME.hero.ctaPath}
                className="btn-primary bg-white text-brand-600 hover:bg-brand-50 shadow-lg px-7 py-3">
                {HOME.hero.ctaLabel}
                <ArrowRight size={17} />
              </Link>
              <Link to="/donate"
                className="btn-secondary border-white text-white hover:bg-white/10 px-7 py-3">
                Donate Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100" aria-label="Impact statistics">
        <div className="section-container py-10 md:py-14">
          <div className="grid grid-cols-3 gap-6 md:gap-8 text-center">
            {stats.map((stat, i) =>
              stat.anchor ? (
                <a key={i} href={stat.anchor}
                   className="group cursor-pointer">
                  <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1
                                group-hover:text-brand-700 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-sm md:text-base text-gray-500 font-medium
                                group-hover:text-brand-600 transition-colors underline-offset-2
                                group-hover:underline">
                    {stat.label}
                  </p>
                </a>
              ) : (
                <div key={i}>
                  <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">{stat.value}</p>
                  <p className="text-sm md:text-base text-gray-500 font-medium">{stat.label}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── FRIDGE LOCATIONS ──────────────────────────────────────── */}
      <section id="fridges" className="bg-neutral-50 border-b border-gray-200 py-10 md:py-14"
               aria-labelledby="fridges-heading">
        <div className="section-container">
          <div className="text-center mb-8">
            <span className="badge-green mb-4">Find a Fridge</span>
            <h2 id="fridges-heading" className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Fridge Locations
            </h2>
            <p className="text-gray-500 mt-2 text-base max-w-xl mx-auto">
              All fridges are open 24/7. Tap any location to get directions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {fridges.map((fridge) => (
              <a
                key={fridge.id}
                href={fridge.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white
                           hover:border-brand-400 hover:shadow-md transition-all group"
              >
                <MapPin size={20} className="text-brand-500 flex-shrink-0 mt-0.5 group-hover:text-brand-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-brand-700 leading-snug">
                    {fridge.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{fridge.address}</p>
                  <p className="text-xs text-brand-500 mt-1.5 font-medium">
                    View on Google Maps →
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── REMAINING PAGE CONTENT WRAPPED WITH SIDEBAR ───────────── */}
      <PageWithSidebar images={images.home}>

        {/* ── COC AFFILIATION ───────────────────────────────────── */}
        <section className="bg-brand-50 border-b border-brand-100 py-6" aria-label="Organizational affiliation">
          <div className="section-container flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <img
              src="/images/coc-logo.png"
              alt="Community of Congregations"
              className="h-14 w-auto object-contain flex-shrink-0"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <div>
              <p className="text-brand-800 font-bold text-base">
                A Project of Community of Congregations
              </p>
              <p className="text-brand-600 text-sm">Oak Park · River Forest</p>
            </div>
          </div>
        </section>

        {/* ── MISSION STATEMENT ─────────────────────────────────── */}
        <section className="section-py bg-white" aria-labelledby="mission-heading">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <span className="badge-green mb-4">Our Mission</span>
              <h2 id="mission-heading" className="mb-6">{pages.missionTitle}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{pages.missionBody}</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section className="section-py bg-neutral-50" aria-labelledby="how-heading">
          <div className="section-container">
            <div className="text-center mb-12">
              <span className="badge-green mb-4">Simple &amp; Open</span>
              <h2 id="how-heading">{HOME.overview.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {HOME.overview.steps.map((step, i) => (
                <div key={i} className="card text-center group hover:border-brand-200">
                  <div className="text-5xl mb-4" role="img" aria-hidden="true">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY PARTNERS ────────────────────────────────── */}
        {partners && partners.length > 0 && (
          <section className="section-py bg-white" aria-labelledby="partners-heading">
            <div className="section-container">
              <div className="text-center mb-8">
                <span className="badge-green mb-4">Community Partners</span>
                <h2 id="partners-heading">Thank You to Our Partners</h2>
                <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
                  These local organizations help make our work possible.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
                {partners.map((partner, i) => (
                  <div
                    key={i}
                    className="bg-neutral-50 border border-gray-200 rounded-xl px-3 py-3
                               text-center shadow-sm hover:border-brand-300 hover:bg-brand-50
                               transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-700 leading-snug">{partner}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── GET INVOLVED CTA ──────────────────────────────────── */}
        <section className="bg-brand-600 text-white section-py" aria-labelledby="cta-heading">
          <div className="section-container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="cta-heading" className="text-white mb-6">Ready to Make a Difference?</h2>
              <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto">
                Whether you have 2 hours or 20, there's a way to contribute to your community.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Link to="/volunteer"
                  className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                             font-bold text-center transition-all duration-200 hover:shadow-lg
                             flex flex-col items-center gap-3">
                  <Users size={32} className="text-brand-500" />
                  <span>Volunteer 🖐️</span>
                </Link>
                <Link to="/donate"
                  className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                             font-bold text-center transition-all duration-200 hover:shadow-lg
                             flex flex-col items-center gap-3">
                  <Heart size={32} className="text-brand-500" />
                  <span>Donate Food</span>
                </Link>
                <Link to="/donate"
                  className="bg-white text-brand-600 hover:bg-brand-50 rounded-xl p-6
                             font-bold text-center transition-all duration-200 hover:shadow-lg
                             flex flex-col items-center gap-3">
                  <DollarSign size={32} className="text-brand-500" />
                  <span>Give Financially</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </PageWithSidebar>
    </>
  )
}
