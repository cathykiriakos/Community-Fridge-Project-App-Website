import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Users, DollarSign } from 'lucide-react'
import { HOME } from '../config/site.config'
import { useContent } from '../hooks/useContent'
import { PageWithSidebar } from '../components/PageImageSidebar'
import VolunteerDashboard from '../components/VolunteerDashboard'

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const { pages, images } = useContent()

  const stats = [
    { value: pages.stat0, label: pages.stat0Label },
    { value: pages.stat1, label: pages.stat1Label },
    { value: pages.stat2, label: pages.stat2Label },
    { value: pages.stat3, label: pages.stat3Label },
  ]

  return (
    <>
      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <section aria-label="Hero banner" className="relative overflow-hidden">
        {/* Full-width banner image — natural proportions, nothing cropped */}
        <div className="w-full bg-[#e3e956]">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">{stat.value}</p>
                <p className="text-sm md:text-base text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REMAINING PAGE CONTENT WRAPPED WITH SIDEBAR ───────────── */}
      <PageWithSidebar images={images.home}>

        {/* ── MISSION STATEMENT ─────────────────────────────────── */}
        <section className="section-py bg-neutral-50" aria-labelledby="mission-heading">
          <div className="section-container">
            <div className="max-w-3xl mx-auto text-center">
              <span className="badge-green mb-4">Our Mission</span>
              <h2 id="mission-heading" className="mb-6">{pages.missionTitle}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{pages.missionBody}</p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section className="section-py bg-white" aria-labelledby="how-heading">
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

        {/* ── VOLUNTEER DASHBOARD PREVIEW ───────────────────────── */}
        <section className="section-py bg-neutral-50" aria-labelledby="dashboard-preview-heading">
          <div className="section-container">
            <div className="text-center mb-12">
              <span className="badge-green mb-4">Real-Time Needs</span>
              <h2 id="dashboard-preview-heading">Volunteer Opportunities</h2>
              <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
                See where help is needed most this week. Spots fill fast!
              </p>
            </div>
            <VolunteerDashboard previewMode={true} />
            <div className="text-center mt-10">
              <Link to="/volunteer" className="btn-primary text-base px-8 py-4">
                View All Opportunities
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

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
                  <span>Volunteer</span>
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
